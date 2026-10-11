// ═══════════════════════════════════════════════════════════════════
// BizOS · main.tsx
//
// TOC — ctrl+F these exact strings to jump
//   [01] IMPORTS
//   [02] TOKENS
//   [03] FORMATTERS
//   [04] DEMO MODE
//   [05] DEMO DATA
//   [06] FIREBASE + API
//   [07] TYPES
//   [08] HOOKS
//   [09] PRIMITIVES
//   [10] CHART SYSTEM
//   [11] CHART LIBRARY
//   [12] LANDING
//   [13] LOGIN
//   [14] ONBOARDING
//   [15] SHELL
//   [15.5] NOTIFICATIONS        ← Chunk 2
//   [15.6] GLOBAL SEARCH        ← Chunk 2
//   [16] HOME                   ← Chunk 2
//   [17] INBOX                  ← Chunk 2
//   [18] INVOICE REVIEW         ← Chunk 2
//   [19] ACTION LEDGER          ← Chunk 2
//   [20] TRUST                  ← Chunk 3
//   [21] IMPACT                 ← Chunk 3
//   [22] CUSTOMERS              ← Chunk 3
//   [23] TASKS                  ← Chunk 3
//   [24] LIVE                   ← Chunk 3
//   [25] SETTINGS               ← Chunk 3
//   [26] COPILOT                ← Chunk 3
//   [26.5] WHATSAPP MOCK        ← Chunk 3
//   [26.6] AGENTS REGISTRY      ← Chunk 3
//   [26.7] COMPLIANCE           ← Chunk 3
//   [26.8] MONEY                ← Chunk 3
//   [27] AUTHED                 ← Chunk 3
//   [28] APP                    ← Chunk 3
//   [29] BOOT                   ← Chunk 3
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// [01] IMPORTS
// ═══════════════════════════════════════════════════════════════════
import {
  StrictMode, useEffect, useState, useMemo, useCallback, useRef,
  createContext, useContext, memo, Component,
  type ReactNode, type CSSProperties, type ErrorInfo,
} from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter, Routes, Route, NavLink, useNavigate, Navigate, useParams,
} from "react-router-dom";
import {
  motion, AnimatePresence, useReducedMotion, useMotionValue, animate,
  useInView, useMotionTemplate, useScroll, useSpring, useTransform,
  type MotionValue, type MotionStyle,
} from "framer-motion";
import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, type User,
} from "firebase/auth";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Home as HomeIcon, Inbox as InboxIcon, Users, IndianRupee, CheckSquare,
  Radio, Leaf, ShieldCheck, Settings as SettingsIcon, Bell, Search,
  Sparkles, ChevronRight, AlertTriangle, Check, X, Edit3, UserPlus,
  RefreshCw, ArrowRight, ArrowLeft, Filter, Zap, Clock, FileText, Building2,
  Download, Share2, Loader2, Table2, BarChart3, Image as ImageIcon,
  ZoomIn, ZoomOut, RotateCw, Flag, Layers,
  Receipt, Calendar, Wallet, Landmark, FileSpreadsheet, Truck,
  ClipboardList, Camera, MessageCircle, Copy,
  ArrowUpRight, BellRing, Send, Command, CornerDownLeft,
  Bot, Package, Plug, Lock, Globe, Gauge, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, MoreHorizontal, ExternalLink, Eye, EyeOff,
  CircleDot, Plus, Minus, ListChecks, Award, Target, Scale, Briefcase,
  type LucideIcon,
} from "lucide-react";
import "./index.css";

// ═══════════════════════════════════════════════════════════════════
// [02] TOKENS
// ═══════════════════════════════════════════════════════════════════
export const T = {
  canvas: "#F6F3EC",
  surface: "#FCFBF8",
  ink: "#101828",
  primary: "#17706A",
  accent: "#F2A33A",
  muted: "#667085",
  border: "#DDD6C6",
  borderSoft: "rgba(16,24,40,0.08)",
  borderStrong: "rgba(16,24,40,0.15)",
  good: "#1E7A4F",
  watch: "#B45309",
  critical: "#B42318",
  primarySoft: "rgba(23,112,106,0.08)",
  goodSoft: "#E9F7EF",
  watchSoft: "#FBEEE0",
  criticalSoft: "#FDECEC",
  terracotta: "#C2410C",
  rust: "#7C2D12",
} as const;

export const CHART = {
  grid: "#EDE7DA",
  axis: "#6B7280",
  series1: T.primary,
  series2: T.accent,
  series3: T.good,
  series4: "#B45309",
  series5: "#B42318",
  series6: "#4B5563",
} as const;

export const WA = {
  green: "#25D366",
  dark: "#0B141A",
  bubbleIn: "#202C33",
  bubbleOut: "#005C4B",
  text: "#E9EDEF",
  textMuted: "#8696A0",
  tick: "#53BDEB",
} as const;

// ═══════════════════════════════════════════════════════════════════
// [03] FORMATTERS
// ═══════════════════════════════════════════════════════════════════
export const fmtINR = (n: number) => {
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return "₹" + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (n < 0 ? "-₹" : "₹") + rest + "," + last3;
};
export const fmtShort = (n: number) => {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};
export const daysAgo = (d: number) =>
  d < 1 ? "today" : d < 30 ? `${d}d` : `${Math.floor(d / 30)}mo`;
export const relTime = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ═══════════════════════════════════════════════════════════════════
// [04] DEMO MODE
// ═══════════════════════════════════════════════════════════════════
const DEMO_KEY = "bizos_demo_mode";
export const isDemoMode = () => localStorage.getItem(DEMO_KEY) === "1";
export const enableDemo = () => localStorage.setItem(DEMO_KEY, "1");
export const disableDemo = () => localStorage.removeItem(DEMO_KEY);

// ═══════════════════════════════════════════════════════════════════
// [05] DEMO DATA
// ═══════════════════════════════════════════════════════════════════
export const DEMO_USER = {
  id: "demo-user", email: "rajesh@abccomponents.in",
  business_name: "ABC Components Pvt Ltd", gstin: "27AABCA1234F1Z5",
  industry: "manufacturing", city: "Mumbai", onboarding_completed: true,
};

export const DEMO_ENTITIES = [
  { id: "c1", type: "customer", name: "Sharma Traders", data: { tier: "top5", city: "Mumbai", lifetime_value: 2100000, phone: "+91 98765 43210", email: "accounts@sharmatraders.in" } },
  { id: "c2", type: "customer", name: "Zenith Technologies LLP", data: { tier: "top5", city: "Bengaluru", lifetime_value: 1750000 } },
  { id: "c3", type: "customer", name: "Patel Precision Works", data: { tier: "top5", city: "Ahmedabad", lifetime_value: 1480000 } },
  { id: "c4", type: "customer", name: "ABC Enterprises Pvt Ltd", data: { tier: "top5", city: "Mumbai", lifetime_value: 1120000 } },
  { id: "c5", type: "customer", name: "XYZ Engineering Works", data: { tier: "top5", city: "Pune", lifetime_value: 950000 } },
  { id: "i1", type: "invoice", name: "INV-104", data: { customer_name: "Sharma Traders", total: 420000, gst: 64068, status: "overdue", days_overdue: 35, due_date: "2026-09-05", issued_date: "2026-08-06", top_customer: true, confidence: 0.94, reminder_sent_hours_ago: 2 } },
  { id: "i2", type: "invoice", name: "INV-105", data: { customer_name: "Zenith Technologies LLP", total: 285000, status: "overdue", days_overdue: 28, due_date: "2026-09-12", confidence: 0.91 } },
  { id: "i3", type: "invoice", name: "INV-106", data: { customer_name: "Patel Precision Works", total: 178000, status: "overdue", days_overdue: 22, due_date: "2026-09-18", confidence: 0.88 } },
  { id: "i4", type: "invoice", name: "INV-107", data: { customer_name: "ABC Enterprises Pvt Ltd", total: 245000, status: "overdue", days_overdue: 18, due_date: "2026-09-22", confidence: 0.72 } },
  { id: "i5", type: "invoice", name: "INV-108", data: { customer_name: "XYZ Engineering Works", total: 132000, status: "overdue", days_overdue: 15, due_date: "2026-09-25", confidence: 0.95 } },
  { id: "i6", type: "invoice", name: "INV-201", data: { customer_name: "Sharma Traders", total: 320000, status: "paid", paid_date: "2026-08-28", confidence: 0.98 } },
  { id: "i7", type: "invoice", name: "INV-202", data: { customer_name: "Zenith Technologies LLP", total: 285000, status: "paid", paid_date: "2026-09-04", confidence: 0.97 } },
  { id: "i8", type: "invoice", name: "INV-203", data: { customer_name: "Patel Precision Works", total: 178000, status: "paid", paid_date: "2026-09-10", confidence: 0.96 } },
  { id: "t1", type: "task", name: "Follow up with Sharma Traders on ₹4.2L overdue", data: { status: "open", owner: "Ravi", priority: "high", due_date: "2026-10-11", created_by: "agent", age_hours: 52 } },
  { id: "t2", type: "task", name: "Send final reminder to Zenith Technologies", data: { status: "open", owner: "Ravi", priority: "high", due_date: "2026-10-12", created_by: "agent", age_hours: 30 } },
  { id: "t3", type: "task", name: "Verify GSTR-3B filing data", data: { status: "in_progress", owner: "Meera", priority: "high", due_date: "2026-10-13", age_hours: 22 } },
  { id: "t4", type: "task", name: "Negotiate with Bharat Steel Suppliers", data: { status: "open", owner: "Ankit", priority: "medium", due_date: "2026-10-15", age_hours: 8 } },
  { id: "t5", type: "task", name: "Approve purchase order", data: { status: "open", owner: "Ankit", priority: "high", due_date: "2026-10-11", age_hours: 4 } },
  { id: "t6", type: "task", name: "Schedule demo with Patel Precision", data: { status: "open", owner: "Priya", priority: "low", due_date: "2026-10-18", age_hours: 2 } },
  { id: "t7", type: "task", name: "Reconcile bank statement", data: { status: "in_progress", owner: "Ravi", priority: "low", due_date: "2026-10-14", age_hours: 20 } },
  { id: "t8", type: "task", name: "Update DPDP consent ledger", data: { status: "open", owner: "Meera", priority: "medium", due_date: "2026-10-16", age_hours: 12 } },
  { id: "v1", type: "vendor", name: "Bharat Steel Suppliers Pvt Ltd", data: { category: "Raw Material - Steel", rating: 4.5 } },
  { id: "v2", type: "vendor", name: "Surya Packaging Industries", data: { category: "Packaging", rating: 4.2 } },
  { id: "v3", type: "vendor", name: "Delhivery Logistics", data: { category: "Logistics", rating: 4.0 } },
  { id: "e1", type: "esg_metric", name: "Governance Coverage", data: { category: "governance", value: 68, target: 90 } },
];

// ═══════════════════════════════════════════════════════════════════
// [06] FIREBASE + API
// ═══════════════════════════════════════════════════════════════════
let fbApp: any = null;
let auth: any = null;
try {
  fbApp = initializeApp({
    apiKey: import.meta.env.VITE_FB_API_KEY || "demo",
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || "demo.firebaseapp.com",
    projectId: import.meta.env.VITE_FB_PROJECT_ID || "demo",
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || "demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID || "0",
    appId: import.meta.env.VITE_FB_APP_ID || "demo",
  });
  auth = getAuth(fbApp);
} catch (e) {
  console.warn("Firebase init failed — falling back to demo mode");
  auth = null;
}

export const signInGoogle = async () => {
  if (!auth) { enableDemo(); window.location.href = "/bizos/"; return; }
  return signInWithPopup(auth, new GoogleAuthProvider());
};
export const logOut = () => {
  disableDemo();
  if (auth) signOut(auth);
  window.location.href = "/bizos/";
};

export const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:5001";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://10.0.2.43:8080",
});
api.interceptors.request.use(async (cfg) => {
  if (isDemoMode()) return cfg;
  if (!auth) return cfg;
  const u = auth.currentUser;
  if (u) cfg.headers.Authorization = `Bearer ${await u.getIdToken()}`;
  return cfg;
});

// ═══════════════════════════════════════════════════════════════════
// [07] TYPES
// ═══════════════════════════════════════════════════════════════════
export type Entity = { id: string; type: string; name: string | null; data?: Record<string, any> };
export type Me = {
  id: string; email: string | null; business_name: string | null;
  gstin: string | null; industry: string | null; city: string | null;
  onboarding_completed: boolean;
};
export type Severity = "critical" | "watch" | "good";

type ApprovalState = { approved: number; bump: () => void; reset: () => void };
const ApprovalCtx = createContext<ApprovalState>({ approved: 0, bump: () => {}, reset: () => {} });
export const useApprovals = () => useContext(ApprovalCtx);

// ═══════════════════════════════════════════════════════════════════
// [08] HOOKS
// ═══════════════════════════════════════════════════════════════════
type LiveResult<T> = { data: T | null; loading: boolean; error: string | null; refresh: () => Promise<void> };
function useLive<T>(fetcher: () => Promise<T>, intervalMs = 5000): LiveResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);
  const load = useCallback(async () => {
    if (isDemoMode()) { setData(DEMO_ENTITIES as unknown as T); setLoading(false); return; }
    try { const res = await fetcherRef.current(); setData(res); setError(null); }
    catch (e: any) { setError(e?.message ?? "fetch failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    load();
    const ms = isDemoMode() ? 30_000 : intervalMs;
    const id = setInterval(load, ms);
    return () => clearInterval(id);
  }, [load, intervalMs]);
  return { data, loading, error, refresh: load };
}
const fetchEntities = async () => (await api.get<Entity[]>("/entities")).data;
export const useEntities = () => useLive(fetchEntities);

export function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV] as const;
}

export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  const mapRef = useRef(map);
  useEffect(() => { mapRef.current = map; });
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const fn = mapRef.current[e.key];
      if (fn) fn(e);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}

export const useCalm = () => useReducedMotion() ?? false;
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}

// ═══════════════════════════════════════════════════════════════════
// [09] PRIMITIVES
// ═══════════════════════════════════════════════════════════════════
export function Sparkline({ data, colour, width = 60, height = 20, fill = false }:
  { data: number[]; colour: string; width?: number; height?: number; fill?: boolean }) {
  const calm = useCalm();
  if (!data || data.length < 2) return <svg width={width} height={height} aria-hidden />;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / range) * height]);
  const points = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M 0 ${height} L ${points.split(" ").join(" L ")} L ${width} ${height} Z`;
  const gid = `spark-${colour.replace(/[^a-z0-9]/gi, "")}-${width}-${data.length}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }} aria-hidden>
      {fill && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colour} stopOpacity="0.22" />
            <stop offset="100%" stopColor={colour} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <motion.polyline points={points} fill="none" stroke={colour} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }} />
    </svg>
  );
}

export function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString("en-IN"),
  className, style, duration = 0.6 }:
  { value: number; format?: (n: number) => string; className?: string; style?: CSSProperties; duration?: number }) {
  const calm = useCalm();
  const mv = useMotionValue(value);
  const [text, setText] = useState(() => format(value));
  const fmtRef = useRef(format); fmtRef.current = format;
  useEffect(() => {
    if (calm) { setText(fmtRef.current(value)); return; }
    const controls = animate(mv, value, { duration, ease: "easeOut", onUpdate: (v) => setText(fmtRef.current(v)) });
    return () => controls.stop();
  }, [value, calm, duration]);
  return <span className={`tabular-nums ${className ?? ""}`} style={style}>{text}</span>;
}

export function EsgGauge({ value, colour, size = 80, label }:
  { value: number; colour: string; size?: number; label?: string }) {
  const calm = useCalm();
  const r = size * 0.4, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={label ?? `Coverage ${value} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F6F3EC" strokeWidth={size * 0.1} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={colour} strokeWidth={size * 0.1} strokeDasharray={c}
          initial={{ strokeDashoffset: calm ? c - (c * value) / 100 : c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: calm ? 0 : 0.9, ease: "easeOut" }}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold tabular-nums"
        style={{ color: colour, fontSize: size * 0.22 }}>
        <AnimatedNumber value={value} format={(n) => `${Math.round(n)}%`} />
      </div>
    </div>
  );
}

export function SeverityPill({ severity, label }: { severity: Severity; label?: string }) {
  const bg = severity === "critical" ? T.criticalSoft : severity === "watch" ? T.watchSoft : T.goodSoft;
  const color = severity === "critical" ? T.critical : severity === "watch" ? T.watch : T.good;
  const Icon = severity === "critical" ? AlertTriangle : severity === "watch" ? Clock : Check;
  return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium whitespace-nowrap inline-flex items-center gap-1"
      style={{ background: bg, color }}>
      <Icon size={9} strokeWidth={2.5} />{label ?? severity}
    </span>
  );
}

export function EvidenceField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>{label}</div>
      <div className={`text-sm p-3 rounded-lg ${mono ? "font-mono text-xs" : ""}`}
        style={{ background: "#F6F3EC", color: T.ink, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

export function Chip({ icon, label, tone }: { icon: string; label: string; tone?: Severity }) {
  const color = tone === "critical" ? T.critical : tone === "watch" ? T.watch : tone === "good" ? T.good : T.muted;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5"
      style={{ borderColor: T.border, background: T.surface, color }}>
      <span aria-hidden>{icon}</span>{label}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono mx-0.5 inline-flex items-center"
      style={{ borderColor: T.border, background: T.surface, color: T.muted }}>{children}</kbd>
  );
}

export function EmptyState({ icon = "✓", title, body, action }:
  { icon?: ReactNode; title: string; body?: string; action?: { label: string; onClick: () => void } }) {
  const calm = useCalm();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-16 text-center"
      style={{ borderColor: T.border, background: T.surface }}>
      <motion.div initial={calm ? false : { scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
        style={{ background: T.goodSoft, color: T.good }}>{icon}</motion.div>
      <div className="font-display text-xl mb-2">{title}</div>
      {body && <div className="text-sm mb-4" style={{ color: T.muted }}>{body}</div>}
      {action && (
        <button onClick={action.onClick}
          className="text-sm px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: T.primary }}>{action.label}</button>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [10] CHART SYSTEM
// ═══════════════════════════════════════════════════════════════════
export function FreshnessChip({ at, staleAfterMs = 5 * 60_000 }: { at: number; staleAfterMs?: number }) {
  const now = useNow(30_000);
  const stale = now - at > staleAfterMs;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: stale ? T.watchSoft : "#F6F3EC", color: stale ? T.watch : T.muted }}>
      as of {relTime(at)}
    </span>
  );
}

export function ExportMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const items = [
    { icon: <ImageIcon size={12} />, label: "Download PNG", msg: `${name} exported as PNG` },
    { icon: <Table2 size={12} />, label: "Download CSV", msg: `${name} exported as CSV` },
    { icon: <Share2 size={12} />, label: "Copy share link", msg: "Share link copied" },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label={`Export ${name}`}
        className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] transition"
        style={{ borderColor: T.border, color: T.muted }}>
        <Download size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12 }}
            className="absolute right-0 top-7 z-30 w-44 rounded-xl overflow-hidden glass-3">
            {items.map((it) => (
              <button key={it.label} onClick={() => { setOpen(false); toast.success(it.msg); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/60 transition"
                style={{ color: T.ink }}>
                {it.icon}{it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChartFrame({ title, subtitle, fresh, ranges, range, onRange,
  children, table, actions, empty, loading, minHeight = 0 }:
  { title: string; subtitle?: string; fresh?: number; ranges?: number[]; range?: number;
    onRange?: (r: number) => void; children?: ReactNode; table?: ReactNode;
    actions?: ReactNode; empty?: boolean; loading?: boolean; minHeight?: number }) {
  const [showTable, setShowTable] = useState(false);
  const calm = useCalm();
  return (
    <motion.div whileHover={calm ? undefined : { boxShadow: "0 8px 30px -12px rgba(16,24,40,0.15)" }}
      className="rounded-2xl border p-5 transition-all"
      style={{ borderColor: T.border, background: T.surface, minHeight }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-display text-base flex items-center gap-2 flex-wrap">
            {title}
            {fresh !== undefined && <FreshnessChip at={fresh} />}
          </div>
          {subtitle && <div className="text-xs mt-1" style={{ color: T.muted }}>{subtitle}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {ranges && onRange && ranges.map((r) => (
            <motion.button key={r} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onRange(r)}
              className="text-xs px-2.5 py-1 rounded font-medium transition"
              style={{ background: range === r ? T.primary : "transparent",
                color: range === r ? "#fff" : T.muted,
                border: range === r ? "none" : `1px solid ${T.border}` }}>{r}d</motion.button>
          ))}
          {table && (
            <button onClick={() => setShowTable((v) => !v)} aria-pressed={showTable} aria-label="View as table"
              className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] transition"
              style={{ borderColor: showTable ? T.primary : T.border, color: showTable ? T.primary : T.muted }}>
              {showTable ? <BarChart3 size={11} /> : <Table2 size={11} />}
            </button>
          )}
          <ExportMenu name={title} />
          {actions}
        </div>
      </div>
      {loading ? (
        <div className="h-40 rounded-xl animate-pulse" style={{ background: "rgba(16,24,40,0.05)" }} />
      ) : empty ? (
        <EmptyState title="No data yet" body="Connect a source to populate this chart." />
      ) : showTable && table ? (
        <div className="overflow-x-auto">{table}</div>
      ) : children}
    </motion.div>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
          {head.map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t" style={{ borderColor: T.border }}>
            {r.map((c, j) => (
              <td key={j} className={`px-2 py-2 ${j > 0 ? "tabular-nums" : ""}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [11] CHART LIBRARY
// ═══════════════════════════════════════════════════════════════════
export function CashProjectionChart({ onDrill }: { onDrill?: () => void }) {
  const [range, setRange] = useLocalState<number>("bizos.cash.range", 30);
  const calm = useCalm();
  const points = useMemo(() => {
    const out: { x: number; y: number; v: number; lo: number; hi: number }[] = [];
    let cash = 4200000;
    for (let i = 0; i < range; i++) {
      cash += Math.sin(i / 10) * 180000 + (i < 10 ? 120000 : 40000);
      const v = Math.round(cash);
      out.push({ x: (i / (range - 1)) * 100, y: 0, v, lo: Math.round(v * 0.94), hi: Math.round(v * 1.06) });
    }
    const max = Math.max(...out.map((p) => p.hi));
    const min = Math.min(...out.map((p) => p.lo));
    const r = max - min || 1;
    out.forEach((p) => { p.y = 100 - ((p.v - min) / r) * 100; });
    return out;
  }, [range]);
  const yMin = Math.min(...points.map((p) => p.lo));
  const yMax = Math.max(...points.map((p) => p.hi));
  const yRange = yMax - yMin || 1;
  const normY = (v: number) => 100 - ((v - yMin) / yRange) * 100;
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${normY(p.v)}`).join(" ");
  const upperPts = points.map((p) => `${p.x} ${normY(p.hi)}`);
  const lowerPts = [...points].reverse().map((p) => `${p.x} ${normY(p.lo)}`);
  const bandPath = `M ${upperPts.join(" L ")} L ${lowerPts.join(" L ")} Z`;
  const table = (
    <DataTable head={["Day", "Projected", "Low", "High"]}
      rows={points.filter((_, i) => i % Math.max(1, Math.floor(range / 8)) === 0)
        .map((p, i) => [`+${i * Math.max(1, Math.floor(range / 8))}d`, fmtINR(p.v), fmtINR(p.lo), fmtINR(p.hi)])} />
  );
  return (
    <ChartFrame title="Cash Projection" subtitle="Confidence band · updated 2 min ago"
      fresh={Date.now() - 120_000} ranges={[30, 60, 90]} range={range} onRange={setRange} table={table}>
      <div className="relative cursor-pointer" style={{ height: 220 }} onClick={onDrill}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}
          role="img" aria-label={`Cash projection over ${range} days, runway 47 days`}>
          <defs>
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.primary} stopOpacity="0.22" />
              <stop offset="100%" stopColor={T.primary} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={CHART.grid} strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" y1="80" x2="100" y2="80" stroke={T.critical} strokeDasharray="2 2" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          <path d={bandPath} fill="url(#bandFill)" />
          <motion.path d={linePath} fill="none" stroke={T.primary} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: calm ? 0 : 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded font-mono"
          style={{ background: T.goodSoft, color: T.good }}>
          <AnimatedNumber value={4230000} format={fmtShort} /> today
        </div>
      </div>
      <div className="flex justify-between text-[10px] mt-2" style={{ color: T.muted }}>
        <span>Today</span><span>+{Math.round(range / 3)}d</span>
        <span>+{Math.round((2 * range) / 3)}d</span><span>+{range}d</span>
      </div>
    </ChartFrame>
  );
}

export function AgeingBars({ onDrill }: { onDrill?: (bucket: string) => void }) {
  const buckets = [
    { name: "0–30d",  amount: 620000, colour: T.primary },
    { name: "31–60d", amount: 420000, colour: T.accent },
    { name: "61–90d", amount: 380000, colour: T.terracotta },
    { name: "90+d",   amount: 210000, colour: T.rust },
  ];
  const max = Math.max(...buckets.map((b) => b.amount));
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const table = (
    <DataTable head={["Bucket", "Amount", "% of total"]}
      rows={buckets.map((b) => [b.name, fmtINR(b.amount), `${Math.round((b.amount / total) * 100)}%`])} />
  );
  return (
    <ChartFrame title="Receivables Ageing" subtitle="Click a bucket to filter invoices"
      fresh={Date.now() - 90_000} table={table}>
      <div className="space-y-3">
        {buckets.map((b, i) => (
          <motion.div key={b.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.01 }}
            className="cursor-pointer group" onClick={() => onDrill?.(b.name)}>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5" style={{ color: T.muted }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.colour }} />{b.name}
              </span>
              <span className="font-medium tabular-nums">{fmtINR(b.amount)}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F6F3EC" }}>
              <motion.div className="h-full rounded-full group-hover:opacity-80"
                initial={{ width: 0 }} animate={{ width: `${(b.amount / max) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
                style={{ background: b.colour }} />
            </div>
          </motion.div>
        ))}
      </div>
    </ChartFrame>
  );
}

export const ApprovalVolumeBar = memo(function ApprovalVolumeBar({ onBarClick, days = 14 }:
  { onBarClick?: (daysAgo: number) => void; days?: number }) {
  const data = useMemo(() => Array.from({ length: days }, (_, i) => 3 + Math.floor(Math.abs(Math.sin(i / 2) * 8))), [days]);
  const max = Math.max(...data);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-0.5 h-10" role="group" aria-label="Approvals per day, last 14 days">
      {data.map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
          whileHover={{ scaleY: 1.15 }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          onClick={() => onBarClick?.(days - i)}
          className="w-1.5 rounded-sm cursor-pointer"
          style={{ background: i === data.length - 1 ? T.primary : hovered === i ? T.primary : "rgba(23,112,106,0.35)", minHeight: 3 }}
          title={`${v} approvals · ${days - i}d ago`} />
      ))}
    </div>
  );
});

export const AgeHistogram = memo(function AgeHistogram({ onBrush, active }:
  { onBrush?: (bucket: string) => void; active?: string | null }) {
  const buckets = [
    { label: "<1d", v: 2, key: "<1d" }, { label: "1–3d", v: 5, key: "1-3d" },
    { label: "3–7d", v: 8, key: "3-7d" }, { label: "7–14d", v: 4, key: "7-14d" },
    { label: "14–30d", v: 3, key: "14-30d" }, { label: "30d+", v: 1, key: "30d+" },
  ];
  const max = Math.max(...buckets.map((b) => b.v));
  return (
    <div className="flex items-end gap-1 h-[60px]">
      {buckets.map((b) => (
        <motion.button key={b.label} whileHover={{ scaleY: 1.05 }}
          onClick={() => onBrush?.(b.key)}
          className="flex-1 flex flex-col items-center justify-end group"
          title={`${b.label}: ${b.v} items`} aria-pressed={active === b.key}>
          <div className="w-full rounded-t-sm transition-all group-hover:opacity-80"
            style={{ height: `${(b.v / max) * 100}%`, background: active === b.key ? T.accent : T.primary, minHeight: 4 }} />
          <div className="text-[8px] mt-1" style={{ color: active === b.key ? T.primary : T.muted }}>{b.label}</div>
        </motion.button>
      ))}
    </div>
  );
});

export const RiskMixDonut = memo(function RiskMixDonut({ critical, watch, good }:
  { critical: number; watch: number; good: number }) {
  const total = critical + watch + good || 1;
  const crit = (critical / total) * 100, wat = (watch / total) * 100;
  const r = 6, c = 2 * Math.PI * r;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: "rotate(-90deg)" }} role="img"
      aria-label={`Risk mix: ${critical} critical, ${watch} watch, ${good} good`}>
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.goodSoft} strokeWidth="3" />
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.watch} strokeWidth="3"
        strokeDasharray={`${(wat / 100) * c} ${c}`} strokeDashoffset={-(crit / 100) * c} />
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.critical} strokeWidth="3"
        strokeDasharray={`${(crit / 100) * c} ${c}`} />
    </svg>
  );
});

export function ConfidenceBar({ value, label = "OCR confidence" }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const colour = pct >= 90 ? T.good : pct >= 75 ? T.watch : T.critical;
  const word = pct >= 90 ? "High" : pct >= 75 ? "Check" : "Low";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span style={{ color: T.muted }}>{label}</span>
        <span className="font-mono font-medium" style={{ color: colour }}>
          {word} · <AnimatedNumber value={pct} format={(n) => `${Math.round(n)}%`} />
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F6F3EC" }}>
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }} style={{ background: colour }} />
      </div>
    </div>
  );
}

export function HealthTile({ label, state, sparkline, onClick }:
  { label: string; state: Severity; sparkline: number[]; onClick?: () => void }) {
  const colour = state === "good" ? T.good : state === "watch" ? T.watch : T.critical;
  const bg = state === "good" ? T.goodSoft : state === "watch" ? T.watchSoft : T.criticalSoft;
  const Icon = state === "good" ? Check : state === "watch" ? Clock : AlertTriangle;
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 24px -12px rgba(16,24,40,0.15)" }}
      onClick={onClick}
      className="rounded-2xl border p-4 cursor-pointer transition-all"
      style={{ borderColor: T.border, background: T.surface }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1"
          style={{ background: bg, color: colour }}>
          <Icon size={9} strokeWidth={2.5} />{state}
        </span>
      </div>
      <Sparkline data={sparkline} colour={colour} width={80} height={24} fill />
    </motion.div>
  );
}

