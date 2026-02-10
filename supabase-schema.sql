-- Supabase SQL Schema - Multi-Tenant Storage
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hjfvoaeoabzlqymkwmxx/sql

-- Storage table (key-value store) - MULTI-TENANT
CREATE TABLE IF NOT EXISTS storage (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'festsmeden',
  key TEXT NOT NULL,
  value TEXT,
  shared BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on project + key + shared
CREATE UNIQUE INDEX IF NOT EXISTS storage_project_key_idx ON storage(project_id, key, shared);

-- Index for fast project lookups
CREATE INDEX IF NOT EXISTS storage_project_idx ON storage(project_id);

-- Enable Row Level Security
ALTER TABLE storage ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (public party app)
CREATE POLICY "Allow all operations" ON storage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS storage_updated_at ON storage;
CREATE TRIGGER storage_updated_at
  BEFORE UPDATE ON storage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
