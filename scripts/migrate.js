// Run all pending migrations: 004, 005, 006, 007
// Usage: node scripts/migrate.js
const { Client } = require('pg')
const c = new Client({ connectionString: process.env.DATABASE_URL })
c.connect()
  .then(() => c.query(`
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rider_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_jobs_rider_id ON jobs (rider_id);
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT
    );
    INSERT INTO platform_settings (key, value, description) VALUES
      ('driver_subscription_enabled','false','Driver subscription toggle'),
      ('driver_plan_amount','49','Monthly driver fee in INR'),
      ('driver_plan_currency','INR','Currency for driver subscription')
    ON CONFLICT (key) DO NOTHING;
    CREATE TABLE IF NOT EXISTS job_messages (
      id BIGSERIAL PRIMARY KEY,
      job_id TEXT NOT NULL,
      sender_uid TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('customer','driver')),
      body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS job_messages_job_id_idx ON job_messages (job_id, created_at);
    CREATE INDEX IF NOT EXISTS job_messages_id_idx ON job_messages (id);
    CREATE TABLE IF NOT EXISTS service_bookings (
      id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
      ref             TEXT        UNIQUE NOT NULL,
      customer_uid    TEXT        NOT NULL,
      business_uid    TEXT        NOT NULL,
      business_id     TEXT        NOT NULL,
      category        TEXT        NOT NULL,
      service_name    TEXT        NOT NULL,
      description     TEXT,
      customer_name   TEXT        NOT NULL,
      customer_phone  TEXT        NOT NULL,
      address_label   TEXT        NOT NULL,
      address_lat     NUMERIC(9,6),
      address_lon     NUMERIC(9,6),
      requested_date  DATE        NOT NULL,
      requested_time  TEXT        NOT NULL,
      quoted_price    NUMERIC(10,2),
      status          TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','accepted','rejected','cancelled','completed')),
      accepted_at     TIMESTAMPTZ,
      rejected_at     TIMESTAMPTZ,
      completed_at    TIMESTAMPTZ,
      cancelled_at    TIMESTAMPTZ,
      reject_reason   TEXT,
      cancel_reason   TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_service_bookings_customer ON service_bookings (customer_uid, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_service_bookings_business ON service_bookings (business_uid, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings (status, created_at DESC);
  `))
  .then(() => { console.log('✓ All migrations done (004-007)!'); c.end() })
  .catch(e => { console.error('ERROR:', e.message); c.end() })
