-- ── Migration 007: service_bookings ─────────────────────────────────────────
-- Separate table for marketplace service bookings (not ride/delivery).
-- These are requests from customers to businesses for services like
-- cleaning, plumbing, electrical work, etc.
-- The BUSINESS (not a driver) accepts or rejects these requests.

CREATE TABLE IF NOT EXISTS service_bookings (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ref             TEXT        UNIQUE NOT NULL,

  -- Parties
  customer_uid    TEXT        NOT NULL,   -- Firebase UID of the customer
  business_uid    TEXT        NOT NULL,   -- Firebase UID of the business owner
  business_id     TEXT        NOT NULL,   -- business_profiles.id

  -- Service details
  category        TEXT        NOT NULL,   -- e.g. 'cleaning', 'electrician'
  service_name    TEXT        NOT NULL,   -- e.g. 'Deep Home Cleaning'
  description     TEXT,                  -- customer notes / requirements

  -- Customer info
  customer_name   TEXT        NOT NULL,
  customer_phone  TEXT        NOT NULL,  -- AES-256-GCM encrypted

  -- Location
  address_label   TEXT        NOT NULL,  -- human-readable address
  address_lat     NUMERIC(9,6),
  address_lon     NUMERIC(9,6),

  -- Scheduling
  requested_date  DATE        NOT NULL,
  requested_time  TEXT        NOT NULL,  -- e.g. '10:00 AM'

  -- Pricing
  quoted_price    NUMERIC(10,2),         -- business can set a quote

  -- Status lifecycle:
  --   pending → accepted | rejected | cancelled
  --   accepted → completed | cancelled
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                      'pending', 'accepted', 'rejected',
                      'cancelled', 'completed'
                    )),

  -- Timestamps
  accepted_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  reject_reason   TEXT,
  cancel_reason   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for customer queries
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer
  ON service_bookings (customer_uid, created_at DESC);

-- Index for business queries
CREATE INDEX IF NOT EXISTS idx_service_bookings_business
  ON service_bookings (business_uid, status, created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_service_bookings_status
  ON service_bookings (status, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_service_bookings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_service_bookings_updated_at ON service_bookings;
CREATE TRIGGER trg_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION set_service_bookings_updated_at();