export function QueueProgress({ cleared, skipped, flagged, remaining, activeFilter, onSegment }:
  { cleared: number; skipped: number; flagged: number; remaining: number;
    activeFilter: string | null;
    onSegment: (key: "cleared" | "skipped" | "flagged" | "remaining") => void }) {
  const total = Math.max(1, cleared + skipped + flagged + remaining);
  const segs = [
    { key: "cleared" as const, label: "Cleared", value: cleared, colour: T.good },
    { key: "skipped" as const, label: "Skipped", value: skipped, colour: "#98A2B3" },
    { key: "flagged" as const, label: "Flagged", value: flagged, colour: T.watch },
    { key: "remaining" as const, label: "Remaining", value: remaining, colour: "#EDE7DA" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium tabular-nums">{cleared} of {total} cleared</div>
        {activeFilter && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
            style={{ background: T.primarySoft, color: T.primary }}>filter: {activeFilter}</span>
        )}
      </div>
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "#F6F3EC" }}>
        {segs.map((s) => s.value > 0 && (
          <motion.button key={s.key} layout initial={{ width: 0 }}
            animate={{ width: `${(s.value / total) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={() => onSegment(s.key)} title={`${s.label}: ${s.value}`}
            aria-label={`Filter by ${s.label}`} className="h-full transition-opacity hover:opacity-80"
            style={{ background: s.colour, opacity: activeFilter && activeFilter !== s.key ? 0.35 : 1 }} />
        ))}
      </div>
      <div className="flex gap-3 mt-2 text-[10px] flex-wrap" style={{ color: T.muted }}>
        {segs.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.colour }} />
            {s.label} · <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function FieldConfidence({ value, width = 44 }: { value: number; width?: number }) {
  const pct = Math.round(value * 100);
  const colour = pct >= 90 ? T.good : pct >= 75 ? T.watch : T.critical;
  const word = pct >= 90 ? "High" : pct >= 75 ? "Check" : "Low";
  return (
    <div className="flex items-center gap-2" title={`${word} · ${pct}%`}>
      <div className="rounded-sm overflow-hidden" style={{ width, height: 5, background: "#F6F3EC" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: colour }} />
      </div>
      <span className="text-[9px] font-mono tabular-nums" style={{ color: colour }}>{pct}</span>
    </div>
  );
}

export function AmountHistogram({ values, active, onBrush }:
  { values: number[]; active: [number, number] | null; onBrush: (r: [number, number] | null) => void }) {
  const buckets = useMemo(() => {
    const edges = [0, 100_000, 200_000, 300_000, 500_000, 1_000_000, Infinity];
    const labels = ["<1L", "1–2L", "2–3L", "3–5L", "5–10L", "10L+"];
    return labels.map((label, i) => ({
      label, lo: edges[i], hi: edges[i + 1],
      v: values.filter((x) => x >= edges[i] && x < edges[i + 1]).length,
    }));
  }, [values]);
  const max = Math.max(1, ...buckets.map((b) => b.v));
  return (
    <div className="flex items-end gap-1.5 h-[110px]" role="group" aria-label="Invoice amount distribution">
      {buckets.map((b) => {
        const selected = active && active[0] === b.lo;
        const pct = (b.v / max) * 100;
        return (
          <button key={b.label} onClick={() => onBrush(selected ? null : [b.lo, b.hi])}
            className="flex-1 h-full flex flex-col items-center justify-end group"
            aria-pressed={!!selected} aria-label={`${b.label}: ${b.v} invoices`}>
            <div className="text-[10px] font-medium tabular-nums mb-1 transition-colors"
              style={{ color: selected ? T.primary : b.v > 0 ? T.ink : T.muted }}>
              {b.v}
            </div>
            <div className="w-full rounded-t transition-all group-hover:opacity-85"
              style={{
                height: `${Math.max(pct, b.v > 0 ? 6 : 2)}%`,
                background: selected ? T.accent : b.v > 0 ? T.primary : "#E7E2D5",
                minHeight: b.v > 0 ? 6 : 2,
              }} />
            <div className="text-[9px] mt-1.5 whitespace-nowrap transition-colors"
              style={{ color: selected ? T.primary : T.muted }}>
              {b.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function OcrAccuracyTrend() {
  const calm = useCalm();
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => 88 + Math.sin(i / 4) * 3 + (i > 20 ? 3 : 0)), []);
  const max = 100, min = 80, w = 400, h = 140;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <div className="pt-4 border-t" style={{ borderColor: T.border }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-display text-sm">OCR accuracy · last 30 days</div>
          <div className="text-[10px]" style={{ color: T.muted }}>Trust signal · higher is better</div>
        </div>
        <div className="text-xs font-mono tabular-nums" style={{ color: T.good }}>
          {data[data.length - 1].toFixed(1)}%
        </div>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, height: "auto" }}
        role="img" aria-label="OCR accuracy trend, last 30 days">
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke={CHART.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={path} fill="none" stroke={T.primary} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: calm ? 0 : 0.9, ease: "easeOut" }} />
      </svg>
    </div>
  );
}

export const AnchorFrequencyBar = memo(function AnchorFrequencyBar({
  onBarClick, days = 21,
}: { onBarClick?: (d: number) => void; days?: number }) {
  const data = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const base = 6 + Math.floor(Math.abs(Math.sin(i / 2.3) * 10));
      const bump = i === days - 2 ? 8 : 0;
      return base + bump;
    });
  }, [days]);
  const max = Math.max(...data);
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, n) => s + n, 0);
  const table = (
    <DataTable head={["Day", "Anchors"]}
      rows={data.map((v, i) => [`${days - i}d ago`, v])} />
  );
  return (
    <ChartFrame title="Anchor Frequency" subtitle={`${total} anchored actions · last ${days} days`}
      fresh={Date.now() - 60_000} table={table}>
      <div className="flex items-end gap-1 h-20" role="group" aria-label="Anchors per day, last 21 days">
        {data.map((v, i) => (
          <motion.button
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(v / max) * 100}%` }}
            transition={{ delay: i * 0.015, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scaleY: 1.08 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onBarClick?.(days - i)}
            className="flex-1 rounded-t-sm cursor-pointer"
            style={{
              background: i === data.length - 2 ? T.accent
                : hovered === i ? T.primary
                : "rgba(23,112,106,0.35)",
              minHeight: 4,
            }}
            title={`${v} anchors · ${days - i}d ago`}
            aria-label={`${v} anchors ${days - i} days ago`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] mt-2" style={{ color: T.muted }}>
        <span>{days}d ago</span>
        <span>{Math.ceil(days / 2)}d ago</span>
        <span>Today</span>
      </div>
    </ChartFrame>
  );
});

export const VerificationStatusDonut = memo(function VerificationStatusDonut({
  verified, pending, failed,
}: { verified: number; pending: number; failed: number }) {
  const total = Math.max(1, verified + pending + failed);
  const segs = [
    { key: "verified", label: "Verified", value: verified, colour: T.good },
    { key: "pending", label: "Pending", value: pending, colour: T.watch },
    { key: "failed", label: "Failed", value: failed, colour: T.critical },
  ];
  const r = 34, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
      <div className="font-display text-base mb-1">Verification Status</div>
      <div className="text-xs mb-4" style={{ color: T.muted }}>Anchor proof results</div>
      <div className="flex items-center gap-5">
        <div className="relative" style={{ width: 92, height: 92 }}>
          <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="46" cy="46" r={r} fill="none" stroke="#F6F3EC" strokeWidth="10" />
            {segs.map((s) => {
              const len = (s.value / total) * c;
              const el = (
                <motion.circle key={s.key}
                  cx="46" cy="46" r={r} fill="none"
                  stroke={s.colour} strokeWidth="10"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  strokeLinecap="butt" />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold tabular-nums" style={{ color: T.good }}>
              {Math.round((verified / total) * 100)}%
            </div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted }}>verified</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {segs.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5" style={{ color: T.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: s.colour }} />
                {s.label}
              </span>
              <span className="font-medium tabular-nums" style={{ color: T.ink }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const ActionTypeMixBar = memo(function ActionTypeMixBar({
  approve, edit, reject, active, onSegment,
}: {
  approve: number; edit: number; reject: number;
  active: string | null;
  onSegment: (key: "approve" | "edit" | "reject") => void;
}) {
  const total = Math.max(1, approve + edit + reject);
  const segs = [
    { key: "approve" as const, label: "Approve", value: approve, colour: T.good },
    { key: "edit" as const, label: "Edit", value: edit, colour: T.primary },
    { key: "reject" as const, label: "Reject", value: reject, colour: T.critical },
  ];
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: T.border, background: T.surface }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium">Action type mix</div>
        <div className="text-[10px] tabular-nums" style={{ color: T.muted }}>{total} total</div>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "#F6F3EC" }}>
        {segs.map((s) => s.value > 0 && (
          <motion.button key={s.key} layout
            initial={{ width: 0 }} animate={{ width: `${(s.value / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={() => onSegment(s.key)}
            className="h-full transition-opacity hover:opacity-80"
            style={{ background: s.colour, opacity: active && active !== s.key ? 0.35 : 1 }}
            title={`${s.label}: ${s.value}`}
            aria-label={`Filter by ${s.label}`} />
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-[10px]" style={{ color: T.muted }}>
        {segs.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.colour }} />
            {s.label} · <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// [12] LANDING
// ═══════════════════════════════════════════════════════════════════
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50 pointer-events-none"
      style={{ scaleX, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }}
    />
  );
}

function Magnetic({
  children, onClick, className = "", style, strength = 0.28, calm,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: MotionStyle;
  strength?: number;
  calm: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 });
  const k = calm ? 0 : strength;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerMove={(e) => {
        if (!k) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * k);
        y.set((e.clientY - (r.top + r.height / 2)) * k);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.97 }}
      className={`group relative overflow-hidden ${className}`}
      style={{ ...style, x: sx, y: sy }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{ background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)" }}
      />
      <span className="relative inline-flex items-center gap-4">{children}</span>
    </motion.button>
  );
}

function CountUp({ to, prefix = "", suffix = "", calm }: {
  to: number; prefix?: string; suffix?: string; calm: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState<number>(calm ? to : 0);

  useEffect(() => {
    if (calm) { setVal(to); return; }
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, calm, to]);

  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

function SpotlightCard({
  children, className = "", style, glow = "rgba(23,112,106,0.14)", delay,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glow?: string;
  delay?: number;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [on, setOn] = useState(false);
  const reveal = delay !== undefined
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { delay },
      }
    : {};
  return (
    <motion.div
      {...reveal}
      whileHover={{ y: -4 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerEnter={() => setOn(true)}
      onPointerLeave={() => setOn(false)}
      className={`relative overflow-hidden ${className}`}
      style={style}>
      {children}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: on ? 1 : 0,
          background: `radial-gradient(260px circle at ${pos.x}px ${pos.y}px, ${glow}, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

type BackdropTone = "paper" | "dark";

function HeroBackdrop({ calm, tone = "paper" }: { calm: boolean; tone?: BackdropTone }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Dot = { x: number; y: number; vx: number; vy: number; r: number };
    type Pulse = { a: number; b: number; t: number; speed: number };
    type Ripple = { x: number; y: number; t: number };

    const pal = tone === "dark"
      ? { dot: "255,255,255", dotA: 0.55, link: "255,255,255", linkA: 0.17, amber: "242,163,58" }
      : { dot: "23,112,106", dotA: 0.5, link: "23,112,106", linkA: 0.2, amber: "242,163,58" };

    const LINK = 130, LINK2 = LINK * LINK;
    const MOUSE_R = 170, MOUSE2 = MOUSE_R * MOUSE_R;
    const REPEL_R = 110, REPEL2 = REPEL_R * REPEL_R;

    let w = 0, h = 0, raf = 0, last = 0, spawnAcc = 0;
    let dots: Dot[] = [];
    const pulses: Pulse[] = [];
    const ripples: Ripple[] = [];
    const mouse = { x: -9999, y: -9999 };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            const al = (1 - Math.sqrt(d2) / LINK) * pal.linkA;
            ctx.strokeStyle = `rgba(${pal.link},${al.toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        const m2 = mdx * mdx + mdy * mdy;
        if (m2 < MOUSE2) {
          const al = (1 - Math.sqrt(m2) / MOUSE_R) * 0.55;
          ctx.strokeStyle = `rgba(${pal.amber},${al.toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${pal.dot},${pal.dotA})`;
      for (const d of dots) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
      for (const p of pulses) {
        const a = dots[p.a], b = dots[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = `rgba(${pal.amber},0.22)`;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${pal.amber},1)`;
        ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      for (const r of ripples) {
        ctx.strokeStyle = `rgba(${pal.amber},${((1 - r.t) * 0.55).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(r.x, r.y, 4 + r.t * 34, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.lineWidth = 1;
    };

    const step = (dt: number) => {
      if (dots.length === 0) return;
      const k = dt * 60;
      for (const d of dots) {
        d.x += d.vx * k; d.y += d.vy * k;
        if (d.x < -10) d.x = w + 10; else if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10; else if (d.y > h + 10) d.y = -10;
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < REPEL2 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const f = (1 - dist / REPEL_R) * 0.6 * k;
          d.x += (dx / dist) * f; d.y += (dy / dist) * f;
        }
      }
      spawnAcc += dt;
      if (spawnAcc > 0.4 && pulses.length < 9) {
        spawnAcc = 0;
        const ai = Math.floor(Math.random() * dots.length);
        const a = dots[ai];
        const near: number[] = [];
        for (let j = 0; j < dots.length; j++) {
          if (j === ai) continue;
          const dx = a.x - dots[j].x, dy = a.y - dots[j].y;
          if (dx * dx + dy * dy < LINK2) near.push(j);
        }
        if (near.length > 0) pulses.push({ a: ai, b: near[Math.floor(Math.random() * near.length)], t: 0, speed: 0.9 + Math.random() * 0.7 });
      }
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pu = pulses[p];
        pu.t += dt * pu.speed;
        if (pu.t >= 1) {
          const tb = dots[pu.b];
          if (tb) ripples.push({ x: tb.x, y: tb.y, t: 0 });
          pulses.splice(p, 1);
        }
      }
      for (let r = ripples.length - 1; r >= 0; r--) {
        ripples[r].t += dt * 1.2;
        if (ripples[r].t >= 1) ripples.splice(r, 1);
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width; h = rect.height;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(84, Math.floor((w * h) / 15000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 1.2 + Math.random() * 1.6,
      }));
      pulses.length = 0; ripples.length = 0;
      draw();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(dt); draw();
    };
    const start = () => { if (calm || raf) return; last = performance.now(); raf = requestAnimationFrame(loop); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { mouse.x = -9999; mouse.y = -9999; }
      else { mouse.x = x; mouse.y = y; }
    };
    const onDown = (e: PointerEvent) => {
      if (calm) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("a,button")) return;
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x >= 0 && y >= 0 && x <= r.width && y <= r.height) ripples.push({ x, y, t: 0 });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) start(); else stop();
    });
    io.observe(wrap);
    if (!calm) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }
    resize();

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [calm, tone]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={
        tone === "paper"
          ? {
              maskImage: "linear-gradient(180deg, #000 0%, #000 65%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 65%, transparent 100%)",
            }
          : undefined
      }>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

type ToastTone = "good" | "primary" | "accent";
type ToastItem = { Icon: LucideIcon; title: string; sub: string; tone: ToastTone };

const TOASTS_LEFT: ToastItem[] = [
  { Icon: IndianRupee, title: "Payment received", sub: "₹2.85L · Zenith Tech", tone: "good" },
  { Icon: Send,        title: "Reminder sent",    sub: "Sharma Traders · INV-104", tone: "primary" },
  { Icon: Receipt,     title: "Invoice logged",   sub: "INV-107 · ₹1,20,000", tone: "accent" },
];
const TOASTS_RIGHT: ToastItem[] = [
  { Icon: ShieldCheck, title: "Action verified",     sub: "Hash matched · 94 ms", tone: "good" },
  { Icon: Calendar,    title: "GSTR-3B in 3 days",   sub: "Reminder set · 7:00 AM", tone: "accent" },
  { Icon: BellRing,    title: "Cash-flow alert",     sub: "Low balance in 12 days", tone: "primary" },
];

function LiveToast({ items, startDelay, calm, className }: {
  items: ToastItem[]; startDelay: number; calm: boolean; className: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (calm) return;
    let iv: number | undefined;
    const t = window.setTimeout(() => {
      setI((v) => (v + 1) % items.length);
      iv = window.setInterval(() => setI((v) => (v + 1) % items.length), 3800);
    }, startDelay);
    return () => { window.clearTimeout(t); if (iv !== undefined) window.clearInterval(iv); };
  }, [calm, items.length, startDelay]);

  const item = items[i];
  const tones: Record<ToastTone, { bg: string; fg: string }> = {
    good: { bg: T.goodSoft, fg: T.good },
    primary: { bg: T.primarySoft, fg: T.primary },
    accent: { bg: "rgba(242,163,58,0.22)", fg: "#B8741A" },
  };
  const tn = tones[item.tone];

  return (
    <div className={`hidden xl:block absolute w-[220px] ${className}`} aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.82)",
            border: `1px solid ${T.border}`,
            boxShadow: "0 18px 40px -18px rgba(16,24,40,0.28)",
          }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: tn.bg }}>
            <item.Icon size={16} strokeWidth={2.2} style={{ color: tn.fg }} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold truncate" style={{ color: T.ink }}>{item.title}</span>
            <span className="block text-[11px] truncate" style={{ color: T.muted }}>{item.sub}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type HeroCardDef = { key: string; featured?: boolean; body: ReactNode };

const HERO_CARDS: HeroCardDef[] = [
  {
    key: "overdue",
    body: (
      <div className="p-3.5 h-full flex flex-col">
        <div className="text-[10px] mb-1" style={{ color: T.muted }}>Overdue</div>
        <div className="text-2xl leading-none tabular-nums" style={{ color: T.ink, fontWeight: 700 }}>₹12.6L</div>
        <div className="text-[10px] mt-1 mb-3" style={{ color: T.critical }}>5 invoices</div>
        {[["Sharma Traders", "35d"], ["Zenith Tech", "28d"], ["Patel Precision", "22d"]].map(([n, d]) => (
          <div key={n} className="flex justify-between text-[10px] py-1.5 border-t"
            style={{ borderColor: T.border, color: T.ink }}>
            <span className="truncate pr-2">{n}</span>
            <span style={{ color: T.muted }}>{d}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "snap",
    body: (
      <div className="h-full flex flex-col" style={{ background: `linear-gradient(160deg, ${T.accent}, #F7C77A)` }}>
        <div className="flex-1 flex items-center justify-center">
          <Camera size={40} color={T.ink} strokeWidth={1.6} />
        </div>
        <div className="m-2 rounded-xl bg-white/90 px-3 py-2">
          <div className="text-[9px]" style={{ color: T.muted }}>Invoice read</div>
          <div className="flex justify-between text-[11px] font-semibold tabular-nums" style={{ color: T.ink }}>
            <span>INV-107</span><span>₹1,20,000</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "cash",
    body: (
      <div className="p-3.5 h-full flex flex-col">
        <div className="text-[10px]" style={{ color: T.muted }}>Cash flow · next 30d</div>
        <div className="text-xl mt-1 tabular-nums" style={{ color: T.ink, fontWeight: 700 }}>+₹3.4L</div>
        <svg viewBox="0 0 120 60" className="mt-auto w-full">
          <defs>
            <linearGradient id="cf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={T.primary} stopOpacity="0.35" />
              <stop offset="1" stopColor={T.primary} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 48 L20 40 L40 44 L60 26 L80 30 L100 12 L120 8 L120 60 L0 60Z" fill="url(#cf)" />
          <path d="M0 48 L20 40 L40 44 L60 26 L80 30 L100 12 L120 8" fill="none"
            stroke={T.primary} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    key: "chat",
    featured: true,
    body: (
      <div className="h-full p-3.5 flex flex-col justify-between" style={{ background: WA.dark }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: WA.green }}>BD</div>
          <div className="text-[11px] text-white font-medium">BizOS Bot</div>
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: WA.green }} />
        </div>
        <div className="space-y-1.5">
          <div className="ml-auto max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10px]"
            style={{ background: WA.bubbleOut, color: WA.text }}>who owes me money?</div>
          <div className="max-w-[92%] rounded-xl px-2.5 py-1.5 text-[10px]"
            style={{ background: WA.bubbleIn, color: WA.text }}>5 invoices · ₹12.6L. Want me to send reminders?</div>
        </div>
      </div>
    ),
  },
  {
    key: "gst",
    body: (
      <div className="p-3.5 h-full flex flex-col" style={{ background: T.ink }}>
        <div className="text-[10px] text-white/60">Compliance</div>
        <div className="text-lg text-white mt-1 leading-tight" style={{ fontWeight: 700 }}>GSTR-3B due in 3 days</div>
        <div className="mt-auto flex items-center gap-2 text-[10px]" style={{ color: T.accent }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.accent }} />
          Reminder set · 7:00 AM
        </div>
      </div>
    ),
  },
  {
    key: "tasks",
    body: (
      <div className="p-3.5 h-full">
        <div className="text-[10px] mb-2" style={{ color: T.muted }}>Open tasks · 8</div>
        {["Send GST data to CA", "Follow up Zenith", "Pay vendor"].map((t, i) => (
          <div key={t} className="flex items-center gap-2 text-[10px] py-1.5" style={{ color: T.ink }}>
            <span className="w-3 h-3 rounded border flex items-center justify-center"
              style={{ borderColor: T.primary, background: i === 0 ? T.primary : "transparent" }}>
              {i === 0 && <Check size={7} color="#fff" strokeWidth={3} />}
            </span>
            <span className={i === 0 ? "line-through opacity-50" : ""}>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

function HeroCard({ c, i, mid, sx, sy, calm }: {
  c: HeroCardDef; i: number; mid: number;
  sx: MotionValue<number>; sy: MotionValue<number>; calm: boolean;
}) {
  const off = i - mid;
  const rotY = -off * 13;
  const lift = Math.abs(off) * 14;
  const featured = !!c.featured;
  const k = featured ? 1.5 : 0.6 + Math.abs(off) * 0.28;
  const px = useTransform(sx, [0, 1], [-14 * k, 14 * k]);
  const py = useTransform(sy, [0, 1], [-8 * k, 8 * k]);

  return (
    <div
      style={{
        transform: `translateY(${lift}px) rotateY(${rotY}deg) scale(${featured ? 1.12 : 1 - Math.abs(off) * 0.04})`,
        transformStyle: "preserve-3d",
        zIndex: featured ? 10 : 5 - Math.round(Math.abs(off)),
      }}>
      <motion.div style={calm ? undefined : { x: px, y: py }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={calm ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -8, 0] }}
          transition={
            calm
              ? { duration: 0.5 }
              : {
                  opacity: { duration: 0.6, delay: 0.7 + i * 0.08 },
                  y: { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                }
          }
          whileHover={{ y: -14, scale: 1.05 }}
          className="w-[128px] h-[168px] md:w-[148px] md:h-[196px] rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            boxShadow: "0 24px 50px -18px rgba(5,40,38,0.45), 0 0 0 1px rgba(255,255,255,0.5)",
          }}>
          {c.body}
        </motion.div>
      </motion.div>
    </div>
  );
}

function HeroCards({ calm, sx, sy }: { calm: boolean; sx: MotionValue<number>; sy: MotionValue<number> }) {
  const mid = (HERO_CARDS.length - 1) / 2;
  const rotY = useTransform(sx, [0, 1], [-7, 7]);
  const rotX = useTransform(sy, [0, 1], [5, -5]);
  return (
    <div className="relative mx-auto w-full overflow-hidden py-6" style={{ perspective: 1400 }}>
      <motion.div
        className="flex items-end justify-center gap-3 md:gap-4 px-4 min-w-[860px] md:min-w-0"
        style={calm ? undefined : { rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }}>
        {HERO_CARDS.map((c, i) => (
          <HeroCard key={c.key} c={c} i={i} mid={mid} sx={sx} sy={sy} calm={calm} />
        ))}
      </motion.div>
    </div>
  );
}

function Word({ children, delay, calm }: { children: ReactNode; delay: number; calm: boolean }) {
  return (
    <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
      <motion.span
        className="inline-block"
        initial={calm ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.span>
    </span>
  );
}

type StripItem = { Icon: LucideIcon; label: string; tone: string };

const STRIP: StripItem[] = [
  { Icon: Receipt,          label: "GST invoices",      tone: "rgba(23,112,106,0.10)" },
  { Icon: Calendar,         label: "GSTR-1 & 3B",       tone: "rgba(242,163,58,0.18)" },
  { Icon: Wallet,           label: "Payment reminders", tone: "rgba(23,112,106,0.10)" },
  { Icon: Landmark,         label: "Cash-flow alerts",  tone: "rgba(23,112,106,0.10)" },
  { Icon: FileSpreadsheet,  label: "TDS dates",         tone: "rgba(242,163,58,0.18)" },
  { Icon: Truck,            label: "e-Way bills",       tone: "rgba(23,112,106,0.10)" },
  { Icon: ClipboardList,    label: "Task tracking",     tone: "rgba(23,112,106,0.10)" },
  { Icon: Users,            label: "Customer ledgers",  tone: "rgba(242,163,58,0.18)" },
];

function StripChip({ Icon, label, tone, calm }: StripItem & { calm: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -4, boxShadow: "0 14px 30px -14px rgba(16,24,40,0.22)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full cursor-pointer whitespace-nowrap"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
      }}>
      <span className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: tone }}>
        <motion.span
          animate={hover && !calm ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center">
          <Icon size={15} strokeWidth={2.2} style={{ color: T.primary }} />
        </motion.span>
      </span>
      <span className="text-sm font-medium" style={{ color: T.ink }}>{label}</span>
    </motion.div>
  );
}

function Strip({ calm }: { calm: boolean }) {
  const items = [...STRIP, ...STRIP];
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="relative overflow-hidden py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}>
      <div
        className="flex gap-3 w-max pr-3"
        style={{
          animation: calm ? "none" : "bizos-marquee 46s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}>
        {items.map((item, i) => (
          <StripChip key={i} {...item} calm={calm} />
        ))}
      </div>
    </div>
  );
}

function HeadlineChip({ children, bg, color = "#fff" }: {
  children: ReactNode;
  bg: string;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle w-[0.95em] h-[0.95em] rounded-full mx-1 text-[0.5em] -translate-y-[0.06em]"
      style={{ background: bg, color }}>
      {children}
    </span>
  );
}

const PROOF_STATS: { to: number; prefix?: string; suffix?: string; label: string; sub: string }[] = [
  { to: 1247, label: "Actions logged", sub: "last 30 days" },
  { to: 100,  suffix: "%", label: "Verified", sub: "zero mismatches" },
  { to: 120,  prefix: "<", suffix: "ms", label: "Verify time", sub: "median response" },
  { to: 8,    label: "Data sources", sub: "bank · GST · Tally" },
];

function ProofSection({ calm }: { calm: boolean }) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const doVerify = () => {
    if (verifying || verified) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 900);
  };

  return (
    <section id="proof" className="relative max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs mb-6 font-medium" style={{ color: T.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} />
            Proof, not promises
          </div>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-5">
            Every action,<br />cryptographically proven.
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: T.muted }}>
            When BizOS sends a reminder, files a return, or approves an action — it writes the source, rule, and approver to a verifiable ledger. Anyone can check. No one can tamper.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
            {PROOF_STATS.map((s, i) => (
              <SpotlightCard
                key={s.label}
                delay={i * 0.08}
                className="rounded-2xl border p-4"
                style={{ borderColor: T.border, background: T.surface }}>
                <div className="text-2xl tabular-nums mb-1" style={{ color: T.ink, fontWeight: 700 }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} calm={calm} />
                </div>
                <div className="text-xs font-medium" style={{ color: T.ink }}>{s.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{s.sub}</div>
              </SpotlightCard>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { Ic: FileText, t: "Source" },
              { Ic: ShieldCheck, t: "Rule" },
              { Ic: Users, t: "Approver" },
            ].map(({ Ic, t }) => (
              <span key={t}
                className="px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5"
                style={{ borderColor: T.border, background: T.surface, color: T.muted }}>
                <Ic size={11} /> {t}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-md w-full mx-auto md:ml-auto relative">
          <div className="absolute -inset-6 rounded-[40px] pointer-events-none"
            style={{ background: "rgba(23,112,106,0.10)", filter: "blur(50px)" }} />

          <div className="relative rounded-3xl p-6"
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              boxShadow: "0 25px 60px -20px rgba(16,24,40,0.25)",
            }}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: T.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: T.primarySoft }}>
                <FileText size={18} color={T.primary} strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: T.ink }}>Evidence drawer</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>INV-104 · Sharma Traders</div>
              </div>
              {verified && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: T.goodSoft }}>
                  <Check size={13} color={T.good} strokeWidth={3} />
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Source</div>
                <div className="text-xs p-2.5 rounded-lg font-mono"
                  style={{ background: "#F6F3EC", color: T.ink }}>
                  tally.sync · invoice 104 · due 2026-09-05
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Rule</div>
                <div className="text-xs p-2.5 rounded-lg"
                  style={{ background: "#F6F3EC", color: T.ink }}>
                  Overdue &gt; 30 days + top-5 customer → manager approval required
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Hash</div>
                <div className="text-[10px] p-2.5 rounded-lg font-mono break-all"
                  style={{ background: "#F6F3EC", color: T.muted }}>
                  8f4a2b1c9e7d3f6a5b8c2e1d4f7a9b3c5e8d1f4a7b2c5e8d1f4a7b2c5e8d1f4a
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={doVerify}
              disabled={verifying || verified}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              style={{
                background: verified ? T.goodSoft : T.primary,
                color: verified ? T.good : "#fff",
                cursor: verified ? "default" : "pointer",
              }}>
              {verifying ? <Loader2 size={14} className="animate-spin" />
                : verified ? <Check size={14} strokeWidth={3} />
                  : <ShieldCheck size={14} />}
              {verifying ? "Recomputing hash…" : verified ? "Verified · matches" : "Verify this action"}
            </motion.button>
            <div className="text-[10px] text-center mt-2" style={{ color: T.muted }}>
              Anyone with the link can verify — no login needed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Landing() {
  const nav = useNavigate();
  const calm = useCalm();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 80, damping: 18, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 80, damping: 18, mass: 0.5 });
  const gx = useTransform(sx, (v) => v * 100);
  const gy = useTransform(sy, (v) => v * 100);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${gx}% ${gy}%, rgba(242,163,58,0.20), transparent 62%)`;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: T.canvas, color: T.ink }}>
      <style>{`
        @keyframes bizos-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes bizos-shimmer { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
      `}</style>

      <ScrollBar />

      <section className="p-3 md:p-4">
        <div
          className="relative rounded-[28px] md:rounded-[36px] overflow-hidden"
          onPointerMove={(e) => {
            if (calm) return;
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width);
            py.set((e.clientY - r.top) / r.height);
          }}
          onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
          style={{ background: "linear-gradient(180deg, #FBF8F1 0%, #F6F3EC 55%, #EFEADC 100%)" }}>

          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: "rgba(23,112,106,0.10)", filter: "blur(120px)" }} />
          <div className="absolute -top-20 right-[-10%] w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: "rgba(242,163,58,0.18)", filter: "blur(120px)" }} />

          <HeroBackdrop calm={calm} tone="paper" />
          {!calm && (
            <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />
          )}

          <LiveToast items={TOASTS_LEFT} startDelay={1800} calm={calm} className="left-6 top-[30%]" />
          <LiveToast items={TOASTS_RIGHT} startDelay={3200} calm={calm} className="right-6 top-[40%]" />

          <nav className="relative flex items-center justify-between px-5 md:px-10 py-5 md:py-6">
            <div className="font-display text-2xl md:text-3xl tracking-tight" style={{ color: T.ink }}>
              Biz<span style={{ color: T.primary }}>OS</span>
            </div>
            <div className="hidden md:flex items-center gap-9 text-sm" style={{ color: T.muted }}>
              <a href="#proof" className="hover:opacity-70 transition">Proof</a>
              <a href="#why" className="hover:opacity-70 transition">Why BizOS</a>
              <a href="#chat" className="hover:opacity-70 transition">See it live</a>
              <a href="#how" className="hover:opacity-70 transition">How it works</a>
            </div>
            <button type="button" onClick={() => nav("/login")}
              className="text-sm px-5 py-2 rounded-full font-semibold transition hover:brightness-110"
              style={{ background: T.ink, color: "#fff" }}>
              Sign in
            </button>
          </nav>

          <div className="relative text-center px-6 pt-12 md:pt-20 max-w-4xl mx-auto">
            <motion.div initial={calm ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 text-xs rounded-full font-medium backdrop-blur-sm"
                style={{
                  background: "rgba(23,112,106,0.08)",
                  border: "1px solid rgba(23,112,106,0.18)",
                  color: T.primary,
                }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
                Built for Indian MSMEs
              </div>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl leading-[1.04] mb-6" style={{ color: T.ink }}>
              <Word delay={0.10} calm={calm}>Run</Word>{" "}
              <Word delay={0.18} calm={calm}>your</Word>{" "}
              <Word delay={0.26} calm={calm}>business</Word>
              <br />
              <Word delay={0.34} calm={calm}>on</Word>{" "}
              <span className="relative inline-block">
                <Word delay={0.42} calm={calm}>
                  <span
                    style={{
                      backgroundImage: `linear-gradient(100deg, ${T.primary} 0%, #35B7A9 25%, ${T.primary} 50%, #35B7A9 75%, ${T.primary} 100%)`,
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      animation: calm ? "none" : "bizos-shimmer 5s linear infinite",
                    }}>
                    WhatsApp
                  </span>
                </Word>
                <svg aria-hidden viewBox="0 0 220 14" preserveAspectRatio="none" fill="none"
                  className="absolute left-0 -bottom-1 md:-bottom-2 w-full h-[0.2em] pointer-events-none">
                  <motion.path
                    d="M3 9 C 45 2, 90 12, 135 6 S 200 4, 217 8"
                    stroke={T.accent}
                    strokeWidth="4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={calm ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
                  />
                </svg>
              </span>
            </h1>

            <motion.div initial={calm ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}>
              <p className="text-base md:text-xl max-w-2xl mx-auto mb-9 leading-relaxed" style={{ color: T.muted }}>
                One operating system for compliance, invoices, cash flow, and customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Magnetic
                  calm={calm}
                  onClick={() => nav("/login")}
                  className="pl-7 pr-2 py-2 rounded-full font-semibold"
                  style={{
                    background: T.accent,
                    color: T.ink,
                    boxShadow: "0 14px 34px -12px rgba(242,163,58,0.65)",
                  }}>
                  Get started free
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{ background: T.ink }}>
                    <ArrowUpRight size={16} strokeWidth={2.4} />
                  </span>
                </Magnetic>
                <a href="#chat"
                  className="px-7 py-3.5 rounded-full text-sm font-medium border backdrop-blur-sm transition hover:bg-white"
                  style={{ borderColor: T.border, color: T.ink, background: "rgba(255,255,255,0.7)" }}>
                  See it live
                </a>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-xs" style={{ color: T.muted }}>
                {["Free for 3 users", "No credit card", "Setup in 2 minutes"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={12} style={{ color: T.good }} strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative pt-10 md:pt-14 pb-10 md:pb-14">
            <HeroCards calm={calm} sx={sx} sy={sy} />
            <p className="text-center text-xs md:text-sm mt-8" style={{ color: T.muted }}>
              Free to start · No new app — just WhatsApp
            </p>
          </div>
        </div>
      </section>

      <Strip calm={calm} />

      <ProofSection calm={calm} />

      <section id="why" className="relative max-w-6xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs mb-6 font-medium" style={{ color: T.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} /> Why BizOS
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.1] tracking-tight">
            Your back-office, <HeadlineChip bg={T.primary}>₹</HeadlineChip> finally<br />
            as simple as <HeadlineChip bg={T.accent} color={T.ink}>
              <MessageCircle size={12} strokeWidth={2.5} />
            </HeadlineChip> a chat
            <span style={{ color: "#9AA4B2" }}>
              {" "}— no<br className="hidden md:block" /> software to learn.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-12 gap-4 md:auto-rows-[minmax(0,1fr)]">
          <SpotlightCard
            glow="rgba(255,255,255,0.14)"
            className="md:col-span-5 md:row-span-2 rounded-[28px] p-6 min-h-[380px] flex flex-col justify-between text-white"
            style={{ background: "linear-gradient(170deg, #17706A 0%, #0B4F4A 100%)" }}>
            <div className="flex items-center justify-between">
              <div className="font-display text-xl">Biz<span style={{ color: T.accent }}>OS</span></div>
              <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center">
                <BarChart3 size={16} style={{ color: T.primary }} strokeWidth={2.2} />
              </div>
            </div>
            <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "rgba(242,163,58,0.25)", filter: "blur(70px)" }} />
            <div className="relative rounded-2xl p-5" style={{ background: "#fff", color: T.ink }}>
              <div className="font-display text-5xl leading-none">1 chat</div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: T.muted }}>
                Invoices, dues, filings and follow-ups — all handled in the WhatsApp app you already use every day.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            className="md:col-span-4 rounded-[28px] p-6 flex flex-col justify-between min-h-[180px]"
            style={{ background: "#F1F3F2" }}>
            <div className="text-sm" style={{ color: T.muted }}>Setup time</div>
            <div>
              <div className="font-display text-5xl">~2 min</div>
              <p className="text-sm mt-2" style={{ color: T.muted }}>
                Sign in, open the bot, send your first invoice photo.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            glow="rgba(255,255,255,0.4)"
            className="md:col-span-3 rounded-[28px] p-6 flex flex-col justify-between min-h-[180px]"
            style={{ background: T.accent, color: T.ink }}>
            <div className="text-sm font-medium">Every morning</div>
            <div>
              <div className="font-display text-4xl tabular-nums">7:00 AM</div>
              <p className="text-sm mt-2 font-medium opacity-80">Your daily brief: dues, tasks, deadlines.</p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            glow="rgba(242,163,58,0.22)"
            className="md:col-span-3 rounded-[28px] p-6 flex items-center justify-between min-h-[110px] text-white"
            style={{ background: T.ink }}>
            <span className="text-sm text-white/70">Deadlines watched</span>
            <span className="font-display text-4xl tabular-nums">24/7</span>
          </SpotlightCard>

          <SpotlightCard
            className="md:col-span-4 rounded-[28px] p-6 flex items-center gap-4 min-h-[110px] border"
            style={{ background: T.surface, borderColor: T.border }}>
            <div className="flex -space-x-2">
              {[Receipt, Calendar, Wallet].map((Ic, i) => (
                <span key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: i === 1 ? "rgba(242,163,58,0.25)" : "rgba(23,112,106,0.15)" }}>
                  <Ic size={16} style={{ color: T.primary }} strokeWidth={2.2} />
                </span>
              ))}
            </div>
            <p className="text-sm leading-snug" style={{ color: T.muted }}>
              Compliance, invoices and cash flow in one place — not three apps and a spreadsheet.
            </p>
          </SpotlightCard>
        </div>
      </section>

      <section id="chat" className="relative max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-5">
              Just ask. <br />Your business answers.
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: T.muted }}>
              No dashboards to dig through. Type what you'd ask your accountant — BizOS replies on WhatsApp with real numbers from your own books.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Who owes me money?", "What's due this week?", "Remind Zenith Tech", "Show cash flow"].map((q) => (
                <motion.span key={q}
                  whileHover={{ y: -3 }}
                  className="px-4 py-2 rounded-full text-sm border bg-white cursor-default"
                  style={{ borderColor: T.border }}>{q}</motion.span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-sm w-full mx-auto md:ml-auto relative">
            <div className="absolute -inset-6 rounded-[40px] pointer-events-none"
              style={{ background: "rgba(37,211,102,0.15)", filter: "blur(50px)" }} />

            <div className="relative rounded-3xl p-6 text-left"
              style={{ background: WA.dark, boxShadow: "0 25px 60px -20px rgba(37,211,102,0.4)" }}>

              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: WA.green }}>BD</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">BizOS Bot</div>
                  <div className="text-xs" style={{ color: WA.green }}>online</div>
                </div>
              </div>

              <div className="text-xs mb-3 text-center" style={{ color: WA.textMuted }}>Today</div>

              <motion.div
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="rounded-2xl rounded-tl-sm p-4 mb-3"
                style={{ background: WA.bubbleIn }}>
                <p className="text-sm font-medium mb-2" style={{ color: WA.text }}>Good morning.</p>
                <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                  <span style={{ color: T.critical, fontWeight: 700 }}>•</span> <b>5 invoices overdue</b> · ₹12.6L<br />
                  <span style={{ color: T.accent, fontWeight: 700 }}>•</span> 8 open tasks<br />
                  <span style={{ color: T.primary, fontWeight: 700 }}>•</span> GSTR-3B due in 3 days
                </p>
                <div className="text-[10px] mt-2 text-right" style={{ color: WA.textMuted }}>7:00 AM</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.8 }}
                className="rounded-2xl rounded-tr-sm p-3 ml-auto max-w-[80%]"
                style={{ background: WA.bubbleOut }}>
                <p className="text-xs" style={{ color: WA.text }}>who owes me money?</p>
                <div className="text-[10px] mt-1 text-right flex items-center justify-end gap-1" style={{ color: WA.textMuted }}>
                  7:01 AM <span style={{ color: WA.tick }}>✓✓</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 1.3 }}
                className="rounded-2xl rounded-tl-sm p-4 mt-3"
                style={{ background: WA.bubbleIn }}>
                <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                  INV-104 — Sharma Traders — ₹4.2L — 35d<br />
                  INV-105 — Zenith Tech — ₹2.85L — 28d<br />
                  INV-106 — Patel Precision — ₹1.78L — 22d
                </p>
                <div className="text-[10px] mt-2 text-right" style={{ color: WA.textMuted }}>7:01 AM</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how" className="relative max-w-6xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl">Built for how Indian businesses actually run</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-[58px] left-[16%] right-[16%] h-px"
            style={{ background: `repeating-linear-gradient(90deg, ${T.primary}55 0 6px, transparent 6px 12px)` }} />
          {[
            { num: "1", title: "Snap an invoice", desc: "Send a photo on WhatsApp. We read it, log it, and track the payment.", Icon: Camera, tint: "rgba(23,112,106,0.12)" },
            { num: "2", title: "Ask anything", desc: '"Who owes me money?" "What\'s due this week?" — get real answers.', Icon: MessageCircle, tint: "rgba(242,163,58,0.2)" },
            { num: "3", title: "Auto-pilot", desc: "Reminders, compliance deadlines, cash-flow alerts. Handled automatically.", Icon: Zap, tint: "rgba(23,112,106,0.12)" },
          ].map((f, i) => (
            <SpotlightCard
              key={f.num}
              delay={i * 0.1}
              className="p-8 rounded-[28px] border"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                style={{ background: f.tint }}>
                <f.Icon size={22} style={{ color: T.primary }} strokeWidth={2.2} />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center text-white"
                  style={{ background: T.primary }}>{f.num}</span>
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{f.desc}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="px-3 md:px-4 pb-4">
        <div className="relative rounded-[28px] md:rounded-[36px] overflow-hidden text-center px-6 py-20 md:py-28"
          style={{ background: "linear-gradient(180deg, #17706A 0%, #0B4F4A 100%)" }}>
          <HeroBackdrop calm={calm} tone="dark" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[560px] h-[360px] rounded-full pointer-events-none"
            style={{ background: "rgba(242,163,58,0.28)", filter: "blur(110px)" }} />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight mb-4">
              Run your business<br />on <span style={{ color: T.accent }}>WhatsApp</span>
            </h2>
            <p className="text-white/80 mb-9 max-w-md mx-auto">
              Ready to get your business in order? Start free — it takes two minutes.
            </p>
            <Magnetic
              calm={calm}
              onClick={() => nav("/login")}
              className="pl-8 pr-2 py-2 rounded-full font-semibold"
              style={{ background: T.accent, color: T.ink }}>
              Start free
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ background: T.ink }}>
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </span>
            </Magnetic>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-xs" style={{ color: T.muted }}>
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:opacity-70 transition">Terms</a>
          <a href="#" className="hover:opacity-70 transition">Privacy</a>
          <a href="#" className="hover:opacity-70 transition">Help</a>
        </div>
        <div>BizOS · Built in India · © 2026</div>
      </footer>
    </div>
  );
}

