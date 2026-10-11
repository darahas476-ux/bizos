-- ═══════════════════════════════════════════════════════════════════
-- BizOS — Neon Postgres schema
-- Run once in Neon SQL Editor. Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT,
    business_name TEXT,
    gstin TEXT,
    industry TEXT,
    city TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Entities (customers, invoices, tasks, vendors, esg metrics, docs) ─
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_user_type
    ON entities(user_id, type);

CREATE INDEX IF NOT EXISTS idx_entities_overdue
    ON entities(user_id)
    WHERE type = 'invoice' AND data->>'status' = 'overdue';

CREATE INDEX IF NOT EXISTS idx_entities_open_tasks
    ON entities(user_id)
    WHERE type = 'task' AND data->>'status' IN ('open', 'in_progress');

-- ── Actions (Action Ledger) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    source TEXT,
    rule TEXT,
    approver TEXT,
    result TEXT,
    verified BOOLEAN DEFAULT FALSE,
    hash TEXT,
    anchor_time TIMESTAMPTZ,
    reference TEXT,
    entity_id UUID,
    fiscal_period TEXT,
    tenant_salt_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_user_created
    ON actions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_actions_hash
    ON actions(hash);

-- ── Anchors (Merkle / verify layer) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS anchors (
    hash TEXT PRIMARY KEY,
    reference TEXT,
    tenant TEXT DEFAULT 'sharma-industries',
    anchored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anchors_tenant
    ON anchors(tenant, anchored_at DESC);

-- ── Events (idempotency-aware event sink) ───────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_created
    ON events(user_id, created_at DESC);

-- ── Policy table (CPSS §2.18 seed) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS policy (
    rule_id TEXT PRIMARY KEY,
    verb TEXT NOT NULL,
    entity TEXT NOT NULL,
    max_amount BIGINT,
    role_required TEXT,
    always_gate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO policy (rule_id, verb, entity, max_amount, role_required, always_gate) VALUES
    ('P-001', 'send_reminder', 'invoice', 500000, 'Manager', 'top-5 customer'),
    ('P-002', 'send_reminder', 'invoice', NULL,   'Owner',   NULL),
    ('P-003', 'push_entry',    'tally',   100000, 'Accountant', NULL),
    ('P-004', 'file_return',   'gst',     NULL,   'CA + Owner', NULL)
ON CONFLICT (rule_id) DO NOTHING;

-- ── Memberships (CPSS §3.1) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    role TEXT NOT NULL,
    scope TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- ── Delegations (CPSS §3.4) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delegations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Dead-letter queue (CPSS §2.20) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extension_id TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- Done. Next: seed the demo tenant.
-- Run locally:  cd ai && python seed.py
-- ═══════════════════════════════════════════════════════════════════