-- Migration 002b: Add subscription_payments table (missed in 002)
BEGIN;

CREATE TABLE IF NOT EXISTS subscription_payments (
  id                    BIGSERIAL     PRIMARY KEY,
  user_id               TEXT          NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  subscription_id       BIGINT        REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id   TEXT          UNIQUE,
  amount_paise          INT           NOT NULL,
  currency              TEXT          NOT NULL DEFAULT 'INR',
  status                TEXT          NOT NULL DEFAULT 'pending',
  method                TEXT,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sp_user_id_idx ON subscription_payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sp_sub_id_idx  ON subscription_payments (subscription_id);

COMMIT;
