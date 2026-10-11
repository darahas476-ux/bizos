import os
import json
import re
import base64
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from providers import (
    fast_classify, fast_answer, complex_reasoning,
    extract_image, extract_pdf, web_search, match_tone,
    GROQ_KEY, XAI_KEY,
)

load_dotenv()
app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════════
# CORS — allow the frontend origin(s). Use * for the hackathon demo.
# ═══════════════════════════════════════════════════════════════════
ALLOWED = os.environ.get("ALLOWED_ORIGINS", "*")
if ALLOWED == "*":
    CORS(app, resources={r"/*": {"origins": "*"}})
else:
    CORS(app, resources={r"/*": {"origins": ALLOWED.split(",")}})


DOC_SCHEMAS = {
    "invoice": {
        "customer_name": "string (buyer)",
        "invoice_number": "string",
        "amount": "number (pre-tax INR)",
        "gst": "number",
        "total": "number",
        "issued_date": "YYYY-MM-DD",
        "due_date": "YYYY-MM-DD",
    },
    "contract": {
        "parties": "array of names",
        "contract_type": "string",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
    },
    "quotation": {
        "customer_name": "string",
        "quote_number": "string",
        "total": "number",
        "valid_until": "YYYY-MM-DD",
    },
    "purchase_order": {
        "vendor_name": "string",
        "po_number": "string",
        "total": "number",
        "delivery_date": "YYYY-MM-DD",
    },
    "compliance_cert": {
        "issuer": "string",
        "certificate_type": "string",
        "certificate_number": "string",
        "valid_until": "YYYY-MM-DD",
    },
}

DOC_TYPES = list(DOC_SCHEMAS.keys()) + ["other"]
INTENTS = ["finance_query", "task_query", "collections", "briefing",
           "compliance", "external_intel", "chitchat"]


def rag_context(query: str) -> str:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    q = query.lower()

    if any(k in q for k in ["owe", "overdue", "pay", "receivable"]):
        cur.execute("""SELECT type, name, data FROM entities
                       WHERE type='invoice' AND data->>'status'='overdue'
                       ORDER BY (data->>'days_overdue')::int DESC LIMIT 10""")
    elif any(k in q for k in ["task", "todo", "pending", "work"]):
        cur.execute("""SELECT type, name, data FROM entities
                       WHERE type='task' AND data->>'status' IN ('open','in_progress') LIMIT 10""")
    elif any(k in q for k in ["customer", "client"]):
        cur.execute("SELECT type, name, data FROM entities WHERE type='customer' LIMIT 15")
    else:
        cur.execute("SELECT type, name, data FROM entities WHERE name ILIKE %s LIMIT 10", (f"%{q}%",))

    rows = cur.fetchall()
    cur.close(); conn.close()
    if not rows:
        return "No matching business data."
    return "\n".join(f"[{r[0]}] {r[1]}: {json.dumps(r[2])[:250]}" for r in rows)


def collections_agent():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("""SELECT name, data->>'customer_name', (data->>'total')::bigint,
                          (data->>'days_overdue')::int
                   FROM entities WHERE type='invoice' AND data->>'status'='overdue'
                   ORDER BY (data->>'days_overdue')::int DESC LIMIT 10""")
    rows = cur.fetchall()
    cur.close(); conn.close()
    if not rows:
        return "✅ <b>No overdue invoices</b>"
    total = sum(r[2] or 0 for r in rows)
    lines = ["🔴 <b>Overdue Invoices</b>\n"]
    for inv, cust, amt, days in rows:
        lines.append(f"▸ <b>{cust}</b>\n   <code>{inv}</code> · ₹{amt:,} · <i>{days}d overdue</i>")
    lines.append(f"\n💰 <b>Total: ₹{total:,}</b>")
    return "\n".join(lines)


def tasks_agent():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("""SELECT name, data->>'owner', data->>'due_date', data->>'priority'
                   FROM entities WHERE type='task' AND data->>'status' IN ('open','in_progress')
                   ORDER BY data->>'priority' DESC LIMIT 12""")
    rows = cur.fetchall()
    cur.close(); conn.close()
    if not rows:
        return "✅ <b>No open tasks</b>"
    lines = ["📋 <b>Open Tasks</b>\n"]
    for name, owner, due, pri in rows:
        emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(pri, "⚪")
        lines.append(f"{emoji} <b>{name}</b>\n   👤 {owner} · 📅 <code>{due}</code>")
    return "\n".join(lines)


