-- Migration 005: Platform settings table
-- Stores global on/off flags and adjustable values for platform features.
-- Currently used for the driver subscription toggle (off by default).
-- Admin can flip driver_subscription_enabled = true when ready to charge drivers.
-- Add new feature flags here as needed — never hard-code them in app code.

CREATE TABLE IF NOT EXISTS platform_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  -- Human-readable description so any admin knows what the key does
  description TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT        -- firebase UID of admin who last changed it (nullable — system-set rows)
);

-- Seed: driver subscription toggle (off by default)
INSERT INTO platform_settings (key, value, description)
VALUES
  ('driver_subscription_enabled', 'false',  'When true, drivers must pay a monthly subscription to accept jobs'),
  ('driver_plan_amount',          '49',     'Monthly subscription fee for drivers in INR (integer). Only used when driver_subscription_enabled = true'),
  ('driver_plan_currency',        'INR',    'Currency code for driver subscription (ISO 4217)')
ON CONFLICT (key) DO NOTHING;

-- Index not needed (table is tiny — all reads are by PK)
