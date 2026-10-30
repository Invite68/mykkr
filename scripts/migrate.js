// Run all pending migrations: 004, 005, 006
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
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      sender_uid TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('customer','driver')),
      body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS job_messages_job_id_idx ON job_messages (job_id, created_at);
    CREATE INDEX IF NOT EXISTS job_messages_id_idx ON job_messages (id);
  `))
  .then(() => { console.log('✓ All migrations done!'); c.end() })
  .catch(e => { console.error('ERROR:', e.message); c.end() })
