#!/bin/bash

# Run Casino Tracker Database Migrations
# This script executes the SQL migrations via Supabase REST API

set -e

# Load environment variables
source .env

# Get service role key (you'll need to add this to .env)
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env"
  echo "Please add your service role key to .env file"
  echo "You can find it in: Supabase Dashboard > Settings > API > service_role key"
  exit 1
fi

SUPABASE_URL="${VITE_SUPABASE_URL}"
API_URL="${SUPABASE_URL}/rest/v1/rpc"

echo "Running Casino Tracker Migrations..."
echo "Supabase URL: ${SUPABASE_URL}"
echo ""

# Migration 1: Update accounts kind constraint
echo "Migration 1: Updating accounts table constraint..."
SQL_1="ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_kind_check; ALTER TABLE accounts ADD CONSTRAINT accounts_kind_check CHECK (kind IN ('main', 'offshore', 'casino', 'other'));"

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL_1}\"}"

echo ""
echo "✓ Migration 1 complete"
echo ""

# Migration 2: Add casino fields
echo "Migration 2: Adding casino transaction fields..."
SQL_2="ALTER TABLE account_daily_pl ADD COLUMN IF NOT EXISTS deposited_usd DECIMAL(10, 2), ADD COLUMN IF NOT EXISTS withdrew_usd DECIMAL(10, 2), ADD COLUMN IF NOT EXISTS in_casino DECIMAL(10, 2), ADD COLUMN IF NOT EXISTS usd_value DECIMAL(10, 2), ADD COLUMN IF NOT EXISTS tokens_received TEXT, ADD COLUMN IF NOT EXISTS deposit_method TEXT;"

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL_2}\"}"

echo ""
echo "✓ Migration 2 complete"
echo ""
echo "✅ All migrations completed successfully!"
echo "You can now create casino accounts in PaperEdge."
