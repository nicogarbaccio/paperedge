-- Remove 'offshore' from valid account kinds
-- This simplifies the account types to just 'main' (sportsbook), 'casino', and 'other'
-- Note: Any existing 'offshore' accounts will need to be manually updated to 'main' before applying this

-- First, drop the existing check constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_kind_check;

-- Add new check constraint without 'offshore'
ALTER TABLE accounts ADD CONSTRAINT accounts_kind_check
  CHECK (kind IN ('main', 'casino', 'other'));
