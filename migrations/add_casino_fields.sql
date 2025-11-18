-- Add casino-specific transaction fields to account_daily_pl table
-- These fields are optional and only populated for casino-type accounts

ALTER TABLE account_daily_pl
  ADD COLUMN IF NOT EXISTS deposited_usd DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS withdrew_usd DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS in_casino DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS usd_value DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tokens_received TEXT,
  ADD COLUMN IF NOT EXISTS deposit_method TEXT;

-- Add comment to table for documentation
COMMENT ON COLUMN account_daily_pl.deposited_usd IS 'Amount deposited in USD (casino accounts)';
COMMENT ON COLUMN account_daily_pl.withdrew_usd IS 'Amount withdrawn in USD (casino accounts)';
COMMENT ON COLUMN account_daily_pl.in_casino IS 'Current balance remaining in casino (casino accounts)';
COMMENT ON COLUMN account_daily_pl.usd_value IS 'Dollar value of promotional items/bonuses (casino accounts)';
COMMENT ON COLUMN account_daily_pl.tokens_received IS 'Promotional tokens or rewards earned (casino accounts)';
COMMENT ON COLUMN account_daily_pl.deposit_method IS 'Payment method used (e.g., credit card, crypto, bank transfer)';

-- For casino accounts, the amount field (NET) can be auto-calculated as: withdrew_usd - deposited_usd
-- But we'll still allow manual entry for flexibility
