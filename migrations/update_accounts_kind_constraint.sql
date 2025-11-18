-- Update the accounts table to allow 'casino' as a valid kind
-- This removes the old check constraint and adds a new one that includes 'casino'

-- First, drop the existing check constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_kind_check;

-- Add new check constraint that includes 'casino'
ALTER TABLE accounts ADD CONSTRAINT accounts_kind_check
  CHECK (kind IN ('main', 'offshore', 'casino', 'other'));

-- Verify the constraint was added
-- You can run: SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'accounts'::regclass;
