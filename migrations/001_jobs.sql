-- ─────────────────────────────────────────────────────────────────────────────
-- MyKKR — Jobs table migration
-- Run once against your PostgreSQL database.
--
-- In Coolify:
--   1. Open your PostgreSQL service → Terminal (or use psql)
--   2. Connect to your app database
--   3. Paste and run this file
--
-- Or run from the VPS:
--   psql "$DATABASE_URL" -f migrations/001_jobs.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM (
    'open',
    'accepted',
    'driver_en_route',
    'picked_up',
    'completed',
    'cancelled_by_rider',
    'cancelled_by_driver'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_mode AS ENUM ('ride', 'deliver');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Jobs table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             TEXT        NOT NULL UNIQUE,        -- human-readable e.g. KKR-A1B2

  mode            job_mode    NOT NULL,
  status          job_status  NOT NULL DEFAULT 'open',

  -- Customer (phone stored AES-256-GCM encrypted)
  customer_name   TEXT        NOT NULL,
  customer_phone  TEXT        NOT NULL,

  -- Route
  pickup_label    TEXT        NOT NULL,
  pickup_lat      DOUBLE PRECISION NOT NULL,
  pickup_lon      DOUBLE PRECISION NOT NULL,
  dropoff_label   TEXT        NOT NULL,
  dropoff_lat     DOUBLE PRECISION NOT NULL,
  dropoff_lon     DOUBLE PRECISION NOT NULL,

  -- Job details
  vehicle_id      TEXT        NOT NULL,
  distance_km     NUMERIC(8,2),
  fare_estimate   INTEGER,                            -- paise (₹1 = 100 paise)
  notes           TEXT,
  scheduled_at    TIMESTAMPTZ,

  -- Driver (null until accepted)
  driver_id       TEXT,
  driver_name     TEXT,
  driver_phone    TEXT,                               -- AES-256-GCM encrypted
  driver_vehicle  TEXT,

  -- Cancellation
  cancel_by       TEXT,
  cancel_reason   TEXT,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  picked_up_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS jobs_status_idx    ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_ref_idx       ON jobs (ref);
CREATE INDEX IF NOT EXISTS jobs_driver_idx    ON jobs (driver_id);
CREATE INDEX IF NOT EXISTS jobs_created_idx   ON jobs (created_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
