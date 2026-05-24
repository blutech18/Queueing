CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queues (
  id SERIAL PRIMARY KEY,
  queue_number VARCHAR(20) NOT NULL,
  service_id INTEGER NOT NULL REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'serving', 'skipped', 'completed')),
  counter_number VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS counters (
  id SERIAL PRIMARY KEY,
  counter_name VARCHAR(50) NOT NULL UNIQUE,
  assigned_service_id INTEGER REFERENCES services(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queues_service_status_created
  ON queues (service_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_queues_created_at
  ON queues (created_at);

INSERT INTO services (name, code) VALUES
  ('AD RECORDS', 'AD'),
  ('PMO SERVICE (ESD)', 'PMO'),
  ('ESD', 'ESD'),
  ('PRIORITY LANE', 'PR'),
  ('TERMINAL', 'TR'),
  ('FD-DISBURSEMENT', 'FD'),
  ('PSD-SAFETY', 'PSD'),
  ('PPD', 'PPD'),
  ('ASSESSMENT', 'AS'),
  ('ENCODING', 'EN'),
  ('CASHIER', 'CA'),
  ('MARINE', 'MA')
ON CONFLICT (name) DO UPDATE
SET code = EXCLUDED.code;

INSERT INTO counters (counter_name) VALUES
  ('Counter 1'),
  ('Counter 2'),
  ('Counter 3'),
  ('Counter 4'),
  ('Counter 5')
ON CONFLICT DO NOTHING;
