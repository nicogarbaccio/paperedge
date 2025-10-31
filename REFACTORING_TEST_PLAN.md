# Refactoring Test Plan

This document outlines the test scenarios for the Phase 1-3 refactoring work. Use this as a basis for creating Playwright end-to-end tests.

## Phase 1: Code Deduplication & Race Condition Prevention

### 1. P&L Calculation Consistency Tests

**Files Affected:**
- `src/hooks/useDashboard.ts`
- `src/hooks/useNotebooks.ts`
- `src/components/CalendarView.tsx`
- `src/lib/betting.ts` (shared utilities)

**Test Scenarios:**

#### TC-1.1: Dashboard P&L Calculations
**Preconditions:**
- User has at least 3 notebooks with various bets (won, lost, push, pending)

**Steps:**
1. Navigate to Dashboard page
2. Verify "Total P&L" matches sum of all completed bets across notebooks
3. Verify "Win Rate" = (won bets / completed bets) * 100
4. Verify "ROI" = (total P&L / total wagered) * 100

**Expected Result:**
- All three metrics display correct calculations
- Matches manual calculation of underlying bet data

#### TC-1.2: Notebooks List P&L Calculations
**Preconditions:**
- User has multiple notebooks with different bet outcomes

**Steps:**
1. Navigate to Notebooks page
2. For each notebook card, verify:
   - Total P&L matches sum of that notebook's bets
   - Win rate matches (won / completed) for that notebook
   - ROI matches (P&L / wagered) for that notebook

**Expected Result:**
- Each notebook shows independent correct calculations
- Sum of all notebook P&Ls equals dashboard total P&L

#### TC-1.3: Calendar View P&L Calculations
**Preconditions:**
- Open a notebook with bets across multiple days

**Steps:**
1. Open notebook detail page with Calendar view
2. Verify daily P&L amounts:
   - Each day shows correct sum of bets on that date
   - Won bets add return_amount (profit only)
   - Lost bets subtract wager_amount
   - Push/pending bets show no P&L impact
3. Verify monthly P&L total matches sum of daily amounts
4. Verify overall stats at bottom match total calculations

**Expected Result:**
- Daily, monthly, and overall P&L calculations are consistent
- Calendar grid shows correct profit/loss colors (green/red)

#### TC-1.4: P&L Calculation with Edge Cases
**Test Data:**
- Bet 1: Won, $100 wager, +150 odds → +$150 profit
- Bet 2: Lost, $50 wager → -$50 loss
- Bet 3: Push, $75 wager → $0 P&L
- Bet 4: Pending, $25 wager → $0 P&L (not in ROI calc)

**Expected Results:**
- Total P&L: +$100
- Completed bets: 3 (won, lost, push)
- Win Rate: 33.33% (1 won / 3 completed)
- Total Wagered: $225 (only won + lost for ROI)
- ROI: 66.67% ($100 / $150)

---

### 2. Custom Columns Component Tests

**Files Affected:**
- `src/components/CustomColumnsFields.tsx` (new shared component)
- `src/components/CreateBetDialog.tsx` (now uses shared component)
- `src/components/EditBetDialog.tsx` (now uses shared component)

**Test Scenarios:**

#### TC-2.1: Create Bet with Custom Columns
**Preconditions:**
- Notebook has custom columns configured (e.g., Sport, League, Bet Type)

**Steps:**
1. Click "Create Bet" button
2. Click "Show additional fields"
3. Verify custom fields appear:
   - All custom columns from notebook are visible
   - Duplicates (case-insensitive) are filtered out
   - Labels are capitalized correctly
4. For SELECT type columns:
   - Select a predefined option
   - Verify "Other…" option is available
   - Select "Other…" and enter custom text
5. For TEXT/NUMBER type columns:
   - Enter values
6. Submit the bet

**Expected Result:**
- Custom values save correctly to database
- Values appear when editing the bet later
- "Other" text inputs work correctly

#### TC-2.2: Edit Bet with Existing Custom Values
**Preconditions:**
- Bet exists with custom column values already set

**Steps:**
1. Click "Edit" on an existing bet
2. Click "Show additional fields"
3. Verify existing values populate:
   - SELECT fields show current selection
   - If value not in options, shows "Other…" with text input
   - TEXT/NUMBER fields show current values
4. Modify some custom values
5. Save changes

