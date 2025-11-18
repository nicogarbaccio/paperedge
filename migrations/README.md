# Database Migrations

This directory contains SQL migrations for the PaperEdge database.

## Running Migrations

Since PaperEdge uses Supabase, you can run these migrations through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

Alternatively, you can use the Supabase CLI:

```bash
supabase db push
```

## Migration Files

**Run these migrations in order:**

1. `update_accounts_kind_constraint.sql` - Updates the accounts table to allow 'casino' as a valid account type
2. `add_casino_fields.sql` - Adds casino transaction tracking fields to the `account_daily_pl` table

## Notes

- All migrations use `IF NOT EXISTS` clauses to be idempotent (safe to run multiple times)
- Migrations are designed to be backwards compatible
- New columns are nullable to support existing data
