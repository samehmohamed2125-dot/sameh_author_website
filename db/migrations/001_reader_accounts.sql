-- PostgreSQL 15+ / private database only.
-- Run in a transaction using a dedicated migration account.
-- Never commit customer data, secrets, or the manuscript.
BEGIN;

CREATE TABLE IF NOT EXISTS reader_users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reader_users_email_valid CHECK (length(email) BETWEEN 3 AND 254 AND email = lower(btrim(email))),
  CONSTRAINT reader_users_password_hash_format CHECK (password_hash ~ '^scrypt-v1:[0-9a-f]{32}:[0-9a-f]{128}$')
);

CREATE TABLE IF NOT EXISTS reader_sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES reader_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CONSTRAINT reader_sessions_hash_format CHECK (token_hash ~ '^[0-9a-f]{64}$')
);
CREATE INDEX IF NOT EXISTS reader_sessions_user_idx ON reader_sessions(user_id);
CREATE INDEX IF NOT EXISTS reader_sessions_expiry_idx ON reader_sessions(expires_at);

CREATE TABLE IF NOT EXISTS reader_orders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES reader_users(id) ON DELETE RESTRICT,
  book_id text NOT NULL CHECK (book_id = 'baad-menni-wa-menk'),
  amount_minor integer NOT NULL CHECK (amount_minor = 40000),
  currency char(3) NOT NULL CHECK (currency = 'EGP'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  provider text,
  provider_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT reader_orders_paid_timestamp CHECK (status <> 'paid' OR paid_at IS NOT NULL),
  CONSTRAINT reader_orders_provider_payment_unique UNIQUE (provider, provider_payment_id)
);
CREATE INDEX IF NOT EXISTS reader_orders_user_idx ON reader_orders(user_id);

CREATE TABLE IF NOT EXISTS reader_entitlements (
  user_id uuid NOT NULL REFERENCES reader_users(id) ON DELETE CASCADE,
  book_id text NOT NULL CHECK (book_id = 'baad-menni-wa-menk'),
  status text NOT NULL CHECK (status IN ('active','revoked')),
  source_order_id uuid NOT NULL REFERENCES reader_orders(id) ON DELETE RESTRICT,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reader_payment_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  order_id uuid REFERENCES reader_orders(id) ON DELETE SET NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);

COMMIT;