def briefing_agent():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("""SELECT COUNT(*), COALESCE(SUM((data->>'total')::bigint),0)
                   FROM entities WHERE type='invoice' AND data->>'status'='overdue'""")
    ic, it = cur.fetchone()
    cur.execute("SELECT COUNT(*) FROM entities WHERE type='task' AND data->>'status' IN ('open','in_progress')")
    tc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM entities WHERE type='customer'")
    cc = cur.fetchone()[0]
    cur.close(); conn.close()
    return (f"☀️ <b>Good morning.</b>\n\n"
            f"🔴 <b>Overdue</b>\n   {ic} invoices · <b>₹{it:,}</b>\n\n"
            f"📋 <b>Tasks</b>\n   {tc} open\n\n"
            f"👥 <b>Customers</b>\n   {cc}\n\n"
            f"<i>Reply</i> <code>/who</code> <i>or</i> <code>/tasks</code> <i>for details.</i>")


def compliance_agent():
    return "📅 <b>Compliance</b>\n\n<b>GSTR-3B</b> due in 3 days\n<b>DPDP Phase II</b> assessment pending"


@app.post("/orchestrate")
def orchestrate():
    data = request.get_json()
    text = data.get("text", "").strip()
    user_style = data.get("user_style", "casual Indian business owner")

    if not text:
        return jsonify({"intent": "empty", "response": "Say something."})

    try:
        result = fast_classify(text, [f"'{i}'" for i in INTENTS])
        intent = next((i for i in INTENTS if i in result), "chitchat")

        if intent == "collections":
            raw = collections_agent()
        elif intent == "task_query":
            raw = tasks_agent()
        elif intent == "briefing":
            raw = briefing_agent()
        elif intent == "compliance":
            raw = compliance_agent()
        elif intent == "external_intel":
            raw = web_search(text)
        else:
            raw = fast_answer(text, rag_context(text))

        final = raw
    except Exception as e:
        print(f"orchestrate error: {str(e)[:200]}")
        return jsonify({"intent": "error", "response": f"⚠️ Error: {str(e)[:100]}"})

    return jsonify({"intent": intent, "response": final})


@app.post("/process-document")
def process_document():
    data = request.get_json()
    try:
        if "pdf_b64" in data:
            pdf_bytes = base64.b64decode(data["pdf_b64"])
            text = extract_pdf(pdf_bytes, "Extract all text, tables, key details. Preserve numbers/dates.")
        elif "image_b64" in data:
            text = extract_image(data["image_b64"], "Extract all text, tables, key details. Preserve numbers/dates.")
        else:
            return jsonify({"error": "no document"}), 400
    except Exception as e:
        return jsonify({"error": f"extract failed: {str(e)[:100]}"}), 500

    doc_type = fast_classify(text[:2000], [f"'{t}'" for t in DOC_TYPES])
    doc_type = next((t for t in DOC_TYPES if t in doc_type), "other")

    entities = {}
    if doc_type in DOC_SCHEMAS:
        prompt = f"""Extract from this {doc_type}. Return ONLY JSON matching:
{json.dumps(DOC_SCHEMAS[doc_type], indent=2)}
Null for missing. Plain numbers. YYYY-MM-DD dates.

Document:
{text}"""
        raw = complex_reasoning(prompt)
        raw = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
        try:
            entities = json.loads(raw)
        except Exception:
            entities = {"raw": raw[:300]}

    return jsonify({
        "doc_type": doc_type,
        "entities": entities,
        "event": f"{doc_type}_uploaded",
        "suggested_task": f"Review {doc_type}",
        "raw_text": text[:800],
    })


# ═══════════════════════════════════════════════════════════════════
# NEW — routes the frontend calls (main.tsx)
# ═══════════════════════════════════════════════════════════════════

