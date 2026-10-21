-- Migration 003: Security hardening
-- Adds:
--   1. audit_log table — tracks privilege escalation and sensitive admin actions
--   2. subscription_payments unique constraint — enables idempotent webhook inserts
--   3. fare_rates table — server-side fare calculation (replaces client-supplied fares)
-- Run: psql $DATABASE_URL -f migrations/003_security_hardening.sql

BEGIN;

-- ── 1. Audit log ──────────────────────────────────────────────────────────────
-- Records sensitive admin actions for compliance and forensics.
-- Append-only (no UPDATE/DELETE granted to app user).
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL     PRIMARY KEY,
  actor_uid   TEXT          NOT NULL,     -- Firebase UID of the actor
  actor_role  TEXT          NOT NULL,     -- role at time of action
  action      TEXT          NOT NULL,     -- e.g. 'role.change', 'subscription.grant'
  target_type TEXT,                       -- e.g. 'user', 'subscription'
  target_id   TEXT,                       -- e.g. user_id or subscription_id
  old_value   JSONB,                      -- previous state (redacted as needed)
  new_value   JSONB,                      -- new state
  ip_address  TEXT,                       -- client IP for forensics
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_actor    ON audit_log (actor_uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target   ON audit_log (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_log (created_at DESC);

-- ── 2. Idempotency constraint on subscription_payments ────────────────────────
-- Ensures ON CONFLICT (razorpay_payment_id) DO NOTHING works in the webhook.
-- If the table/column already exists, the constraint is added safely.
ALTER TABLE subscription_payments
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscription_payments_razorpay_payment_id_key'
  ) THEN
    ALTER TABLE subscription_payments
      ADD CONSTRAINT subscription_payments_razorpay_payment_id_key
      UNIQUE (razorpay_payment_id);
  END IF;
END
$$;

-- ── 3. Fare rates table — server-side fare calculation ────────────────────────
-- The client suggests a fare; the server validates it against this table.
-- Platform admin sets rates; drivers and customers cannot manipulate them.
CREATE TABLE IF NOT EXISTS fare_rates (
  id             SERIAL       PRIMARY KEY,
  vehicle_type   TEXT         NOT NULL,   -- 'auto', 'bike', 'car', 'van', 'truck'
  mode           TEXT         NOT NULL,   -- 'ride' or 'deliver'
  base_fare_paise      INT    NOT NULL DEFAULT 2000,   -- ₹20 base
  per_km_paise         INT    NOT NULL DEFAULT 1000,   -- ₹10/km
  per_min_paise        INT    NOT NULL DEFAULT 100,    -- ₹1/min
  min_fare_paise       INT    NOT NULL DEFAULT 3000,   -- ₹30 minimum
  surge_multiplier     NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_type, mode)
);

-- Seed default fare rates (idempotent — ON CONFLICT DO UPDATE)
INSERT INTO fare_rates (vehicle_type, mode, base_fare_paise, per_km_paise, per_min_paise, min_fare_paise)
VALUES
  ('bike',  'ride',    1500,  800, 50,  2500),
  ('auto',  'ride',    2000, 1200, 80,  3000),
  ('car',   'ride',    3000, 1500, 120, 5000),
  ('van',   'deliver', 4000, 2000, 100, 6000),
  ('truck', 'deliver', 6000, 3000, 150, 9000)
ON CONFLICT (vehicle_type, mode) DO UPDATE
  SET updated_at = NOW();

-- ── 4. Add fare validation columns to jobs ────────────────────────────────────
-- Tracks both what the client claimed and what the server calculated.
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS fare_client_paise  INT,   -- client-supplied estimate
  ADD COLUMN IF NOT EXISTS fare_server_paise  INT,   -- server-calculated from fare_rates
  ADD COLUMN IF NOT EXISTS fare_accepted_paise INT;  -- final agreed fare (set on accept)

COMMIT;