// [13] LOGIN
// ═══════════════════════════════════════════════════════════════════
const DEMO_CODE = "123456";
type LoginStep = "choose" | "phone" | "otp" | "email" | "emailSent" | "mfa";

function Login() {
  const [step, setStep] = useState<LoginStep>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) { setError("Enter a 10-digit phone"); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("otp"); }, 800);
  };
  const verifyOtp = () => {
    if (otp.replace(/\D/g, "").length < 6) { setError("Enter the 6-digit code"); return; }
    if (otp !== DEMO_CODE) { setError(`Demo code is ${DEMO_CODE}`); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("mfa"); }, 700);
  };
  const sendEmailLink = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email"); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("emailSent"); }, 800);
  };
  const verifyMfa = () => {
    if (mfaCode.replace(/\D/g, "").length < 6) { setError("Enter the 6-digit MFA code"); return; }
    if (mfaCode !== DEMO_CODE) { setError(`Demo code is ${DEMO_CODE}`); return; }
    setError(null); enableDemo(); window.location.href = "/bizos/";
  };
  const demoLogin = () => { enableDemo(); window.location.href = "/bizos/"; };

  const wrap = {
    initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: T.canvas, color: T.ink }}>
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="font-display text-4xl mb-3">Biz<span style={{ color: T.primary }}>OS</span></div>
          <div className="text-sm" style={{ color: T.muted }}>Your business operating system</div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "choose" && (
            <motion.div key="choose" {...wrap} className="space-y-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep("phone")}
                className="w-full px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-3"
                style={{ background: T.primary }}>
                <MessageCircle size={16} /> Continue with Phone
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={signInGoogle}
                className="w-full px-6 py-3 rounded-xl font-medium border flex items-center justify-center gap-3 hover:bg-white"
                style={{ borderColor: T.border, background: T.surface }}>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>Continue with Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep("email")}
                className="w-full px-6 py-3 rounded-xl font-medium border hover:bg-white flex items-center justify-center gap-3"
                style={{ borderColor: T.border, background: T.surface }}>
                <FileText size={16} /> Continue with Email
              </motion.button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: T.border }} />
                <div className="text-xs" style={{ color: T.muted }}>or</div>
                <div className="flex-1 h-px" style={{ background: T.border }} />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={demoLogin} disabled={busy}
                className="w-full px-6 py-3 rounded-xl font-medium border hover:bg-[#EFEBE0] disabled:opacity-50"
                style={{ borderColor: T.border, background: T.surface, color: T.ink }}>
                {busy ? "Entering…" : "Demo as Rajesh (ABC Components)"}
              </motion.button>
              <div className="mt-6 text-xs text-center" style={{ color: T.muted }}>
                Demo mode uses sample data — no signup needed.
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div key="phone" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter your phone</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>We'll send a 6-digit OTP.</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-3 rounded-xl border text-sm font-medium"
                  style={{ borderColor: T.border, background: T.surface }}>+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210" inputMode="numeric" autoFocus
                  className="flex-1 px-4 py-3 rounded-xl border outline-none text-lg tracking-wider focus:ring-2 focus:ring-[#17706A]/20"
                  style={{ borderColor: T.border, background: T.surface }} />
              </div>
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={sendOtp} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: T.primary }}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                {busy ? "Sending…" : "Send OTP"}
              </motion.button>
              <button onClick={() => { setStep("choose"); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div key="otp" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter OTP</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Sent to <b>+91 {phone}</b> · <i>Demo: {DEMO_CODE}</i>
              </p>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" inputMode="numeric" maxLength={6} autoFocus
                className="w-full px-4 py-4 rounded-xl border outline-none text-2xl tracking-[0.5em] text-center font-mono mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={verifyOtp} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Verifying…" : "Verify & continue"}</motion.button>
              <button onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Change number</button>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div key="email" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter your email</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>We'll send you a magic link.</p>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in" type="email" autoFocus
                className="w-full px-4 py-3 rounded-xl border outline-none mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={sendEmailLink} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Sending…" : "Send magic link"}</motion.button>
              <button onClick={() => { setStep("choose"); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "emailSent" && (
            <motion.div key="emailSent" {...wrap} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: T.primarySoft }}>
                <FileText size={28} color={T.primary} />
              </motion.div>
              <h2 className="font-display text-2xl mb-2">Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Sent a magic link to <b>{email}</b>
              </p>
              <motion.button whileTap={{ scale: 0.99 }} onClick={() => setStep("mfa")}
                className="w-full py-3 rounded-xl font-medium text-white"
                style={{ background: T.primary }}>Simulate opening link →</motion.button>
              <button onClick={() => { setStep("choose"); setEmail(""); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "mfa" && (
            <motion.div key="mfa" {...wrap}>
              <div className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium inline-block mb-2"
                style={{ background: "rgba(242,163,58,0.12)", color: T.accent }}>MFA · step 2 of 2</div>
              <h2 className="font-display text-2xl mb-2">Two-factor code</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Enter the 6-digit code from your authenticator. <i>Demo: {DEMO_CODE}</i>
              </p>
              <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" inputMode="numeric" maxLength={6} autoFocus
                className="w-full px-4 py-4 rounded-xl border outline-none text-2xl tracking-[0.5em] text-center font-mono mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer" style={{ color: T.muted }}>
                <input type="checkbox" checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded" />Trust this device for 30 days
              </label>
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={verifyMfa} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Verifying…" : "Verify & sign in"}</motion.button>
              <button onClick={() => { setStep("choose"); setMfaCode(""); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// [14] ONBOARDING
// ═══════════════════════════════════════════════════════════════════
function Onboarding({ onDone }: { onDone: (name: string, city: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("manufacturing");
  const [gstin, setGstin] = useState("");
  const [saving, setSaving] = useState(false);

  const industries = [
    { id: "manufacturing", label: "Manufacturing" },
    { id: "services", label: "Services" },
    { id: "retail", label: "Retail / Trade" },
    { id: "wholesale", label: "Wholesale" },
    { id: "construction", label: "Construction" },
    { id: "other", label: "Other" },
  ];

  const canNext = step === 0 ? name.trim().length >= 2
    : step === 1 ? city.trim().length >= 2 : true;

  const finish = async () => {
    setSaving(true);
    try {
      if (!isDemoMode()) {
        await api.put("/me/business", {
          business_name: name.trim(),
          gstin: gstin.trim() || null, industry,
          city: city.trim() || "Mumbai",
        });
        await api.post("/me/complete-onboarding");
      }
      onDone(name.trim(), city.trim() || "Mumbai");
    } finally { setSaving(false); }
  };

  const steps = [
    { title: "What's your business called?", body: "This shows on invoices, reminders, and filings.",
      content: (
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ABC Components Pvt Ltd" autoFocus
          className="w-full px-4 py-3 rounded-xl border outline-none text-base"
          style={{ borderColor: T.border, background: T.surface }} />
      ) },
    { title: "Where are you based?", body: "State matters for GST rates and filing deadlines.",
      content: (
        <input value={city} onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Mumbai" autoFocus
          className="w-full px-4 py-3 rounded-xl border outline-none text-base"
          style={{ borderColor: T.border, background: T.surface }} />
      ) },
    { title: "What do you do?", body: "We'll customise defaults to fit your line of work.",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {industries.map((it) => (
            <button key={it.id} onClick={() => setIndustry(it.id)}
              className="text-sm px-3 py-3 rounded-xl border font-medium text-left transition"
              style={{ borderColor: industry === it.id ? T.primary : T.border,
                background: industry === it.id ? T.primarySoft : T.surface,
                color: industry === it.id ? T.primary : T.ink }}>
              {it.label}
            </button>
          ))}
        </div>
      ) },
    { title: "GSTIN (optional)", body: "Skip if not registered. You can add it later in Settings.",
      content: (
        <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())}
          placeholder="27AABCA1234F1Z5" autoFocus
          className="w-full px-4 py-3 rounded-xl border outline-none text-base font-mono tracking-wider"
          style={{ borderColor: T.border, background: T.surface }} />
      ) },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: T.canvas, color: T.ink }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="font-display text-2xl">Biz<span style={{ color: T.primary }}>OS</span></div>
          <div className="text-xs" style={{ color: T.muted }}>Step {step + 1} of {steps.length}</div>
        </div>
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#E7E2D5" }}>
              <motion.div className="h-full rounded-full" initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }}
                style={{ background: T.primary }} />
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}>
            <h1 className="font-display text-2xl mb-2">{current.title}</h1>
            <p className="text-sm mb-6" style={{ color: T.muted }}>{current.body}</p>
            {current.content}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-2 mt-8">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="px-4 py-3 rounded-xl text-sm font-medium border hover:bg-white"
              style={{ borderColor: T.border, color: T.muted }}>
              Back
            </button>
          )}
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => (step === steps.length - 1 ? finish() : setStep((s) => s + 1))}
            disabled={!canNext || saving}
            className="flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: T.primary }}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {step === steps.length - 1 ? (saving ? "Setting up…" : "Enter BizOS →") : "Continue"}
            {step < steps.length - 1 && <ArrowRight size={14} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// [15] SHELL
// ═══════════════════════════════════════════════════════════════════
const NAV = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/inbox", label: "Inbox", Icon: InboxIcon, badgeKey: "inbox" as const },
  { to: "/money", label: "Money", Icon: IndianRupee },
  { to: "/invoices", label: "Invoices", Icon: Receipt },
  { to: "/customers", label: "Customers", Icon: Users },
  { to: "/tasks", label: "Work", Icon: CheckSquare },
  { to: "/agents", label: "Agents", Icon: Bot },
  { to: "/compliance", label: "Compliance", Icon: Scale },
  { to: "/trust", label: "Trust", Icon: ShieldCheck },
  { to: "/impact", label: "Impact", Icon: Leaf },
  { to: "/extensions", label: "Extensions", Icon: Package },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

const NAV_MOBILE = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/inbox", label: "Inbox", Icon: InboxIcon, badgeKey: "inbox" as const },
  { to: "/invoices", label: "Invoices", Icon: Receipt },
  { to: "/trust", label: "Trust", Icon: ShieldCheck },
  { to: "/agents", label: "Agents", Icon: Bot },
  { to: "/tasks", label: "Work", Icon: CheckSquare },
];

