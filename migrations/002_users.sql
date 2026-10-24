-- ============================================================
-- Migration 002 — Users, Business Profiles, Customers, Drivers, Subscriptions
-- Run:  psql "$DATABASE_URL" -f migrations/002_users.sql
-- Idempotent: safe to re-run (uses IF NOT EXISTS / DO guards).
-- ============================================================

-- ── ENUMS ─────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('business', 'customer', 'driver', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── HELPER: updated_at trigger (reuse from 001 if already exists) ──────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── TABLE: users ──────────────────────────────────────────────────────────────
-- One row per Firebase UID. Role determines which profile table is populated.

CREATE TABLE IF NOT EXISTS users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT        UNIQUE NOT NULL,          -- from Firebase Auth
  phone        TEXT        NOT NULL,                 -- encrypted AES-256-GCM
  role         user_role   NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid_idx ON users (firebase_uid);
CREATE INDEX        IF NOT EXISTS users_role_idx         ON users (role);

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: business_profiles ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS business_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name   TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,          -- URL-safe slug
  description     TEXT,
  category        TEXT        NOT NULL,                 -- top-level category
  sub_category    TEXT,
  logo_url        TEXT,
  photo_urls      TEXT[]      NOT NULL DEFAULT '{}',
  gstin           TEXT,                                 -- GSTIN (optional)
  address_line    TEXT,
  city            TEXT,
  state           TEXT        NOT NULL DEFAULT 'Haryana',
  pin_code        TEXT,
  lat             NUMERIC(9,6),
  lon             NUMERIC(9,6),
  contact_phone   TEXT,                                 -- public contact (encrypted)
  contact_email   TEXT,
  website_url     TEXT,
  opening_time    TEXT,                                 -- "09:00"
  closing_time    TEXT,                                 -- "21:00"
  open_days       TEXT[]      NOT NULL DEFAULT '{}',   -- ["Mon","Tue",…]
  delivery_modes  TEXT[]      NOT NULL DEFAULT '{}',   -- ["self","partner","pickup"]
  kyc_status      kyc_status  NOT NULL DEFAULT 'unverified',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS biz_user_id_idx    ON business_profiles (user_id);
CREATE INDEX IF NOT EXISTS biz_category_idx   ON business_profiles (category);
CREATE INDEX IF NOT EXISTS biz_city_idx       ON business_profiles (city);

DROP TRIGGER IF EXISTS set_biz_updated_at ON business_profiles;
CREATE TRIGGER set_biz_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: customer_profiles ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customer_profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name    TEXT        NOT NULL,
  email        TEXT,
  area         TEXT,
  city         TEXT,
  state        TEXT        NOT NULL DEFAULT 'Haryana',
  pin_code     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS cust_user_id_idx ON customer_profiles (user_id);

DROP TRIGGER IF EXISTS set_cust_updated_at ON customer_profiles;
CREATE TRIGGER set_cust_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: driver_profiles ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS driver_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name       TEXT        NOT NULL,
  vehicle_type    TEXT        NOT NULL,                 -- "Auto", "Bike", "Car", …
  vehicle_number  TEXT        NOT NULL,
  license_number  TEXT,                                 -- encrypted
  aadhaar_last4   TEXT,                                 -- last 4 digits only
  working_area    TEXT,
  city            TEXT,
  state           TEXT        NOT NULL DEFAULT 'Haryana',
  kyc_status      kyc_status  NOT NULL DEFAULT 'unverified',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS driver_user_id_idx ON driver_profiles (user_id);

DROP TRIGGER IF EXISTS set_driver_updated_at ON driver_profiles;
CREATE TRIGGER set_driver_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: subscriptions ──────────────────────────────────────────────────────
-- Only platform subscription fees (₹99/mo business, ₹9.99/mo customer).
-- Customer-to-business payments are DIRECT — never tracked here.

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                  TEXT                NOT NULL,   -- 'business' | 'customer'
  status                subscription_status NOT NULL DEFAULT 'trialing',
  razorpay_sub_id       TEXT                UNIQUE,     -- Razorpay subscription ID
  razorpay_plan_id      TEXT,
  trial_ends_at         TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sub_user_id_idx ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS sub_status_idx  ON subscriptions (status);

DROP TRIGGER IF EXISTS set_sub_updated_at ON subscriptions;
CREATE TRIGGER set_sub_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Subscription payments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_payments (
  id                    BIGSERIAL     PRIMARY KEY,
  user_id               UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id       UUID          REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id   TEXT          UNIQUE,
  amount_paise          INT           NOT NULL,
  currency              TEXT          NOT NULL DEFAULT 'INR',
  status                TEXT          NOT NULL DEFAULT 'pending',  -- pending, captured, failed, refunded
  method                TEXT,                                      -- card, upi, netbanking, wallet
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sp_user_id_idx ON subscription_payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sp_sub_id_idx  ON subscription_payments (subscription_id);

-- ── DONE ──────────────────────────────────────────────────────────────────────
-- Next migration: 003_security_hardening.sql