**Expected Result:**
- Existing values load correctly
- Changes persist after save
- "Other" values display correctly in text input

#### TC-2.3: Custom Column "Other" Option Filtering
**Test Data:**
- Custom column "Sport" with options: ["Football", "Basketball", "Other", "Other...", "Other…"]

**Expected Behavior:**
- Dropdown filters out: "other", "other...", "other…" (case-insensitive)
- Single "Other…" option appears at bottom of dropdown
- User can select "Other…" to enter custom text

#### TC-2.4: Custom Column Deduplication
**Test Data:**
- Multiple custom columns with same name (different case):
  - "sport", "Sport", "SPORT"

**Expected Behavior:**
- Only first occurrence renders (case-insensitive deduplication)
- No duplicate fields appear in dialog

#### TC-2.5: Toggle Show/Hide Additional Fields
**Steps:**
1. Open Create or Edit Bet Dialog
2. Custom fields initially hidden
3. Click "Show additional fields"
4. Verify fields expand and button text changes to "Hide additional fields"
5. Click "Hide additional fields"
6. Verify fields collapse

**Expected Result:**
- Toggle works smoothly
- State persists while dialog is open
- No layout shifting issues

---

### 3. Race Condition Prevention Tests

**Files Affected:**
- `src/hooks/useDashboard.ts`
- `src/hooks/useNotebooks.ts`
- `src/hooks/useNotebook.ts`
- `src/hooks/useAccounts.ts`
- `src/hooks/useDailyPL.ts`

**Test Scenarios:**

#### TC-3.1: Rapid Notebook Navigation
**Steps:**
1. Navigate to Notebooks page
2. Rapidly click between different notebooks (3-5 clicks in quick succession)
3. Wait for final notebook to load

**Expected Result:**
- Final notebook displays correct data
- No flickering or incorrect data briefly appearing
- No "Cannot update unmounted component" warnings in console
- Loading state resolves to correct notebook

#### TC-3.2: Navigate Away During Fetch
**Steps:**
1. Navigate to a notebook detail page
2. Immediately navigate back before data loads (< 500ms)
3. Navigate to Dashboard

**Expected Result:**
- No console errors
- No memory leaks
- Correct data loads on Dashboard
- Cancelled fetch doesn't override new data

#### TC-3.3: Account Switching Race Condition
**Preconditions:**
- User has multiple accounts configured

**Steps:**
1. Navigate to Account Tracker page
2. Rapidly switch between accounts (select different accounts quickly)
3. Verify final account loads correctly

**Expected Result:**
- Correct account data displays
- No stale data from previous account
- No console errors

#### TC-3.4: Calendar Date Range Changes
**Preconditions:**
- Open notebook with Calendar view

**Steps:**
1. Rapidly click "next month" 5 times quickly
2. Wait for data to load

**Expected Result:**
- Correct month displays with accurate data
- No data from intermediate months flashes
- Monthly P&L is accurate for final month shown

---

## Phase 2: Type Safety & Error Handling (To be tested after Phase 2)

### 4. Type Safety Improvements

**Files to be Refactored:**
- `src/hooks/useDailyPL.ts` (lines 81-83, 144, 168-169, 199)
- `src/hooks/useAccounts.ts` (line 35)

**Test Scenarios:**

#### TC-4.1: Supabase Response Type Validation
**Steps:**
1. Mock Supabase response with unexpected structure
2. Verify application handles gracefully
3. Check error messages are user-friendly

**Expected Result:**
- No runtime crashes
- Specific error messages (not generic "undefined")
- Data validation catches malformed responses

---

### 5. Error Handling Improvements

**Files to be Refactored:**
- All data hooks (useDailyPL, useNotebook, useNotebooks, useDashboard, etc.)

**Test Scenarios:**

#### TC-5.1: Network Error Handling
**Steps:**
1. Disconnect internet/block Supabase
2. Navigate to Dashboard
3. Attempt to create a bet

**Expected Result:**
- User-friendly error message displays
- Error state is recoverable (retry works)
- Specific error: "Network error" not just generic "Error occurred"

#### TC-5.2: Invalid Input Handling
**Steps:**
1. Create bet with invalid odds (e.g., "abc" instead of number)
2. Create bet with odds = 0
3. Create bet with odds between -99 and +99 (invalid American odds)

**Expected Result:**
- Validation error displays before submission
- Error messages explain what's wrong
- No silent failures

