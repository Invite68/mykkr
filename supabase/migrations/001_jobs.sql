-- ═══════════════════════════════════════════════════════════════════════════
-- My KKR — Jobs (rides + deliveries) state machine
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Status enum ───────────────────────────────────────────────────────
CREATE TYPE job_status AS ENUM (
  'open',                 -- broadcast to drivers, awaiting accept
  'accepted',             -- one driver locked it in
  'driver_en_route',      -- driver heading to pickup
  'picked_up',            -- driver has the passenger / package
  'completed',            -- delivered / ride done
  'cancelled_by_rider',   -- rider cancelled → stays closed
  'cancelled_by_driver'   -- driver cancelled → goes back to open
);

CREATE TYPE job_mode AS ENUM ('ride', 'deliver');

-- ── 2. Jobs table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             text NOT NULL UNIQUE,        -- human-readable e.g. KKR-8821
  mode            job_mode NOT NULL,
  status          job_status NOT NULL DEFAULT 'open',

  -- Customer details (encrypted in app layer before storing)
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,               -- stored encrypted

  -- Locations
  pickup_label    text NOT NULL,
  pickup_lat      double precision NOT NULL,
  pickup_lon      double precision NOT NULL,
  dropoff_label   text NOT NULL,
  dropoff_lat     double precision NOT NULL,
  dropoff_lon     double precision NOT NULL,

  -- Job details
  vehicle_id      text NOT NULL,
  distance_km     double precision,
  fare_estimate   integer,                     -- in paise (₹×100)
  notes           text,
  scheduled_at    timestamptz,                 -- null = ASAP

  -- Assignment
  driver_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_name     text,
  driver_phone    text,
  driver_vehicle  text,

  -- Cancellation
  cancel_reason   text,
  cancel_by       text,                        -- 'rider' | 'driver'

  -- Audit
  created_at      timestamptz NOT NULL DEFAULT now(),
  accepted_at     timestamptz,
  picked_up_at    timestamptz,
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Auto-update updated_at ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. Indexes ───────────────────────────────────────────────────────────
CREATE INDEX idx_jobs_status     ON jobs(status);
CREATE INDEX idx_jobs_driver_id  ON jobs(driver_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_ref        ON jobs(ref);

-- ── 5. Realtime — enable broadcast for this table ────────────────────────
-- Supabase Realtime needs the table in the publication
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

-- ── 6. Row Level Security ─────────────────────────────────────────────────
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can read open jobs (drivers browsing the board)
CREATE POLICY "open jobs visible to all"
  ON jobs FOR SELECT
  USING (status = 'open');

-- Authenticated drivers can read jobs assigned to them
CREATE POLICY "driver sees own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- Anon insert allowed (customers are not authed yet in v1)
-- In production: add a CAPTCHA token check via a server function
CREATE POLICY "customers can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (status = 'open' AND driver_id IS NULL);

-- Only the assigned driver can update status (accept/cancel/progress)
-- Server-side service_role key bypasses RLS for the accept endpoint
CREATE POLICY "driver updates own job"
  ON jobs FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid() OR driver_id IS NULL);

-- ── 7. Atomic accept function (prevents double-accept) ───────────────────
-- Called from the API route — uses service_role to bypass RLS
-- Returns the updated row, or NULL if job already taken
CREATE OR REPLACE FUNCTION accept_job(
  p_job_id    uuid,
  p_driver_id uuid,
  p_driver_name  text,
  p_driver_phone text,
  p_driver_vehicle text
)
RETURNS jobs LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result jobs;
BEGIN
  UPDATE jobs
  SET
    status        = 'accepted',
    driver_id     = p_driver_id,
    driver_name   = p_driver_name,
    driver_phone  = p_driver_phone,
    driver_vehicle = p_driver_vehicle,
    accepted_at   = now()
  WHERE
    id        = p_job_id
    AND status  = 'open'          -- ← MUST still be open
    AND driver_id IS NULL         -- ← MUST not already taken
  RETURNING * INTO result;

  RETURN result;  -- NULL if race condition lost
END;
$$;

-- ── 8. Cancel + re-open function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION cancel_job(
  p_job_id   uuid,
  p_by       text,   -- 'rider' | 'driver'
  p_reason   text DEFAULT NULL
)
RETURNS jobs LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result jobs;
  new_status job_status;
BEGIN
  -- Driver cancel → job goes back to OPEN for other drivers to grab
  -- Rider cancel → job closes (driver already en route = too late)
  IF p_by = 'driver' THEN
    new_status := 'open';
  ELSE
    new_status := 'cancelled_by_rider';
  END IF;

  UPDATE jobs
  SET
    status        = new_status,
    driver_id     = CASE WHEN p_by = 'driver' THEN NULL ELSE driver_id END,
    driver_name   = CASE WHEN p_by = 'driver' THEN NULL ELSE driver_name END,
    driver_phone  = CASE WHEN p_by = 'driver' THEN NULL ELSE driver_phone END,
    cancel_reason = p_reason,
    cancel_by     = p_by,
    cancelled_at  = CASE WHEN p_by = 'rider' THEN now() ELSE NULL END,
    accepted_at   = CASE WHEN p_by = 'driver' THEN NULL ELSE accepted_at END
  WHERE
    id = p_job_id
    AND status IN ('accepted', 'driver_en_route')
  RETURNING * INTO result;

  RETURN result;
END;
$$;
