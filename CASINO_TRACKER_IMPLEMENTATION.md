# Casino Tracker Implementation Guide

## Overview

The Casino Journal has been successfully integrated into PaperEdge as a special type of tracker account. Users can now track casino deposits, withdrawals, balances, and promotional values alongside their sports betting accounts.

## Implementation Summary

### What Was Changed

#### 1. **Account Types** ([src/hooks/useAccounts.ts](src/hooks/useAccounts.ts:9))
   - Added `'casino'` to the Account kind union type
   - Updated from: `'main' | 'offshore' | 'other'`
   - Updated to: `'main' | 'offshore' | 'casino' | 'other'`

#### 2. **Database Schema** ([migrations/add_casino_fields.sql](migrations/add_casino_fields.sql))
   - Added optional casino-specific fields to `account_daily_pl` table:
     - `deposited_usd` - Amount deposited
     - `withdrew_usd` - Amount withdrawn
     - `in_casino` - Current casino balance
     - `usd_value` - Promotional value (bonuses, free plays)
     - `tokens_received` - Loyalty points/rewards
     - `deposit_method` - Payment method used
   - These fields are nullable and only populated for casino accounts

#### 3. **Type Definitions** ([src/hooks/useDailyPL.ts](src/hooks/useDailyPL.ts))
   - Extended `DailyPLEntry` interface with casino transaction fields
   - Updated `DailyPLByDate` to include casino data in byAccount records
   - Modified `upsertValue` function to accept optional `casinoData` parameter

#### 4. **User Interface Components**

   **CreateAccountDialog** ([src/components/tracker/CreateAccountDialog.tsx](src/components/tracker/CreateAccountDialog.tsx:63))
   - Added "Casino" option to account type dropdown

   **EditAccountDialog** ([src/components/tracker/EditAccountDialog.tsx](src/components/tracker/EditAccountDialog.tsx:99))
   - Added "Casino" option to account type dropdown

   **EditDailyPLDialog** ([src/components/tracker/EditDailyPLDialog.tsx](src/components/tracker/EditDailyPLDialog.tsx))
   - Conditionally renders casino-specific fields when account type is 'casino'
   - Auto-calculates NET from deposits/withdrawals
   - Shows enhanced form with:
     - Deposited USD
     - Withdrew USD
     - In Casino (current balance)
     - NET (auto-calculated, read-only)
     - Promo Value USD
     - Tokens Received
     - Deposit Method
     - Notes

#### 5. **Page Updates**
   - **TrackerPage** ([src/pages/TrackerPage.tsx](src/pages/TrackerPage.tsx:141-170))
   - **AccountTrackerPage** ([src/pages/AccountTrackerPage.tsx](src/pages/AccountTrackerPage.tsx:164-195))
   - Both updated to pass `casinoData` to `upsertValue` function

## How to Use

### Step 1: Run Database Migrations

**IMPORTANT**: Before using the casino tracker, you need to run TWO database migrations in order:

#### Migration 1: Update accounts table constraint

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and execute the contents of `migrations/update_accounts_kind_constraint.sql`

This updates the `accounts` table to allow 'casino' as a valid account type.

#### Migration 2: Add casino transaction fields

1. In the same SQL Editor
2. Copy and execute the contents of `migrations/add_casino_fields.sql`

This adds the casino-specific columns to the `account_daily_pl` table.

**Alternatively**, if you have Supabase CLI installed:
```bash
supabase db push
```

### Step 2: Create a Casino Account

1. Navigate to **Bet Tracker** page
2. Click **Add Account**
3. Enter account name (e.g., "DraftKings Casino", "BetMGM Casino")
4. Select **Casino** from the Type dropdown
5. Click **Create**

### Step 3: Track Casino Transactions

1. Click on any date in the calendar
2. For casino accounts, you'll see an enhanced form with:
   - **Deposited USD**: Amount you deposited into the casino
   - **Withdrew USD**: Amount you withdrew from the casino
   - **In Casino**: Current balance remaining in the casino
   - **NET**: Auto-calculated as (Withdrew - Deposited)
   - **Promo Value USD**: Dollar value of bonuses, free plays, etc.
   - **Tokens Received**: Loyalty points or rewards (text field)
   - **Deposit Method**: How you deposited (credit card, crypto, etc.)
   - **Notes**: Additional information (promo codes, observations)