---

### 6. Input Validation

**Files to be Refactored:**
- `src/components/CalendarView.tsx` (lines 108-109)
- `src/components/CreateBetDialog.tsx` (line 223)

**Test Scenarios:**

#### TC-6.1: Bet Date Parsing Validation
**Steps:**
1. Create bet with invalid date string in database
2. Navigate to Calendar view

**Expected Result:**
- Invalid dates show error instead of crashing
- Error message: "Invalid date format for bet [ID]"
- Other valid bets still render

#### TC-6.2: Odds Input Validation
**Steps:**
1. Enter non-numeric odds
2. Enter decimal odds (should be integer)
3. Enter invalid American odds (0, -100, ±50)

**Expected Result:**
- Input field shows validation error in real-time
- Submit button disabled until valid
- Helpful error text: "American odds must be ≤-110 or ≥+100"

---

## Phase 3: Code Quality (To be tested after Phase 3)

### 7. Debug Logging Removal

**Files to be Refactored:**
- `src/lib/supabase.ts` (lines 7-9, 19, 39)
- `src/hooks/useNotebook.ts` (lines 63, 103)
- `src/App.tsx` (lines 67, 112, 122)

**Test Scenarios:**

#### TC-7.1: Production Build Logging
**Steps:**
1. Build production bundle: `npm run build`
2. Serve production build
3. Open browser console
4. Navigate through application

**Expected Result:**
- No console.log statements in production
- Only intentional logging (errors, warnings if configured)
- Console is clean during normal usage

---

## Playwright Test Structure

### Suggested Test Organization

```
tests/
├── refactoring/
│   ├── phase1/
│   │   ├── pl-calculations.spec.ts
│   │   ├── custom-columns.spec.ts
│   │   └── race-conditions.spec.ts
│   ├── phase2/
│   │   ├── type-safety.spec.ts
│   │   └── error-handling.spec.ts
│   └── phase3/
│       └── production-logging.spec.ts
└── fixtures/
    ├── test-data.ts (sample bets, notebooks)
    └── mock-responses.ts (Supabase mocks)
```

---

## Test Data Requirements

### Minimal Test Dataset

```typescript
// Test User
const testUser = {
  email: 'test@example.com',
  password: 'test123'
}

// Test Notebooks
const notebooks = [
  {
    name: 'NFL 2024',
    starting_bankroll: 1000,
    bets: [
      { status: 'won', wager: 100, odds: 150, return: 150 },
      { status: 'lost', wager: 50, odds: -110 },
      { status: 'push', wager: 75, odds: 200 },
      { status: 'pending', wager: 25, odds: -150 }
    ]
  },
  {
    name: 'NBA 2024',
    starting_bankroll: 500,
    bets: [
      { status: 'won', wager: 200, odds: 100, return: 200 },
      { status: 'lost', wager: 150, odds: -120 }
    ]
  }
]

// Custom Columns
const customColumns = [
  { name: 'Sport', type: 'select', options: ['Football', 'Basketball', 'Baseball'] },
  { name: 'League', type: 'select', options: ['NFL', 'NBA', 'MLB', 'Other'] },
  { name: 'Bet Type', type: 'select', options: ['Spread', 'Moneyline', 'Over/Under'] },
  { name: 'Notes', type: 'text' },
  { name: 'Confidence', type: 'number' }
]
```

---

## Manual Testing Checklist (Before Playwright)

Before moving to Phase 2, manually verify:

- [ ] Dashboard calculations are correct
- [ ] Notebook list calculations are correct
- [ ] Calendar view calculations are correct
- [ ] Create bet with custom columns works
- [ ] Edit bet with custom columns works
- [ ] "Other" option in custom columns works
- [ ] Rapid navigation doesn't cause errors
- [ ] No console errors during normal usage
- [ ] Build completes successfully: `npm run build`
- [ ] Type checking passes: `npm run type-check` (if available)

---

## Success Criteria

**Phase 1 is ready for Phase 2 when:**
1. All manual tests pass ✓
2. No regression bugs found
3. Build completes with no errors ✓
4. TypeScript has no errors ✓
5. No console errors in development mode
6. Performance is same or better (no visible slowdowns)

**Ready for Playwright tests when:**
1. All 3 phases complete
2. Manual testing confirms functionality
3. Test data fixtures prepared
4. Test scenarios documented (this file)
