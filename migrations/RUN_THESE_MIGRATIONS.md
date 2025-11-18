# 🚀 Quick Setup: Run These SQL Migrations

Copy and paste these SQL statements into your Supabase SQL Editor in this exact order.

## Step 1: Update accounts table to allow 'casino' type

```sql
-- Update the accounts table to allow 'casino' as a valid kind
-- This removes the old check constraint and adds a new one that includes 'casino'

-- First, drop the existing check constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_kind_check;

-- Add new check constraint that includes 'casino'
ALTER TABLE accounts ADD CONSTRAINT accounts_kind_check
  CHECK (kind IN ('main', 'offshore', 'casino', 'other'));
```

## Step 2: Add casino transaction fields to account_daily_pl

```sql
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
```

## ✅ Verification

After running both migrations, you should be able to:
1. Create a new account with type "Casino"
2. Click on a date and see the enhanced casino transaction form
3. Track deposits, withdrawals, and casino balances

## 🔧 Troubleshooting

If you get an error about the constraint already existing, that's OK - the migrations use `IF EXISTS` and `IF NOT EXISTS` to be safe to run multiple times.

If you still can't create casino accounts after running the migrations, check:
1. Both SQL statements ran successfully without errors
2. You're logged into the correct Supabase project
3. Your user has permissions to create accounts (RLS policies)
