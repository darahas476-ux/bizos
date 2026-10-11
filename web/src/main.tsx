import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const T = {
  canvas: "#F6F3EC", surface: "#FCFBF8", ink: "#101828",
  primary: "#17706A", accent: "#F2A33A", muted: "#667085",
  border: "#DDD6C6", good: "#1E7A4F", watch: "#B45309", critical: "#B42318",
  goodSoft: "#E9F7EF", watchSoft: "#FBEEE0", criticalSoft: "#FDECEC",
  primarySoft: "rgba(23,112,106,0.08)",
};
const inr = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

type S = "landing" | "login" | "home" | "inbox" | "trust";

function Landing({ go }: { go: (s: S) => void }) {
  const cards = [
    { b: "#fff", t: "Overdue", v: "\u20B912.6L", s: "5 invoices" },
    { b: T.accent, t: "Invoice read", v: "INV-107", s: "\u20B91,20,000" },
    { b: "#fff", t: "Cash flow", v: "+\u20B93.4L", s: "next 30 days" },
    { b: "#0B141A", t: "BizOS Bot", v: "Who owes me?", s: "5 invoices \u00B7 \u20B912.6L" },
    { b: T.ink, t: "Compliance", v: "GSTR-3B", s: "Due in 3 days" },
    { b: "#fff", t: "Tasks", v: "8 open", s: "3 high priority" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#FBF8F1,#EFEADC)", color: T.ink, fontFamily: "system-ui,sans-serif", padding: "0 0 40px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Biz<span style={{ color: T.primary }}>OS</span></div>
        <button onClick={() => go("login")} style={{ background: T.ink, color: "#fff", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Sign in</button>
      </nav>
      <div style={{ textAlign: "center", padding: "60px 20px 20px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(23,112,106,0.08)", color: T.primary, padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 24 }}>Built for Indian MSMEs</div>
        <h1 style={{ fontSize: "clamp(40px,6vw,76px)", lineHeight: 1.05, fontWeight: 700, margin: "0 0 20px", letterSpacing: -1 }}>
          Run your business<br />on <span style={{ color: T.primary }}>WhatsApp</span>
        </h1>
        <p style={{ fontSize: 18, color: T.muted, marginBottom: 32, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>One operating system for compliance, invoices, cash flow, and customers.</p>
        <button onClick={() => go("login")} style={{ background: T.accent, color: T.ink, border: "none", borderRadius: 999, padding: "16px 32px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Get started free \u2192</button>
      </div>
      <div style={{ display: "flex", gap: 16, padding: "60px 40px", justifyContent: "center", flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: c.b, color: c.b === "#0B141A" || c.b === T.ink ? "#fff" : T.ink, borderRadius: 20, padding: 20, width: 180, minHeight: 140, boxShadow: "0 12px 30px -12px rgba(16,24,40,0.25)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>{c.t}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: "auto" }}>{c.v}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{c.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login({ go }: { go: (s: S) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: 360, padding: 32, borderRadius: 20, background: T.surface, border: "1px solid " + T.border, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Biz<span style={{ color: T.primary }}>OS</span></div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>Your business operating system</div>
        <button onClick={() => go("home")} style={{ width: "100%", padding: "14px 20px", background: T.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Demo as Rajesh</button>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 20 }}>Demo mode uses sample data</div>
      </div>
    </div>
  );
}

function Home({ go }: { go: (s: S) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: "system-ui,sans-serif", padding: 32 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -1 }}>Good morning, Rajesh</h1>
        <p style={{ color: T.muted, marginTop: 8, marginBottom: 32 }}>Here's what needs your attention today.</p>
        <div onClick={() => go("inbox")} style={{ background: T.surface, border: "1px solid " + T.border, borderLeft: "4px solid " + T.critical, borderRadius: 16, padding: 20, cursor: "pointer", marginBottom: 12 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: T.critical, fontWeight: 700, marginBottom: 6 }}>CRITICAL \u00B7 Collections Agent</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>5 invoices overdue \u00B7 \u20B912.6L</div>
          <div style={{ fontSize: 13, color: T.muted }}>Largest: Sharma Traders \u00B7 35d</div>
        </div>
        <div style={{ background: T.surface, border: "1px solid " + T.border, borderLeft: "4px solid " + T.watch, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: T.watch, fontWeight: 700, marginBottom: 6 }}>WATCH \u00B7 Operations</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>8 open tasks</div>
          <div style={{ fontSize: 13, color: T.muted }}>Team has pending work</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>Cash Projection \u00B7 30 days</div>
            <svg viewBox="0 0 300 100" style={{ width: "100%" }}>
              <path d="M0,70 L40,60 L80,65 L120,45 L160,50 L200,30 L240,25 L280,15 L300,10 L300,100 L0,100 Z" fill="rgba(23,112,106,0.15)" />
              <path d="M0,70 L40,60 L80,65 L120,45 L160,50 L200,30 L240,25 L280,15 L300,10" fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>\u20B942.3L today</div>
          </div>
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Receivables Ageing</div>
            {[{ l: "0-30d", v: 620000, c: T.primary }, { l: "31-60d", v: 420000, c: T.accent }, { l: "61-90d", v: 380000, c: "#C2410C" }, { l: "90+d", v: 210000, c: "#7C2D12" }].map((b) => (
              <div key={b.l} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>{b.l}</span><span style={{ fontWeight: 600 }}>{inr(b.v)}</span>
                </div>
                <div style={{ height: 8, background: "#F6F3EC", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (b.v / 620000) * 100 + "%", background: b.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => go("inbox")} style={{ padding: "12px 20px", background: T.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Open Inbox</button>
          <button onClick={() => go("trust")} style={{ padding: "12px 20px", background: T.surface, color: T.ink, border: "1px solid " + T.border, borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Trust & Verify</button>
        </div>
      </div>
    </div>
  );
}

function Inbox({ go }: { go: (s: S) => void }) {
  const items = [
    { name: "INV-104", cust: "Sharma Traders", amt: 420000, days: 35 },
    { name: "INV-105", cust: "Zenith Technologies", amt: 285000, days: 28 },
    { name: "INV-106", cust: "Patel Precision", amt: 178000, days: 22 },
  ];
  const [sel, setSel] = useState(items[0]);
  const [ok, setOk] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: "system-ui,sans-serif", padding: 32 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -1 }}>Inbox</h1>
          <button onClick={() => go("home")} style={{ padding: "8px 14px", border: "1px solid " + T.border, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 13, height: "fit-content" }}>\u2190 Home</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((i) => (
              <div key={i.name} onClick={() => setSel(i)} style={{ background: sel.name === i.name ? T.primarySoft : T.surface, border: "1px solid " + (sel.name === i.name ? T.primary : T.border), borderRadius: 12, padding: 14, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: T.critical, fontWeight: 700 }}>CRITICAL</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{inr(i.amt)}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{i.name} \u00B7 {i.cust}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{i.days}d overdue</div>
              </div>
            ))}
          </div>
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{sel.name} \u00B7 {sel.cust}</h2>
            <p style={{ color: T.muted, marginBottom: 20 }}>{sel.days} days overdue \u00B7 {inr(sel.amt)}</p>
            <div style={{ background: "#F6F3EC", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: T.muted, marginBottom: 8 }}>WhatsApp draft</div>
              <div style={{ background: "#0B141A", color: "#E9EDEF", borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                Dear {sel.cust},<br /><br />Gentle reminder regarding invoice {sel.name} for {inr(sel.amt)}, now {sel.days} days overdue.
              </div>
            </div>
            <div style={{ background: T.primarySoft, color: T.primary, borderRadius: 10, padding: 12, fontSize: 12, fontWeight: 600, marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
              <span>P-001 \u00B7 Top-5 customer \u00B7 manager approval required</span>
              <span style={{ background: T.critical, color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10 }}>always_gate</span>
            </div>
            {ok ? (
              <div style={{ background: T.goodSoft, color: T.good, padding: 16, borderRadius: 12, fontWeight: 600 }}>\u2713 Approved \u00B7 WhatsApp reminder sent</div>
            ) : (
              <button onClick={() => setOk(true)} style={{ padding: "12px 24px", background: T.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Approve</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Trust({ go }: { go: (s: S) => void }) {
  const rows = [
    { ref: "INV-104 \u00B7 Sharma Traders", rule: "Overdue > 30d + top-5 \u2192 manager approval", hash: "8f4a2b1c9e7d3f6a5b8c2e1d4f7a9b3c5e8d1f4a7b2c5e8d1f4a7b2c5e8d1f4a" },
    { ref: "Reminder \u00B7 INV-105", rule: "Auto-approved \u00B7 below limit", hash: "a7c2e4b8d1f9c3e6b2a5d8f1c4e7b9a2d5f8c1e4b7a2d9f5c8e1b4a7d2f5c8e1" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: "system-ui,sans-serif", padding: 32 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -1 }}>Trust & Proof</h1>
          <button onClick={() => go("home")} style={{ padding: "8px 14px", border: "1px solid " + T.border, borderRadius: 8, background: T.surface, cursor: "pointer", fontSize: 13, height: "fit-content" }}>\u2190 Home</button>
        </div>
        <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 16, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ padding: 20, borderTop: i > 0 ? "1px solid " + T.border : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.ref}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{r.rule}</div>
                </div>
                <div style={{ background: T.goodSoft, color: T.good, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>\u2713 verified</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, background: "#F6F3EC", padding: 8, borderRadius: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.hash}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [s, setS] = useState<S>("landing");
  return (
    <>
      {s === "landing" && <Landing go={setS} />}
      {s === "login" && <Login go={setS} />}
      {s === "home" && <Home go={setS} />}
      {s === "inbox" && <Inbox go={setS} />}
      {s === "trust" && <Trust go={setS} />}
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<StrictMode><App /></StrictMode>);