### Step 4: View Casino Performance

- **Monthly Total**: See your casino P&L for the current month
- **YTD Total**: Year-to-date casino performance
- **All-Time Total**: Lifetime casino P&L
- **Individual Account View**: Click on a casino account to see its dedicated calendar

## Features

### Auto-Calculation
When you enter deposits and withdrawals for a casino account, the NET (profit/loss) is automatically calculated. This matches the Casino Journal format where NET = Withdrew - Deposited.

### Net Value Generated
To calculate your total value including promotions:
- **Net Value = NET + Promo Value USD**
- This captures the full value of your casino relationship, including bonuses and promotional offers

### Mixed Account Types
You can have a mix of account types in your tracker:
- Main sportsbooks (standard P&L entry)
- Offshore sportsbooks (standard P&L entry)
- Casino accounts (enhanced transaction fields)
- Other accounts (standard P&L entry)

When viewing daily P&L, each account type shows the appropriate form.

## UX Benefits

✅ **Seamless Integration**: Casino tracking lives alongside sports betting in the same tracker
✅ **Opt-in**: Only visible when you create casino accounts
✅ **Consistent Interface**: Uses the same calendar view you're familiar with
✅ **Auto-calculation**: NET is automatically calculated from deposits/withdrawals
✅ **Comprehensive Tracking**: Captures all Casino Journal fields including promotions
✅ **Individual Views**: Each casino gets its own dedicated calendar
✅ **Aggregated Totals**: Casino P&L rolls up into tracker-wide totals

## Database Fields Mapping

From the Casino Journal spec to PaperEdge:

| Casino Journal Field | PaperEdge Field | Type | Notes |
|---------------------|-----------------|------|-------|
| Deposited USD | `deposited_usd` | DECIMAL(10,2) | Amount deposited |
| Withdrew USD | `withdrew_usd` | DECIMAL(10,2) | Amount withdrawn |
| In Sportsbook | `in_casino` | DECIMAL(10,2) | Current balance |
| NET | `amount` | DECIMAL(10,2) | Auto-calculated |
| USD Value | `usd_value` | DECIMAL(10,2) | Promotional value |
| Tokens Received | `tokens_received` | TEXT | Loyalty rewards |
| Deposit Method | `deposit_method` | TEXT | Payment method |
| Notes | `note` | TEXT | Additional info |

## Technical Notes

### Type Safety
All casino fields are optional and nullable to support:
- Existing non-casino accounts (backwards compatible)
- Partial data entry (you can fill in fields as needed)

### Data Validation
The UI enforces:
- Numeric fields accept decimals (0.01 step)
- Auto-calculation prevents manual NET entry for casino accounts
- All fields are optional (casino transactions can be as detailed or simple as needed)

### Testing
The implementation includes comprehensive test IDs for E2E testing:
- `casino-deposited-{accountId}`
- `casino-withdrew-{accountId}`
- `casino-balance-{accountId}`
- `casino-net-{accountId}`
- `casino-promo-{accountId}`
- `casino-tokens-{accountId}`
- `casino-method-{accountId}`
- `casino-note-{accountId}`

## Future Enhancements

Potential improvements for future iterations:

1. **Net Value Display**: Show calculated Net Value (NET + Promo Value) in the UI
2. **Casino Dashboard**: Aggregated view of all casino accounts with totals
3. **Promo Tracking**: Dedicated section for tracking promotional offers
4. **Export**: CSV export with casino-specific fields for tax preparation
5. **Historical Balance**: Chart showing "In Casino" balance over time
6. **Bonus Hunt Metrics**: Track ROI on signup bonuses and promotions

## Support

If you encounter any issues:
1. Ensure the database migration has been run
2. Check that casino accounts are created with type 'casino'
3. Verify Supabase RLS policies allow the new columns
4. Check browser console for any errors

## Conclusion

The Casino Tracker is now fully integrated into PaperEdge! Users can seamlessly track both sports betting and casino activity in one unified platform, with the flexibility to use only the features they need.
