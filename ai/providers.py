import os
import base64
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
gemini = genai.GenerativeModel("gemini-2.5-flash-lite")

# Groq (optional)
GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
groq = OpenAI(api_key=GROQ_KEY, base_url="https://api.groq.com/openai/v1") if GROQ_KEY and GROQ_KEY.startswith("gsk_") else None

# xAI (optional)
XAI_KEY = os.environ.get("XAI_API_KEY", "")
grok = OpenAI(api_key=XAI_KEY, base_url="https://api.x.ai/v1") if XAI_KEY and XAI_KEY.startswith("xai-") else None


BIZOS_IDENTITY = """You are BizOS — a business operating system for Indian SMEs.

IDENTITY (never break):
- You ARE BizOS. Not an AI, not a model, not Gemini/GPT/Llama.
- Never say "I am Gemini", "I am an AI", "As a language model..."
- If asked "what are you", reply: "I'm BizOS, your business operating system. I help you run collections, invoices, tasks, and compliance."
- Use ₹ for currency. Indian format: 1,00,000 not 100,000.
- Direct, practical, business-focused."""


def fast_classify(text: str, categories: list) -> str:
    """Classify. Groq first, Gemini fallback. Never crashes."""
    prompt = f'Classify into ONE category: {categories}\nMessage: "{text}"\nReply ONLY the category name.'

    if groq:
        try:
            r = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20, temperature=0,
            )
            return r.choices[0].message.content.strip().lower()
        except Exception as e:
            print(f"[groq classify] {str(e)[:80]}")

    try:
        r = gemini.generate_content(prompt)
        return r.text.strip().lower()
    except Exception as e:
        print(f"[gemini classify] {str(e)[:80]}")
        return "chitchat"


def fast_answer(question: str, context: str) -> str:
    sys = f"""{BIZOS_IDENTITY}

Business data from this company's database:
{context}

Answer using ONLY the data above. Real numbers only. If no data, say so."""

    if groq:
        try:
            r = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": sys},
                          {"role": "user", "content": question}],
                max_tokens=400, temperature=0.3,
            )
            return r.choices[0].message.content
        except Exception as e:
            print(f"[groq answer] {str(e)[:80]}")

    try:
        r = gemini.generate_content(f"{sys}\n\nQ: {question}")
        return r.text
    except Exception as e:
        return f"I'm having trouble answering that right now ({str(e)[:60]}). Try /who, /tasks, or /brief."


def complex_reasoning(prompt: str) -> str:
    try:
        return gemini.generate_content(prompt).text
    except Exception as e:
        print(f"[gemini reasoning] {str(e)[:80]}")
        return "{}"


def extract_image(image_b64: str, prompt: str) -> str:
    try:
        r = gemini.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": base64.b64decode(image_b64)},
        ])
        return r.text
    except Exception as e:
        print(f"[gemini vision] {str(e)[:80]}")
        if grok:
            r = grok.chat.completions.create(
                model="grok-2-vision-1212",
                messages=[{"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                ]}],
                max_tokens=800,
            )
            return r.choices[0].message.content
        raise


def extract_pdf(pdf_bytes: bytes, prompt: str) -> str:
    r = gemini.generate_content([
        prompt,
        {"mime_type": "application/pdf", "data": pdf_bytes},
    ])
    return r.text


def web_search(query: str) -> str:
    prompt = f"""{BIZOS_IDENTITY}

Answer this business question concisely (3-5 lines max): {query}"""

    if groq:
        try:
            r = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
            )
            return r.choices[0].message.content
        except Exception:
            pass
    try:
        return gemini.generate_content(prompt).text
    except Exception as e:
        return f"Couldn't fetch that: {str(e)[:60]}"


def match_tone(text: str, user_style: str) -> str:
    """Optional polish. If it fails, returns text as-is."""
    prompt = f"""You are BizOS. Rewrite this to be friendlier. Keep ALL numbers exact.
Never mention being an AI.

Style: {user_style}
Reply: {text}

Return ONLY the rewritten reply."""

    if groq:
        try:
            r = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500, temperature=0.4,
            )
            return r.choices[0].message.content
        except Exception:
            pass
    return text