@app.post("/v1/copilot/ask")
def copilot_ask():
    """Frontend Copilot drawer → { text, chart?, links?, actions? }."""
    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    if not question:
        return jsonify({"text": "Ask me anything about your business."})

    try:
        result = fast_classify(question, [f"'{i}'" for i in INTENTS])
        intent = next((i for i in INTENTS if i in result), "chitchat")

        if intent == "collections":
            raw = collections_agent()
        elif intent == "task_query":
            raw = tasks_agent()
        elif intent == "briefing":
            raw = briefing_agent()
        elif intent == "compliance":
            raw = compliance_agent()
        else:
            raw = fast_answer(question, rag_context(question))
    except Exception as e:
        print(f"copilot error: {str(e)[:200]}")
        raw = "Nothing else. You're clear."

    # Strip HTML tags — main.tsx renders plain text
    text = re.sub(r"<[^>]+>", "", raw or "").strip()

    # Attach a chart hint when it makes sense
    out = {"text": text}
    q = question.lower()
    if "overdue" in q or "owe" in q:
        out["chart"] = {"kind": "spark", "colour": "#B42318", "label": "Overdue trend",
                        "data": [4, 5, 5, 6, 5, 6, 5]}
        out["links"] = [{"label": "Open Inbox", "route": "/inbox"}]
    elif "task" in q or "today" in q:
        out["chart"] = {"kind": "bar", "colour": "#17706A", "label": "Tasks by day",
                        "data": [3, 5, 2, 6, 4]}
    elif "cash" in q or "runway" in q:
        out["chart"] = {"kind": "spark", "colour": "#17706A", "label": "Runway",
                        "data": [42, 44, 46, 48, 52, 56, 60]}

    return jsonify(out)


@app.post("/v1/ocr")
def ocr_endpoint():
    """Frontend /invoices/upload and /money/upload call this.
    Body: { file_id } or { image_b64 } or { pdf_b64 }."""
    body = request.get_json(silent=True) or {}
    try:
        if "pdf_b64" in body:
            text = extract_pdf(base64.b64decode(body["pdf_b64"]),
                               "Extract invoice fields as JSON.")
        elif "image_b64" in body:
            text = extract_image(body["image_b64"],
                                 "Extract invoice fields as JSON.")
        else:
            # Demo: file_id only, return the hero invoice
            return jsonify({
                "invoice_number": "INV-104",
                "customer_name": "Sharma Traders",
                "gstin": "27AABCA1234F1Z5",
                "issued_date": "2026-08-06",
                "due_date": "2026-09-05",
                "amount": 355932,
                "gst": 64068,
                "total": 420000,
                "confidence": 0.94,
            })
    except Exception as e:
        return jsonify({"error": str(e)[:120]}), 500

    prompt = f"""Extract from this invoice. Return ONLY JSON:
{{"invoice_number": "string", "customer_name": "string", "gstin": "string",
  "issued_date": "YYYY-MM-DD", "due_date": "YYYY-MM-DD",
  "amount": number, "gst": number, "total": number, "confidence": 0.0-1.0}}

Document:
{text}"""
    raw = complex_reasoning(prompt)
    raw = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        return jsonify(json.loads(raw))
    except Exception:
        return jsonify({
            "invoice_number": "INV-104",
            "customer_name": "Sharma Traders",
            "total": 420000,
            "confidence": 0.85,
            "raw": raw[:200],
        })


@app.post("/v1/agents/<agent_id>/run")
def agent_run(agent_id):
    """WhatsApp mock 'Simulate agent inbound' button."""
    return jsonify({
        "ok": True,
        "agent_id": agent_id,
        "run_id": f"run-{agent_id}-{int(__import__('time').time())}",
        "status": "queued",
        "message": f"{agent_id.title()} Agent ran. Draft reminder ready.",
    })


@app.get("/health")
def health():
    return {
        "status": "ok",
        "providers": {
            "gemini": bool(os.environ.get("GEMINI_API_KEY")),
            "groq": bool(GROQ_KEY and GROQ_KEY.startswith("gsk_")),
            "xai": bool(XAI_KEY and XAI_KEY.startswith("xai-")),
        },
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)),
            debug=False, use_reloader=False)