function Shell({
  children, me, onLogout, onCopilot, onNotify, onSearch, badges, notifUnread,
}: {
  children: ReactNode;
  me: Me;
  onLogout: () => void;
  onCopilot: () => void;
  onNotify: () => void;
  onSearch: () => void;
  badges: { inbox: number };
  notifUnread: number;
}) {
  const demo = isDemoMode();
  const calm = useCalm();
  const nav = useNavigate();
  const [railCollapsed, setRailCollapsed] = useLocalState<boolean>("bizos.rail.collapsed", false);
  const [density, setDensity] = useLocalState<"comfortable" | "compact">("bizos.density", "comfortable");

  return (
    <div className="min-h-screen flex" style={{ background: T.canvas, color: T.ink }}>
      <aside
        className={`hidden md:flex flex-col glass-2 sticky top-0 h-screen transition-all`}
        style={{ borderRight: "1px solid rgba(255,255,255,0.6)", width: railCollapsed ? 64 : 224 }}>
        <div className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(16,24,40,0.06)" }}>
          {!railCollapsed && (
            <div>
              <div className="font-display text-xl tracking-tight">
                Biz<span style={{ color: T.primary }}>OS</span>
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: T.muted }}>Agentic Business OS</div>
            </div>
          )}
          <button onClick={() => setRailCollapsed((v) => !v)}
            className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-white/60 transition shrink-0"
            style={{ borderColor: T.border, color: T.muted }}
            aria-label={railCollapsed ? "Expand rail" : "Collapse rail"}>
            {railCollapsed ? <ChevronRight size={12} /> : <ArrowLeft size={12} />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={to === "/"}
              title={railCollapsed ? label : undefined}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition hover:bg-white/60"
              style={({ isActive }: any) => ({
                background: isActive ? "rgba(255,255,255,0.75)" : "transparent",
                color: isActive ? T.ink : T.muted,
                fontWeight: isActive ? 700 : 400,
                boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(16,24,40,0.04)" : "none",
                justifyContent: railCollapsed ? "center" : "space-between",
              })}>
              <span className="flex items-center gap-3">
                <Icon size={14} style={{ color: T.primary }} />
                {!railCollapsed && label}
              </span>
              {badgeKey && badges[badgeKey] > 0 && !railCollapsed && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-semibold tabular-nums"
                  style={{ background: T.critical }}>{badges[badgeKey]}</motion.span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t text-xs" style={{ borderColor: "rgba(16,24,40,0.06)", color: T.muted }}>
          {demo && !railCollapsed && (
            <div className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded mb-2 inline-block"
              style={{ background: "rgba(242,163,58,0.14)", color: T.watch }}>Demo</div>
          )}
          {!railCollapsed && (
            <>
              <div className="truncate mb-1 font-medium" style={{ color: T.ink }}>
                {me.business_name ?? me.email}
              </div>
              <button onClick={onLogout} className="hover:opacity-70 text-[11px]">Sign out →</button>
            </>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-3 md:px-5 py-2.5 glass-2 sticky top-0 z-20"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="md:hidden font-display text-lg">
              Biz<span style={{ color: T.primary }}>OS</span>
            </div>
            <motion.button
              type="button"
              onClick={onSearch}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition hover:bg-white/60 group"
              style={{ borderColor: T.border, color: T.muted }}
              aria-label="Open search (⌘K)">
              <Search size={14} />
              <span className="hidden md:flex items-center gap-1">
                <Kbd><Command size={9} className="inline align-middle" />K</Kbd>
              </span>
              <span className="hidden lg:inline group-hover:text-[#101828] transition">Search…</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => nav("/whatsapp")}
              className="hidden lg:flex text-xs px-2.5 py-1.5 rounded-lg font-medium border items-center gap-1.5 hover:bg-white/60"
              style={{ borderColor: T.border, color: T.ink }}>
              <MessageCircle size={12} /> WhatsApp
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onCopilot}
              className="hidden sm:flex text-xs px-2.5 py-1.5 rounded-lg font-medium text-white items-center gap-1.5"
              style={{ background: T.primary, boxShadow: "0 4px 14px -4px rgba(23,112,106,0.5)" }}>
              <Sparkles size={12} /> Copilot
            </motion.button>

            <motion.button
              type="button"
              onClick={onNotify}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-white/60 transition"
              style={{ borderColor: T.border }}
              aria-label={`Notifications${notifUnread > 0 ? ` (${notifUnread} unread)` : ""}`}>
              <motion.span
                animate={!calm && notifUnread > 0
                  ? { rotate: [0, -14, 12, -8, 8, 0] }
                  : { rotate: 0 }}
                transition={!calm && notifUnread > 0
                  ? { duration: 0.8, repeat: Infinity, repeatDelay: 3.2 }
                  : { duration: 0.2 }}
                className="inline-flex">
                <Bell size={15} />
              </motion.span>
              {notifUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center tabular-nums"
                  style={{ background: T.critical }}>
                  {notifUnread > 9 ? "9+" : notifUnread}
                </motion.span>
              )}
            </motion.button>

            <div className="hidden md:flex text-xs px-2.5 py-1.5 rounded-lg border items-center gap-2 cursor-pointer hover:bg-white/60 transition"
              style={{ borderColor: T.border }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: T.primary }}>{(me.business_name ?? "B")[0].toUpperCase()}</span>
              <span className="hidden lg:inline truncate max-w-[120px]">{me.business_name ?? "Business"}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className={`max-w-6xl mx-auto ${density === "compact" ? "p-3 md:p-5" : "p-4 md:p-7"}`}>{children}</div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-20 glass-2"
          style={{ borderColor: "rgba(255,255,255,0.6)" }}>
          {NAV_MOBILE.map(({ to, label, Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className="flex-1 py-2 text-[10px] flex flex-col items-center gap-0.5 relative"
              style={({ isActive }: any) => ({ color: isActive ? T.primary : T.muted })}>
              <Icon size={16} />{label}
              {badgeKey && badges[badgeKey] > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold"
                  style={{ background: T.critical }}>{badges[badgeKey] > 9 ? "9+" : badges[badgeKey]}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ▼▼▼ CHUNK 2 STARTS HERE — paste [15.5] through [19] ▼▼▼
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// [15.5] NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════
type NotifKind = "approval" | "alert" | "info" | "mention" | "system";

type Notification = {
  id: string;
  kind: NotifKind;
  severity: Severity;
  title: string;
  body?: string;
  at: number;
  read: boolean;
  link?: string;
  actionLabel?: string;
  Icon?: LucideIcon;
};

function buildNotifications(entities: Entity[]): Notification[] {
  const now = Date.now();
  const out: Notification[] = [];

  const overdue = entities.filter((e) => e.type === "invoice" && e.data?.status === "overdue");
  if (overdue[0]) {
    out.push({
      id: "n-overdue",
      kind: "alert",
      severity: "critical",
      title: `${overdue[0].name} overdue ${overdue[0].data?.days_overdue}d`,
      body: `${overdue[0].data?.customer_name} · ${fmtINR(overdue[0].data?.total ?? 0)}`,
      at: now - 8 * 60_000,
      read: false,
      link: "/inbox",
      actionLabel: "Approve",
      Icon: AlertTriangle,
    });
  }

  out.push({
    id: "n-cash",
    kind: "alert",
    severity: "critical",
    title: "Cash runway drops below 15 days",
    body: "Runway projected at 12 days. Review collections and expenses.",
    at: now - 45 * 60_000,
    read: false,
    link: "/trust",
    actionLabel: "Review",
    Icon: Wallet,
  });

  out.push({
    id: "n-gst",
    kind: "info",
    severity: "watch",
    title: "GSTR-3B due in 3 days",
    body: "Auto-reminder set for 7:00 AM. Data sync ready.",
    at: now - 2 * 3600_000,
    read: false,
    link: "/compliance",
    Icon: Calendar,
  });

  out.push({
    id: "n-tally",
    kind: "system",
    severity: "watch",
    title: "Tally sync partially failed",
    body: "3 of 47 invoices didn't sync. Retry from Extensions.",
    at: now - 5 * 3600_000,
    read: true,
    link: "/extensions",
    actionLabel: "Fix",
    Icon: RefreshCw,
  });

  out.push({
    id: "n-payment",
    kind: "info",
    severity: "good",
    title: "Payment received · ₹2.85L",
    body: "Zenith Technologies paid INV-105 in full.",
    at: now - 26 * 3600_000,
    read: true,
    link: "/trust",
    Icon: IndianRupee,
  });

  out.push({
    id: "n-mention",
    kind: "mention",
    severity: "good",
    title: "Ravi mentioned you on a task",
    body: "\"Can you approve the Zenith PO today?\"",
    at: now - 30 * 3600_000,
    read: true,
    link: "/tasks",
    Icon: MessageCircle,
  });

  out.push({
    id: "n-tasks",
    kind: "info",
    severity: "good",
    title: "3 tasks completed today",
    body: "Nice work. Your team's on track.",
    at: now - 3 * 3600_000,
    read: true,
    link: "/tasks",
    Icon: CheckSquare,
  });

  out.push({
    id: "n-cust",
    kind: "info",
    severity: "good",
    title: "2 new customers added",
    body: "Meera added Patel Precision and ABC Enterprises.",
    at: now - 4 * 24 * 3600_000,
    read: true,
    link: "/customers",
    Icon: Users,
  });

  return out.sort((a, b) => b.at - a.at);
}

function NotificationPanel({
  open, onClose, items, onMarkRead, onMarkAllRead, onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  items: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (link: string) => void;
}) {
  const [tab, setTab] = useState<"all" | "needs" | "fyi">("all");
  const calm = useCalm();

  const needs = items.filter((n) => n.severity === "critical" || n.severity === "watch");
  const fyi = items.filter((n) => n.severity === "good" || n.kind === "info" || n.kind === "system" || n.kind === "mention");
  const unread = items.filter((n) => !n.read).length;
  const needsUnread = needs.filter((n) => !n.read).length;
  const fyiUnread = fyi.filter((n) => !n.read).length;

  const shown = tab === "all" ? items : tab === "needs" ? needs : fyi;

  const groups = useMemo(() => {
    const now = Date.now();
    const out: { label: string; items: Notification[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Earlier", items: [] },
    ];
    shown.forEach((n) => {
      const days = (now - n.at) / (24 * 3600_000);
      if (days < 1) out[0].items.push(n);
      else if (days < 2) out[1].items.push(n);
      else out[2].items.push(n);
    });
    return out.filter((g) => g.items.length > 0);
  }, [shown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toneFor = (sev: Severity) =>
    sev === "critical"
      ? { bg: T.criticalSoft, fg: T.critical }
      : sev === "watch"
        ? { bg: T.watchSoft, fg: T.watch }
        : { bg: T.goodSoft, fg: T.good };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(16,24,40,0.22)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col glass-3"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
            role="dialog"
            aria-label="Notifications">

            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
              <div>
                <div className="font-display text-lg">Notifications</div>
                <div className="text-xs" style={{ color: T.muted }}>
                  {unread > 0 ? `${unread} unread` : "You're caught up"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    onClick={onMarkAllRead}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium transition hover:brightness-95"
                    style={{ background: T.primarySoft, color: T.primary }}>
                    Mark all read
                  </motion.button>
                )}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-white/60"
                  style={{ borderColor: T.border, color: T.muted }}
                  aria-label="Close">
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex gap-1 px-3 pt-3 border-b" style={{ borderColor: T.border }}>
              {[
                { id: "all" as const, label: "All", count: unread },
                { id: "needs" as const, label: "Needs you", count: needsUnread },
                { id: "fyi" as const, label: "FYI", count: fyiUnread },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative px-3 py-2.5 text-sm font-medium flex items-center gap-2 transition"
                  style={{ color: tab === t.id ? T.ink : T.muted }}>
                  {t.label}
                  {t.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums font-semibold"
                      style={{
                        background: tab === t.id ? T.primarySoft : "#F6F3EC",
                        color: tab === t.id ? T.primary : T.muted,
                      }}>{t.count}</span>
                  )}
                  {tab === t.id && (
                    <motion.div
                      layoutId="notif-tab-underline"
                      className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full"
                      style={{ background: T.primary }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {shown.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={calm ? false : { scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: T.goodSoft }}>
                    <Check size={26} color={T.good} strokeWidth={2.5} />
                  </motion.div>
                  <div className="font-display text-base mb-1">You're all caught up.</div>
                  <div className="text-xs" style={{ color: T.muted }}>Nothing needs you right now.</div>
                </div>
              ) : (
                groups.map((g, gi) => (
                  <div key={g.label} className="mb-4">
                    <div className="text-[10px] uppercase tracking-widest px-2 mb-2" style={{ color: T.muted }}>
                      {g.label}
                    </div>
                    <div className="space-y-1.5">
                      {g.items.map((n, i) => {
                        const tone = toneFor(n.severity);
                        return (
                          <motion.button
                            key={n.id}
                            layout
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: gi * 0.05 + i * 0.035, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                              onMarkRead(n.id);
                              if (n.link) onNavigate(n.link);
                              onClose();
                            }}
                            className="w-full text-left rounded-xl border p-3 transition relative"
                            style={{
                              borderColor: n.read ? T.border : "rgba(23,112,106,0.28)",
                              background: n.read ? T.surface : T.primarySoft,
                            }}>
                            <div className="flex items-start gap-3">
                              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: tone.bg }}>
                                {n.Icon ? (
                                  <n.Icon size={16} strokeWidth={2.2} style={{ color: tone.fg }} />
                                ) : (
                                  <Bell size={16} strokeWidth={2.2} style={{ color: tone.fg }} />
                                )}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                  <div className={`text-sm leading-tight ${n.read ? "font-medium" : "font-semibold"}`}
                                    style={{ color: T.ink }}>
                                    {n.title}
                                  </div>
                                  {!n.read && (
                                    <motion.span
                                      animate={calm ? undefined : { scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                                      style={{ background: T.primary }}
                                    />
                                  )}
                                </div>
                                {n.body && (
                                  <div className="text-xs leading-snug mb-1" style={{ color: T.muted }}>{n.body}</div>
                                )}
                                <div className="flex items-center gap-2 text-[10px]" style={{ color: T.muted }}>
                                  <Clock size={9} />
                                  {relTime(n.at)}
                                  {n.actionLabel && (
                                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                                      style={{ background: tone.fg, color: "#fff" }}>
                                      {n.actionLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t flex items-center justify-between text-xs"
              style={{ borderColor: T.border, color: T.muted }}>
              <button className="hover:opacity-70 transition" onClick={onClose}>
                Manage preferences →
              </button>
              <span className="text-[10px] flex items-center gap-1.5">
                <Kbd>Esc</Kbd> close
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [15.6] GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════════
type SearchCategory = "entity" | "invoice" | "task" | "action";

type SearchResult = {
  id: string;
  category: SearchCategory;
  title: string;
  sub: string;
  link: string;
  Icon: LucideIcon;
};

function buildSearchIndex(entities: Entity[], ledger: any[]): SearchResult[] {
  const out: SearchResult[] = [];
  (entities ?? []).forEach((e) => {
    if (e.type === "customer") out.push({
      id: `c-${e.id}`, category: "entity",
      title: e.name ?? "Customer",
      sub: `${e.data?.city ?? "—"} · customer`,
      link: "/customers", Icon: Users,
    });
    if (e.type === "vendor") out.push({
      id: `v-${e.id}`, category: "entity",
      title: e.name ?? "Vendor",
      sub: `${e.data?.category ?? "vendor"}`,
      link: "/customers", Icon: Building2,
    });
    if (e.type === "invoice") out.push({
      id: `i-${e.id}`, category: "invoice",
      title: e.name ?? "Invoice",
      sub: `${e.data?.customer_name ?? "—"} · ${fmtINR(e.data?.total ?? 0)}`,
      link: `/money/invoices/${e.id}/review`, Icon: Receipt,
    });
    if (e.type === "task") out.push({
      id: `t-${e.id}`, category: "task",
      title: e.name ?? "Task",
      sub: `${e.data?.owner ?? "—"} · ${e.data?.status ?? "open"}`,
      link: "/tasks", Icon: CheckSquare,
    });
  });
  ledger.slice(0, 20).forEach((r: any) => out.push({
    id: `l-${r.id}`, category: "action",
    title: r.reference,
    sub: `${r.approver} · ${r.type}`,
    link: "/trust", Icon: ShieldCheck,
  }));
  return out;
}

function highlightText(text: string, q: string): ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: "rgba(242,163,58,0.4)",
        color: "inherit",
        borderRadius: 3,
        padding: "0 2px",
        fontWeight: 700,
      }}>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function GlobalSearch({ open, onClose, index, onNavigate }: {
  open: boolean;
  onClose: () => void;
  index: SearchResult[];
  onNavigate: (link: string) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useLocalState<string[]>("bizos.recent-searches", []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return [];
    return index
      .map((r) => {
        const t = r.title.toLowerCase().indexOf(needle);
        const s = r.sub.toLowerCase().indexOf(needle);
        const score = t === 0 ? 0 : t > 0 ? 1 : s >= 0 ? 2 : 99;
        return { r, score };
      })
      .filter((x) => x.score < 99)
      .sort((a, b) => a.score - b.score)
      .slice(0, 14)
      .map((x) => x.r);
  }, [q, index]);

  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  const commit = useCallback((r: SearchResult) => {
    setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 5));
    onNavigate(r.link);
    onClose();
  }, [q, setRecent, onNavigate, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && results[active]) { e.preventDefault(); commit(results[active]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, commit, onClose]);

  const grouped = useMemo(() => {
    const g: Record<string, SearchResult[]> = {};
    results.forEach((r) => { (g[r.category] ??= []).push(r); });
    return g;
  }, [results]);

  const catLabel: Record<SearchCategory, string> = {
    entity: "Customers & vendors",
    invoice: "Invoices",
    task: "Tasks",
    action: "Ledger actions",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(16,24,40,0.35)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed left-1/2 top-[10vh] -translate-x-1/2 w-[92vw] max-w-2xl z-50 rounded-2xl overflow-hidden"
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              boxShadow: "0 30px 80px -20px rgba(16,24,40,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
            role="dialog"
            aria-label="Global search">

            <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: T.border }}>
              <Search size={18} style={{ color: T.muted }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                placeholder="Search customers, invoices, tasks, actions…"
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: T.ink }}
                aria-label="Search"
              />
              {q && (
                <button onClick={() => { setQ(""); inputRef.current?.focus(); }}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#F6F3EC] transition"
                  style={{ color: T.muted }} aria-label="Clear">
                  <X size={14} />
                </button>
              )}
              <Kbd>Esc</Kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!q.trim() ? (
                <div className="p-5">
                  {recent.length > 0 && (
                    <>
                      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>
                        Recent
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {recent.map((term) => (
                          <button key={term} onClick={() => { setQ(term); inputRef.current?.focus(); }}
                            className="text-xs px-3 py-1.5 rounded-full border hover:bg-[#F6F3EC] transition flex items-center gap-1.5"
                            style={{ borderColor: T.border, color: T.muted }}>
                            <Clock size={11} /> {term}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>
                    Quick access
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { Icon: InboxIcon, label: "Inbox", link: "/inbox" },
                      { Icon: FileText, label: "Action ledger", link: "/trust" },
                      { Icon: Users, label: "Customers", link: "/customers" },
                      { Icon: CheckSquare, label: "Tasks", link: "/tasks" },
                    ].map((s) => (
                      <button key={s.label}
                        onClick={() => { onNavigate(s.link); onClose(); }}
                        className="text-left px-3 py-2.5 rounded-xl border hover:bg-[#F6F3EC] transition flex items-center gap-2 text-sm"
                        style={{ borderColor: T.border }}>
                        <s.Icon size={14} style={{ color: T.primary }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 text-[10px] flex items-center gap-2" style={{ color: T.muted }}>
                    <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate · <Kbd>Enter</Kbd> open · <Kbd>Esc</Kbd> close
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-14 px-6">
                  <div className="font-display text-base mb-1">No matches for "{q}"</div>
                  <div className="text-xs" style={{ color: T.muted }}>
                    Try a customer name, invoice number, or keyword.
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(grouped).map(([cat, list]) => (
                    <div key={cat} className="mb-2">
                      <div className="text-[10px] uppercase tracking-widest px-3 py-1.5"
                        style={{ color: T.muted }}>
                        {catLabel[cat as SearchCategory]}
                      </div>
                      {list.map((r) => {
                        const gi = results.indexOf(r);
                        const isActive = gi === active;
                        return (
                          <motion.button
                            key={r.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(gi * 0.02, 0.2), duration: 0.2 }}
                            onMouseEnter={() => setActive(gi)}
                            onClick={() => commit(r)}
                            className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition"
                            style={{ background: isActive ? T.primarySoft : "transparent" }}>
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                              style={{ background: isActive ? T.primary : "#F6F3EC" }}>
                              <r.Icon size={14}
                                style={{ color: isActive ? "#fff" : T.primary }}
                                strokeWidth={2.2} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: T.ink }}>
                                {highlightText(r.title, q)}
                              </div>
                              <div className="text-xs truncate" style={{ color: T.muted }}>
                                {highlightText(r.sub, q)}
                              </div>
                            </div>
                            {isActive && (
                              <motion.span
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shrink-0"
                                style={{ background: T.primary, color: "#fff" }}>
                                <CornerDownLeft size={9} /> open
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ))}
                  <div className="px-3 py-2 text-[10px] flex items-center gap-2 border-t"
                    style={{ borderColor: T.border, color: T.muted }}>
                    <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate · <Kbd>Enter</Kbd> open · <Kbd>Esc</Kbd> close
                    <span className="ml-auto tabular-nums">
                      {results.length} {results.length === 1 ? "result" : "results"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [16] HOME
// ═══════════════════════════════════════════════════════════════════
function Home({ me, onNavigate, inboxBadge }: { me: Me; onNavigate: (p: string) => void; inboxBadge: number }) {
  const { data: entities, loading, refresh } = useEntities();
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(() => Date.now());

  const stats = useMemo(() => {
    const list = entities ?? [];
    const invoices = list.filter((e) => e.type === "invoice");
    const tasks = list.filter((e) => e.type === "task");
    const customers = list.filter((e) => e.type === "customer");
    const overdue = invoices.filter((i) => i.data?.status === "overdue");
    const overdueAmt = overdue.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    const openTasks = tasks.filter((t) => t.data?.status === "open" || t.data?.status === "in_progress");
    const esg = list.find((e) => e.type === "esg_metric");
    return { overdueAmt, openTasks: openTasks.length, customers: customers.length, esgCoverage: esg?.data?.value ?? 68 };
  }, [entities]);

  const priorities = useMemo(() => buildPriorities(entities ?? []), [entities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setLastChecked(Date.now());
    setTimeout(() => setRefreshing(false), 500);
    toast.success("Refreshed");
  };

  if (loading) return <HomeSkeleton />;
  const allClear = priorities.length === 0 && inboxBadge === 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Good {greeting()}, Rajesh</h1>
          <p className="mt-2 text-sm" style={{ color: T.muted }}>
            Here's what needs your attention today at {me.business_name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FreshnessChip at={lastChecked} />
          <motion.button whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }}
            onClick={handleRefresh} aria-label="Refresh"
            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-white/60"
            style={{ borderColor: T.border }}>
            <RefreshCw size={14} style={{ color: refreshing ? T.primary : T.muted }} />
          </motion.button>
        </div>
      </motion.div>

      {allClear ? (
        <EmptyState icon={<Check size={28} />} title="All clear. Nothing needs you today."
          body={`Last checked ${relTime(lastChecked)}`}
          action={{ label: "Review yesterday", onClick: () => onNavigate("/trust") }} />
      ) : (
        <>
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4, boxShadow: "0 8px 30px -12px rgba(16,24,40,0.15)" }}
                onClick={() => onNavigate(p.action === "Review" ? "/inbox" : "/tasks")}
                className="rounded-2xl border p-5 transition-all cursor-pointer"
                style={{ borderColor: T.border, background: T.surface, borderLeftWidth: 3,
                  borderLeftColor: p.severity === "critical" ? T.critical : p.severity === "watch" ? T.watch : T.good }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <SeverityPill severity={p.severity} />
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>{p.source}</span>
                    </div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm mt-1" style={{ color: T.muted }}>{p.detail}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Sparkline data={[40, 42, 38, 45, 52, 58, 55, 62, 68, 71, 74, 78]}
                      colour={p.severity === "critical" ? T.critical : p.severity === "watch" ? T.watch : T.good} />
                    <motion.button whileHover={{ x: 2 }}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap flex items-center gap-1 transition hover:bg-[#F6F3EC]"
                      style={{ borderColor: T.border }}>{p.action}<ChevronRight size={12} /></motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <HealthTile label="Finance"
              state={stats.overdueAmt > 500000 ? "critical" : stats.overdueAmt > 200000 ? "watch" : "good"}
              sparkline={[62, 58, 55, 60, 65, 68, 72, 70, 68, 74, 76, 72, 70, 68]}
              onClick={() => onNavigate("/trust")} />
            <HealthTile label="Operations" state="good"
              sparkline={[50, 55, 60, 62, 68, 72, 75, 78, 76, 80, 82, 84, 86, 88]}
              onClick={() => onNavigate("/tasks")} />
            <HealthTile label="Compliance" state="good"
              sparkline={[70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96]}
              onClick={() => onNavigate("/compliance")} />
            <HealthTile label="People" state="watch"
              sparkline={[80, 78, 76, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52]}
              onClick={() => onNavigate("/tasks")} />
          </div>
        </>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <CashProjectionChart onDrill={() => onNavigate("/trust")} />
          <AgeingBars onDrill={(bucket) => toast.success(`Filter invoices: ${bucket}`)} />
        </div>
        <div className="space-y-4">
          <motion.div whileHover={{ y: -2 }} onClick={() => onNavigate("/inbox")}
            className="rounded-2xl border p-5 cursor-pointer transition-all"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Pending approvals</div>
              {inboxBadge > 0 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                  style={{ background: T.critical }}>{inboxBadge}</motion.span>
              )}
            </div>
            <div className="text-4xl tracking-tight mb-1 tabular-nums" style={{ color: T.primary, fontWeight: 700 }}>
              <AnimatedNumber value={inboxBadge} />
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border font-medium w-full mt-3 flex items-center justify-center gap-1 hover:bg-[#F6F3EC] transition"
              style={{ borderColor: T.border }}>Open Inbox<ChevronRight size={12} /></button>
          </motion.div>

          <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: T.muted }}>Top risks</div>
            <div className="space-y-3">
              {[
                { label: "Cash flow", score: 78 }, { label: "Overdue INV-104", score: 72 },
                { label: "Vendor concentration", score: 48 }, { label: "Compliance deadline", score: 42 },
                { label: "Task backlog", score: 28 },
              ].map((r, i) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{r.label}</span>
                    <span className="tabular-nums" style={{ color: T.muted }}>{r.score}</span>
                  </div>
                  <div className="h-2 rounded-sm overflow-hidden" style={{ background: "#F6F3EC" }}>
                    <motion.div className="h-full rounded-sm" initial={{ width: 0 }} animate={{ width: `${r.score}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                      style={{
                        background:
                          r.score >= 75 ? T.rust
                          : r.score >= 55 ? T.terracotta
                          : r.score >= 35 ? T.accent
                          : T.primary,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div whileHover={{ y: -2 }} onClick={() => onNavigate("/tasks")}
            className="rounded-2xl border p-5 cursor-pointer transition-all"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Overdue & blocked</div>
            <div className="text-4xl tracking-tight mb-1 tabular-nums" style={{ color: T.watch, fontWeight: 700 }}>
              <AnimatedNumber value={stats.openTasks} />
            </div>
            <div className="text-xs" style={{ color: T.muted }}>tasks pending attention</div>
          </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/live")}>
          <div className="flex items-center gap-2 mb-3">
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: T.good }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Machine M-01</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl tabular-nums" style={{ fontWeight: 700 }}>
              <AnimatedNumber value={72.4} format={(n) => `${n.toFixed(1)}°C`} />
            </div>
            <Sparkline data={[68, 70, 71, 69, 72, 73, 71, 72, 74, 72, 71, 72, 73, 72]}
              colour={T.good} width={120} height={32} fill />
          </div>
          <div className="text-xs mt-2" style={{ color: T.muted }}>Last 60 min · normal</div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 flex items-center gap-4 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/impact")}>
          <EsgGauge value={Math.round(stats.esgCoverage)} colour={stats.esgCoverage >= 75 ? T.good : T.watch} />
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>ESG Coverage</div>
            <div className="font-medium">Governance {Math.round(stats.esgCoverage)}%</div>
            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: T.primary }}>
              View impact<ChevronRight size={12} />
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/customers")}>
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl tabular-nums" style={{ fontWeight: 700 }}>
              <AnimatedNumber value={stats.customers} />
            </div>
            <Sparkline data={[42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68]}
              colour={T.primary} width={120} height={32} fill />
          </div>
          <div className="text-xs mt-2" style={{ color: T.muted }}>Active this quarter</div>
        </motion.div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />)}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-72 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-72 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function buildPriorities(entities: Entity[]) {
  const out: any[] = [];
  const overdue = entities.filter((e) => e.type === "invoice" && e.data?.status === "overdue");
  if (overdue.length > 0) {
    const sorted = [...overdue].sort((a, b) => (b.data?.days_overdue ?? 0) - (a.data?.days_overdue ?? 0));
    const top = sorted[0];
    const total = overdue.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    out.push({ id: "overdue", severity: overdue.length >= 10 ? "critical" : "watch", source: "Collections Agent",
      title: `${overdue.length} invoices overdue · ${fmtINR(total)}`,
      detail: `Largest: ${top.data?.customer_name ?? top.name} · ${top.data?.days_overdue}d`, action: "Review" });
  }
  const tasks = entities.filter((e) => e.type === "task" && (e.data?.status === "open" || e.data?.status === "in_progress"));
  if (tasks.length > 0) {
    out.push({ id: "tasks", severity: "watch", source: "Operations",
      title: `${tasks.length} open tasks`,
      detail: "Team has pending work across collections, compliance, and sales", action: "View" });
  }
  return out.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════
// [17] INBOX — with Agents side-tab (Screen 14 detail pane)
// ═══════════════════════════════════════════════════════════════════
type InboxItem = {
  id: string; kind: "approval" | "exception" | "mention";
  severity: Severity; source: string; team: string;
  title: string; subtitle: string; detail: string;
  amount?: number; ageHours?: number; confidence?: number;
  entity?: Entity;
  evidence?: { source: string; rule: string; evidence: string; agent: string };
  agent?: AgentRun;
};

type AgentRun = {
  id: string;
  agentName: string;
  autonomy: 0 | 1 | 2;
  limit?: number;
  policy: string;
  tools: string[];
  runs: { at: number; result: "success" | "pending" | "rejected"; note: string }[];
  successRate: number;
};

function defaultAgentFor(item: InboxItem): AgentRun {
  const isCollections = item.kind === "exception";
  return {
    id: isCollections ? "agent-collections" : "agent-ops",
    agentName: isCollections ? "Collections Agent" : "Operations Agent",
    autonomy: 1,
    limit: isCollections ? 500000 : 100000,
    policy: isCollections ? "P-001" : "P-003",
    tools: isCollections ? ["WhatsApp", "Email"] : ["Work", "Notifications"],
    runs: [
      { at: Date.now() - 3 * 3600_000, result: "success", note: item.title },
      { at: Date.now() - 26 * 3600_000, result: "success", note: "Reminder sent · INV-105" },
      { at: Date.now() - 51 * 3600_000, result: "pending", note: "Draft awaiting approval" },
    ],
    successRate: 0.94,
  };
}

const AGE_BUCKETS: { key: string; label: string; test: (h: number) => boolean }[] = [
  { key: "<1d", label: "<1d", test: (h) => h < 24 },
  { key: "1-3d", label: "1–3d", test: (h) => h >= 24 && h < 72 },
  { key: "3-7d", label: "3–7d", test: (h) => h >= 72 && h < 168 },
  { key: "7-14d", label: "7–14d", test: (h) => h >= 168 && h < 336 },
  { key: "14-30d", label: "14–30d", test: (h) => h >= 336 && h < 720 },
  { key: "30d+", label: "30d+", test: (h) => h >= 720 },
];
const TEAMS = ["Collections", "Operations", "Compliance", "Sales"];
const RISKS: Severity[] = ["critical", "watch", "good"];

function AgentsSideTab({ item }: { item: InboxItem }) {
  const agent = item.agent ?? defaultAgentFor(item);
  const calm = useCalm();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: T.border, background: T.surface }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: T.primarySoft }}>
              <Bot size={16} color={T.primary} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-medium text-sm">{agent.agentName}</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
                Autonomy {agent.autonomy} · {agent.autonomy === 0 ? "Suggest" : agent.autonomy === 1 ? "Act below limit" : "Act within policy"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: T.primarySoft, color: T.primary }}>{agent.policy}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg p-2.5" style={{ background: "#F6F3EC" }}>
            <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Per-action limit</div>
            <div className="text-sm font-medium tabular-nums">
              {agent.limit ? fmtINR(agent.limit) : "—"}
            </div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: "#F6F3EC" }}>
            <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Success rate</div>
            <div className="text-sm font-medium tabular-nums" style={{ color: T.good }}>
              {(agent.successRate * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="mb-1">
          <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Tools allowed</div>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: T.primarySoft, color: T.primary }}>
                <Plug size={9} className="inline mr-1" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: T.border, background: T.surface }}>
        <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
          Recent runs · last 3
        </div>
        <div className="space-y-2.5">
          {agent.runs.map((r, i) => {
            const tone = r.result === "success" ? T.good : r.result === "rejected" ? T.critical : T.watch;
            const bg = r.result === "success" ? T.goodSoft : r.result === "rejected" ? T.criticalSoft : T.watchSoft;
            const Icon = r.result === "success" ? Check : r.result === "rejected" ? X : Clock;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: bg }}>
                  <Icon size={12} color={tone} strokeWidth={3} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs">{r.note}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                    {relTime(r.at)} · {r.result}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t" style={{ borderColor: T.border }}>
          <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Success trend</div>
          <Sparkline data={[88, 90, 91, 89, 92, 94, 93, 95, 94, 96, 95, 94]} colour={T.good}
            width={220} height={32} fill />
        </div>

        {!calm && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => toast.success(`Opening ${agent.agentName} registry…`)}
            className="w-full mt-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 hover:bg-[#F6F3EC] transition"
            style={{ borderColor: T.border, color: T.primary }}>
            <ExternalLink size={11} /> Open agent registry
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Inbox({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const nav = useNavigate();
  const { data: entities, loading } = useEntities();
  const { bump } = useApprovals();
  const [tab, setTab] = useState<"approvals" | "exceptions" | "mentions">("approvals");
  const [sideTab, setSideTab] = useState<"detail" | "agents">("detail");
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<InboxItem | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<Severity | null>(null);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedMany, setSelectedMany] = useState<Set<string>>(new Set());
  const [dayFilter, setDayFilter] = useState<number | null>(null);

  const items: InboxItem[] = useMemo(() => {
    const list = entities ?? [];
    const out: InboxItem[] = [];
    list.filter((e) => e.type === "invoice" && e.data?.status === "overdue").forEach((inv) => {
      const days = inv.data?.days_overdue ?? 0;
      out.push({ id: `exc-${inv.id}`, kind: "exception",
        severity: days > 30 ? "critical" : "watch", source: "Collections Agent", team: "Collections",
        title: inv.name ?? "Invoice", subtitle: inv.data?.customer_name ?? "—",
        detail: `${days}d overdue · ${fmtINR(inv.data?.total ?? 0)}`,
        amount: inv.data?.total ?? 0, ageHours: days * 24,
        confidence: inv.data?.confidence ?? 0.9, entity: inv,
        evidence: { source: `Tally sync · invoice ${inv.name} · due ${inv.data?.due_date}`,
          rule: "Overdue > 30 days + top-5 customer → manager approval required",
          evidence: `Days overdue: ${days}\nAmount: ${fmtINR(inv.data?.total ?? 0)}\nLast reminder: 2 days ago · no response\nPrior payment avg: 12 days`,
          agent: "Collections Agent v1.2" } });
    });
    list.filter((e) => e.type === "task" && e.data?.priority === "high" && e.data?.status === "open").forEach((t) => {
      const owner = t.data?.owner ?? "—";
      out.push({ id: `app-${t.id}`, kind: "approval", severity: "watch",
        source: t.data?.created_by === "agent" ? "Operations Agent" : "You", team: "Operations",
        title: t.name ?? "Task", subtitle: `Owner · ${owner}`,
        detail: `Due ${t.data?.due_date ?? "—"}`, ageHours: t.data?.age_hours ?? 12, entity: t,
        evidence: { source: `Task created by ${t.data?.created_by ?? "user"}`,
          rule: "Manual review required for high-priority items",
          evidence: `Priority: high\nOwner: ${owner}\nDue: ${t.data?.due_date}`,
          agent: "Operations Agent" } });
    });
    list.filter((e) => e.type === "customer").slice(0, 5).forEach((c) => {
      out.push({ id: `men-${c.id}`, kind: "mention", severity: "good",
        source: "Customer Success Agent", team: "Sales",
        title: c.name ?? "Customer", subtitle: `${c.data?.city ?? "—"} · ${c.data?.tier ?? "standard"}`,
        detail: `LTV ${fmtINR(c.data?.lifetime_value ?? 0)}`, ageHours: 2, entity: c,
        evidence: { source: `Customer ${c.name}`, rule: "Track customer relationships and health",
          evidence: `City: ${c.data?.city}\nLifetime value: ${fmtINR(c.data?.lifetime_value ?? 0)}`,
          agent: "Customer Success Agent" } });
    });
    return out;
  }, [entities]);

  const filtered = useMemo(() => {
    const wantKind = tab === "approvals" ? "approval" : tab === "exceptions" ? "exception" : "mention";
    const f = items.filter((i) => {
      if (i.kind !== wantKind) return false;
      if (ageFilter) { const bucket = AGE_BUCKETS.find((b) => b.key === ageFilter); if (bucket && !bucket.test(i.ageHours ?? 0)) return false; }
      if (riskFilter && i.severity !== riskFilter) return false;
      if (teamFilter && i.team !== teamFilter) return false;
      if (dayFilter !== null) { const d = Math.floor((i.ageHours ?? 0) / 24); if (d !== dayFilter - 1) return false; }
      return true;
    });
    const rank = (s: Severity) => (s === "critical" ? 3 : s === "watch" ? 2 : 1);
    f.sort((a, b) => {
      if (rank(a.severity) !== rank(b.severity)) return rank(b.severity) - rank(a.severity);
      if ((b.amount ?? 0) !== (a.amount ?? 0)) return (b.amount ?? 0) - (a.amount ?? 0);
      return (b.ageHours ?? 0) - (a.ageHours ?? 0);
    });
    return f;
  }, [items, tab, ageFilter, riskFilter, teamFilter, dayFilter]);

  const sel = useMemo(() => filtered.find((i) => i.id === selected) ?? filtered[0] ?? null, [filtered, selected]);
  const riskMix = useMemo(() => ({
    critical: items.filter((i) => i.severity === "critical").length,
    watch: items.filter((i) => i.severity === "watch").length,
    good: items.filter((i) => i.severity === "good").length,
  }), [items]);
  const activeFilterCount = (ageFilter ? 1 : 0) + (riskFilter ? 1 : 0) + (teamFilter ? 1 : 0) + (dayFilter !== null ? 1 : 0);

  useEffect(() => {
    const n = items.filter((i) => i.kind !== "mention" && !handled.has(i.id)).length;
    onCountChange?.(n);
  }, [items, handled, onCountChange]);

  useEffect(() => { if (sel) setEditedText(sel.subtitle); }, [sel]);

  const handleApprove = useCallback((item: InboxItem) => {
    setHandled((s) => new Set(s).add(item.id));
    bump();
    toast.custom((t) => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: t.visible ? 1 : 0, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="rounded-xl px-4 py-3 flex items-center gap-3 max-w-md glass-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: T.goodSoft }}>
          <Check size={14} color={T.good} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Approved. WhatsApp reminder sent.</div>
          <div className="text-xs truncate" style={{ color: T.muted }}>{item.title} · {item.subtitle}</div>
        </div>
        <button onClick={() => { toast.dismiss(t.id); nav("/trust"); }}
          className="text-xs px-2 py-1 rounded border font-medium whitespace-nowrap"
          style={{ borderColor: T.border, color: T.primary }}>Ledger</button>
        <button onClick={() => {
          toast.dismiss(t.id);
          setHandled((s) => { const n = new Set(s); n.delete(item.id); return n; });
          toast.success("Reverted");
        }} className="text-xs px-2 py-1 rounded border font-medium whitespace-nowrap"
          style={{ borderColor: T.border, color: T.muted }}>Undo</button>
      </motion.div>
    ), { duration: 10000 });
  }, [bump, nav]);

  const handleReject = useCallback((item: InboxItem) => {
    setHandled((s) => new Set(s).add(item.id));
    toast.error(`Rejected: ${item.title}`);
  }, []);

  const handleBulkApprove = () => {
    const lowRisk = filtered.filter((i) => i.severity !== "critical" && !handled.has(i.id));
    if (lowRisk.length === 0) { toast.error("No low-risk items to bulk approve"); return; }
    lowRisk.forEach((i) => { setHandled((s) => new Set(s).add(i.id)); bump(); });
    setBulkMode(false); setSelectedMany(new Set());
    toast.success(`Bulk approved ${lowRisk.length} low-risk items`);
  };

  useHotkeys({
    j: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.min(idx + 1, filtered.length - 1)]?.id ?? null); },
    ArrowDown: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.min(idx + 1, filtered.length - 1)]?.id ?? null); },
    k: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.max(idx - 1, 0)]?.id ?? null); },
    ArrowUp: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.max(idx - 1, 0)]?.id ?? null); },
    a: () => { if (!drawer && !delegateOpen && !editMode && sel) handleApprove(sel); },
    r: () => { if (!drawer && !delegateOpen && !editMode && sel) handleReject(sel); },
    e: () => { if (!drawer && !delegateOpen && sel) setEditMode(true); },
    d: () => { if (!drawer && sel) setDelegateOpen(true); },
    Escape: () => { if (drawer) setDrawer(null); else if (delegateOpen) setDelegateOpen(false);
      else if (editMode) setEditMode(false); else if (showFilter) setShowFilter(false); },
  }, true);

  if (loading) return <InboxSkeleton />;

  const tabs = [
    { id: "approvals" as const, label: "Approvals", count: items.filter((i) => i.kind === "approval" && !handled.has(i.id)).length },
    { id: "exceptions" as const, label: "Exceptions", count: items.filter((i) => i.kind === "exception" && !handled.has(i.id)).length },
    { id: "mentions" as const, label: "Mentions", count: items.filter((i) => i.kind === "mention").length },
  ];

  return (
    <div className="pb-14">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Inbox</h1>
          <p className="text-sm" style={{ color: T.muted }}>What needs your attention</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Approvals / 14d</div>
            <div className="text-[10px]" style={{ color: T.muted }}>
              {dayFilter === null ? "Click a bar to filter" : `Filtered: ${dayFilter}d ago`}
            </div>
          </div>
          <ApprovalVolumeBar onBarClick={(d) => {
            setDayFilter((cur) => (cur === d ? null : d));
            toast.success(d === dayFilter ? "Cleared day filter" : `Filtered: ${d} days ago`);
          }} />
        </div>
      </div>

      <div className="flex gap-1 border-b mb-6 flex-wrap" style={{ borderColor: T.border }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
            className="px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition"
            style={{ color: tab === t.id ? T.ink : T.muted,
              borderBottom: tab === t.id ? `2px solid ${T.primary}` : "2px solid transparent", marginBottom: "-1px" }}>
            {t.label}
            {t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium tabular-nums"
                style={{ background: tab === t.id ? T.primarySoft : "#F6F3EC", color: tab === t.id ? T.primary : T.muted }}>{t.count}</span>
            )}
            {t.id === "approvals" && <RiskMixDonut critical={riskMix.critical} watch={riskMix.watch} good={riskMix.good} />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {bulkMode ? (
            <>
              <button onClick={handleBulkApprove} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                style={{ background: T.primary }}>Approve {filtered.filter((i) => i.severity !== "critical").length} low-risk</button>
              <button onClick={() => { setBulkMode(false); setSelectedMany(new Set()); }}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                style={{ borderColor: T.border, color: T.muted }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setBulkMode(true)}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-[#F6F3EC]"
              style={{ borderColor: T.border, color: T.muted }}>Bulk</button>
          )}
          <button onClick={() => setShowFilter((v) => !v)} aria-expanded={showFilter}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            <Filter size={12} /> Filter {activeFilterCount > 0 && `· ${activeFilterCount}`}
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs flex items-center gap-2 flex-wrap">
          <span style={{ color: T.muted }}>Filters:</span>
          {ageFilter && <FilterChip label={`Age ${ageFilter}`} onClear={() => setAgeFilter(null)} />}
          {riskFilter && <FilterChip label={`Risk ${riskFilter}`} onClear={() => setRiskFilter(null)} />}
          {teamFilter && <FilterChip label={`Team ${teamFilter}`} onClear={() => setTeamFilter(null)} />}
          {dayFilter !== null && <FilterChip label={`${dayFilter}d ago`} onClear={() => setDayFilter(null)} />}
        </motion.div>
      )}

      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }} className="mb-6 rounded-2xl border p-4 overflow-hidden"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-semibold">Age distribution</div>
                <div className="text-[10px]" style={{ color: T.muted }}>Click a bar to filter by age</div>
              </div>
              <button onClick={() => setShowFilter(false)} className="text-xs" style={{ color: T.muted }}>close</button>
            </div>
            <AgeHistogram active={ageFilter} onBrush={(bucket) => {
              setAgeFilter((cur) => (cur === bucket ? null : bucket));
              toast.success(`Filtered by ${bucket}`);
            }} />
            <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t" style={{ borderColor: T.border }}>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Risk</div>
                <div className="flex flex-wrap gap-1.5">
                  {RISKS.map((r) => (
                    <button key={r} onClick={() => setRiskFilter((cur) => (cur === r ? null : r))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{ borderColor: riskFilter === r ? T.primary : T.border,
                        background: riskFilter === r ? T.primarySoft : T.surface,
                        color: riskFilter === r ? T.primary : T.muted }}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Team</div>
                <div className="flex flex-wrap gap-1.5">
                  {TEAMS.map((tm) => (
                    <button key={tm} onClick={() => setTeamFilter((cur) => (cur === tm ? null : tm))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{ borderColor: teamFilter === tm ? T.primary : T.border,
                        background: teamFilter === tm ? T.primarySoft : T.surface,
                        color: teamFilter === tm ? T.primary : T.muted }}>{tm}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState icon={<Check size={28} />} title="Inbox zero. Nothing needs you."
          body={activeFilterCount > 0 ? "Try clearing your filters." : "You're all caught up."}
          action={activeFilterCount > 0 ? { label: "Clear filters",
            onClick: () => { setAgeFilter(null); setRiskFilter(null); setTeamFilter(null); setDayFilter(null); } } : undefined} />
      ) : (
        <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4">
          <div className="space-y-2 md:max-h-[calc(100vh-300px)] md:overflow-y-auto md:pr-1">
            {filtered.map((item, i) => (
              <InboxRow key={item.id} item={item} index={i}
                active={sel?.id === item.id} handled={handled.has(item.id)}
                bulkMode={bulkMode} checked={selectedMany.has(item.id)}
                onCheck={(next) => setSelectedMany((s) => {
                  const n = new Set(s); next ? n.add(item.id) : n.delete(item.id); return n;
                })}
                onSelect={() => { setSelected(item.id); setSideTab("detail"); }} />
            ))}
          </div>

          {sel && (
            <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: T.border, background: T.surface }}>

              {/* Side tabs */}
              <div className="flex border-b" style={{ borderColor: T.border }}>
                {[
                  { id: "detail" as const, label: "Detail", Icon: FileText },
                  { id: "agents" as const, label: "Agents", Icon: Bot },
                ].map((st) => (
                  <button key={st.id} onClick={() => setSideTab(st.id)}
                    className="px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 transition"
                    style={{
                      color: sideTab === st.id ? T.ink : T.muted,
                      borderBottom: sideTab === st.id ? `2px solid ${T.primary}` : "2px solid transparent",
                      marginBottom: "-1px",
                    }}>
                    <st.Icon size={12} /> {st.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {sideTab === "detail" ? (
                  <>
                    {sel.ageHours !== undefined && sel.ageHours > 48 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: T.criticalSoft }}>
                        <AlertTriangle size={16} color={T.critical} />
                        <div className="text-xs" style={{ color: T.critical }}>
                          <b>Escalated to owner</b> · Reminder sent {Math.floor(sel.ageHours / 24)}h ago
                        </div>
                      </motion.div>
                    )}
                    {sel.ageHours !== undefined && sel.ageHours > 24 && sel.ageHours <= 48 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: T.watchSoft }}>
                        <AlertTriangle size={16} color={T.watch} />
                        <div className="text-xs" style={{ color: T.watch }}>
                          <b>Reminder sent</b> · 2h ago · awaiting response
                        </div>
                      </motion.div>
                    )}

                    <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{sel.kind}</div>

                    {editMode ? (
                      <div className="mb-6">
                        <label className="text-xs font-medium block mb-2">Edit subject</label>
                        <input value={editedText} onChange={(e) => setEditedText(e.target.value)} autoFocus
                          className="w-full px-3 py-2 rounded-lg border outline-none text-sm mb-2"
                          style={{ borderColor: T.border, background: T.surface }} />
                        <div className="flex gap-2">
                          <button onClick={() => { setEditMode(false); toast.success("Saved"); }}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                            style={{ background: T.primary }}>Save</button>
                          <button onClick={() => setEditMode(false)}
                            className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                            style={{ borderColor: T.border }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-display text-xl mb-1">{sel.title}</h2>
                        <p className="text-sm mb-6" style={{ color: T.muted }}>{sel.subtitle} · {sel.detail}</p>
                      </>
                    )}

                    <div className="mb-4">
                      <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Why it exists</div>
                      <p className="text-sm leading-relaxed">
                        {sel.kind === "exception" && `${sel.title} is ${sel.ageHours ? Math.floor(sel.ageHours / 24) : 0} days past due and ${sel.subtitle} is a top-5 customer. Unresolved receivables at this aging typically slip to 90+ days.`}
                        {sel.kind === "approval" && `This high-priority task requires manager sign-off before it can proceed.`}
                        {sel.kind === "mention" && `${sel.subtitle} was recently active — worth a check-in.`}
                      </p>
                    </div>

                    {sel.evidence && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Chip icon="📄" label={sel.evidence.source.split("·")[0].trim()} />
                        <Chip icon="⚖️" label="Rule applied" />
                        <Chip icon="🧠" label="Business memory" />
                      </div>
                    )}

                    {sel.kind === "exception" && (
                      <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: T.border, background: "#F6F3EC" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.muted }}>
                            <Zap size={11} color={T.primary} /> WhatsApp draft
                          </div>
                          <button onClick={() => setEditMode(true)} className="text-[10px] flex items-center gap-1"
                            style={{ color: T.primary }}><Edit3 size={11} /> Edit</button>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                          className="rounded-xl p-3" style={{ background: WA.dark }}>
                          <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                            Dear {sel.subtitle},<br /><br />
                            This is a gentle reminder regarding invoice <b>{sel.title}</b> for{" "}
                            <b>{sel.amount ? fmtINR(sel.amount) : "the pending amount"}</b>, now{" "}
                            {sel.ageHours ? Math.floor(sel.ageHours / 24) : 0} days overdue.<br /><br />
                            We value our relationship and would appreciate your attention. Please let us know if there are any issues.<br /><br />
                            Thank you.
                          </p>
                        </motion.div>
                      </div>
                    )}

                    <div className="mb-4 text-xs p-3 rounded-lg border flex items-center gap-2"
                      style={{ borderColor: T.border, background: T.primarySoft, color: T.primary }}>
                      <ShieldCheck size={14} />Top-5 customer: manager approval required
                    </div>

                    {sel.confidence !== undefined && <div className="mb-6"><ConfidenceBar value={sel.confidence} /></div>}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApprove(sel)}
                        className="flex-1 min-w-[120px] py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5"
                        style={{ background: T.primary }}><Check size={14} /> Approve</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditMode(true)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                        style={{ borderColor: T.border }}><Edit3 size={14} /> Edit</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleReject(sel)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#FDECEC]"
                        style={{ borderColor: T.border, color: T.critical }}><X size={14} /> Reject</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDelegateOpen(true)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                        style={{ borderColor: T.border }}><UserPlus size={14} /> Delegate</motion.button>
                    </div>

                    <button onClick={() => setDrawer(sel)}
                      className="text-xs flex items-center gap-1 font-medium hover:gap-2 transition-all"
                      style={{ color: T.primary }}>Open evidence drawer <ArrowRight size={12} /></button>
                  </>
                ) : (
                  <AgentsSideTab item={sel} />
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="fixed bottom-4 md:bottom-4 left-1/2 -translate-x-1/2 z-30 hidden sm:block pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] glass-3"
          style={{ color: T.muted }}>
          <Kbd>J</Kbd><Kbd>K</Kbd> move
          <span className="opacity-30">·</span>
          <Kbd>A</Kbd> approve
          <span className="opacity-30">·</span>
          <Kbd>R</Kbd> reject
          <span className="opacity-30">·</span>
          <Kbd>E</Kbd> edit
          <span className="opacity-30">·</span>
          <Kbd>D</Kbd> delegate
        </motion.div>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawer(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto glass-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
              role="dialog" aria-label="Evidence drawer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: T.muted }}>
                    <FileText size={14} /> Evidence drawer · 7 sections
                  </div>
                  <button onClick={() => setDrawer(null)} className="hover:opacity-60" aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <div className="font-display text-lg mb-1">{drawer.title}</div>
                <div className="text-sm mb-6" style={{ color: T.muted }}>{drawer.subtitle} · {drawer.detail}</div>
                {drawer.evidence && (
                  <div className="space-y-4">
                    <EvidenceField label="1. Inputs" value={drawer.evidence.source} />
                    <EvidenceField label="2. Reasoning" value={`${drawer.ageHours ? Math.floor(drawer.ageHours / 24) : 0}d overdue, top-5 customer, no reply to 2 reminders.`} />
                    <EvidenceField label="3. Policy check" value={`${drawer.agent ? "P-001" : "P-001"} · pass · limit ₹5L`} />
                    <EvidenceField label="4. Artifact" value={`Reminder draft v2 · WhatsApp`} />
                    <EvidenceField label="5. Approver" value="Rajesh (Owner) · pending" />
                    <EvidenceField label="6. Result" value="awaiting decision" />
                    <EvidenceField label="7. Proof" value="8f4a2b1c9e7d3f6a… (anchored at approval)" mono />
                  </div>
                )}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: T.border }}>
                  <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>Actions</div>
                  <div className="flex gap-2">
                    <button onClick={() => { handleApprove(drawer); setDrawer(null); }}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: T.primary }}>Approve</button>
                    <button onClick={() => setDrawer(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border"
                      style={{ borderColor: T.border }}>Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {delegateOpen && sel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setDelegateOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-50 glass-3"
              role="dialog" aria-label="Delegate">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: T.muted }}>Delegate</div>
              <h3 className="font-display text-lg mb-4">{sel.title}</h3>
              <div className="space-y-2 mb-4">
                {["Ravi Kumar · Collections", "Meera Iyer · Compliance", "Ankit Sharma · Operations", "Priya Nair · Sales"].map((u) => (
                  <motion.button key={u} whileHover={{ x: 4 }}
                    onClick={() => { setDelegateOpen(false); toast.success(`Delegated to ${u.split(" · ")[0]}`); }}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:bg-white/60 text-sm transition flex items-center justify-between"
                    style={{ borderColor: T.border }}>
                    {u}<ChevronRight size={14} style={{ color: T.muted }} />
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setDelegateOpen(false)}
                className="w-full py-2 text-sm font-medium" style={{ color: T.muted }}>Cancel</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: T.primarySoft, color: T.primary }}>
      {label}
      <button onClick={onClear} className="hover:opacity-70" aria-label={`Clear ${label}`}><X size={10} /></button>
    </motion.span>
  );
}

const InboxRow = memo(function InboxRow({ item, active, handled, bulkMode, checked, onCheck, onSelect, index }:
  { item: InboxItem; active: boolean; handled: boolean; bulkMode: boolean; checked: boolean;
    onCheck: (next: boolean) => void; onSelect: () => void; index: number }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ x: 2 }} onClick={onSelect}
      className="rounded-xl border p-4 cursor-pointer transition-all relative"
      style={{ borderColor: active ? T.primary : T.border,
        background: active ? T.primarySoft : handled ? "#FAFAF8" : T.surface,
        opacity: handled ? 0.55 : 1, borderLeftWidth: active ? 3 : 1 }}>
      {bulkMode && item.severity !== "critical" && (
        <input type="checkbox" checked={checked}
          onChange={(e) => { e.stopPropagation(); onCheck(e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 w-4 h-4 rounded" aria-label={`Select ${item.title}`} />
      )}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <SeverityPill severity={item.severity} />
        {item.amount !== undefined && <span className="text-xs font-medium tabular-nums">{fmtINR(item.amount)}</span>}
      </div>
      <div className="font-medium text-sm mb-0.5 leading-tight">{item.title} · {item.subtitle}</div>
      <div className="text-xs mb-1.5 truncate" style={{ color: T.muted }}>{item.detail}</div>
      <div className="flex items-center justify-between text-[11px]" style={{ color: T.muted }}>
        <span className="truncate">{item.source}</span>
        {item.ageHours !== undefined && (
          <span className="flex items-center gap-1 shrink-0"><Clock size={10} />{daysAgo(Math.floor(item.ageHours / 24))}</span>
        )}
      </div>
      {handled && (
        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
          style={{ background: T.goodSoft, color: T.good }}>done</div>
      )}
    </motion.div>
  );
});

function InboxSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-48 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl" style={{ background: "rgba(16,24,40,0.05)" }} />)}
        </div>
        <div className="h-96 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [18] INVOICE REVIEW
// ═══════════════════════════════════════════════════════════════════
type FieldKey = "number" | "date" | "vendor" | "gstin" | "amount" | "tax" | "total";
type FieldDef = { key: FieldKey; label: string; value: string; confidence: number; box: { x: number; y: number; w: number; h: number } };

function buildFields(inv: Entity): FieldDef[] {
  const d = inv.data ?? {};
  const base = d.confidence ?? 0.9;
  return [
    { key: "number", label: "Invoice #", value: inv.name ?? "—", confidence: base, box: { x: 62, y: 8, w: 32, h: 4 } },
    { key: "date", label: "Date", value: d.issued_date ?? "—", confidence: base - 0.02, box: { x: 62, y: 14, w: 32, h: 4 } },
    { key: "vendor", label: "Vendor", value: d.customer_name ?? "—", confidence: base - 0.01, box: { x: 6, y: 26, w: 60, h: 5 } },
    { key: "gstin", label: "GSTIN", value: d.gstin ?? "27AABCA1234F1Z5", confidence: base - 0.15, box: { x: 6, y: 35, w: 60, h: 4 } },
    { key: "amount", label: "Amount", value: fmtINR((d.total ?? 0) - (d.gst ?? 0)), confidence: base, box: { x: 58, y: 76, w: 36, h: 4 } },
    { key: "tax", label: "Tax (GST)", value: fmtINR(d.gst ?? 0), confidence: base - 0.08, box: { x: 58, y: 82, w: 36, h: 4 } },
    { key: "total", label: "Total", value: fmtINR(d.total ?? 0), confidence: base + 0.02, box: { x: 54, y: 89, w: 40, h: 6 } },
  ];
}

function InvoiceReview() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: allEntities, loading } = useEntities();

  const queue = useMemo(() => {
    const list = (allEntities ?? []).filter((e) => e.type === "invoice");
    if (!id) return list;
    const idx = list.findIndex((e) => e.id === id);
    if (idx <= 0) return list;
    return [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
  }, [allEntities, id]);

  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const [queueStatus, setQueueStatus] = useState<Record<string, "cleared" | "skipped" | "flagged">>({});
  const [filter, setFilter] = useState<"cleared" | "skipped" | "flagged" | "remaining" | null>(null);
  const [amountRange, setAmountRange] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editField, setEditField] = useState<FieldKey | null>(null);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [showOcr, setShowOcr] = useState(false);
  const [duplicateAck, setDuplicateAck] = useState(false);
  const [entityAccepted, setEntityAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    setEdits({}); setZoom(100); setRotation(0); setPage(1);
    setEditField(null); setActiveField(null); setDuplicateAck(false); setEntityAccepted(null);
  }, [currentId]);

  const current = useMemo(() => queue.find((q) => q.id === currentId) ?? queue[0], [queue, currentId]);
  const fields = useMemo(() => (current ? buildFields(current) : []), [current]);

  const filteredQueue = useMemo(() => queue.filter((q) => {
    const status = queueStatus[q.id];
    if (filter === "remaining") return !status;
    if (filter === "cleared") return status === "cleared";
    if (filter === "skipped") return status === "skipped";
    if (filter === "flagged") return status === "flagged";
    if (amountRange) { const amt = q.data?.total ?? 0; if (amt < amountRange[0] || amt >= amountRange[1]) return false; }
    return true;
  }), [queue, queueStatus, filter, amountRange]);

  const counts = useMemo(() => {
    let cleared = 0, skipped = 0, flagged = 0;
    for (const q of queue) {
      const s = queueStatus[q.id];
      if (s === "cleared") cleared++; else if (s === "skipped") skipped++; else if (s === "flagged") flagged++;
    }
    return { cleared, skipped, flagged, remaining: queue.length - cleared - skipped - flagged };
  }, [queue, queueStatus]);

  const allAmounts = useMemo(() => queue.map((q) => q.data?.total ?? 0).filter((n) => n > 0), [queue]);

  const goNext = useCallback(() => {
    if (filteredQueue.length === 0) return;
    const idx = filteredQueue.findIndex((q) => q.id === currentId);
    const next = filteredQueue[(idx + 1) % filteredQueue.length];
    setCurrentId(next.id);
  }, [filteredQueue, currentId]);

  const confirm = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "cleared" }));
    toast.success(`${current.name} confirmed · next`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  const skip = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "skipped" }));
    toast(`Skipped ${current.name}`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  const flag = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "flagged" }));
    toast.error(`${current.name} flagged for review`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  useHotkeys({
    Enter: (e) => { if (editField) return; e.preventDefault(); confirm(); },
    s: (e) => { if (!editField) { e.preventDefault(); skip(); } },
    S: (e) => { if (!editField) { e.preventDefault(); skip(); } },
    f: (e) => { if (!editField) { e.preventDefault(); flag(); } },
    F: (e) => { if (!editField) { e.preventDefault(); flag(); } },
    Escape: () => { if (editField) setEditField(null); else nav("/trust"); },
  }, true);

  if (loading || !current) return <InvoiceReviewSkeleton />;

  const isDuplicate = queue.some((q) => q.id !== current.id
    && q.data?.total === current.data?.total
    && q.data?.customer_name === current.data?.customer_name);
  const entitySuggestion = (allEntities ?? []).find((e) => e.type === "customer" && e.name === current.data?.customer_name);

  const lineItems = [
    { desc: "Steel brackets · 240 units", amt: 168000 },
    { desc: "Fasteners · 1200 units", amt: 122000 },
    { desc: "Surface coating service", amt: 65932 },
  ];

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => nav("/trust")}
            className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-white/60"
            style={{ borderColor: T.border, color: T.muted }} aria-label="Back">
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
              Invoice review · {current.name}
            </div>
            <h1 className="font-display text-2xl tracking-tight">{current.data?.customer_name}</h1>
          </div>
        </div>
        <button onClick={() => setShowOcr((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-white/60"
          style={{ borderColor: T.border, color: T.muted }}>
          <Layers size={12} />{showOcr ? "Hide" : "Show"} OCR trend
        </button>
      </div>

      <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: T.border, background: T.surface }}>
        <QueueProgress {...counts} activeFilter={filter}
          onSegment={(key) => setFilter((cur) => (cur === key ? null : key))} />
      </div>

      <AnimatePresence>
        {showOcr && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
              <OcrAccuracyTrend />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: T.border, background: T.surface }}>
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC]"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Zoom out">
                <ZoomOut size={12} />
              </button>
              <span className="text-xs font-mono tabular-nums w-10 text-center" style={{ color: T.muted }}>{zoom}%</span>
              <button onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC]"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Zoom in">
                <ZoomIn size={12} />
              </button>
              <button onClick={() => setRotation((r) => (r + 90) % 360)}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] ml-1"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Rotate">
                <RotateCw size={12} />
              </button>
            </div>
            <div className="text-xs flex items-center gap-2" style={{ color: T.muted }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="hover:opacity-70" aria-label="Previous page">‹</button>
              <span className="font-mono tabular-nums">{page} / 1</span>
              <button onClick={() => setPage((p) => Math.min(1, p + 1))} className="hover:opacity-60" aria-label="Next page">›</button>
            </div>
          </div>

          <div className="relative flex items-center justify-center p-6"
            style={{ minHeight: 560, background: "#EAE5D9" }}>
            <div className="relative bg-white shadow-lg transition-transform"
              style={{
                width: "78%", aspectRatio: "0.76",
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
              }}>
              <div className="absolute left-[6%] top-[6%] w-[38%] h-[2.5%] rounded"
                style={{ background: "#EAE5D9" }} />
              <div className="absolute right-[6%] top-[6%] text-[8px] font-mono" style={{ color: T.muted }}>
                {current.name}
              </div>

              <div className="absolute left-[6%] right-[6%] top-[52%] space-y-2">
                {lineItems.map((row, i) => (
                  <div key={i} className="flex justify-between text-[9px] pb-1.5 border-b border-dashed"
                    style={{ borderColor: "rgba(16,24,40,0.12)" }}>
                    <span style={{ color: T.muted }}>{row.desc}</span>
                    <span className="tabular-nums" style={{ color: T.ink }}>{fmtINR(row.amt)}</span>
                  </div>
                ))}
              </div>

              {fields.map((f) => {
                const isActive = activeField === f.key;
                const low = f.confidence < 0.75;
                return (
                  <button key={f.key}
                    onClick={() => { setActiveField(f.key); setEditField(f.key); }}
                    className="absolute transition-all group"
                    style={{
                      left: `${f.box.x}%`, top: `${f.box.y}%`,
                      width: `${f.box.w}%`, height: `${f.box.h}%`,
                      border: `1.5px ${isActive ? "solid" : "dashed"} ${isActive ? T.primary : low ? T.critical : "rgba(23,112,106,0.55)"}`,
                      background: isActive ? "rgba(23,112,106,0.10)" : "transparent",
                      borderRadius: 3,
                    }}
                    aria-label={`Jump to ${f.label}`}>
                    <span className="absolute -top-2 left-1 text-[8px] px-1 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition"
                      style={{ background: T.ink, color: "#fff" }}>{f.label}</span>
                  </button>
                );
              })}

              <div className="absolute left-[6%] top-[26%] text-[10px] font-medium" style={{ color: T.ink }}>
                {current.data?.customer_name}
              </div>
              <div className="absolute left-[6%] top-[35%] text-[9px] font-mono" style={{ color: T.muted }}>
                {current.data?.gstin ?? "27AABCA1234F1Z5"}
              </div>
              <div className="absolute right-[6%] top-[76%] text-[10px] tabular-nums" style={{ color: T.ink }}>
                {fmtINR((current.data?.total ?? 0) - (current.data?.gst ?? 0))}
              </div>
              <div className="absolute right-[6%] top-[82%] text-[10px] tabular-nums" style={{ color: T.ink }}>
                {fmtINR(current.data?.gst ?? 0)}
              </div>
              <div className="absolute right-[6%] top-[89%] text-[12px] font-bold tabular-nums" style={{ color: T.ink }}>
                {fmtINR(current.data?.total ?? 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 space-y-4"
          style={{ borderColor: T.border, background: T.surface }}>
          <AnimatePresence>
            {isDuplicate && !duplicateAck && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="rounded-lg p-3 flex items-start gap-2" style={{ background: T.watchSoft }}>
                <AlertTriangle size={16} color={T.watch} />
                <div className="flex-1 text-xs" style={{ color: T.watch }}>
                  <b>Possible duplicate.</b> Another invoice with the same total and customer exists.
                </div>
                <button onClick={() => setDuplicateAck(true)}
                  className="text-[10px] px-2 py-0.5 rounded border font-medium whitespace-nowrap"
                  style={{ borderColor: T.watch, color: T.watch }}>Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          {entitySuggestion && entityAccepted === null && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-3 flex items-center gap-2" style={{ background: T.primarySoft }}>
              <Users size={14} color={T.primary} />
              <div className="flex-1 text-xs" style={{ color: T.primary }}>
                Match found: <b>{entitySuggestion.name}</b>
              </div>
              <button onClick={() => { setEntityAccepted(true); toast.success("Linked to customer"); }}
                className="text-[10px] px-2 py-0.5 rounded font-medium text-white"
                style={{ background: T.primary }}>Accept</button>
              <button onClick={() => { setEntityAccepted(false); toast("Ignored"); }}
                className="text-[10px] px-2 py-0.5 rounded border font-medium"
                style={{ borderColor: T.border, color: T.muted }}>Reject</button>
            </motion.div>
          )}
          {entityAccepted === true && (
            <div className="text-[10px] flex items-center gap-1.5" style={{ color: T.good }}>
              <Check size={12} /> Linked to <b>{entitySuggestion?.name}</b>
            </div>
          )}

          <div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="font-display text-base">Extracted fields</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                  {fields.length} fields ·{" "}
                  {fields.filter((f) => f.confidence >= 0.9).length} high confidence
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {fields.map((f) => {
                const editing = editField === f.key;
                const value = edits[f.key] ?? f.value;
                const low = f.confidence < 0.75;
                return (
                  <div key={f.key} onClick={() => setActiveField(f.key)}
                    className="rounded-lg border p-2.5 transition cursor-pointer"
                    style={{
                      borderColor: activeField === f.key ? T.primary : T.border,
                      background: activeField === f.key ? T.primarySoft : T.surface,
                    }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: T.muted }}>{f.label}</span>
                        <FieldConfidence value={f.confidence} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setEditField(editing ? null : f.key); }}
                        className="text-[10px] flex items-center gap-1" style={{ color: T.primary }}>
                        <Edit3 size={10} /> {editing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {editing ? (
                      <input autoFocus value={value}
                        onChange={(e) => setEdits((s) => ({ ...s, [f.key]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); setEditField(null); toast.success("Saved"); }
                        }}
                        className="w-full px-2 py-1 rounded border outline-none text-sm"
                        style={{ borderColor: T.primary, background: T.surface }} />
                    ) : (
                      <div className="text-sm tabular-nums" style={{ color: low ? T.critical : T.ink }}>{value}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Amount distribution</div>
              {amountRange && (
                <button onClick={() => setAmountRange(null)}
                  className="text-[10px] flex items-center gap-1" style={{ color: T.primary }}>
                  <X size={10} /> clear
                </button>
              )}
            </div>
            <AmountHistogram values={allAmounts} active={amountRange}
              onBrush={(r) => {
                setAmountRange(r);
                if (r) toast.success(`Filtered queue to ${fmtShort(r[0])}–${r[1] === Infinity ? "∞" : fmtShort(r[1])}`);
              }} />
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: T.border }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirm}
              className="flex-1 min-w-[140px] py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5"
              style={{ background: T.primary }}><Check size={14} /> Confirm & next</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={skip}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
              style={{ borderColor: T.border, color: T.muted }}>Skip</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={flag}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#FEF4E6]"
              style={{ borderColor: T.border, color: T.watch }}><Flag size={14} /> Flag</motion.button>
          </div>

          {filteredQueue.length === 0 && (
            <div className="pt-3 border-t text-center" style={{ borderColor: T.border }}>
              <div className="font-display text-base mb-1">Queue clear.</div>
              <div className="text-xs" style={{ color: T.muted }}>{counts.cleared} of {queue.length} done.</div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 hidden sm:block pointer-events-none">
        <div className="px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] glass-3"
          style={{ color: T.muted }}>
          <Kbd>Enter</Kbd> confirm
          <span className="opacity-30">·</span>
          <Kbd>S</Kbd> skip
          <span className="opacity-30">·</span>
          <Kbd>F</Kbd> flag
          <span className="opacity-30">·</span>
          <Kbd>Esc</Kbd> back
        </div>
      </div>
    </div>
  );
}

function InvoiceReviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="h-12 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="h-[560px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-[560px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [19] ACTION LEDGER
// ═══════════════════════════════════════════════════════════════════
type LedgerRow = {
  id: string;
  type: "approve" | "edit" | "reject";
  source: "agent" | "user";
  rule: string;
  approver: string;
  result: "approved" | "rejected" | "pending";
  verified: boolean;
  hash: string;
  anchorTime: number;
  reference: string;
  timestamp: number;
  entityId?: string;
};

function hashFor(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  const hex = h.toString(16).padStart(8, "0");
  return (hex + hex.split("").reverse().join("") + hex + hex.split("").reverse().join("")).slice(0, 64);
}

function buildLedgerRows(entities: Entity[]): LedgerRow[] {
  const list = entities ?? [];
  const approvers = ["Rajesh (Owner)", "Meera Iyer", "Ravi Kumar", "Auto"];
  const rows: LedgerRow[] = [];

  list.filter((e) => e.type === "invoice" && e.data?.status === "overdue").slice(0, 6).forEach((inv, i) => {
    const ts = Date.now() - (i + 1) * 3 * 3600_000;
    rows.push({
      id: `inv-${inv.id}`,
      type: "approve",
      source: "agent",
      rule: "Overdue > 30 days + top-5 customer → manager approval",
      approver: approvers[i % approvers.length],
      result: i === 0 ? "approved" : i === 1 ? "pending" : "approved",
      verified: i !== 1,
      hash: hashFor(`inv-${inv.id}-${i}`),
      anchorTime: ts + 400,
      reference: `Invoice ${inv.name} · ${inv.data?.customer_name ?? "—"}`,
      timestamp: ts,
      entityId: inv.id,
    });
  });

  list.filter((e) => e.type === "task").slice(0, 4).forEach((t, i) => {
    const ts = Date.now() - (i + 1) * 5 * 3600_000;
    rows.push({
      id: `task-${t.id}`,
      type: "edit",
      source: "user",
      rule: "Manual reassignment / priority change",
      approver: approvers[(i + 1) % approvers.length],
      result: "approved",
      verified: true,
      hash: hashFor(`task-${t.id}-${i}`),
      anchorTime: ts + 300,
      reference: `Task: ${t.name ?? "—"}`,
      timestamp: ts,
      entityId: t.id,
    });
  });

  const ts0 = Date.now() - 30 * 3600_000;
  rows.push({
    id: "rejected-1", type: "reject", source: "agent",
    rule: "Duplicate invoice detected → auto-reject", approver: "Auto",
    result: "rejected", verified: true, hash: hashFor("rejected-1"),
    anchorTime: ts0 + 200, reference: "Duplicate invoice INV-107", timestamp: ts0,
  });

  const tsF = Date.now() - 48 * 3600_000;
  rows.push({
    id: "failed-1", type: "approve", source: "agent",
    rule: "Reminder sent to vendor", approver: "Ravi Kumar",
    result: "approved", verified: false, hash: hashFor("failed-1"),
    anchorTime: tsF + 300, reference: "Reminder: Zenith Technologies", timestamp: tsF,
  });

  return rows.sort((a, b) => b.timestamp - a.timestamp);
}

function Ledger() {
  const nav = useNavigate();
  const { data: entities, loading } = useEntities();
  const [proofOpen, setProofOpen] = useState<LedgerRow | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"approve" | "edit" | "reject" | null>(null);
  const [resultFilter, setResultFilter] = useState<"approved" | "rejected" | "pending" | null>(null);
  const [approverFilter, setApproverFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "7d" | "30d" | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const rows = useMemo(() => buildLedgerRows(entities ?? []), [entities]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (resultFilter && r.result !== resultFilter) return false;
      if (approverFilter && r.approver !== approverFilter) return false;
      if (dateFilter !== "all") {
        const days = (now - r.timestamp) / (24 * 3600_000);
        if (dateFilter === "today" && days > 1) return false;
        if (dateFilter === "7d" && days > 7) return false;
        if (dateFilter === "30d" && days > 30) return false;
      }
      return true;
    });
  }, [rows, typeFilter, resultFilter, approverFilter, dateFilter]);

  const counts = useMemo(() => {
    const v = rows.filter((r) => r.verified).length;
    const p = rows.filter((r) => !r.verified && r.result !== "rejected").length;
    const f = rows.filter((r) => !r.verified && r.result === "rejected").length;
    const app = rows.filter((r) => r.type === "approve").length;
    const ed = rows.filter((r) => r.type === "edit").length;
    const rej = rows.filter((r) => r.type === "reject").length;
    return { verified: v, pending: p, failed: f, approve: app, edit: ed, reject: rej };
  }, [rows]);

  const approvers = useMemo(() => Array.from(new Set(rows.map((r) => r.approver))), [rows]);
  const activeFilters = [typeFilter, resultFilter, approverFilter, dateFilter !== "all" ? dateFilter : null].filter(Boolean).length;

  useEffect(() => { setVerified(false); setVerifying(false); }, [proofOpen]);

  const doVerify = () => {
    if (verifying || verified) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); toast.success("Hash verified · matches"); }, 900);
  };

  const copyHash = (h: string) => {
    navigator.clipboard?.writeText(`https://bizos.in/verify/${h}`);
    toast.success("Share link copied");
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-56 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="h-40 rounded-2xl md:col-span-2" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-40 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
      <div className="h-96 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
    </div>
  );

  return (
    <div className="pb-16">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Action Ledger</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            Every autonomous action, logged and verifiable.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("CSV export queued")}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            <Download size={12} /> Export CSV
          </button>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <AnchorFrequencyBar onBarClick={(d) => toast.success(`Filter: ${d}d ago`)} />
        </div>
        <VerificationStatusDonut verified={counts.verified} pending={counts.pending} failed={counts.failed} />
      </div>

      <div className="mb-4">
        <ActionTypeMixBar
          approve={counts.approve}
          edit={counts.edit}
          reject={counts.reject}
          active={typeFilter}
          onSegment={(k) => setTypeFilter((cur) => (cur === k ? null : k))}
        />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setShowFilters((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
          style={{ borderColor: T.border, color: T.muted }}
          aria-expanded={showFilters}>
          <Filter size={12} /> Filters {activeFilters > 0 && `· ${activeFilters}`}
        </button>
        {typeFilter && (
          <button onClick={() => setTypeFilter(null)}
            className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: T.primarySoft, color: T.primary }}>
            Type · {typeFilter} <X size={10} />
          </button>
        )}
        {resultFilter && (
          <button onClick={() => setResultFilter(null)}
            className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: T.primarySoft, color: T.primary }}>
            Result · {resultFilter} <X size={10} />
          </button>
        )}
        {approverFilter && (
          <button onClick={() => setApproverFilter(null)}
            className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: T.primarySoft, color: T.primary }}>
            Approver · {approverFilter} <X size={10} />
          </button>
        )}
        {dateFilter !== "all" && (
          <button onClick={() => setDateFilter("all")}
            className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: T.primarySoft, color: T.primary }}>
            Date · {dateFilter} <X size={10} />
          </button>
        )}
        <span className="ml-auto text-xs tabular-nums" style={{ color: T.muted }}>
          {filtered.length} of {rows.length}
        </span>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-2xl border p-4 overflow-hidden"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Result</div>
                <div className="flex flex-wrap gap-1.5">
                  {(["approved", "rejected", "pending"] as const).map((r) => (
                    <button key={r}
                      onClick={() => setResultFilter((cur) => (cur === r ? null : r))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{
                        borderColor: resultFilter === r ? T.primary : T.border,
                        background: resultFilter === r ? T.primarySoft : T.surface,
                        color: resultFilter === r ? T.primary : T.muted,
                      }}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Approver</div>
                <div className="flex flex-wrap gap-1.5">
                  {approvers.map((a) => (
                    <button key={a}
                      onClick={() => setApproverFilter((cur) => (cur === a ? null : a))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{
                        borderColor: approverFilter === a ? T.primary : T.border,
                        background: approverFilter === a ? T.primarySoft : T.surface,
                        color: approverFilter === a ? T.primary : T.muted,
                      }}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Date</div>
                <div className="flex flex-wrap gap-1.5">
                  {(["today", "7d", "30d", "all"] as const).map((d) => (
                    <button key={d}
                      onClick={() => setDateFilter(d)}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{
                        borderColor: dateFilter === d ? T.primary : T.border,
                        background: dateFilter === d ? T.primarySoft : T.surface,
                        color: dateFilter === d ? T.primary : T.muted,
                      }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} />}
          title="No actions yet."
          body="When agents act, they appear here — with proof."
          action={{ label: "Clear filters", onClick: () => {
            setTypeFilter(null); setResultFilter(null); setApproverFilter(null); setDateFilter("all");
          } }} />
      ) : (
        <div className="rounded-2xl border overflow-hidden overflow-x-auto"
          style={{ borderColor: T.border, background: T.surface }}>
          <table className="w-full text-sm">
            <thead style={{ background: "#F6F3EC" }}>
              <tr className="text-left text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Source</th>
                <th className="px-4 py-3 font-medium">Rule</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Approver</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const typeColour = r.type === "approve" ? T.good : r.type === "edit" ? T.primary : T.critical;
                const resultColour = r.result === "approved" ? T.good : r.result === "rejected" ? T.critical : T.watch;
                return (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    onClick={() => setProofOpen(r)}
                    className="border-t hover:bg-[#F6F3EC]/50 transition cursor-pointer"
                    style={{ borderColor: T.border }}>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                        style={{ background: `${typeColour}1A`, color: typeColour }}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: T.muted }}>
                      <span className="flex items-center gap-1.5">
                        {r.source === "agent" ? <Zap size={10} /> : <Users size={10} />}
                        {r.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs truncate max-w-[260px]">{r.rule}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: T.muted }}>{r.approver}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                        style={{ background: `${resultColour}1A`, color: resultColour }}>
                        {r.result}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.verified ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1 w-fit"
                          style={{ background: T.goodSoft, color: T.good }}>
                          <ShieldCheck size={10} /> verified
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1 w-fit"
                          style={{ background: "#F1F3F2", color: T.muted }}>
                          <ShieldCheck size={10} /> pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs font-mono" style={{ color: T.muted }}>
                      {new Date(r.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {proofOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setProofOpen(null)} />
// ═══════════════════════════════════════════════════════════════════
// [19] ACTION LEDGER (continued from proof drawer cut-off)
// ═══════════════════════════════════════════════════════════════════
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto glass-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
              role="dialog" aria-label="Proof drawer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs uppercase tracking-widest flex items-center gap-2"
                    style={{ color: T.muted }}>
                    <ShieldCheck size={14} /> Proof of action · 7 sections
                  </div>
                  <button onClick={() => setProofOpen(null)} className="hover:opacity-60"
                    aria-label="Close">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                    style={{
                      background: proofOpen.type === "approve" ? T.goodSoft
                        : proofOpen.type === "edit" ? T.primarySoft : T.criticalSoft,
                      color: proofOpen.type === "approve" ? T.good
                        : proofOpen.type === "edit" ? T.primary : T.critical,
                    }}>{proofOpen.type}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                    style={{
                      background: proofOpen.result === "approved" ? T.goodSoft
                        : proofOpen.result === "rejected" ? T.criticalSoft : T.watchSoft,
                      color: proofOpen.result === "approved" ? T.good
                        : proofOpen.result === "rejected" ? T.critical : T.watch,
                    }}>{proofOpen.result}</span>
                  {proofOpen.verified && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1"
                      style={{ background: T.goodSoft, color: T.good }}>
                      <Check size={9} strokeWidth={3} /> anchored
                    </span>
                  )}
                </div>

                <div className="font-display text-lg mb-1">{proofOpen.reference}</div>
                <div className="text-xs mb-6 font-mono" style={{ color: T.muted }}>
                  {new Date(proofOpen.timestamp).toLocaleString("en-IN")}
                </div>

                <div className="space-y-4">
                  <EvidenceField label="1. Input" value={`Source: ${proofOpen.source === "agent" ? "Autonomous agent" : "User action"}\nEntity: ${proofOpen.reference}`} />
                  <EvidenceField label="2. Rule applied" value={proofOpen.rule} />
                  <EvidenceField label="3. Policy check" value={`Policy P-001 · pass\nPer-action limit: ₹5,00,000\nAutonomy level: 1 (act below limit)`} />
                  <EvidenceField label="4. Artifact" value={`Hash: ${proofOpen.hash.slice(0, 32)}…\nAnchor time: +${proofOpen.anchorTime - proofOpen.timestamp}ms\nChain: bizos-mainnet-1`} mono />
                  <EvidenceField label="5. Approver" value={`${proofOpen.approver}\nRole: ${proofOpen.approver.includes("Owner") ? "Owner" : proofOpen.approver === "Auto" ? "Automated" : "Manager"}`} />
                  <EvidenceField label="6. Result" value={proofOpen.result === "approved"
                    ? "Action committed. Downstream effect dispatched."
                    : proofOpen.result === "rejected"
                    ? "Action blocked. Nothing dispatched."
                    : "Awaiting decision."} />
                  <EvidenceField label="7. Proof" value={`${proofOpen.hash}\nhttps://bizos.in/verify/${proofOpen.hash}`} mono />
                </div>

                <div className="mt-6 pt-6 border-t" style={{ borderColor: T.border }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={doVerify}
                    disabled={verifying || verified}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition mb-2"
                    style={{
                      background: verified ? T.goodSoft : T.primary,
                      color: verified ? T.good : "#fff",
                      cursor: verified ? "default" : "pointer",
                    }}>
                    {verifying ? <Loader2 size={14} className="animate-spin" />
                      : verified ? <Check size={14} strokeWidth={3} />
                        : <ShieldCheck size={14} />}
                    {verifying ? "Recomputing hash…" : verified ? "Verified · matches" : "Verify this action"}
                  </motion.button>
                  <button onClick={() => copyHash(proofOpen.hash)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 hover:bg-[#F6F3EC] transition"
                    style={{ borderColor: T.border, color: T.ink }}>
                    <Copy size={13} /> Copy share link
                  </button>
                  {proofOpen.entityId && (
                    <button
                      onClick={() => { setProofOpen(null); nav(`/money/invoices/${proofOpen.entityId}/review`); }}
                      className="w-full py-2.5 mt-2 text-xs flex items-center justify-center gap-1.5"
                      style={{ color: T.primary }}>
                      Open source record <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [20] TRUST
// ═══════════════════════════════════════════════════════════════════
function Trust() {
  const nav = useNavigate();
  const { data: entities } = useEntities();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1400);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => buildLedgerRows(entities ?? []).slice(0, 8), [entities]);
  const counts = useMemo(() => {
    const v = rows.filter((r) => r.verified).length;
    const p = rows.filter((r) => !r.verified).length;
    return { v, p, total: rows.length };
  }, [rows]);

  const pillars = [
    { Icon: FileText, label: "Source", desc: "Every input traceable to origin", tint: "rgba(23,112,106,0.12)" },
    { Icon: Scale, label: "Rule", desc: "Policy applied to every decision", tint: "rgba(242,163,58,0.18)" },
    { Icon: Users, label: "Approver", desc: "Human or agent sign-off recorded", tint: "rgba(23,112,106,0.12)" },
    { Icon: ShieldCheck, label: "Proof", desc: "Cryptographic hash, publicly verifiable", tint: "rgba(30,122,79,0.14)" },
  ];

  return (
    <div className="space-y-8 pb-16">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>
              Trust layer
            </div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
              Proof, not promises.
            </h1>
            <p className="text-sm max-w-2xl" style={{ color: T.muted }}>
              Every autonomous action BizOS takes — a reminder, an approval, a filing — is written to a
              verifiable ledger. Anyone you share the link with can check it. No one can tamper.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
            style={{ borderColor: T.border, background: T.surface }}>
            <motion.span
              animate={pulse ? { scale: [1, 1.6, 1] } : {}}
              transition={{ duration: 1.4 }}
              className="w-2 h-2 rounded-full"
              style={{ background: T.good }} />
            <span style={{ color: T.muted }}>Ledger healthy</span>
            <span className="font-mono tabular-nums" style={{ color: T.ink }}>
              {counts.v}/{counts.total}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pillars.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border p-4"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: p.tint }}>
              <p.Icon size={17} style={{ color: T.primary }} strokeWidth={2.2} />
            </div>
            <div className="font-medium text-sm mb-1">{p.label}</div>
            <div className="text-xs leading-snug" style={{ color: T.muted }}>{p.desc}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <AnchorFrequencyBar onBarClick={() => toast.success("Opening day's actions…")} />
        </div>
        <VerificationStatusDonut
          verified={counts.v}
          pending={counts.p}
          failed={rows.filter((r) => r.result === "rejected").length}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="font-display text-lg">Recent proven actions</div>
            <div className="text-xs" style={{ color: T.muted }}>
              Each row is anchored and independently verifiable
            </div>
          </div>
          <button onClick={() => nav("/ledger")}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC] transition"
            style={{ borderColor: T.border, color: T.primary }}>
            Open full ledger <ArrowRight size={12} />
          </button>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border, background: T.surface }}>
          {rows.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => nav("/ledger")}
              whileHover={{ background: "#F6F3EC" }}
              className="px-4 py-3 flex items-center gap-3 border-t cursor-pointer transition first:border-t-0"
              style={{ borderColor: T.border }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: r.verified ? T.goodSoft : "#F1F3F2" }}>
                <ShieldCheck size={14} style={{ color: r.verified ? T.good : T.muted }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.reference}</div>
                <div className="text-[10px] truncate" style={{ color: T.muted }}>
                  {r.rule}
                </div>
              </div>
              <div className="hidden md:block text-[10px] font-mono whitespace-nowrap" style={{ color: T.muted }}>
                {r.hash.slice(0, 10)}…
              </div>
              <div className="text-[10px] whitespace-nowrap" style={{ color: T.muted }}>
                {relTime(r.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="rounded-[28px] p-6 md:p-8 relative overflow-hidden text-white"
        style={{ background: "linear-gradient(160deg, #17706A 0%, #0B4F4A 100%)" }}>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(242,163,58,0.22)", filter: "blur(70px)" }} />
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-3 opacity-70">Verification</div>
            <h2 className="font-display text-2xl md:text-3xl mb-3">Anyone can check. No login needed.</h2>
            <p className="text-sm opacity-80 mb-5 max-w-md">
              Share a proof link with your CA, an auditor, or a customer. It shows the source,
              the rule, the approver, and the cryptographic hash — end to end.
            </p>
            <button
              onClick={() => {
                const hash = rows[0]?.hash ?? "0".repeat(64);
                navigator.clipboard?.writeText(`https://bizos.in/verify/${hash}`);
                toast.success("Sample proof link copied");
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: T.accent, color: T.ink }}>
              <Copy size={13} /> Copy sample proof link
            </button>
          </div>
          <div className="rounded-2xl p-4 font-mono text-[10px] leading-relaxed"
            style={{ background: "rgba(0,0,0,0.28)" }}>
            <div className="opacity-60 mb-2">$ curl bizos.in/verify/{(rows[0]?.hash ?? "…").slice(0, 12)}…</div>
            <div style={{ color: T.accent }}>{"{"}</div>
            <div className="pl-3">"reference": "{rows[0]?.reference ?? "—"}",</div>
            <div className="pl-3">"rule": "{rows[0]?.rule?.slice(0, 40) ?? "—"}…",</div>
            <div className="pl-3">"approver": "{rows[0]?.approver ?? "—"}",</div>
            <div className="pl-3">"verified": <span style={{ color: "#8be0c3" }}>true</span>,</div>
            <div className="pl-3">"anchored_at": "{rows[0] ? new Date(rows[0].anchorTime).toISOString() : ""}"</div>
            <div style={{ color: T.accent }}>{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [21] IMPACT
// ═══════════════════════════════════════════════════════════════════
function Impact() {
  const { data: entities } = useEntities();
  const esg = (entities ?? []).find((e) => e.type === "esg_metric");
  const coverage = esg?.data?.value ?? 68;

  const metrics = [
    { label: "Environment", value: 74, target: 85, colour: T.primary,
      sub: "Paper saved · 3,240 pages · FY26" },
    { label: "Social", value: 81, target: 85, colour: T.good,
      sub: "On-time vendor payments · 92%" },
    { label: "Governance", value: coverage, target: 90, colour: coverage >= 75 ? T.good : T.watch,
      sub: "Policy coverage · DPDP consent logged" },
  ];

  const programmes = [
    { Icon: Leaf, label: "Paperless invoices", sub: "1,214 invoices · 0 printed", tone: T.good },
    { Icon: Truck, label: "Local-first logistics", sub: "78% of shipments under 200km", tone: T.primary },
    { Icon: Users, label: "Supplier fairness", sub: "Median payment 14 days", tone: T.good },
    { Icon: Landmark, label: "Compliance velocity", sub: "GSTR filed 2 days early · 6mo streak", tone: T.primary },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>ESG · Impact</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Impact, tracked honestly.</h1>
        <p className="text-sm max-w-2xl" style={{ color: T.muted }}>
          What BizOS automated, and what it saved — on paper, on time, on fair dealing.
          Not marketing, just what the ledger shows.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5 flex items-center gap-4"
            style={{ borderColor: T.border, background: T.surface }}>
            <EsgGauge value={m.value} colour={m.colour} size={92} />
            <div className="min-w-0">
              <div className="font-medium">{m.label}</div>
              <div className="text-xs mt-1 leading-snug" style={{ color: T.muted }}>{m.sub}</div>
              <div className="text-[10px] mt-2 flex items-center gap-1" style={{ color: m.colour }}>
                <Target size={10} /> target {m.target}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
          <div className="font-display text-base mb-1">Programmes in motion</div>
          <div className="text-xs mb-4" style={{ color: T.muted }}>Every one is auditable</div>
          <div className="space-y-3">
            {programmes.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${p.tone}1A` }}>
                  <p.Icon size={15} style={{ color: p.tone }} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{p.sub}</div>
                </div>
                <ChevronRight size={14} style={{ color: T.muted }} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
          <div className="font-display text-base mb-1">Coverage over time</div>
          <div className="text-xs mb-4" style={{ color: T.muted }}>
            Governance coverage · last 12 weeks
          </div>
          <Sparkline
            data={[42, 46, 50, 54, 58, 62, 64, 68, 70, 72, 76, coverage]}
            colour={T.primary} width={420} height={80} fill />
          <div className="flex justify-between text-[10px] mt-2" style={{ color: T.muted }}>
            <span>12w ago</span><span>6w ago</span><span>now</span>
          </div>
          <div className="mt-5 pt-5 border-t flex items-center gap-3" style={{ borderColor: T.border }}>
            <Award size={16} style={{ color: T.accent }} />
            <div className="text-xs" style={{ color: T.muted }}>
              You're tracking above the MSME median for governance coverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [22] CUSTOMERS
// ═══════════════════════════════════════════════════════════════════
function Customers() {
  const { data: entities, loading } = useEntities();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const customers = useMemo(
    () => (entities ?? []).filter((e) => e.type === "customer"),
    [entities]
  );
  const vendors = useMemo(
    () => (entities ?? []).filter((e) => e.type === "vendor"),
    [entities]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((c) =>
      (c.name ?? "").toLowerCase().includes(needle) ||
      (c.data?.city ?? "").toLowerCase().includes(needle)
    );
  }, [customers, q]);

  const current = useMemo(
    () => filtered.find((c) => c.id === selected) ?? filtered[0] ?? null,
    [filtered, selected]
  );

  if (loading) return <div className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(16,24,40,0.05)" }} />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Customers</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            {customers.length} active · {vendors.length} vendors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: T.border, background: T.surface }}>
            <Search size={13} style={{ color: T.muted }} />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search customers…"
              className="bg-transparent outline-none text-sm w-40 md:w-56"
              style={{ color: T.ink }} />
          </div>
          <button onClick={() => toast.success("Add customer flow opened")}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
            style={{ background: T.primary }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[340px_minmax(0,1fr)] gap-4">
        <div className="space-y-2 md:max-h-[calc(100vh-260px)] md:overflow-y-auto md:pr-1">
          {filtered.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setSelected(c.id)}
              whileHover={{ x: 2 }}
              className="w-full text-left rounded-xl border p-4 transition"
              style={{
                borderColor: current?.id === c.id ? T.primary : T.border,
                background: current?.id === c.id ? T.primarySoft : T.surface,
                borderLeftWidth: current?.id === c.id ? 3 : 1,
              }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-medium text-sm leading-tight truncate">{c.name}</div>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{ background: T.primarySoft, color: T.primary }}>
                  {c.data?.tier ?? "standard"}
                </span>
              </div>
              <div className="text-xs truncate" style={{ color: T.muted }}>
                {c.data?.city ?? "—"} · LTV {fmtShort(c.data?.lifetime_value ?? 0)}
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <EmptyState title="No customers match" body="Try a different search." />
          )}
        </div>

        {current && (
          <motion.div key={current.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>
                  Customer
                </div>
                <h2 className="font-display text-2xl leading-tight">{current.name}</h2>
                <div className="text-xs mt-1 flex items-center gap-3 flex-wrap" style={{ color: T.muted }}>
                  <span className="flex items-center gap-1"><Building2 size={11} /> {current.data?.city ?? "—"}</span>
                  {current.data?.phone && <span className="flex items-center gap-1"><MessageCircle size={11} /> {current.data.phone}</span>}
                  {current.data?.email && <span className="flex items-center gap-1"><FileText size={11} /> {current.data.email}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success(`Opening WhatsApp draft to ${current.name}`)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
                  style={{ background: T.primary }}>
                  <MessageCircle size={12} /> Message
                </button>
                <button onClick={() => nav("/tasks")}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                  style={{ borderColor: T.border }}>
                  <ListChecks size={12} /> Add task
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Lifetime value", v: fmtShort(current.data?.lifetime_value ?? 0), tone: T.primary },
                { label: "Open invoices", v: "2", tone: T.watch },
                { label: "Avg pay time", v: "12d", tone: T.good },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: "#F6F3EC" }}>
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>{s.label}</div>
                  <div className="text-lg font-bold tabular-nums" style={{ color: s.tone }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>
                Payment trend · last 12 months
              </div>
              <Sparkline data={[3, 4, 3, 5, 6, 7, 6, 8, 9, 8, 10, 12]}
                colour={T.primary} width={560} height={70} fill />
            </div>

            <div className="pt-5 border-t" style={{ borderColor: T.border }}>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
                Recent activity
              </div>
              <div className="space-y-3">
                {[
                  { t: "Payment received · ₹2.85L", w: "2 days ago", tone: T.good },
                  { t: "Reminder sent · WhatsApp", w: "5 days ago", tone: T.watch },
                  { t: "Invoice INV-104 issued", w: "34 days ago", tone: T.primary },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.tone }} />
                    <div className="flex-1 text-sm">{a.t}</div>
                    <div className="text-[10px]" style={{ color: T.muted }}>{a.w}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [23] TASKS — Kanban + list
// ═══════════════════════════════════════════════════════════════════
type TaskStatus = "open" | "in_progress" | "done";
const TASK_COLS: { key: TaskStatus; label: string; colour: string }[] = [
  { key: "open", label: "Open", colour: T.watch },
  { key: "in_progress", label: "In progress", colour: T.primary },
  { key: "done", label: "Done", colour: T.good },
];

function Tasks() {
  const { data: entities, loading } = useEntities();
  const [view, setView] = useState<"board" | "list">("board");
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);

  const tasks = useMemo(
    () => (entities ?? []).filter((e) => e.type === "task"),
    [entities]
  );

  const owners = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.data?.owner).filter(Boolean))) as string[],
    [tasks]
  );

  const filtered = useMemo(
    () => (ownerFilter ? tasks.filter((t) => t.data?.owner === ownerFilter) : tasks),
    [tasks, ownerFilter]
  );

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Entity[]> = { open: [], in_progress: [], done: [] };
    filtered.forEach((t) => {
      const s = (t.data?.status as TaskStatus) ?? "open";
      (g[s] ?? g.open).push(t);
    });
    return g;
  }, [filtered]);

  if (loading) return <div className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(16,24,40,0.05)" }} />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Work</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            {filtered.filter((t) => t.data?.status !== "done").length} open ·{" "}
            {filtered.filter((t) => t.data?.status === "done").length} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: T.border }}>
            {(["board", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="text-xs px-3 py-1.5 font-medium capitalize transition"
                style={{
                  background: view === v ? T.primary : "transparent",
                  color: view === v ? "#fff" : T.muted,
                }}>{v}</button>
            ))}
          </div>
          <button onClick={() => toast.success("Add task flow opened")}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
            style={{ background: T.primary }}>
            <Plus size={12} /> Add task
          </button>
        </div>
      </div>

      {owners.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Owner</span>
          {owners.map((o) => (
            <button key={o} onClick={() => setOwnerFilter((cur) => (cur === o ? null : o))}
              className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
              style={{
                borderColor: ownerFilter === o ? T.primary : T.border,
                background: ownerFilter === o ? T.primarySoft : T.surface,
                color: ownerFilter === o ? T.primary : T.muted,
              }}>{o}</button>
          ))}
          {ownerFilter && (
            <button onClick={() => setOwnerFilter(null)}
              className="text-[11px] flex items-center gap-1" style={{ color: T.primary }}>
              <X size={10} /> clear
            </button>
          )}
        </div>
      )}

      {view === "board" ? (
        <div className="grid md:grid-cols-3 gap-4">
          {TASK_COLS.map((col) => (
            <div key={col.key} className="rounded-2xl border p-4 min-h-[400px]"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.colour }} />
                  <span className="text-sm font-medium">{col.label}</span>
                </div>
                <span className="text-xs tabular-nums px-2 py-0.5 rounded-full"
                  style={{ background: "#F6F3EC", color: T.muted }}>
                  {grouped[col.key].length}
                </span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].map((t, i) => (
                  <TaskCard key={t.id} task={t} index={i} />
                ))}
                {grouped[col.key].length === 0 && (
                  <div className="text-xs text-center py-8" style={{ color: T.muted }}>
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: T.border, background: T.surface }}>
          {filtered.length === 0 ? (
            <EmptyState title="No tasks" body="Add your first task to get started." />
          ) : filtered.map((t, i) => {
            const done = t.data?.status === "done";
            const sev = t.data?.priority === "high" ? "critical" : t.data?.priority === "medium" ? "watch" : "good";
            return (
              <div key={t.id}
                className="flex items-center gap-3 px-4 py-3 border-t first:border-t-0 hover:bg-[#F6F3EC]/40 transition"
                style={{ borderColor: T.border }}>
                <button
                  onClick={() => toast.success(done ? "Reopened" : "Marked done")}
                  className="w-5 h-5 rounded border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: done ? T.good : T.border,
                    background: done ? T.good : "transparent",
                  }}>
                  {done && <Check size={11} color="#fff" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${done ? "line-through opacity-60" : ""}`}>{t.name}</div>
                  <div className="text-[10px] flex items-center gap-2" style={{ color: T.muted }}>
                    <span>{t.data?.owner ?? "—"}</span>
                    {t.data?.due_date && <span>· due {t.data.due_date}</span>}
                  </div>
                </div>
                <SeverityPill severity={sev as Severity} label={t.data?.priority ?? "low"} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TaskCard = memo(function TaskCard({ task, index }: { task: Entity; index: number }) {
  const sev: Severity = task.data?.priority === "high" ? "critical"
    : task.data?.priority === "medium" ? "watch" : "good";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px -12px rgba(16,24,40,0.15)" }}
      className="rounded-xl border p-3 cursor-pointer transition"
      style={{ borderColor: T.border, background: "#fff" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <SeverityPill severity={sev} />
        {task.data?.created_by === "agent" && (
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium flex items-center gap-1"
            style={{ background: T.primarySoft, color: T.primary }}>
            <Bot size={8} /> agent
          </span>
        )}
      </div>
      <div className="text-sm leading-snug mb-2">{task.name}</div>
      <div className="flex items-center justify-between text-[10px]" style={{ color: T.muted }}>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ background: T.primary }}>
            {(task.data?.owner ?? "?")[0]}
          </span>
          {task.data?.owner ?? "unassigned"}
        </span>
        {task.data?.due_date && <span className="flex items-center gap-1"><Calendar size={9} />{task.data.due_date.slice(5)}</span>}
      </div>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// [24] LIVE — Machine telemetry / live ops
// ═══════════════════════════════════════════════════════════════════
function Live() {
  const calm = useCalm();
  const [temp, setTemp] = useState(72.4);
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: 40 }, (_, i) => 70 + Math.sin(i / 3) * 2 + Math.random())
  );

  useEffect(() => {
    if (calm) return;
    const id = setInterval(() => {
      setTemp((t) => Math.max(60, Math.min(85, t + (Math.random() - 0.5) * 0.6)));
      setHistory((h) => [...h.slice(1), temp + (Math.random() - 0.5) * 1.5]);
    }, 2000);
    return () => clearInterval(id);
  }, [calm, temp]);

  const machines = [
    { id: "M-01", name: "CNC Mill #1", temp, status: "good" as Severity, uptime: 98.2 },
    { id: "M-02", name: "Lathe #3", temp: 68.1, status: "good" as Severity, uptime: 96.8 },
    { id: "M-03", name: "Press #1", temp: 79.5, status: "watch" as Severity, uptime: 88.1 },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Live ops</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Floor telemetry</h1>
        <p className="text-sm max-w-2xl" style={{ color: T.muted }}>
          Live sensor feed from machines on the shop floor. Alerts route to the right owner automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {machines.map((m, i) => {
          const colour = m.status === "good" ? T.good : m.status === "watch" ? T.watch : T.critical;
          const bg = m.status === "good" ? T.goodSoft : m.status === "watch" ? T.watchSoft : T.criticalSoft;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={!calm && m.status === "watch" ? { opacity: [1, 0.4, 1] } : {}}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: colour }} />
                  <span className="font-mono text-xs" style={{ color: T.muted }}>{m.id}</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold"
                  style={{ background: bg, color: colour }}>
                  {m.status === "good" ? "normal" : "watch"}
                </span>
              </div>
              <div className="text-sm font-medium mb-1">{m.name}</div>
              <div className="text-3xl font-bold tabular-nums mb-3" style={{ color: colour }}>
                <AnimatedNumber value={m.temp} format={(n) => `${n.toFixed(1)}°C`} duration={0.8} />
              </div>
              <Sparkline data={history} colour={colour} width={220} height={38} fill />
              <div className="text-[10px] mt-2" style={{ color: T.muted }}>
                Uptime {m.uptime}% · 24h
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
        <div className="font-display text-base mb-1">Alert rules</div>
        <div className="text-xs mb-4" style={{ color: T.muted }}>
          When a threshold breaks, BizOS notifies the on-call owner over WhatsApp
        </div>
        <div className="space-y-2">
          {[
            { cond: "Temp > 78°C for 5 min", action: "Notify Ravi · WhatsApp", live: true },
            { cond: "Vibration anomaly detected", action: "Create task · Operations", live: false },
            { cond: "Uptime < 90% for 1h", action: "Notify owner · daily digest", live: true },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
              style={{ borderColor: T.border, background: "#F6F3EC" }}>
              <span className="w-2 h-2 rounded-full"
                style={{ background: r.live ? T.good : T.muted }} />
              <div className="flex-1 text-xs">
                <div className="font-medium">{r.cond}</div>
                <div style={{ color: T.muted }}>{r.action}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                style={{
                  background: r.live ? T.goodSoft : "#F1F3F2",
                  color: r.live ? T.good : T.muted,
                }}>
                {r.live ? "active" : "paused"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [25] SETTINGS
// ═══════════════════════════════════════════════════════════════════
function Settings({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [density, setDensity] = useLocalState<"comfortable" | "compact">("bizos.density", "comfortable");
  const [railCollapsed, setRailCollapsed] = useLocalState<boolean>("bizos.rail.collapsed", false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useLocalState<boolean>("bizos.notify.whatsapp", true);
  const [notifyEmail, setNotifyEmail] = useLocalState<boolean>("bizos.notify.email", true);
  const [autoApprove, setAutoApprove] = useLocalState<boolean>("bizos.autoapprove", false);
  const [limit, setLimit] = useLocalState<number>("bizos.autoapprove.limit", 500000);

  const sections = [
    {
      title: "Appearance",
      body: (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Density</div>
              <div className="text-xs" style={{ color: T.muted }}>Comfortable for readability, compact for more on screen</div>
            </div>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: T.border }}>
              {(["comfortable", "compact"] as const).map((d) => (
                <button key={d} onClick={() => setDensity(d)}
                  className="text-xs px-3 py-1.5 font-medium capitalize transition"
                  style={{ background: density === d ? T.primary : "transparent", color: density === d ? "#fff" : T.muted }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Collapse sidebar by default</div>
              <div className="text-xs" style={{ color: T.muted }}>Frees horizontal space</div>
            </div>
            <Toggle checked={railCollapsed} onChange={setRailCollapsed} />
          </div>
        </div>
      ),
    },
    {
      title: "Notifications",
      body: (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">WhatsApp reminders</div>
              <div className="text-xs" style={{ color: T.muted }}>Messages sent to customers and staff</div>
            </div>
            <Toggle checked={notifyWhatsapp} onChange={setNotifyWhatsapp} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Email digests</div>
              <div className="text-xs" style={{ color: T.muted }}>Daily 7:00 AM summary</div>
            </div>
            <Toggle checked={notifyEmail} onChange={setNotifyEmail} />
          </div>
        </div>
      ),
    },
    {
      title: "Automation",
      body: (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Auto-approve low-risk reminders</div>
              <div className="text-xs" style={{ color: T.muted }}>Agents can act below limit without your sign-off</div>
            </div>
            <Toggle checked={autoApprove} onChange={setAutoApprove} />
          </div>
          {autoApprove && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="pt-2 border-t" style={{ borderColor: T.border }}>
              <div className="text-xs mb-2" style={{ color: T.muted }}>Per-action limit</div>
              <div className="flex items-center gap-2">
                <input type="range" min={100000} max={2000000} step={50000}
                  value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                  className="flex-1 accent-[#17706A]" />
                <div className="text-sm font-mono tabular-nums w-24 text-right">{fmtShort(limit)}</div>
              </div>
            </motion.div>
          )}
        </div>
      ),
    },
    {
      title: "Business profile",
      body: (
        <div className="space-y-3">
          <Field label="Business name" value={me.business_name ?? "—"} />
          <Field label="GSTIN" value={me.gstin ?? "—"} mono />
          <Field label="Industry" value={me.industry ?? "—"} />
          <Field label="City" value={me.city ?? "—"} />
          <Field label="Email" value={me.email ?? "—"} mono />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-3xl tracking-tight mb-1">Settings</h1>
        <p className="text-sm" style={{ color: T.muted }}>Preferences, automation, and profile</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-5"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="font-display text-base mb-4">{s.title}</div>
            {s.body}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border p-5 md:col-span-2"
          style={{ borderColor: T.border, background: T.surface }}>
          <div className="font-display text-base mb-4">Danger zone</div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">Sign out</div>
              <div className="text-xs" style={{ color: T.muted }}>You'll be returned to login</div>
            </div>
            <button onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-[#FDECEC] transition"
              style={{ borderColor: T.border, color: T.critical }}>
              Sign out →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-10 h-6 rounded-full flex items-center transition-all shrink-0"
      style={{ background: checked ? T.primary : "#D0CBBE", padding: 2, justifyContent: checked ? "flex-end" : "flex-start" }}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="w-5 h-5 rounded-full bg-white shadow" />
    </button>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
      style={{ borderColor: T.border }}>
      <div className="text-xs" style={{ color: T.muted }}>{label}</div>
      <div className={`text-sm truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
type CopilotChart = { kind: "spark" | "bar"; data: number[]; colour: string; label: string };
type CopilotMsg = {
  role: "user" | "copilot";
  text: string;
  at: number;
  chart?: CopilotChart;
  actions?: { label: string; onClick: () => void }[];
  links?: { label: string; route: string }[];
};

// [26] COPILOT — Screen 8 (revised, real API + interactivity)
// ═══════════════════════════════════════════════════════════════════
const QUICK_PROMPTS = [
  "What needs me today?", "Show overdue", "Draft reminder", "Approve INV-104",
];

function localCopilot(text: string): Omit<CopilotMsg, "role" | "at"> {
  const t = text.toLowerCase();
  if (t.includes("overdue") || t.includes("owes")) {
    return { text: "5 invoices overdue · ₹12.6L. Largest is INV-104 (Sharma Traders, 35d, ₹4.2L).",
      chart: { kind: "spark", data: [4, 5, 5, 6, 5, 6, 5], colour: T.critical, label: "Overdue trend" } };
  }
  if (t.includes("task") || t.includes("today")) {
    return { text: "8 open tasks. 3 high priority. Closest deadline: 'Follow up with Sharma Traders' due tomorrow.",
      chart: { kind: "bar", data: [3, 5, 2, 6, 4], colour: T.primary, label: "Tasks by day" } };
  }
  if (t.includes("cash") || t.includes("runway")) {
    return { text: "Runway 47 days. Inflows expected ₹18.4L in next 30 days.",
      chart: { kind: "spark", data: [42, 44, 46, 48, 52, 56, 60], colour: T.primary, label: "Runway" } };
  }
  if (t.includes("gst") || t.includes("compliance")) {
    return { text: "GSTR-3B due in 3 days. Data is synced. Reminder set for 7:00 AM.",
      chart: { kind: "bar", data: [8, 6, 4, 3, 2], colour: T.accent, label: "Days to deadline" } };
  }
  return { text: "Nothing else. You're clear." };
}

function Copilot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const { bump } = useApprovals();
  const [msgs, setMsgs] = useState<CopilotMsg[]>([
    { role: "copilot", text: "Hi Rajesh. I'm your Copilot. Ask me anything about your business, or pick a quick prompt below.", at: Date.now() - 200 },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chartOpen, setChartOpen] = useState<CopilotChart | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [msgs, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const logEvent = useCallback(async (type: string, payload: any) => {
    try { await api.post("/events", { type, payload }); } catch {}
  }, []);

  const runIntent = useCallback(async (intent: string) => {
    if (intent.startsWith("approve:")) {
      const inv = intent.split(":")[1];
      bump();
      toast.success(`WhatsApp reminder sent · ${inv}`);
      await logEvent("copilot.approve", { invoice: inv });
      return;
    }
    if (intent === "draft_reminder") { toast.success("Reminder drafted — check Inbox"); nav("/inbox"); return; }
    if (intent === "bulk_approve") { bump(); toast.success("Approved all low-risk reminders"); await logEvent("copilot.bulk_approve", {}); return; }
    if (intent === "cancel") { toast("Cancelled"); return; }
    toast.success(`Action: ${intent}`);
  }, [bump, nav, logEvent]);

  const ask = useCallback(async (question: string) => {
    setMsgs((m) => [...m, { role: "user", text: question, at: Date.now() }]);
    setInput("");
    setBusy(true);
    try {
      const res = await axios.post(`${AI_URL}/v1/copilot/ask`,
        { question, context: { route: window.location.pathname } }, { timeout: 4000 });
      const d = res.data ?? {};
      const reply: CopilotMsg = {
        role: "copilot",
        text: d.text ?? "…",
        at: Date.now(),
        chart: d.chart ?? undefined,
        links: d.links,
        actions: Array.isArray(d.actions)
          ? d.actions.map((a: any) => ({ label: a.label, onClick: () => runIntent(a.intent ?? a.label) }))
          : undefined,
      };
      setMsgs((m) => [...m, reply]);
    } catch {
      const local = localCopilot(question);
      setMsgs((m) => [...m, { role: "copilot", at: Date.now(), ...local }]);
    } finally { setBusy(false); }
  }, [runIntent]);

  const send = useCallback((text: string) => {
    if (!text.trim() || busy) return;
    ask(text.trim());
  }, [ask, busy]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="fixed inset-0 z-40"
            style={{ background: "rgba(16,24,40,0.18)", backdropFilter: "blur(3px)" }} onClick={onClose} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col glass-3"
            style={{ width: "min(400px, 100vw)", borderLeft: "1px solid rgba(255,255,255,0.75)" }}
            role="dialog" aria-label="Copilot">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}>
                  <Sparkles size={15} color={T.primary} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm leading-tight">Copilot</div>
                  <div className="text-[10px] flex items-center gap-1.5" style={{ color: T.muted }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.good }} />
                    context · {window.location.pathname === "/" ? "home" : window.location.pathname.slice(1)}
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-white/60"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <CopilotBubble key={i} msg={m} onOpenChart={(c) => setChartOpen(c)} onNavigate={(r) => { nav(r); onClose(); }} />
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs" style={{ color: T.muted }}>
                  <Loader2 size={12} className="animate-spin" /> thinking…
                </div>
              )}
            </div>

            <div className="px-4 pt-3 border-t" style={{ borderColor: T.border }}>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => send(p)} disabled={busy}
                    className="text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap font-medium hover:bg-[#F6F3EC] transition disabled:opacity-50"
                    style={{ borderColor: T.border, color: T.muted }}>{p}</button>
                ))}
              </div>
            </div>

            <div className="p-3 flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask anything…" className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                style={{ borderColor: T.border, background: T.surface }} />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => send(input)} disabled={!input.trim() || busy}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: T.primary }} aria-label="Send">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </motion.button>
            </div>
          </motion.aside>

          <AnimatePresence>
            {chartOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-black/40" onClick={() => setChartOpen(null)} />
                <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-2xl p-6 z-[61] glass-3"
                  role="dialog" aria-label={chartOpen.label}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-display text-lg">{chartOpen.label}</div>
                    <button onClick={() => setChartOpen(null)} aria-label="Close"><X size={18} style={{ color: T.muted }} /></button>
                  </div>
                  <div className="rounded-xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
                    {chartOpen.kind === "spark" ? (
                      <Sparkline data={chartOpen.data} colour={chartOpen.colour} width={420} height={120} fill />
                    ) : (
                      <div className="flex items-end gap-2 h-32">
                        {chartOpen.data.map((v, i) => {
                          const max = Math.max(...chartOpen.data);
                          return (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
                              transition={{ delay: i * 0.05, duration: 0.4 }} className="flex-1 rounded-t"
                              style={{ background: chartOpen.colour, minHeight: 6 }} />
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 text-xs" style={{ color: T.muted }}>Full chart opens on the relevant page.</div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function CopilotBubble({ msg, onOpenChart, onNavigate }: {
  msg: CopilotMsg;
  onOpenChart: (c: CopilotChart) => void;
  onNavigate: (route: string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%]">
        <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={{ background: isUser ? T.primary : T.surface, color: isUser ? "#fff" : T.ink,
            border: isUser ? "none" : `1px solid ${T.border}`,
            borderTopRightRadius: isUser ? 4 : undefined, borderTopLeftRadius: isUser ? undefined : 4 }}>
          {msg.text}
        </div>

        {!isUser && msg.chart && (
          <motion.button
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            onClick={() => onOpenChart(msg.chart!)}
            whileHover={{ scale: 1.02 }}
            className="mt-2 w-full text-left rounded-xl border p-3 flex items-center gap-3 hover:bg-[#F6F3EC] transition"
            style={{ borderColor: T.border, background: "#fff" }}>
            <div className="shrink-0">
              {msg.chart.kind === "spark" ? (
                <Sparkline data={msg.chart.data} colour={msg.chart.colour} width={72} height={26} fill />
              ) : (
                <div className="flex items-end gap-0.5 h-6">
                  {msg.chart.data.map((v, i) => {
                    const max = Math.max(...msg.chart!.data);
                    return (
                      <span key={i} style={{ width: 5, height: `${Math.max(4, (v / max) * 24)}px`,
                        background: msg.chart!.colour, borderRadius: 2, display: "inline-block" }} />
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>{msg.chart.label}</div>
              <div className="text-xs font-medium" style={{ color: T.primary }}>Tap to open full chart →</div>
            </div>
            <ArrowUpRight size={14} style={{ color: T.muted }} />
          </motion.button>
        )}

        {!isUser && msg.links && msg.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.links.map((l) => (
              <button key={l.label} onClick={() => onNavigate(l.route)}
                className="text-[11px] px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 hover:bg-[#F6F3EC] transition"
                style={{ borderColor: T.border, color: T.primary }}>
                <ExternalLink size={9} /> {l.label}
              </button>
            ))}
          </div>
        )}

        {!isUser && msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.actions.map((a) => (
              <button key={a.label} onClick={a.onClick}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium text-white"
                style={{ background: T.primary }}>{a.label}</button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [26.5] WHATSAPP MOCK — Screen 9 (Telegram under hood, WA branding)
// ═══════════════════════════════════════════════════════════════════
type ChatMsg = {
  from: "user" | "bot";
  text: string;
  at: number;
  kind?: "photo" | "text";
  actions?: { label: string; tone: "primary" | "accent" | "ghost"; onClick: () => void }[];
};

function WhatsAppMock() {
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "bot", text: "Hi Rajesh. I'm your BizOS bot.\n\nSend me an invoice photo, ask me a question, or type approve INV-104.", at: Date.now() - 60000 },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkpoint, setCheckpoint] = useState<string | null>(null);
  const [log, setLog] = useState<{ at: number; type: string; detail: string }[]>([]);
  const [showLog, setShowLog] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [msgs]);

  const push = useCallback((m: ChatMsg) => setMsgs((cur) => [...cur, m]), []);

  const logEvent = useCallback(async (type: string, detail: string, payload?: any) => {
    setLog((l) => [{ at: Date.now(), type, detail }, ...l].slice(0, 30));
    try { await api.post("/events", { type, payload: payload ?? { detail } }); } catch {}
  }, []);

  const flashCheckpoint = (text: string) => {
    setCheckpoint(text);
    setTimeout(() => setCheckpoint(null), 5000);
  };

  const sendPhoto = async () => {
    push({ from: "user", text: "📷 Invoice photo attached", at: Date.now(), kind: "photo" });
    logEvent("whatsapp.capture", "Photo received");
    setBusy(true);
    try {
      const res = await axios.post(`${AI_URL}/v1/ocr`, { file_id: `demo-${Date.now()}` }, { timeout: 5000 });
      const f = res.data ?? {};
      push({
        from: "bot",
        text: `Got it.\n\nInvoice: ${f.invoice_number ?? "INV-104"}\nCustomer: ${f.customer_name ?? "Sharma Traders"}\nTotal: ₹${(f.total ?? 420000).toLocaleString("en-IN")}\nConfidence: ${Math.round((f.confidence ?? 0.94) * 100)}%\n\nLog this invoice?`,
        at: Date.now(),
        actions: [
          { label: "Yes, log it", tone: "primary", onClick: () => {
            push({ from: "bot", text: `✅ Logged ${f.invoice_number ?? "INV-104"}. Reminder scheduled for tomorrow 7 AM.`, at: Date.now() });
            logEvent("whatsapp.capture.confirm", `Logged ${f.invoice_number ?? "INV-104"}`, f);
          }},
          { label: "Edit", tone: "ghost", onClick: () => {
            push({ from: "bot", text: "Send me the corrected fields and I'll update them.", at: Date.now() });
            logEvent("whatsapp.capture.edit", "Requested correction");
          }},
        ],
      });
    } catch {
      push({
        from: "bot",
        text: "Got it.\n\nInvoice: INV-104\nCustomer: Sharma Traders\nTotal: ₹4,20,000\nConfidence: 94%\n\nLog this invoice?",
        at: Date.now(),
        actions: [
          { label: "Yes, log it", tone: "primary", onClick: () => {
            push({ from: "bot", text: "✅ Logged INV-104. Reminder scheduled for tomorrow 7 AM.", at: Date.now() });
            logEvent("whatsapp.capture.confirm", "Logged INV-104");
          }},
          { label: "Edit", tone: "ghost", onClick: () => push({ from: "bot", text: "Send corrections.", at: Date.now() }) },
        ],
      });
    } finally { setBusy(false); }
  };

  const handleQuery = (text: string) => {
    push({ from: "user", text, at: Date.now() });
    setBusy(true);
    setTimeout(() => {
      const t = text.toLowerCase();
      if (t.includes("task") || t.includes("today")) {
        push({ from: "bot", text: "Your tasks today:\n\n• Follow up with Sharma Traders — ₹4.2L, due tomorrow\n• Verify GSTR-3B data — due in 3 days\n• Approve purchase order — today", at: Date.now() });
        logEvent("whatsapp.query.tasks", "Task list delivered");
      } else if (t.includes("overdue") || t.includes("owes")) {
        push({
          from: "bot",
          text: "5 invoices overdue · ₹12.6L\n\n• INV-104 · Sharma Traders · ₹4.2L · 35d\n• INV-105 · Zenith Tech · ₹2.85L · 28d\n• INV-106 · Patel Precision · ₹1.78L · 22d\n• INV-107 · ABC Enterprises · ₹2.45L · 18d\n• INV-108 · XYZ Engineering · ₹1.32L · 15d",
          at: Date.now(),
          actions: [
            { label: "Draft reminders", tone: "primary", onClick: () => {
              push({ from: "bot", text: "3 draft reminders ready. Approve all?", at: Date.now(), actions: [
                { label: "Approve all", tone: "primary", onClick: () => {
                  push({ from: "bot", text: "✅ 3 WhatsApp reminders queued.", at: Date.now() });
                  flashCheckpoint("WhatsApp reminder sent.");
                  logEvent("whatsapp.reminders.bulk", "3 reminders queued");
                }},
                { label: "Cancel", tone: "ghost", onClick: () => push({ from: "bot", text: "Cancelled.", at: Date.now() }) },
              ]});
            }},
          ],
        });
        logEvent("whatsapp.query.overdue", "Overdue list delivered");
      } else {
        push({ from: "bot", text: "Noted. Try 'my tasks', 'overdue', or 'approve INV-104'.", at: Date.now() });
      }
      setBusy(false);
    }, 550);
  };

  const handleApprove = (inv = "INV-104") => {
    push({ from: "user", text: `Approve ${inv}`, at: Date.now() });
    setBusy(true);
    logEvent("whatsapp.approve.start", `Approval started · ${inv}`);
    setTimeout(() => {
      push({
        from: "bot",
        text: `🔎 Policy check\n\nOverdue > 30 days + top-5 customer → manager approval required.\n\n${inv} — confirm sending reminder?`,
        at: Date.now(),
        actions: [
          { label: "✅ Approve & send", tone: "primary", onClick: () => {
            push({ from: "bot", text: `✅ WhatsApp reminder sent.\n\n${inv} · Sharma Traders · ₹4.2L`, at: Date.now() });
            flashCheckpoint("WhatsApp reminder sent.");
            logEvent("whatsapp.approve.confirm", `Approved ${inv}`, { invoice: inv });
          }},
          { label: "Cancel", tone: "ghost", onClick: () => {
            push({ from: "bot", text: "Cancelled. Nothing was sent.", at: Date.now() });
            logEvent("whatsapp.approve.cancel", "Cancelled");
          }},
        ],
      });
      setBusy(false);
    }, 650);
  };

  const simulateInbound = async () => {
    try {
      await axios.post(`${AI_URL}/v1/agents/collections/run`, { trigger: "manual", channel: "telegram" }, { timeout: 4000 });
      push({ from: "bot", text: "🤖 Collections Agent ran. Draft reminder ready.", at: Date.now() });
      logEvent("agent.collections.run", "Simulated inbound");
    } catch {
      push({ from: "bot", text: "🤖 Collections Agent ran (local). Draft reminder ready.", at: Date.now() });
      logEvent("agent.collections.run", "Simulated inbound (offline)");
    }
  };

  return (
    <div className="pb-16">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>External mock</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">WhatsApp</h1>
          <p className="text-sm" style={{ color: T.muted }}>External mock — chat-only. Every action logs to the events table.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={simulateInbound}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.primary }}>
            <Bot size={12} /> Simulate agent inbound
          </button>
          <button onClick={() => setShowLog((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            <FileText size={12} /> {showLog ? "Hide" : "Show"} event log
          </button>
          <button onClick={() => nav("/")}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            Back to app
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-4">
        <div className="max-w-md mx-auto w-full">
          <div className="rounded-3xl overflow-hidden" style={{ background: WA.dark, boxShadow: "0 25px 60px -20px rgba(37,211,102,0.35)" }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: WA.green }}>BD</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">BizOS Bot</div>
                <div className="text-xs" style={{ color: WA.green }}>online</div>
              </div>
              <MoreHorizontal size={16} color={WA.textMuted} />
            </div>
            <div ref={threadRef} className="p-4 space-y-3 h-[460px] overflow-y-auto">
              {msgs.map((m, i) => {
                const isUser = m.from === "user";
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[86%]">
                      <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ background: isUser ? WA.bubbleOut : WA.bubbleIn, color: WA.text,
                          borderTopRightRadius: isUser ? 4 : undefined, borderTopLeftRadius: isUser ? undefined : 4 }}>
                        {m.text}
                      </div>
                      <div className="text-[10px] mt-1 flex items-center gap-1 justify-end" style={{ color: WA.textMuted }}>
                        {new Date(m.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {isUser && <span style={{ color: WA.tick }}>✓✓</span>}
                      </div>
                      {!isUser && m.actions && m.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 justify-start">
                          {m.actions.map((a) => (
                            <button key={a.label} onClick={a.onClick}
                              className="text-[11px] px-3 py-1.5 rounded-full font-medium"
                              style={{ background: a.tone === "primary" ? WA.green : a.tone === "accent" ? T.accent : "transparent",
                                color: a.tone === "ghost" ? WA.textMuted : "#0B141A",
                                border: a.tone === "ghost" ? "1px solid rgba(255,255,255,0.15)" : "none" }}>{a.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: WA.bubbleIn, color: WA.textMuted }}>
                    <Loader2 size={11} className="animate-spin" /> typing…
                  </div>
                </div>
              )}
            </div>
            <div className="px-3 pt-2 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                <button onClick={sendPhoto}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5"
                  style={{ background: "rgba(37,211,102,0.15)", color: WA.green }}>
                  <Camera size={11} /> Send photo
                </button>
                <button onClick={() => handleQuery("What's my task today?")}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                  style={{ background: "rgba(255,255,255,0.06)", color: WA.text }}>
                  Query: tasks
                </button>
                <button onClick={() => handleQuery("Who owes me money?")}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                  style={{ background: "rgba(255,255,255,0.06)", color: WA.text }}>
                  Query: overdue
                </button>
                <button onClick={() => handleApprove("INV-104")}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5"
                  style={{ background: "rgba(242,163,58,0.18)", color: T.accent }}>
                  <Check size={11} /> Approve INV-104
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { handleQuery(input); setInput(""); } }}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2.5 rounded-full outline-none text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", color: WA.text }} />
                <button onClick={() => { if (input.trim()) { handleQuery(input); setInput(""); } }}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: WA.green }} aria-label="Send">
                  <Send size={14} color="#0B141A" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {checkpoint && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: T.goodSoft, border: `1px solid ${T.good}33` }}>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 16 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: T.good }}>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </motion.span>
                <div className="text-sm font-medium" style={{ color: T.good }}>{checkpoint}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showLog && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
              className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display text-base">Event log</div>
                  <div className="text-xs" style={{ color: T.muted }}>Live · {log.length} entries · POSTed to /events</div>
                </div>
                <button onClick={() => setLog([])} className="text-xs" style={{ color: T.muted }}>clear</button>
              </div>
              {log.length === 0 ? (
                <div className="text-center py-12 text-xs" style={{ color: T.muted }}>Interact with the chat to see events here.</div>
              ) : (
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {log.map((e, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 px-3 py-2 rounded-lg" style={{ background: "#F6F3EC" }}>
                      <span className="text-[10px] font-mono shrink-0 mt-0.5" style={{ color: T.muted }}>
                        {new Date(e.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-medium" style={{ color: T.primary }}>{e.type}</div>
                        <div className="text-[11px]" style={{ color: T.muted }}>{e.detail}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// [26.6] AGENTS REGISTRY
// ═══════════════════════════════════════════════════════════════════
type AgentDef = {
  id: string;
  name: string;
  purpose: string;
  autonomy: 0 | 1 | 2;
  policy: string;
  limit?: number;
  tools: string[];
  runs: { at: number; result: "success" | "pending" | "rejected"; note: string }[];
  successRate: number;
  status: "live" | "paused";
};

const AGENTS_REGISTRY: AgentDef[] = [
  {
    id: "collections",
    name: "Collections Agent",
    purpose: "Chases overdue invoices politely, escalates when stuck",
    autonomy: 1, policy: "P-001", limit: 500000,
    tools: ["WhatsApp", "Email", "Tally"],
    runs: [
      { at: Date.now() - 2 * 3600_000, result: "success", note: "Reminder sent · INV-104" },
      { at: Date.now() - 26 * 3600_000, result: "success", note: "Reminder sent · INV-105" },
      { at: Date.now() - 51 * 3600_000, result: "pending", note: "Draft awaiting approval" },
    ],
    successRate: 0.94, status: "live",
  },
  {
    id: "ops",
    name: "Operations Agent",
    purpose: "Tracks production tasks, reassigns when blocked",
    autonomy: 1, policy: "P-003", limit: 100000,
    tools: ["Work", "Notifications"],
    runs: [
      { at: Date.now() - 4 * 3600_000, result: "success", note: "Reassigned to Ankit" },
      { at: Date.now() - 30 * 3600_000, result: "success", note: "Task created · verify GSTR data" },
    ],
    successRate: 0.91, status: "live",
  },
  {
    id: "cs",
    name: "Customer Success Agent",
    purpose: "Monitors customer health, flags churn risk",
    autonomy: 0, policy: "P-007",
    tools: ["Email", "Work"],
    runs: [
      { at: Date.now() - 12 * 3600_000, result: "success", note: "Flagged Zenith Tech · 22% drop" },
    ],
    successRate: 0.88, status: "live",
  },
  {
    id: "compliance",
    name: "Compliance Agent",
    purpose: "Tracks GSTR/TDS deadlines, ensures filings",
    autonomy: 2, policy: "P-002", limit: 0,
    tools: ["Calendar", "Email", "Notifications"],
    runs: [
      { at: Date.now() - 1 * 3600_000, result: "success", note: "GSTR-3B reminder set · 7 AM" },
      { at: Date.now() - 72 * 3600_000, result: "success", note: "TDS due date tracked" },
    ],
    successRate: 0.99, status: "live",
  },
  {
    id: "reconcile",
    name: "Reconciliation Agent",
    purpose: "Matches bank transactions to invoices daily",
    autonomy: 0, policy: "P-004",
    tools: ["Bank", "Tally"],
    runs: [
      { at: Date.now() - 20 * 3600_000, result: "success", note: "Matched 42/47 transactions" },
    ],
    successRate: 0.89, status: "paused",
  },
];

function AgentsRegistry() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Registry</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Agents</h1>
          <p className="text-sm max-w-2xl" style={{ color: T.muted }}>
            Every agent that acts on your behalf — with autonomy level, per-action limit, and policy.
          </p>
        </div>
        <button onClick={() => toast.success("Agent builder opened")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
          style={{ background: T.primary }}>
          <Plus size={12} /> New agent
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {AGENTS_REGISTRY.map((a, i) => {
          const open = openId === a.id;
          const statusColour = a.status === "live" ? T.good : T.muted;
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-5 overflow-hidden"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: T.primarySoft }}>
                    <Bot size={17} color={T.primary} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm leading-tight truncate">{a.name}</div>
                    <div className="text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.muted }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColour }} />
                      {a.status} · autonomy {a.autonomy}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: T.primarySoft, color: T.primary }}>{a.policy}</span>
              </div>

              <p className="text-xs mb-4 leading-relaxed" style={{ color: T.muted }}>{a.purpose}</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-lg p-2 text-center" style={{ background: "#F6F3EC" }}>
                  <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Limit</div>
                  <div className="text-xs font-medium tabular-nums">
                    {a.limit ? fmtShort(a.limit) : "—"}
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ background: "#F6F3EC" }}>
                  <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Success</div>
                  <div className="text-xs font-medium tabular-nums" style={{ color: T.good }}>
                    {Math.round(a.successRate * 100)}%
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ background: "#F6F3EC" }}>
                  <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Tools</div>
                  <div className="text-xs font-medium tabular-nums">{a.tools.length}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {a.tools.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                    style={{ background: T.primarySoft, color: T.primary }}>
                    <Plug size={8} />{t}
                  </span>
                ))}
              </div>

              <button onClick={() => setOpenId(open ? null : a.id)}
                className="text-xs flex items-center gap-1 font-medium" style={{ color: T.primary }}>
                {open ? "Hide" : "Show"} recent runs
                {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t overflow-hidden"
                    style={{ borderColor: T.border }}>
                    <div className="space-y-2.5">
                      {a.runs.map((r, j) => {
                        const tone = r.result === "success" ? T.good : r.result === "rejected" ? T.critical : T.watch;
                        const bg = r.result === "success" ? T.goodSoft : r.result === "rejected" ? T.criticalSoft : T.watchSoft;
                        const Icon = r.result === "success" ? Check : r.result === "rejected" ? X : Clock;
                        return (
                          <div key={j} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: bg }}>
                              <Icon size={10} color={tone} strokeWidth={3} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs">{r.note}</div>
                              <div className="text-[10px]" style={{ color: T.muted }}>{relTime(r.at)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [26.7] COMPLIANCE
// ═══════════════════════════════════════════════════════════════════
function Compliance() {
  const deadlines = [
    { label: "GSTR-3B", due: "in 3 days", date: "2026-10-13", status: "watch" as Severity, note: "Data synced · reminder 7 AM" },
    { label: "GSTR-1", due: "in 8 days", date: "2026-10-18", status: "good" as Severity, note: "Auto-draft ready" },
    { label: "TDS deposit", due: "in 5 days", date: "2026-10-15", status: "watch" as Severity, note: "4 entries pending" },
    { label: "PF challan", due: "in 12 days", date: "2026-10-22", status: "good" as Severity, note: "Recurring · automated" },
    { label: "Advance tax Q3", due: "in 32 days", date: "2026-11-11", status: "good" as Severity, note: "Provision calculated" },
  ];

  const filings = [
    { period: "Sep 2026", gstr1: "filed", gstr3b: "filed", onTime: true },
    { period: "Aug 2026", gstr1: "filed", gstr3b: "filed", onTime: true },
    { period: "Jul 2026", gstr1: "filed", gstr3b: "filed", onTime: true },
    { period: "Jun 2026", gstr1: "filed", gstr3b: "filed", onTime: true },
    { period: "May 2026", gstr1: "filed", gstr3b: "filed", onTime: false },
    { period: "Apr 2026", gstr1: "filed", gstr3b: "filed", onTime: true },
  ];

  const onTimeRate = Math.round((filings.filter((f) => f.onTime).length / filings.length) * 100);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Compliance</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Filings & deadlines</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            Auto-tracked. Reminders route to the right owner. Nothing slips.
          </p>
        </div>
        <div className="rounded-2xl border px-4 py-3" style={{ borderColor: T.border, background: T.surface }}>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>On-time rate</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: T.good }}>{onTimeRate}%</div>
        </div>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
        <div className="font-display text-base mb-4">Upcoming</div>
        <div className="space-y-2">
          {deadlines.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl border"
              style={{ borderColor: T.border, background: "#FBF9F4" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: d.status === "watch" ? T.watchSoft : T.goodSoft }}>
                <Calendar size={16}
                  style={{ color: d.status === "watch" ? T.watch : T.good }} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{d.label}</div>
                <div className="text-[10px]" style={{ color: T.muted }}>{d.date} · {d.note}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-medium" style={{ color: d.status === "watch" ? T.watch : T.good }}>
                  {d.due}
                </div>
                <SeverityPill severity={d.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
        <div className="font-display text-base mb-1">Filing history</div>
        <div className="text-xs mb-4" style={{ color: T.muted }}>Last 6 months · all verifiable</div>
        <div className="space-y-1.5">
          {filings.map((f) => (
            <div key={f.period} className="flex items-center gap-3 py-2 border-b last:border-b-0"
              style={{ borderColor: T.border }}>
              <div className="text-xs font-mono w-24" style={{ color: T.muted }}>{f.period}</div>
              <div className="flex-1 flex gap-2">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1"
                  style={{ background: T.goodSoft, color: T.good }}>
                  <Check size={9} strokeWidth={3} /> GSTR-1
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1"
                  style={{ background: T.goodSoft, color: T.good }}>
                  <Check size={9} strokeWidth={3} /> GSTR-3B
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                style={{
                  background: f.onTime ? T.goodSoft : T.watchSoft,
                  color: f.onTime ? T.good : T.watch,
                }}>
                {f.onTime ? "on time" : "late"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [26.8] MONEY — Overview (receivables, DSO, ageing, cash)
// ═══════════════════════════════════════════════════════════════════
function Money() {
  const { data: entities } = useEntities();
  const nav = useNavigate();

  const stats = useMemo(() => {
    const list = entities ?? [];
    const overdue = list.filter((e) => e.type === "invoice" && e.data?.status === "overdue");
    const paid = list.filter((e) => e.type === "invoice" && e.data?.status === "paid");
    const overdueAmt = overdue.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    const paidAmt = paid.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    return { overdue: overdueAmt, overdueCount: overdue.length, paid: paidAmt, paidCount: paid.length };
  }, [entities]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Money</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Cash & receivables</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            One place for what's owed, what's collected, and where cash is heading.
          </p>
        </div>
        <button onClick={() => nav("/trust")}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
          style={{ borderColor: T.border }}>
          Trust dashboard <ArrowRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Overdue" value={stats.overdue} tone="critical" count={stats.overdueCount} />
        <StatTile label="Paid · 90d" value={stats.paid} tone="good" count={stats.paidCount} />
        <StatTile label="DSO" value={28} tone="watch" suffix=" days" />
        <StatTile label="Runway" value={47} tone="good" suffix=" days" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <CashProjectionChart onDrill={() => nav("/trust")} />
          <AgeingBars onDrill={(b) => toast.success(`Filter: ${b}`)} />
        </div>
        <div className="space-y-4">
          <motion.div whileHover={{ y: -2 }}
            className="rounded-2xl border p-5 cursor-pointer"
            style={{ borderColor: T.border, background: T.surface }}
            onClick={() => nav("/inbox")}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>
              To chase today
            </div>
            <div className="text-3xl font-bold tabular-nums mb-1" style={{ color: T.critical }}>
              <AnimatedNumber value={stats.overdueCount} />
            </div>
            <div className="text-xs mb-3" style={{ color: T.muted }}>invoices overdue</div>
            <button className="text-xs px-3 py-1.5 rounded-lg border font-medium w-full flex items-center justify-center gap-1 hover:bg-[#F6F3EC]"
              style={{ borderColor: T.border }}>
              Open in Inbox <ChevronRight size={12} />
            </button>
          </motion.div>

          <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
              Top overdue
            </div>
            <div className="space-y-2.5">
              {[
                { n: "Sharma Traders", a: 420000, d: 35 },
                { n: "Zenith Tech", a: 285000, d: 28 },
                { n: "Patel Precision", a: 178000, d: 22 },
              ].map((r) => (
                <div key={r.n} className="flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.n}</div>
                    <div style={{ color: T.muted }}>{r.d}d overdue</div>
                  </div>
                  <div className="font-medium tabular-nums" style={{ color: T.critical }}>{fmtINR(r.a)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
              Top customer LTV
            </div>
            <Sparkline data={[1.2, 1.4, 1.6, 1.8, 1.9, 2.0, 2.1]}
              colour={T.primary} width={220} height={40} fill />
            <div className="mt-2 text-xs" style={{ color: T.muted }}>
              Sharma Traders · <span style={{ color: T.ink }}>₹21.0L</span> lifetime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone, count, suffix }: {
  label: string; value: number; tone: Severity; count?: number; suffix?: string;
}) {
  const colour = tone === "critical" ? T.critical : tone === "watch" ? T.watch : T.good;
  const bg = tone === "critical" ? T.criticalSoft : tone === "watch" ? T.watchSoft : T.goodSoft;
  return (
    <motion.div whileHover={{ y: -2 }}
      className="rounded-2xl border p-4"
      style={{ borderColor: T.border, background: T.surface }}>
      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{label}</div>
      <div className="text-2xl font-bold tabular-nums mb-1" style={{ color: colour }}>
        {suffix === " days" ? (
          <AnimatedNumber value={value} format={(n) => `${Math.round(n)}d`} />
        ) : (
          <AnimatedNumber value={value} format={fmtShort} />
        )}
      </div>
      {count !== undefined && (
        <div className="text-[10px] px-1.5 py-0.5 rounded inline-block"
          style={{ background: bg, color: colour }}>
          {count} items
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// [26.9] EXTENSIONS
// ═══════════════════════════════════════════════════════════════════
type IntegrationCategory = "accounting" | "banking" | "tax" | "messaging" | "payments" | "storage";
type Integration = {
  id: string; name: string; vendor: string; category: IntegrationCategory;
  description: string; Icon: LucideIcon; connected: boolean;
  lastSync?: number; status: "healthy" | "error" | "idle"; tone: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "tally", name: "Tally Prime", vendor: "Tally Solutions", category: "accounting", description: "Sync invoices, receipts, and ledgers from your Tally installation.", Icon: FileSpreadsheet, connected: true, lastSync: Date.now() - 4 * 60_000, status: "healthy", tone: T.primary },
  { id: "gstn", name: "GSTN", vendor: "Government of India", category: "tax", description: "Auto-file GSTR-1 and GSTR-3B. Pull tax liability in real time.", Icon: Landmark, connected: true, lastSync: Date.now() - 22 * 3600_000, status: "healthy", tone: T.good },
  { id: "hdfc", name: "HDFC Bank", vendor: "HDFC", category: "banking", description: "Real-time bank feed. Auto-match payments to invoices.", Icon: Wallet, connected: true, lastSync: Date.now() - 3 * 60_000, status: "healthy", tone: T.primary },
  { id: "telegram", name: "Telegram Bot", vendor: "Telegram", category: "messaging", description: "Chat interface for customers & staff. WhatsApp-branded in the app.", Icon: MessageCircle, connected: true, lastSync: Date.now() - 30_000, status: "healthy", tone: T.primary },
  { id: "razorpay", name: "Razorpay", vendor: "Razorpay", category: "payments", description: "Payment links, UPI, and auto-reconciliation.", Icon: IndianRupee, connected: false, status: "idle", tone: T.accent },
  { id: "gdrive", name: "Google Drive", vendor: "Google", category: "storage", description: "Archive invoice PDFs and backups to a shared drive.", Icon: Package, connected: false, status: "idle", tone: T.primary },
  { id: "icici", name: "ICICI Bank", vendor: "ICICI", category: "banking", description: "Secondary bank feed. Multi-account supported.", Icon: Wallet, connected: false, status: "idle", tone: T.accent },
  { id: "cleartax", name: "ClearTax", vendor: "Clear", category: "tax", description: "Backup tax filing. Import from GSTN portal.", Icon: Scale, connected: false, status: "idle", tone: T.good },
];

function Extensions() {
  const [filter, setFilter] = useState<IntegrationCategory | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [localState, setLocalState] = useLocalState<Record<string, boolean>>("bizos.integrations", {});

  const isConnected = (i: Integration) => localState[i.id] ?? i.connected;
  const toggle = (i: Integration) => {
    const next = !isConnected(i);
    setLocalState((s) => ({ ...s, [i.id]: next }));
    toast.success(next ? `${i.name} connected` : `${i.name} disconnected`);
  };

  const categories: { id: IntegrationCategory; label: string }[] = [
    { id: "accounting", label: "Accounting" }, { id: "banking", label: "Banking" },
    { id: "tax", label: "Tax & Compliance" }, { id: "messaging", label: "Messaging" },
    { id: "payments", label: "Payments" }, { id: "storage", label: "Storage" },
  ];

  const filtered = filter ? INTEGRATIONS.filter((i) => i.category === filter) : INTEGRATIONS;
  const open = openId ? INTEGRATIONS.find((i) => i.id === openId) : null;
  const connectedCount = INTEGRATIONS.filter(isConnected).length;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Extensions</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Connect your stack</h1>
          <p className="text-sm" style={{ color: T.muted }}>{connectedCount} of {INTEGRATIONS.length} connected · every source feeds BizOS</p>
        </div>
        <button onClick={() => toast.success("Opening catalogue…")}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
          style={{ borderColor: T.border }}>
          <Plus size={12} /> Request integration
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter(null)}
          className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
          style={{ borderColor: filter === null ? T.primary : T.border,
            background: filter === null ? T.primarySoft : T.surface,
            color: filter === null ? T.primary : T.muted }}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter((cur) => (cur === c.id ? null : c.id))}
            className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
            style={{ borderColor: filter === c.id ? T.primary : T.border,
              background: filter === c.id ? T.primarySoft : T.surface,
              color: filter === c.id ? T.primary : T.muted }}>{c.label}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((it, i) => {
          const connected = isConnected(it);
          const statusColour = it.status === "healthy" ? T.good : it.status === "error" ? T.critical : T.muted;
          return (
            <motion.div key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
              className="rounded-2xl border p-5 flex flex-col"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${it.tone}1A` }}>
                  <it.Icon size={19} style={{ color: it.tone }} strokeWidth={2.2} />
                </div>
                {connected && (
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1"
                    style={{ background: T.goodSoft, color: statusColour }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColour }} />{it.status}
                  </span>
                )}
              </div>
              <div className="font-display text-base leading-tight mb-0.5">{it.name}</div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{it.vendor}</div>
              <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: T.muted }}>{it.description}</p>
              {connected && it.lastSync && (
                <div className="text-[10px] mb-3 flex items-center gap-1.5" style={{ color: T.muted }}>
                  <Clock size={10} /> synced {relTime(it.lastSync)}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => toggle(it)}
                  className="flex-1 text-xs py-2 rounded-lg font-medium transition"
                  style={{ background: connected ? "transparent" : T.primary,
                    color: connected ? T.critical : "#fff",
                    border: connected ? `1px solid ${T.border}` : "none" }}>
                  {connected ? "Disconnect" : "Connect"}
                </button>
                {connected && (
                  <button onClick={() => setOpenId(it.id)}
                    className="text-xs px-3 py-2 rounded-lg border font-medium hover:bg-[#F6F3EC]"
                    style={{ borderColor: T.border }}>Configure</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpenId(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto glass-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
              role="dialog" aria-label={`Configure ${open.name}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${open.tone}1A` }}>
                      <open.Icon size={17} style={{ color: open.tone }} />
                    </div>
                    <div>
                      <div className="font-display text-lg leading-tight">{open.name}</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>{open.vendor}</div>
                    </div>
                  </div>
                  <button onClick={() => setOpenId(null)} aria-label="Close"><X size={18} style={{ color: T.muted }} /></button>
                </div>
                <div className="space-y-4">
                  <EvidenceField label="Status" value={open.status === "healthy" ? "Connected · healthy" : open.status === "error" ? "Connected · needs attention" : "Not connected"} />
                  <EvidenceField label="Category" value={open.category} />
                  {open.lastSync && <EvidenceField label="Last sync" value={new Date(open.lastSync).toLocaleString("en-IN")} />}
                  <EvidenceField label="Scopes" value={open.id === "tally" ? "read:invoices, read:ledgers, write:receipts" : open.id === "gstn" ? "read:gstin, write:returns" : open.id === "hdfc" ? "read:transactions, read:balance" : open.id === "telegram" ? "send:message, receive:update" : "read:all"} mono />
                  <EvidenceField label="Webhook" value={`https://api.bizos.in/hooks/${open.id}`} mono />
                </div>
                <div className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: T.border }}>
                  <button onClick={() => { toast.success(`${open.name} re-sync queued`); setOpenId(null); }}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                    style={{ background: T.primary }}>
                    <RefreshCw size={13} /> Force re-sync
                  </button>
                  <button onClick={() => toast.success("Opening logs…")}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 hover:bg-[#F6F3EC]"
                    style={{ borderColor: T.border }}>
                    <FileText size={13} /> View sync logs
                  </button>
                  <button onClick={() => { toggle(open); setOpenId(null); }}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 hover:bg-[#FDECEC]"
                    style={{ borderColor: T.border, color: T.critical }}>
                    <X size={13} /> Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [26.10] INVOICE UPLOAD
// ═══════════════════════════════════════════════════════════════════
function InvoiceUpload() {
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, any> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback(async (f: File) => {
    setFile(f); setConfirmed(false);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else setPreview(null);
    setBusy(true);
    try {
      const res = await axios.post(`${AI_URL}/v1/ocr`, { file_id: `upload-${f.name}-${f.size}` }, { timeout: 6000 });
      setFields(res.data);
    } catch {
      setFields({ invoice_number: "INV-201", customer_name: "New Customer", amount: 185000, gst: 33300, total: 218300, confidence: 0.88, due_date: "2026-11-15" });
    } finally { setBusy(false); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) onFile(f);
  }, [onFile]);

  const confirm = async () => {
    if (!fields) return;
    setConfirmed(true);
    toast.success(`Logged ${fields.invoice_number}`);
    try { await api.post("/events", { type: "invoice.upload.confirm", payload: fields }); } catch {}
    setTimeout(() => nav("/inbox"), 500);
  };
  const reset = () => { setFile(null); setPreview(null); setFields(null); setConfirmed(false); };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <button onClick={() => nav("/money")}
            className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: T.muted }}>
            <ArrowLeft size={11} /> back
          </button>
          <h1 className="font-display text-3xl tracking-tight mb-1">Capture invoice</h1>
          <p className="text-sm" style={{ color: T.muted }}>Snap, drop, or paste. BizOS reads it and logs it.</p>
        </div>
        {file && (
          <button onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border }}>Upload another</button>
        )}
      </div>

      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop} onClick={() => inputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed p-12 text-center cursor-pointer transition"
          style={{ borderColor: dragOver ? T.primary : T.border, background: dragOver ? T.primarySoft : T.surface }}>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          <motion.div animate={dragOver ? { scale: 1.06 } : { scale: 1 }}
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: T.primarySoft }}>
            <Camera size={26} color={T.primary} strokeWidth={2} />
          </motion.div>
          <div className="font-display text-lg mb-1">Drop an invoice photo here</div>
          <div className="text-sm mb-5" style={{ color: T.muted }}>Or click to browse. JPG, PNG, PDF — up to 10 MB.</div>
          <div className="flex items-center justify-center gap-3 text-[10px] flex-wrap" style={{ color: T.muted }}>
            <span className="flex items-center gap-1"><Check size={10} color={T.good} /> OCR extracted</span>
            <span className="flex items-center gap-1"><ShieldCheck size={10} color={T.good} /> Stored locally</span>
            <span className="flex items-center gap-1"><Zap size={10} color={T.good} /> Auto-reminders</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest px-4 py-3 border-b"
              style={{ borderColor: T.border, color: T.muted }}>
              Preview · {file.name}
            </div>
            <div className="p-4 flex items-center justify-center min-h-[300px]" style={{ background: "#EAE5D9" }}>
              {preview ? (
                <img src={preview} alt="Invoice preview" className="max-w-full max-h-[420px] rounded-lg shadow-lg" />
              ) : (
                <div className="text-center" style={{ color: T.muted }}>
                  <FileText size={32} />
                  <div className="text-xs mt-2">PDF / other — preview unavailable</div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
            <div className="font-display text-base mb-1">Extracted fields</div>
            <div className="text-xs mb-4" style={{ color: T.muted }}>
              {busy ? "Reading…" : fields ? `Confidence ${Math.round((fields.confidence ?? 0.9) * 100)}%` : "Waiting"}
            </div>
            {busy && <div className="h-40 rounded-xl animate-pulse" style={{ background: "rgba(16,24,40,0.05)" }} />}
            {!busy && fields && (
              <div className="space-y-3">
                {Object.entries(fields).filter(([k]) => k !== "confidence").map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 py-2 border-b"
                    style={{ borderColor: T.border }}>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>{k.replace(/_/g, " ")}</div>
                    <div className="text-sm font-medium tabular-nums">
                      {typeof v === "number" ? v.toLocaleString("en-IN") : String(v)}
                    </div>
                  </div>
                ))}
                {fields.confidence !== undefined && (
                  <div className="pt-2"><ConfidenceBar value={fields.confidence} /></div>
                )}
              </div>
            )}
            {!busy && fields && (
              <div className="mt-5 pt-5 border-t flex gap-2" style={{ borderColor: T.border }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={confirm} disabled={confirmed}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                  style={{ background: T.primary }}>
                  {confirmed ? <Check size={14} /> : <Plus size={14} />}
                  {confirmed ? "Logged · opening Inbox…" : "Log invoice"}
                </motion.button>
                <button onClick={reset}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border hover:bg-[#F6F3EC]"
                  style={{ borderColor: T.border }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [27.5] GUARDS · OVERLAYS
// ═══════════════════════════════════════════════════════════════════
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("BizOS crashed:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6"
          style={{ background: T.canvas, color: T.ink }}>
          <div className="max-w-md w-full rounded-2xl border p-8 text-center"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: T.criticalSoft }}>
              <AlertTriangle size={24} color={T.critical} />
            </div>
            <div className="font-display text-xl mb-2">Something broke.</div>
            <p className="text-sm mb-5" style={{ color: T.muted }}>We logged it. Try reloading — or return home.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => window.location.reload()}
                className="text-sm px-4 py-2 rounded-lg font-medium text-white"
                style={{ background: T.primary }}>Reload</button>
              <button onClick={() => { window.location.href = "/bizos/"; }}
                className="text-sm px-4 py-2 rounded-lg border font-medium"
                style={{ borderColor: T.border }}>Go home</button>
            </div>
            <pre className="text-[10px] mt-5 p-3 rounded-lg text-left overflow-auto max-h-32"
              style={{ background: "#F6F3EC", color: T.muted }}>{this.state.error.message}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RequireAuth({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    if (!auth) { setAuthed(isDemoMode()); setChecked(true); return; }
    unsub = onAuthStateChanged(auth, (user: User | null) => {
      setAuthed(!!user || isDemoMode()); setChecked(true);
    });
    return () => { if (unsub) unsub(); };
  }, []);
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.canvas }}>
        <div className="flex items-center gap-3" style={{ color: T.muted }}>
          <Loader2 size={16} className="animate-spin" /><span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }
  if (!authed) return <Landing />;
  return <>{children}</>;
}

function ShortcutsOverlay({ open, onClose, onOpenCopilot, onOpenSearch }: {
  open: boolean; onClose: () => void; onOpenCopilot: () => void; onOpenSearch: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = [
    { label: "Global", items: [
      { k: ["⌘", "K"], label: "Open global search", run: () => { onClose(); onOpenSearch(); } },
      { k: ["⌘", "J"], label: "Toggle Copilot", run: () => { onClose(); onOpenCopilot(); } },
      { k: ["?"], label: "This help", run: () => {} },
      { k: ["Esc"], label: "Close / go back", run: () => {} },
    ]},
    { label: "Inbox", items: [
      { k: ["J"], label: "Next item", run: () => {} }, { k: ["K"], label: "Previous item", run: () => {} },
      { k: ["A"], label: "Approve selected", run: () => {} }, { k: ["R"], label: "Reject selected", run: () => {} },
      { k: ["E"], label: "Edit", run: () => {} }, { k: ["D"], label: "Delegate", run: () => {} },
    ]},
    { label: "Invoice Review", items: [
      { k: ["Enter"], label: "Confirm & next", run: () => {} },
      { k: ["S"], label: "Skip", run: () => {} },
      { k: ["F"], label: "Flag for review", run: () => {} },
    ]},
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-2xl overflow-hidden z-[71] glass-3"
            role="dialog" aria-label="Keyboard shortcuts">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
              <div className="font-display text-lg">Keyboard shortcuts</div>
              <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/60"
                style={{ color: T.muted }} aria-label="Close"><X size={15} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {groups.map((g) => (
                <div key={g.label} className="mb-5 last:mb-0">
                  <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{g.label}</div>
                  <div className="space-y-1">
                    {g.items.map((it, i) => (
                      <button key={i} onClick={it.run}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-[#F6F3EC] transition text-left">
                        <span className="text-sm">{it.label}</span>
                        <span className="flex items-center gap-1">{it.k.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-5 pt-4 border-t text-xs flex items-center gap-2"
                style={{ borderColor: T.border, color: T.muted }}>
                <span>Press</span><Kbd>?</Kbd><span>anytime to reopen this panel.</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [26.11] INVOICES — with left pane list + right detail
// ═══════════════════════════════════════════════════════════════════
type InvoiceFilter = "all" | "overdue" | "paid" | "draft";
type InvoiceSort = "recent" | "amount" | "days_overdue";

function Invoices() {
  const nav = useNavigate();
  const { data: entities, loading } = useEntities();
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [sort, setSort] = useState<InvoiceSort>("days_overdue");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const invoices = useMemo(() => (entities ?? []).filter((e) => e.type === "invoice"), [entities]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (filter === "overdue") list = list.filter((i) => i.data?.status === "overdue");
    else if (filter === "paid") list = list.filter((i) => i.data?.status === "paid");
    else if (filter === "draft") list = list.filter((i) => !i.data?.status || i.data?.status === "draft");
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((i) =>
      (i.name ?? "").toLowerCase().includes(needle) ||
      (i.data?.customer_name ?? "").toLowerCase().includes(needle));
    const arr = [...list];
    if (sort === "amount") arr.sort((a, b) => (b.data?.total ?? 0) - (a.data?.total ?? 0));
    else if (sort === "days_overdue") arr.sort((a, b) => (b.data?.days_overdue ?? 0) - (a.data?.days_overdue ?? 0));
    else arr.sort((a, b) => (b.data?.issued_date ?? "").localeCompare(a.data?.issued_date ?? ""));
    return arr;
  }, [invoices, filter, sort, q]);

  const current = useMemo(
    () => filtered.find((i) => i.id === selected) ?? filtered[0] ?? null,
    [filtered, selected]
  );

  const counts = useMemo(() => ({
    all: invoices.length,
    overdue: invoices.filter((i) => i.data?.status === "overdue").length,
    paid: invoices.filter((i) => i.data?.status === "paid").length,
    draft: invoices.filter((i) => !i.data?.status || i.data?.status === "draft").length,
  }), [invoices]);

  const totalOverdue = invoices
    .filter((i) => i.data?.status === "overdue")
    .reduce((s, i) => s + (i.data?.total ?? 0), 0);

  if (loading) {
    return (
      <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4 animate-pulse">
        <div className="h-[600px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-[600px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>Money</div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Invoices</h1>
          <p className="text-sm" style={{ color: T.muted }}>
            {counts.overdue} overdue · {fmtShort(totalOverdue)} at risk · {invoices.length} total
          </p>
        </div>
        <button onClick={() => nav("/money/upload")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
          style={{ background: T.primary }}>
          <Camera size={12} /> Upload invoice
        </button>
      </div>

      <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4 md:h-[calc(100vh-220px)]">
        {/* LEFT PANE */}
        <div className="rounded-2xl border flex flex-col overflow-hidden h-full"
          style={{ borderColor: T.border, background: T.surface }}>
          <div className="p-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2"
              style={{ background: "#F6F3EC" }}>
              <Search size={13} style={{ color: T.muted }} />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search invoice or customer…"
                className="flex-1 bg-transparent outline-none text-xs"
                style={{ color: T.ink }} />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {(["all", "overdue", "paid", "draft"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition"
                  style={{
                    background: filter === f ? T.primary : "transparent",
                    color: filter === f ? "#fff" : T.muted,
                    border: filter === f ? "none" : `1px solid ${T.border}`,
                  }}>
                  {f} · {counts[f]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px]" style={{ color: T.muted }}>
              <ArrowUpRight size={10} />
              <button onClick={() => setSort("recent")} style={{ color: sort === "recent" ? T.primary : T.muted }}>Recent</button>
              <span>·</span>
              <button onClick={() => setSort("amount")} style={{ color: sort === "amount" ? T.primary : T.muted }}>Amount</button>
              <span>·</span>
              <button onClick={() => setSort("days_overdue")} style={{ color: sort === "days_overdue" ? T.primary : T.muted }}>Days overdue</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="text-sm font-medium mb-1">No invoices</div>
                <div className="text-xs" style={{ color: T.muted }}>Try a different filter.</div>
              </div>
            ) : filtered.map((inv, i) => {
              const status = inv.data?.status ?? "draft";
              const isOverdue = status === "overdue";
              const isPaid = status === "paid";
              const tone = isPaid ? T.good : isOverdue ? (inv.data?.days_overdue > 30 ? T.critical : T.watch) : T.primary;
              const isActive = current?.id === inv.id;
              return (
                <motion.button key={inv.id}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setSelected(inv.id)}
                  className="w-full text-left px-4 py-3 border-t transition"
                  style={{
                    borderColor: T.border,
                    background: isActive ? T.primarySoft : "transparent",
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: T.primary,
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm font-medium truncate">{inv.name}</div>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium shrink-0"
                      style={{
                        background: `${tone}1A`, color: tone,
                      }}>{status}</span>
                  </div>
                  <div className="text-[11px] truncate" style={{ color: T.muted }}>
                    {inv.data?.customer_name ?? "—"}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs font-medium tabular-nums">{fmtShort(inv.data?.total ?? 0)}</div>
                    {inv.data?.days_overdue !== undefined && (
                      <div className="text-[10px]" style={{ color: T.muted }}>
                        {inv.data.days_overdue}d overdue
                      </div>
                    )}
                    {isPaid && inv.data?.paid_date && (
                      <div className="text-[10px]" style={{ color: T.good }}>
                        paid {inv.data.paid_date.slice(5)}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE */}
        {current ? (
          <motion.div key={current.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6 overflow-y-auto h-full"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>
                  Invoice
                </div>
                <h2 className="font-display text-2xl mb-1">{current.name}</h2>
                <div className="text-sm" style={{ color: T.muted }}>
                  {current.data?.customer_name ?? "—"}
                  {current.data?.days_overdue !== undefined && (
                    <> · <span style={{ color: T.critical }}>{current.data.days_overdue}d overdue</span></>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => nav(`/money/invoices/${current.id}/review`)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1.5"
                  style={{ background: T.primary }}>
                  <Edit3 size={12} /> Review
                </button>
                <button onClick={() => toast.success(`Reminder sent for ${current.name}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                  style={{ borderColor: T.border }}>
                  <MessageCircle size={12} /> Remind
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl p-3" style={{ background: "#F6F3EC" }}>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Total</div>
                <div className="text-lg font-bold tabular-nums">{fmtShort(current.data?.total ?? 0)}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#F6F3EC" }}>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>GST</div>
                <div className="text-lg font-bold tabular-nums">{fmtShort(current.data?.gst ?? 0)}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#F6F3EC" }}>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Due</div>
                <div className="text-lg font-bold tabular-nums">{current.data?.due_date?.slice(5) ?? "—"}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#F6F3EC" }}>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>Confidence</div>
                <div className="text-lg font-bold tabular-nums">
                  {Math.round((current.data?.confidence ?? 0.9) * 100)}%
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
                Payment timeline
              </div>
              <div className="relative pl-4 space-y-4">
                <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: T.border }} />
                <div className="relative">
                  <span className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: T.primary }} />
                  <div className="text-sm font-medium">Invoice issued</div>
                  <div className="text-xs" style={{ color: T.muted }}>
                    {current.data?.issued_date ?? "2026-08-06"}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: T.watch }} />
                  <div className="text-sm font-medium">Reminder sent</div>
                  <div className="text-xs" style={{ color: T.muted }}>
                    2 days ago · WhatsApp
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: T.muted }} />
                  <div className="text-sm font-medium" style={{ color: T.muted }}>
                    {current.data?.status === "paid" ? "Payment received" : "Awaiting payment"}
                  </div>
                  <div className="text-xs" style={{ color: T.muted }}>
                    {current.data?.paid_date ?? current.data?.due_date ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
                Suggested next steps
              </div>
              <div className="space-y-2">
                {[
                  { label: "Send final reminder", tone: T.primary, action: () => toast.success("Reminder sent") },
                  { label: "Escalate to owner", tone: T.watch, action: () => toast.success("Escalated") },
                  { label: "Mark as paid", tone: T.good, action: () => toast.success("Marked paid") },
                ].map((s) => (
                  <button key={s.label} onClick={s.action}
                    className="w-full text-left px-3 py-2.5 rounded-lg border hover:bg-[#F6F3EC] transition flex items-center gap-2 text-sm"
                    style={{ borderColor: T.border }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.tone }} />
                    {s.label}
                    <ChevronRight size={12} className="ml-auto" style={{ color: T.muted }} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border p-16 flex items-center justify-center"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-center">
              <Receipt size={32} style={{ color: T.muted }} />
              <div className="text-sm mt-3" style={{ color: T.muted }}>Select an invoice to preview</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [27] AUTHED
// ═══════════════════════════════════════════════════════════════════
function Authed() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me>(DEMO_USER as Me);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>(() => buildNotifications(DEMO_ENTITIES as unknown as Entity[]));
  const { data: entities } = useEntities();
  const { approved } = useApprovals();

  useEffect(() => { setMe(DEMO_USER as Me); }, []);
  useEffect(() => { if (entities) setNotifications(buildNotifications(entities)); }, [entities]);

  const searchIndex = useMemo(() => buildSearchIndex(entities ?? [], []), [entities]);
  const notifUnread = notifications.filter((n) => !n.read).length;

  useHotkeys({
    "k": (e) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); setSearchOpen(true); } },
    "/": (e) => { e.preventDefault(); setSearchOpen(true); },
    "?": (e) => { e.preventDefault(); setShortcutsOpen(true); },
    "j": (e) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); setCopilotOpen(true); } },
  }, true);

  const onLogout = () => logOut();

  return (
    <>
      <Shell me={me} onLogout={onLogout} onCopilot={() => setCopilotOpen(true)}
        onNotify={() => setNotifyOpen(true)} onSearch={() => setSearchOpen(true)}
        badges={{ inbox: inboxBadge + approved }} notifUnread={notifUnread}>
        <Routes>
          <Route path="/" element={<Home me={me} onNavigate={nav} inboxBadge={inboxBadge} />} />
          <Route path="/inbox" element={<Inbox onCountChange={setInboxBadge} />} />
          <Route path="/money" element={<Money />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/money/upload" element={<InvoiceUpload />} />
          <Route path="/money/invoices/:id/review" element={<InvoiceReview />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/live" element={<Live />} />
          <Route path="/settings" element={<Settings me={me} onLogout={onLogout} />} />
          <Route path="/agents" element={<AgentsRegistry />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/whatsapp" element={<WhatsAppMock />} />
          <Route path="/extensions" element={<Extensions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>

      <Copilot open={copilotOpen} onClose={() => setCopilotOpen(false)} />

      <NotificationPanel open={notifyOpen} onClose={() => setNotifyOpen(false)}
        items={notifications}
        onMarkRead={(id) => setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x))}
        onMarkAllRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
        onNavigate={(link) => nav(link)} />

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)}
        index={searchIndex} onNavigate={(link) => nav(link)} />

      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}
        onOpenCopilot={() => setCopilotOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [28] APP
// ═══════════════════════════════════════════════════════════════════
function ApprovalProvider({ children }: { children: ReactNode }) {
  const [approved, setApproved] = useState(0);
  const bump = useCallback(() => setApproved((v) => v + 1), []);
  const reset = useCallback(() => setApproved(0), []);
  return (
    <ApprovalCtx.Provider value={{ approved, bump, reset }}>
      {children}
    </ApprovalCtx.Provider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ApprovalProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding onDone={() => { enableDemo(); window.location.href = "/bizos/"; }} />} />
            <Route path="/*" element={<RequireAuth><Authed /></RequireAuth>} />
          </Routes>
          <Toaster position="bottom-right"
            toastOptions={{ style: { background: T.surface, color: T.ink,
              border: `1px solid ${T.border}`, fontSize: 13, borderRadius: 12 } }} />
        </ApprovalProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

// [29] BOOT
// ═══════════════════════════════════════════════════════════════════
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}