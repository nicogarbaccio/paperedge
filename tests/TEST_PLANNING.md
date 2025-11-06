# PaperEdge Comprehensive Test Planning Document

## Executive Summary

### Overview
This document outlines the complete testing strategy for the PaperEdge sports betting analytics application, including detailed test scenarios, test file organization, test ID requirements, and implementation phases.

**Updated**: Streamlined to focus on core functionality with manual testing for edge cases.

### Key Metrics (Updated)
- **Total Estimated Tests**: ~219 E2E tests (reduced from 292, 25% reduction)
- **Coverage Target**: 95%+ code coverage
- **Test Files**: 22 test specification files
- **Estimated Test IDs Needed**: 180+ data-testid attributes
- **Implementation Timeline**: 6 phases (6-8 weeks)

### Test Count by Phase
- **Phase 1 (Auth)**: 58 tests (unchanged - already completed)
- **Phase 2 (Notebooks)**: 39 tests ✅ COMPLETED (reduced from 68)
- **Phase 3 (Bets)**: 47 tests (reduced from 86)
- **Phase 4 (Tracker)**: 36 tests (reduced from 62)
- **Phase 5 (Advanced)**: 55 tests (reduced from 96)
- **Phase 6 (Non-Functional)**: 42 tests (reduced from 78)

### Philosophy
Focus on **core functionality** and **critical user paths**. Edge cases (special characters, very large values, bulk operations, concurrent updates, etc.) will be covered through manual testing during development.

### Test ID Audit Summary
Current state analysis reveals that most components lack `data-testid` attributes. An estimated **180+ test IDs** need to be added across:
- 35% in form inputs and interactive controls
- 25% in navigation and routing elements
- 20% in dialogs and modals
- 15% in data display components (tables, lists, cards)
- 5% in feedback/status indicators

### Risk Areas and Priorities

**Critical Path (P0 - Must Have):**
- Authentication flows (login, register, password reset)
- Notebook CRUD operations
- Bet CRUD operations
- Data persistence and RLS policies

**High Priority (P1 - Should Have):**
- Custom fields functionality
- Tracker and calendar views
- Search and filtering
- Settings management

**Medium Priority (P2 - Nice to Have):**
- Calculators functionality
- Analytics dashboards
- Responsive design validation
- Performance benchmarks

---

## Feature-Based Test Matrix

| Feature | Test File Path | Test Count | Priority | Status | Test ID Coverage |
|---------|---------------|------------|----------|--------|------------------|
| **Authentication** |
| Login | `tests/e2e/auth/login.spec.ts` | 18 | P0 | Planned | 0% |
| Registration | `tests/e2e/auth/register.spec.ts` | 16 | P0 | Planned | 0% |
| Password Reset | `tests/e2e/auth/password-reset.spec.ts` | 14 | P0 | Planned | 0% |
| OAuth (Google) | `tests/e2e/auth/oauth.spec.ts` | 10 | P1 | Planned | 0% |
| **Notebooks** |
| Notebook CRUD | `tests/e2e/notebooks/crud.spec.ts` | 13 | P0 | ✅ Complete | 100% |
| Custom Columns | `tests/e2e/notebooks/custom-columns.spec.ts` | 12 | P1 | ✅ Complete | 100% |
| Navigation | `tests/e2e/notebooks/navigation.spec.ts` | 6 | P1 | ✅ Complete | 100% |
| Search & Filter | `tests/e2e/notebooks/search-filter.spec.ts` | 8 | P1 | ✅ Complete | 100% |
| **Bets** |
| Bet CRUD | `tests/e2e/bets/crud.spec.ts` | 15 | P0 | Planned | 0% |
| Bet Custom Fields | `tests/e2e/bets/custom-fields.spec.ts` | 10 | P1 | Planned | 0% |
| Bet Validation | `tests/e2e/bets/validation.spec.ts` | 10 | P1 | Planned | 0% |
| Bet Search | `tests/e2e/bets/search.spec.ts` | 6 | P1 | Planned | 0% |
| Bet Status Updates | `tests/e2e/bets/status.spec.ts` | 6 | P0 | Planned | 0% |
| **Tracker** |
| Calendar View | `tests/e2e/tracker/calendar.spec.ts` | 12 | P1 | Planned | 0% |
| Accounts CRUD | `tests/e2e/tracker/accounts.spec.ts` | 10 | P1 | Planned | 0% |
| Daily P&L | `tests/e2e/tracker/daily-pl.spec.ts` | 8 | P1 | Planned | 0% |
| Aggregations | `tests/e2e/tracker/aggregations.spec.ts` | 6 | P1 | Planned | 0% |
| **Dashboard** |
| Dashboard Overview | `tests/e2e/dashboard/overview.spec.ts` | 10 | P1 | Planned | 0% |
| **Calculators** |
| Kelly Calculator | `tests/e2e/calculators/kelly.spec.ts` | 6 | P2 | Planned | 0% |
| Arbitrage Calculator | `tests/e2e/calculators/arbitrage.spec.ts` | 6 | P2 | Planned | 0% |
| Parlay Calculator | `tests/e2e/calculators/parlay.spec.ts` | 5 | P2 | Planned | 0% |
| Unit Betting Calculator | `tests/e2e/calculators/unit-betting.spec.ts` | 5 | P2 | Planned | 0% |
| **Settings** |
| Settings Page | `tests/e2e/settings/settings.spec.ts` | 8 | P1 | Planned | 0% |
| **Support & Admin** |
| Support System | `tests/e2e/support/support.spec.ts` | 6 | P2 | Planned | 0% |
| Admin Dashboard | `tests/e2e/admin/admin.spec.ts` | 5 | P2 | Planned | 0% |
| **FAQs** |
| FAQs Page | `tests/e2e/faqs/faqs.spec.ts` | 4 | P2 | Planned | 0% |
| **Responsive** |
| Mobile Layout | `tests/e2e/responsive/mobile.spec.ts` | 10 | P2 | Planned | 0% |
| Tablet Layout | `tests/e2e/responsive/tablet.spec.ts` | 8 | P2 | Planned | 0% |
| **Performance** |
| Page Load Performance | `tests/e2e/performance/page-load.spec.ts` | 6 | P2 | Planned | 0% |
| Data Load Performance | `tests/e2e/performance/data-load.spec.ts` | 4 | P2 | Planned | 0% |
| **Accessibility** |
| Keyboard Navigation | `tests/e2e/a11y/keyboard.spec.ts` | 8 | P2 | Planned | 0% |
| Screen Reader | `tests/e2e/a11y/screen-reader.spec.ts` | 6 | P2 | Planned | 0% |
| **TOTAL** | | **219** | | | **18% (39/219)** |

---

## Test File Organization Structure

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts (18 tests)
│   │   ├── register.spec.ts (16 tests)
│   │   ├── password-reset.spec.ts (14 tests)
│   │   └── oauth.spec.ts (10 tests)
│   ├── notebooks/
│   │   ├── crud.spec.ts (24 tests)
│   │   ├── custom-columns.spec.ts (18 tests)
│   │   ├── navigation.spec.ts (12 tests)
│   │   └── search-filter.spec.ts (14 tests)
│   ├── bets/
│   │   ├── crud.spec.ts (28 tests)
│   │   ├── custom-fields.spec.ts (20 tests)
│   │   ├── validation.spec.ts (16 tests)
│   │   ├── search.spec.ts (12 tests)
│   │   └── status.spec.ts (10 tests)
│   ├── tracker/
│   │   ├── calendar.spec.ts (20 tests)
│   │   ├── accounts.spec.ts (16 tests)
│   │   ├── daily-pl.spec.ts (14 tests)
│   │   └── aggregations.spec.ts (12 tests)
│   ├── dashboard/
│   │   └── overview.spec.ts (18 tests)
│   ├── calculators/
│   │   ├── kelly.spec.ts (12 tests)
│   │   ├── arbitrage.spec.ts (12 tests)
│   │   ├── parlay.spec.ts (10 tests)
│   │   └── unit-betting.spec.ts (10 tests)
│   ├── settings/
│   │   └── settings.spec.ts (14 tests)
│   ├── support/
│   │   └── support.spec.ts (12 tests)
│   ├── admin/
│   │   └── admin.spec.ts (10 tests)
│   ├── faqs/
│   │   └── faqs.spec.ts (8 tests)
│   ├── responsive/
│   │   ├── mobile.spec.ts (20 tests)
│   │   └── tablet.spec.ts (14 tests)
│   ├── performance/
│   │   ├── page-load.spec.ts (10 tests)
│   │   └── data-load.spec.ts (8 tests)
│   └── a11y/
│       ├── keyboard.spec.ts (14 tests)
│       └── screen-reader.spec.ts (12 tests)
├── fixtures/
│   ├── auth-fixtures.ts (user data, auth helpers)
│   ├── notebook-fixtures.ts (notebook test data)
│   ├── bet-fixtures.ts (bet test data)
│   ├── tracker-fixtures.ts (tracker test data)
│   └── helpers.ts (common test utilities)
└── global-setup.ts (test environment setup)
```

---

## Phase Breakdown

### Phase 1: Core Authentication & Setup (Week 1-2)
**Objective**: Establish authentication foundation and test infrastructure

**Scope:**
- User authentication (login, register, logout)
- Password reset flows
- OAuth integration (Google)
- Protected route guards
- Session management

**Test Files:**
- `tests/e2e/auth/login.spec.ts`
- `tests/e2e/auth/register.spec.ts`
- `tests/e2e/auth/password-reset.spec.ts`
- `tests/e2e/auth/oauth.spec.ts`

**Estimated Test Count**: 58 tests

**Test IDs Needed (38 total):**
```
Auth Pages:
[ ] login-email-input
[ ] login-password-input
[ ] login-submit-button
[ ] login-error-message
[ ] login-google-button
[ ] login-forgot-password-link
[ ] login-register-link

[ ] register-email-input
[ ] register-password-input
[ ] register-confirm-password-input
[ ] register-submit-button
[ ] register-error-message
[ ] register-success-message
[ ] register-login-link

[ ] reset-password-email-input
[ ] reset-password-submit-button
[ ] reset-password-success-message
[ ] reset-password-error-message

[ ] new-password-input
[ ] new-password-confirm-input
[ ] new-password-submit-button
[ ] new-password-error-message
[ ] new-password-success-message

Navigation:
[ ] header-user-menu
[ ] header-logout-button
[ ] header-settings-link
[ ] header-dashboard-link

Protected Routes:
[ ] protected-route-redirect
[ ] loading-spinner
[ ] auth-toast-message
```

**Test Scenarios:**

#### Login (18 tests)
1. **Happy Path (6 tests)**
   - Successful login with valid credentials
   - Redirect to dashboard after login
   - Remember me functionality
   - Google OAuth login
   - Persist session across page refresh
   - Display welcome toast on login

2. **Error Scenarios (8 tests)**
   - Invalid email format validation
   - Wrong password error
   - Non-existent user error
   - Empty field validation
   - Network error handling
   - Rate limiting behavior
   - Expired session redirect
   - OAuth cancellation handling

3. **Edge Cases (4 tests)**
   - Already authenticated user redirects from login
   - Case-insensitive email handling
   - Whitespace trimming in email
   - SQL injection attempt protection

#### Register (16 tests)
1. **Happy Path (5 tests)**
   - Successful registration with valid data
   - Auto-login after registration
   - Email confirmation sent
   - Redirect to dashboard
   - Display success toast

2. **Error Scenarios (7 tests)**
   - Email already exists error
   - Weak password validation
   - Password mismatch validation
   - Invalid email format
   - Required field validation
   - Network error handling
   - Email delivery failure

3. **Edge Cases (4 tests)**
   - Password strength meter
   - Show/hide password toggle
   - Terms acceptance checkbox
   - XSS attack protection

#### Password Reset (14 tests)
1. **Happy Path (5 tests)**
   - Request reset link with valid email
   - Reset email received
   - Reset token validation
   - Successfully update password
   - Auto-login after reset

2. **Error Scenarios (6 tests)**
   - Invalid email format
   - Non-existent email
   - Expired reset token
   - Mismatched new passwords
   - Weak new password
   - Reset token already used

3. **Edge Cases (3 tests)**
   - Multiple reset requests
   - Reset link expiration time
   - Password history validation

#### OAuth (10 tests)
1. **Happy Path (4 tests)**
   - Successful Google OAuth flow
   - Profile data retrieved
   - Auto-create account if new user
   - Redirect to dashboard

2. **Error Scenarios (4 tests)**
   - OAuth cancellation
   - OAuth provider error
   - Network interruption
   - Missing required scopes

3. **Edge Cases (2 tests)**
   - Linking existing email account
   - Multiple OAuth provider support

---

### Phase 2: Notebook Management (Week 2-3) ✅ COMPLETED
**Objective**: Test notebook creation, editing, deletion, and organization

**Scope:**
- Notebook CRUD operations
- Custom column management
- Notebook navigation
- Search and filtering
- Color coding

**Test Files:**
- `tests/e2e/notebooks/crud.spec.ts` (13 tests)
- `tests/e2e/notebooks/custom-columns.spec.ts` (12 tests)
- `tests/e2e/notebooks/navigation.spec.ts` (6 tests)
- `tests/e2e/notebooks/search-filter.spec.ts` (8 tests)

**Actual Test Count**: 39 tests (reduced from 68, removed edge cases)
**Status**: ✅ All tests passing (39/39 - 100%)

**Test IDs Needed (42 total):**
```
Notebooks Page:
[ ] notebooks-page-title
[ ] create-notebook-button
[ ] notebooks-grid
[ ] notebook-card
[ ] notebook-card-title
[ ] notebook-card-stats
[ ] notebook-card-color-indicator
[ ] notebook-search-input
[ ] notebook-filter-dropdown
[ ] notebook-sort-dropdown
[ ] notebooks-empty-state

Create/Edit Notebook Dialog:
[ ] notebook-dialog
[ ] notebook-dialog-title
[ ] notebook-name-input
[ ] notebook-description-input
[ ] notebook-color-picker
[ ] notebook-save-button
[ ] notebook-cancel-button
[ ] notebook-delete-button
[ ] notebook-dialog-error

Custom Columns:
[ ] custom-columns-section
[ ] add-custom-column-button
[ ] custom-column-name-input
[ ] custom-column-type-select
[ ] custom-column-category-select
[ ] custom-column-save-button
[ ] custom-column-delete-button
[ ] custom-column-list
[ ] custom-column-item
[ ] custom-column-reorder-handle

Notebook Detail:
[ ] notebook-detail-title
[ ] notebook-detail-description
[ ] edit-notebook-button
[ ] delete-notebook-confirm-dialog
[ ] back-to-notebooks-link
```

**Test Scenarios:**

#### Notebook CRUD (24 tests)
1. **Happy Path (8 tests)**
   - Create new notebook with name only
   - Create notebook with name and description
   - Create notebook with custom color
   - Edit notebook name
   - Edit notebook description
   - Edit notebook color
   - Delete notebook (with confirmation)
   - View notebook details

2. **Error Scenarios (10 tests)**
   - Create notebook without name (validation)
   - Duplicate notebook name handling
   - Edit non-existent notebook (404)
   - Delete notebook with bets (cascade warning)
   - Unauthorized access to other user's notebook
   - Network error during save
   - Concurrent edit conflict
   - Character limit validation (name, description)
   - Special characters in name
   - SQL injection attempt

3. **Edge Cases (6 tests)**
   - Maximum notebooks limit
   - Notebook with very long name/description
   - Notebook with emoji in name
   - Notebook color persistence
   - Delete last notebook
   - Navigate away with unsaved changes

#### Custom Columns (18 tests)
1. **Happy Path (6 tests)**
   - Add market category custom column
   - Add sportsbook category custom column
   - Edit custom column name
   - Delete custom column
   - Reorder custom columns
   - Custom column persists to bets

2. **Error Scenarios (8 tests)**
   - Duplicate column name validation
   - Empty column name validation
   - Delete column with data (warning)
   - Maximum columns limit
   - Invalid column type
   - Column name character limit
   - Special characters in column name
   - Unauthorized column modification

3. **Edge Cases (4 tests)**
   - Column display order (Market before Sportsbook)
   - Column type conversion with existing data
   - Bulk delete columns
   - Import/export custom columns

#### Navigation (12 tests)
1. **Happy Path (4 tests)**
   - Navigate from notebooks list to detail
   - Navigate back to notebooks list
   - Sidebar navigation to notebooks
   - Direct URL access to notebook

2. **Error Scenarios (5 tests)**
   - Invalid notebook ID in URL
   - Non-existent notebook ID (404)
   - Unauthorized notebook access (redirect)
   - Malformed UUID in URL
   - Protected route without auth

3. **Edge Cases (3 tests)**
   - Browser back/forward navigation
   - Refresh notebook detail page
   - Deep link to notebook detail

#### Search & Filter (14 tests)
1. **Happy Path (5 tests)**
   - Search notebooks by name
   - Filter notebooks by color
   - Sort notebooks by name
   - Sort notebooks by date created
   - Sort notebooks by P&L

2. **Error Scenarios (4 tests)**
   - Search with no results
   - Invalid search query
   - Search with special characters
   - Filter with no matches

3. **Edge Cases (5 tests)**
   - Search performance with many notebooks
   - Case-insensitive search
   - Partial match search
   - Clear search/filters
   - Combine search and filters

---

### Phase 3: Bet Operations (Week 3-4)
**Objective**: Test comprehensive bet management functionality

**Scope:**
- Bet CRUD operations
- Custom field support
- Bet validation logic
- Bet search and filtering
- Status updates

**Test Files:**
- `tests/e2e/bets/crud.spec.ts` (~15 tests - core CRUD, validation errors)
- `tests/e2e/bets/custom-fields.spec.ts` (~10 tests - basic custom field functionality)
- `tests/e2e/bets/validation.spec.ts` (~10 tests - odds/wager/date validation)
- `tests/e2e/bets/search.spec.ts` (~6 tests - search, filter, sort basics)
- `tests/e2e/bets/status.spec.ts` (~6 tests - status updates, P&L calculation)

**Estimated Test Count**: 47 tests (reduced from 86, focus on core functionality)
**Note**: Removed edge cases like very large values, special characters, emoji handling, bulk operations

**Test IDs Needed (48 total):**
```
Bets List (Notebook Detail):
[ ] bets-list
[ ] bet-card
[ ] bet-description
[ ] bet-odds
[ ] bet-wager
[ ] bet-status
[ ] bet-date
[ ] bet-profit-loss
[ ] bet-actions-menu
[ ] edit-bet-button
[ ] delete-bet-button
[ ] bets-empty-state

Create/Edit Bet Dialog:
[ ] bet-dialog
[ ] bet-dialog-title
[ ] bet-description-input
[ ] bet-odds-input
[ ] bet-wager-input
[ ] bet-date-input
[ ] bet-status-select
[ ] bet-result-input
[ ] bet-payout-display
[ ] bet-profit-display
[ ] bet-save-button
[ ] bet-cancel-button
[ ] bet-dialog-error

Custom Fields:
[ ] bet-custom-field-input
[ ] bet-custom-field-dropdown
[ ] market-custom-field-section
[ ] sportsbook-custom-field-section

Bet Search:
[ ] bet-search-input
[ ] bet-search-clear-button
[ ] bet-filter-status-dropdown
[ ] bet-filter-date-range
[ ] bet-sort-dropdown
[ ] bet-view-toggle (history/calendar)

Bet Actions:
[ ] bet-mark-won-button
[ ] bet-mark-lost-button
[ ] bet-mark-void-button
[ ] bet-mark-pending-button
[ ] bet-quick-edit-button
[ ] bet-duplicate-button
```

**Test Scenarios (Streamlined - Focus on Core Functionality):**

#### Bet CRUD (~15 tests)
1. **Happy Path (8 tests)**
   - Create bet with required fields only
   - Create bet with all fields
   - Create bet with custom fields
   - Edit bet description
   - Edit bet odds/wager
   - Edit bet status
   - Delete bet with confirmation
   - View bet details

2. **Error Scenarios (7 tests)**
   - Create bet without description (required field)
   - Invalid odds format
   - Negative/zero wager amount
   - Empty required fields
   - Cancel button in create/edit dialogs
   - Network error during save
   - Unauthorized bet edit

**Removed**: Very large values, emoji handling, bulk operations, duplicate bet, character limits, SQL injection tests

#### Custom Fields (~10 tests)
1. **Happy Path (6 tests)**
   - Create bet with market custom field
   - Create bet with sportsbook custom field
   - Create bet without custom fields (optional)
   - Edit custom field value
   - Display custom fields in bet card
   - Toggle custom fields panel

2. **Error Scenarios (4 tests)**
   - Handle missing custom columns
   - Handle empty custom field values
   - Don't block submission with invalid types
   - Maintain form state on validation fail

**Removed**: Special characters, bulk updates, export, backward compatibility, filter/sort by custom fields

#### Validation (~10 tests)
1. **Odds Validation (4 tests)**
   - Positive American odds (+100, +150)
   - Negative American odds (-110, -200)
   - Invalid odds formats
   - Odds calculation accuracy

2. **Wager Validation (3 tests)**
   - Zero/negative wager validation
   - Decimal precision
   - Required field validation

3. **Date Validation (3 tests)**
   - Date picker functionality
   - Future date handling
   - Invalid date format

**Removed**: Min/max limits, currency formatting, date localization, edge case values

#### Search (~6 tests)
1. **Happy Path (4 tests)**
   - Search bets by description
   - Filter by status (Won/Lost/Pending/Void)
   - Sort by date
   - Clear search/filters

2. **Error Scenarios (2 tests)**
   - Search with no results
   - Handle empty search

**Removed**: Date range filters, sort by P&L, case-insensitive search, partial match, combine filters, timeout handling

#### Status Updates (~6 tests)
1. **Happy Path (4 tests)**
   - Mark bet as Won (calculates profit)
   - Mark bet as Lost (calculates loss)
   - Mark bet as Void (no P&L impact)
   - Mark bet as Pending

2. **Error Scenarios (2 tests)**
   - Status update validation (requires odds/wager)
   - Handle status update errors

**Removed**: Bulk updates, concurrent updates, unauthorized changes, notifications

---

### Phase 4: Tracker & Aggregations (Week 4-5)
**Objective**: Test tracker functionality and data aggregations

**Scope:**
- Calendar view
- Accounts management
- Daily P&L tracking
- Data aggregations and calculations

**Test Files:**
- `tests/e2e/tracker/calendar.spec.ts` (~12 tests - display, navigation, edit P&L)
- `tests/e2e/tracker/accounts.spec.ts` (~10 tests - CRUD, validation)
- `tests/e2e/tracker/daily-pl.spec.ts` (~8 tests - add/edit/delete P&L)
- `tests/e2e/tracker/aggregations.spec.ts` (~6 tests - monthly/yearly/all-time totals)

**Estimated Test Count**: 36 tests (reduced from 62, focus on core functionality)
**Note**: Removed edge cases like leap year handling, very large values, bulk imports, concurrent updates

**Test IDs Needed (36 total):**
```
Tracker Page:
[ ] tracker-page-title
[ ] tracker-calendar-view
[ ] tracker-month-navigation
[ ] tracker-prev-month-button
[ ] tracker-next-month-button
[ ] tracker-current-month-display
[ ] tracker-calendar-grid
[ ] tracker-day-cell
[ ] tracker-day-date
[ ] tracker-day-pl-value
[ ] tracker-monthly-total
[ ] tracker-yearly-total
[ ] tracker-all-time-total

Accounts:
[ ] tracker-accounts-list
[ ] create-account-button
[ ] account-card
[ ] account-name
[ ] account-balance
[ ] account-pl
[ ] edit-account-button
[ ] delete-account-button
[ ] view-account-details-link

Daily P&L:
[ ] daily-pl-dialog
[ ] daily-pl-date
[ ] daily-pl-value-input
[ ] daily-pl-notes-input
[ ] daily-pl-save-button
[ ] daily-pl-cancel-button
[ ] daily-pl-delete-button

Account Detail:
[ ] account-detail-title
[ ] account-detail-stats
[ ] account-pl-history
[ ] account-bet-list
```

**Test Scenarios (Streamlined - Focus on Core Functionality):**

#### Calendar View (~12 tests)
1. **Happy Path (7 tests)**
   - Display current month calendar
   - Navigate to previous month
   - Navigate to next month
   - Display daily P&L values
   - Click day to edit P&L
   - Display monthly total
   - Display yearly total

2. **Error Scenarios (5 tests)**
   - Loading state during data fetch
   - Error state on fetch failure
   - Empty state for no data
   - Invalid P&L value format
   - Network error

**Removed**: Concurrent updates, month/year boundary edge cases, leap year handling, large value display, unauthorized access

#### Accounts (~10 tests)
1. **Happy Path (6 tests)**
   - Create new account
   - Edit account name
   - Delete account
   - View account details
   - List all accounts
   - Navigate to account detail page

2. **Error Scenarios (4 tests)**
   - Create account without name (required field)
   - Duplicate account name
   - Delete account with P&L data (warning)
   - Network error during save

**Removed**: Special characters, character limits, max accounts, default designation, unauthorized access, edit non-existent

#### Daily P&L (~8 tests)
1. **Happy Path (5 tests)**
   - Add daily P&L value
   - Edit daily P&L value
   - Delete daily P&L value
   - Add P&L notes
   - View P&L history

2. **Error Scenarios (3 tests)**
   - Invalid P&L value format
   - Empty P&L value
   - Network error during save

**Removed**: Negative validation, concurrent updates, unauthorized access, very large values, decimal precision, bulk import

#### Aggregations (~6 tests)
1. **Happy Path (4 tests)**
   - Calculate monthly total P&L
   - Calculate yearly total P&L
   - Calculate all-time total P&L
   - Display account-level aggregations

2. **Error Scenarios (2 tests)**
   - Aggregation with missing/empty data
   - Aggregation calculation errors

**Removed**: Timeout, invalid date range, performance testing, real-time updates, multiple accounts, voided bets handling

---

### Phase 5: Advanced Features (Week 5-6)
**Objective**: Test dashboard, calculators, settings, support, and admin features

**Scope:**
- Dashboard overview
- Betting calculators
- Settings management
- Support system
- Admin dashboard
- FAQs

**Test Files:**
- `tests/e2e/dashboard/overview.spec.ts` (~10 tests - stats display, navigation, empty state)
- `tests/e2e/calculators/kelly.spec.ts` (~6 tests - calculate, validate inputs)
- `tests/e2e/calculators/arbitrage.spec.ts` (~6 tests - calculate, validate inputs)
- `tests/e2e/calculators/parlay.spec.ts` (~5 tests - add legs, calculate)
- `tests/e2e/calculators/unit-betting.spec.ts` (~5 tests - calculate units)
- `tests/e2e/settings/settings.spec.ts` (~8 tests - view email, reset password, export/import, delete account)
- `tests/e2e/support/support.spec.ts` (~6 tests - submit bug/feature, view history)
- `tests/e2e/admin/admin.spec.ts` (~5 tests - view submissions, resolve/delete, unauthorized)
- `tests/e2e/faqs/faqs.spec.ts` (~4 tests - display, search, expand/collapse)

**Estimated Test Count**: 55 tests (reduced from 96, focus on core functionality)
**Note**: Removed edge cases like very large values, special characters, performance testing, responsive layout

**Test IDs Needed (52 total):**
```
Dashboard:
[ ] dashboard-page-title
[ ] dashboard-stats-grid
[ ] dashboard-total-bets-stat
[ ] dashboard-win-rate-stat
[ ] dashboard-total-pl-stat
[ ] dashboard-roi-stat
[ ] dashboard-recent-bets-section
[ ] dashboard-top-notebooks-section
[ ] dashboard-empty-state

Calculators:
[ ] calculators-page-title
[ ] calculator-tabs
[ ] kelly-calculator-tab
[ ] arbitrage-calculator-tab
[ ] parlay-calculator-tab
[ ] unit-betting-calculator-tab

Kelly Calculator:
[ ] kelly-bankroll-input
[ ] kelly-win-probability-input
[ ] kelly-odds-input
[ ] kelly-calculate-button
[ ] kelly-result-display
[ ] kelly-optimal-bet-display

Arbitrage Calculator:
[ ] arb-odds1-input
[ ] arb-odds2-input
[ ] arb-total-stake-input
[ ] arb-calculate-button
[ ] arb-profit-display
[ ] arb-stake1-display
[ ] arb-stake2-display

Settings:
[ ] settings-page-title
[ ] settings-email-display
[ ] settings-reset-password-button
[ ] settings-export-data-button
[ ] settings-import-data-button
[ ] settings-delete-account-button

Support:
[ ] support-page-title
[ ] support-bug-report-tab
[ ] support-feature-request-tab
[ ] support-title-input
[ ] support-description-input
[ ] support-submit-button
[ ] support-submission-list

Admin:
[ ] admin-page-title
[ ] admin-bug-reports-section
[ ] admin-feature-requests-section
[ ] admin-resolve-button
[ ] admin-delete-button

FAQs:
[ ] faqs-page-title
[ ] faq-search-input
[ ] faq-category-filter
[ ] faq-item
[ ] faq-question
[ ] faq-answer
```

**Test Scenarios:**

#### Dashboard (18 tests)
1. **Happy Path (6 tests)**
   - Display dashboard stats (total bets, win rate, P&L, ROI)
   - Display recent bets
   - Display top notebooks
   - Navigate to notebook from dashboard
   - Navigate to bet from recent bets
   - Refresh dashboard data

2. **Error Scenarios (6 tests)**
   - Loading state during data fetch
   - Error state on fetch failure
   - Empty state for new users
   - Partial data loading errors
   - Stale data detection
   - Network timeout

3. **Edge Cases (6 tests)**
   - Dashboard with no bets
   - Dashboard with single notebook
   - Dashboard with large dataset
   - Dashboard stat calculations accuracy
   - Dashboard responsive layout
   - Dashboard data refresh on nav

#### Calculators (44 tests)
**Kelly Calculator (12 tests):**
1. Happy Path (4 tests)
   - Calculate optimal bet size
   - Display Kelly percentage
   - Display recommended stake
   - Reset calculator inputs

2. Error Scenarios (5 tests)
   - Invalid bankroll input
   - Invalid probability (>100%)
   - Invalid odds format
   - Negative values
   - Zero bankroll

3. Edge Cases (3 tests)
   - Very large bankrolls
   - Edge probability values (0%, 100%)
   - Decimal precision in results

**Arbitrage Calculator (12 tests):**
1. Happy Path (4 tests)
   - Calculate arbitrage opportunity
   - Display stake distribution
   - Display guaranteed profit
   - Reset calculator inputs

2. Error Scenarios (5 tests)
   - No arbitrage opportunity
   - Invalid odds inputs
   - Negative total stake
   - Zero stake inputs
   - Mismatched odds formats

3. Edge Cases (3 tests)
   - Very small profit margins
   - Very large stakes
   - Edge case odds values

**Parlay Calculator (10 tests):**
1. Happy Path (3 tests)
   - Calculate parlay payout
   - Add multiple legs
   - Display combined odds

2. Error Scenarios (4 tests)
   - Single leg parlay
   - Invalid leg odds
   - Maximum legs exceeded
   - Empty parlay

3. Edge Cases (3 tests)
   - Large number of legs
   - Mixed odds formats
   - Very high combined odds

**Unit Betting Calculator (10 tests):**
1. Happy Path (3 tests)
   - Calculate unit size
   - Calculate bet amount from units
   - Display bankroll percentage

2. Error Scenarios (4 tests)
   - Invalid bankroll
   - Invalid unit count
   - Negative values
   - Zero bankroll

3. Edge Cases (3 tests)
   - Very large unit sizes
   - Fractional units
   - High percentage of bankroll

#### Settings (14 tests)
1. **Happy Path (5 tests)**
   - View user email
   - Request password reset
   - Export user data
   - Import user data
   - Delete account (with confirmation)

2. **Error Scenarios (6 tests)**
   - Password reset email failure
   - Export data failure
   - Import invalid data format
   - Delete account error
   - Network timeout
   - Unauthorized access

3. **Edge Cases (3 tests)**
   - Large data export
   - Import with existing data (merge/replace)
   - Account deletion with active data

#### Support (12 tests)
1. **Happy Path (4 tests)**
   - Submit bug report
   - Submit feature request
   - View submission history
   - Display success message

2. **Error Scenarios (5 tests)**
   - Submit without title
   - Submit without description
   - Network error during submission
   - Rate limiting
   - Unauthorized access

3. **Edge Cases (3 tests)**
   - Very long description
   - Special characters in inputs
   - Multiple submissions

#### Admin (10 tests)
1. **Happy Path (3 tests)**
   - View bug reports
   - View feature requests
   - Resolve/delete submissions

2. **Error Scenarios (4 tests)**
   - Unauthorized access (non-admin)
   - Loading state errors
   - Resolve/delete failures
   - Network timeout

3. **Edge Cases (3 tests)**
   - Large number of submissions
   - Filter submissions
   - Bulk operations

#### FAQs (8 tests)
1. **Happy Path (3 tests)**
   - Display all FAQs
   - Search FAQs
   - Expand/collapse FAQ items

2. **Error Scenarios (3 tests)**
   - Loading state errors
   - Search with no results
   - Network timeout

3. **Edge Cases (2 tests)**
   - FAQs with markdown formatting
   - FAQs with images

---

### Phase 6: Non-Functional Testing (Week 6-8)
**Objective**: Test responsive design, performance, and accessibility

**Scope:**
- Mobile responsiveness
- Tablet responsiveness
- Page load performance
- Data load performance
- Keyboard navigation
- Screen reader compatibility

**Test Files:**
- `tests/e2e/responsive/mobile.spec.ts` (~10 tests - key pages at mobile viewport)
- `tests/e2e/responsive/tablet.spec.ts` (~8 tests - key pages at tablet viewport)
- `tests/e2e/performance/page-load.spec.ts` (~6 tests - dashboard, notebooks, tracker load times)
- `tests/e2e/performance/data-load.spec.ts` (~4 tests - key data fetching operations)
- `tests/e2e/a11y/keyboard.spec.ts` (~8 tests - tab order, focus, shortcuts)
- `tests/e2e/a11y/screen-reader.spec.ts` (~6 tests - headings, labels, ARIA, announcements)

**Estimated Test Count**: 42 tests (reduced from 78, focus on critical paths)
**Note**: Removed edge cases like notch handling, split-screen, slow network simulation, custom shortcuts, live regions

**Test IDs Needed** (use existing test IDs from previous phases)

**Test Scenarios:**

#### Mobile Responsive (20 tests)
1. **Layout (8 tests)**
   - Mobile navigation menu
   - Collapsible sidebar
   - Responsive cards
   - Touch-friendly buttons
   - Responsive tables
   - Mobile dialogs
   - Bottom navigation
   - Hamburger menu

2. **Interactions (7 tests)**
   - Tap/touch interactions
   - Swipe gestures
   - Pull-to-refresh
   - Touch target sizes
   - Scroll behavior
   - Form inputs on mobile
   - Mobile keyboard behavior

3. **Edge Cases (5 tests)**
   - Landscape orientation
   - Portrait orientation
   - Small screens (<375px)
   - Notch handling
   - Mobile browser quirks

#### Tablet Responsive (14 tests)
1. **Layout (6 tests)**
   - Tablet grid layouts
   - Two-column layouts
   - Sidebar behavior
   - Navigation patterns
   - Card layouts
   - Dialog sizing

2. **Interactions (5 tests)**
   - Touch and mouse support
   - Hover states
   - Tap interactions
   - Form layouts
   - Scroll areas

3. **Edge Cases (3 tests)**
   - Tablet landscape
   - Tablet portrait
   - Split-screen mode

#### Page Load Performance (10 tests)
1. **Initial Load (4 tests)**
   - Dashboard load time (<3s)
   - Auth pages load time (<2s)
   - First contentful paint (FCP)
   - Largest contentful paint (LCP)

2. **Navigation Performance (4 tests)**
   - Client-side routing speed
   - Code splitting effectiveness
   - Route prefetching
   - Back/forward navigation

3. **Edge Cases (2 tests)**
   - Slow network simulation (3G)
   - Offline mode behavior

#### Data Load Performance (8 tests)
1. **Data Fetching (4 tests)**
   - Notebook list load time
   - Bet list load time
   - Dashboard aggregations
   - Tracker calendar data

2. **Optimization (3 tests)**
   - Pagination performance
   - Lazy loading images
   - Data caching

3. **Edge Cases (1 test)**
   - Large dataset performance (1000+ bets)

#### Keyboard Navigation (14 tests)
1. **Navigation (6 tests)**
   - Tab order throughout app
   - Focus indicators visible
   - Skip to main content
   - Navigate through forms
   - Navigate through dialogs
   - Navigate through menus

2. **Shortcuts (5 tests)**
   - Enter to submit forms
   - Escape to close dialogs
   - Arrow keys in dropdowns
   - Arrow keys in date picker
   - Custom keyboard shortcuts

3. **Edge Cases (3 tests)**
   - Focus trap in modals
   - Focus restoration
   - Keyboard-only workflows

#### Screen Reader (12 tests)
1. **Semantics (5 tests)**
   - Proper heading hierarchy
   - ARIA labels present
   - ARIA roles correct
   - Alt text on images
   - Form labels associated

2. **Announcements (4 tests)**
   - Loading state announced
   - Error messages announced
   - Success messages announced
   - Dynamic content updates

3. **Edge Cases (3 tests)**
   - Complex table navigation
   - Custom component accessibility
   - Live region updates

---

## TEST ID AUDIT SECTION

### Test ID Inventory by Feature

#### Auth Feature (22 test IDs)
**LoginPage (`src/pages/auth/LoginPage.tsx`)**
- [ ] `login-email-input`
- [ ] `login-password-input`
- [ ] `login-submit-button`
- [ ] `login-error-message`
- [ ] `login-google-button`
- [ ] `login-forgot-password-link`
- [ ] `login-register-link`

**RegisterPage (`src/pages/auth/RegisterPage.tsx`)**
- [ ] `register-email-input`
- [ ] `register-password-input`
- [ ] `register-confirm-password-input`
- [ ] `register-submit-button`
- [ ] `register-error-message`
- [ ] `register-success-message`
- [ ] `register-login-link`

**ResetPasswordPage (`src/pages/auth/ResetPasswordPage.tsx`)**
- [ ] `reset-password-email-input`
- [ ] `reset-password-submit-button`
- [ ] `reset-password-success-message`
- [ ] `reset-password-error-message`
- [ ] `new-password-input`
- [ ] `new-password-confirm-input`
- [ ] `new-password-submit-button`
- [ ] `new-password-success-message`

#### Navigation & Layout (12 test IDs)
**Header (`src/components/layout/Header.tsx`)**
- [ ] `header-user-menu`
- [ ] `header-user-menu-button`
- [ ] `header-logout-button`
- [ ] `header-settings-link`
- [ ] `header-dashboard-link`

**Sidebar (`src/components/layout/Sidebar.tsx`)**
- [ ] `sidebar-nav`
- [ ] `sidebar-dashboard-link`
- [ ] `sidebar-notebooks-link`
- [ ] `sidebar-tracker-link`
- [ ] `sidebar-calculators-link`
- [ ] `sidebar-settings-link`
- [ ] `sidebar-collapse-button`

#### Notebooks Feature (36 test IDs)
**NotebooksPage (`src/pages/NotebooksPage.tsx`)**
- [ ] `notebooks-page-title`
- [ ] `create-notebook-button`
- [ ] `notebooks-grid`
- [ ] `notebook-card`
- [ ] `notebook-card-title`
- [ ] `notebook-card-description`
- [ ] `notebook-card-stats`
- [ ] `notebook-card-color`
- [ ] `notebooks-empty-state`
- [ ] `notebook-search-input`

**CreateNotebookDialog (`src/components/CreateNotebookDialog.tsx`)**
- [ ] `create-notebook-dialog`
- [ ] `notebook-name-input`
- [ ] `notebook-description-input`
- [ ] `notebook-color-picker`
- [ ] `notebook-save-button`
- [ ] `notebook-cancel-button`
- [ ] `notebook-dialog-error`

**EditNotebookDialog (`src/components/EditNotebookDialog.tsx`)**
- [ ] `edit-notebook-dialog`
- [ ] `edit-notebook-name-input`
- [ ] `edit-notebook-description-input`
- [ ] `edit-notebook-color-picker`
- [ ] `edit-notebook-save-button`
- [ ] `edit-notebook-cancel-button`
- [ ] `edit-notebook-delete-button`

**NotebookDetailPage (`src/pages/NotebookDetailPage.tsx`)**
- [ ] `notebook-detail-title`
- [ ] `notebook-detail-description`
- [ ] `notebook-detail-stats`
- [ ] `edit-notebook-button`
- [ ] `delete-notebook-button`
- [ ] `delete-notebook-confirm-dialog`
- [ ] `back-to-notebooks-link`
- [ ] `notebook-view-toggle`
- [ ] `notebook-history-view`
- [ ] `notebook-calendar-view`

**Custom Columns Section**
- [ ] `custom-columns-section`
- [ ] `add-custom-column-button`
- [ ] `custom-column-name-input`
- [ ] `custom-column-category-select`

#### Bets Feature (42 test IDs)
**Bets List (in NotebookDetailPage)**
- [ ] `bets-list`
- [ ] `bets-empty-state`
- [ ] `create-bet-button`
- [ ] `bet-card`
- [ ] `bet-description`
- [ ] `bet-odds`
- [ ] `bet-wager`
- [ ] `bet-status`
- [ ] `bet-date`
- [ ] `bet-profit-loss`
- [ ] `bet-actions-menu`
- [ ] `edit-bet-button`
- [ ] `delete-bet-button`
- [ ] `delete-bet-confirm-dialog`

**CreateBetDialog (`src/components/CreateBetDialog.tsx`)**
- [ ] `create-bet-dialog`
- [ ] `bet-description-input`
- [ ] `bet-odds-input`
- [ ] `bet-wager-input`
- [ ] `bet-date-input`
- [ ] `bet-payout-display`
- [ ] `bet-profit-display`
- [ ] `bet-save-button`
- [ ] `bet-cancel-button`
- [ ] `bet-dialog-error`

**EditBetDialog (`src/components/EditBetDialog.tsx`)**
- [ ] `edit-bet-dialog`
- [ ] `edit-bet-description-input`
- [ ] `edit-bet-odds-input`
- [ ] `edit-bet-wager-input`
- [ ] `edit-bet-date-input`
- [ ] `edit-bet-status-select`
- [ ] `edit-bet-result-input`
- [ ] `edit-bet-save-button`
- [ ] `edit-bet-cancel-button`
- [ ] `edit-bet-delete-button`

**BetSearch (`src/components/BetSearch.tsx`)**
- [ ] `bet-search-input`
- [ ] `bet-search-clear-button`
- [ ] `bet-filter-status-dropdown`
- [ ] `bet-filter-date-from`
- [ ] `bet-filter-date-to`
- [ ] `bet-sort-dropdown`
- [ ] `bet-filters-clear-button`

**CustomColumnsFields (`src/components/CustomColumnsFields.tsx`)**
- [ ] `bet-custom-field`
- [ ] `market-custom-field`
- [ ] `sportsbook-custom-field`

#### Tracker Feature (32 test IDs)
**TrackerPage (`src/pages/TrackerPage.tsx`)**
- [ ] `tracker-page-title`
- [ ] `tracker-help-button`
- [ ] `tracker-month-display`
- [ ] `tracker-prev-month-button`
- [ ] `tracker-next-month-button`
- [ ] `tracker-monthly-total`
- [ ] `tracker-yearly-total`
- [ ] `tracker-all-time-total`

**CalendarView (`src/components/CalendarView.tsx`)**
- [ ] `tracker-calendar-view`
- [ ] `tracker-calendar-grid`
- [ ] `tracker-day-cell`
- [ ] `tracker-day-date`
- [ ] `tracker-day-pl-value`
- [ ] `tracker-day-header`

**Accounts Section (TrackerPage)**
- [ ] `tracker-accounts-section`
- [ ] `tracker-accounts-list`
- [ ] `create-account-button`
- [ ] `account-card`
- [ ] `account-name`
- [ ] `account-balance`
- [ ] `account-pl`
- [ ] `view-account-button`
- [ ] `edit-account-button`
- [ ] `delete-account-button`

**CreateAccountDialog (`src/components/tracker/CreateAccountDialog.tsx`)**
- [ ] `create-account-dialog`
- [ ] `account-name-input`
- [ ] `account-save-button`
- [ ] `account-cancel-button`

**EditDailyPLDialog (`src/components/tracker/EditDailyPLDialog.tsx`)**
- [ ] `edit-daily-pl-dialog`
- [ ] `daily-pl-value-input`
- [ ] `daily-pl-notes-input`
- [ ] `daily-pl-save-button`
- [ ] `daily-pl-cancel-button`

#### Dashboard Feature (14 test IDs)
**DashboardPage (`src/pages/DashboardPage.tsx`)**
- [ ] `dashboard-page-title`
- [ ] `dashboard-stats-grid`
- [ ] `dashboard-total-bets-card`
- [ ] `dashboard-win-rate-card`
- [ ] `dashboard-total-pl-card`
- [ ] `dashboard-roi-card`
- [ ] `dashboard-recent-bets-section`
- [ ] `dashboard-recent-bet-card`
- [ ] `dashboard-top-notebooks-section`
- [ ] `dashboard-top-notebook-card`
- [ ] `dashboard-empty-state`
- [ ] `dashboard-loading-skeleton`
- [ ] `dashboard-error-message`
- [ ] `dashboard-refresh-button`

#### Calculators Feature (28 test IDs)
**CalculatorsPage (`src/pages/CalculatorsPage.tsx`)**
- [ ] `calculators-page-title`
- [ ] `calculator-tabs`

**KellyCalculator (`src/components/calculators/KellyCalculator.tsx`)**
- [ ] `kelly-calculator-tab`
- [ ] `kelly-bankroll-input`
- [ ] `kelly-win-probability-input`
- [ ] `kelly-odds-input`
- [ ] `kelly-calculate-button`
- [ ] `kelly-result-display`
- [ ] `kelly-optimal-bet-display`
- [ ] `kelly-reset-button`

**ArbitrageCalculator (`src/components/calculators/ArbitrageCalculator.tsx`)**
- [ ] `arbitrage-calculator-tab`
- [ ] `arb-odds1-input`
- [ ] `arb-odds2-input`
- [ ] `arb-total-stake-input`
- [ ] `arb-calculate-button`
- [ ] `arb-profit-display`
- [ ] `arb-stake1-display`
- [ ] `arb-stake2-display`
- [ ] `arb-reset-button`

**ParlayCalculator (`src/components/calculators/ParlayCalculator.tsx`)**
- [ ] `parlay-calculator-tab`
- [ ] `parlay-add-leg-button`
- [ ] `parlay-leg-odds-input`
- [ ] `parlay-remove-leg-button`
- [ ] `parlay-total-odds-display`
- [ ] `parlay-payout-display`

**UnitBettingCalculator (`src/components/calculators/UnitBettingCalculator.tsx`)**
- [ ] `unit-betting-calculator-tab`
- [ ] `unit-bankroll-input`
- [ ] `unit-size-input`
- [ ] `unit-bet-amount-display`

#### Settings Feature (10 test IDs)
**SettingsPage (`src/pages/SettingsPage.tsx`)**
- [ ] `settings-page-title`
- [ ] `settings-email-display`
- [ ] `settings-reset-password-button`
- [ ] `settings-reset-password-success`
- [ ] `settings-export-data-button`
- [ ] `settings-import-data-button`
- [ ] `settings-import-file-input`
- [ ] `settings-delete-account-button`
- [ ] `settings-delete-account-confirm-dialog`
- [ ] `settings-error-message`

#### Support Feature (12 test IDs)
**SupportPage (`src/pages/SupportPage.tsx`)**
- [ ] `support-page-title`
- [ ] `support-tabs`
- [ ] `support-bug-report-tab`
- [ ] `support-feature-request-tab`
- [ ] `support-title-input`
- [ ] `support-description-input`
- [ ] `support-submit-button`
- [ ] `support-success-message`
- [ ] `support-error-message`
- [ ] `support-submissions-list`
- [ ] `support-submission-card`
- [ ] `support-clear-button`

#### Admin Feature (8 test IDs)
**AdminDashboard (`src/pages/AdminDashboard.tsx`)**
- [ ] `admin-page-title`
- [ ] `admin-bug-reports-section`
- [ ] `admin-feature-requests-section`
- [ ] `admin-submission-card`
- [ ] `admin-resolve-button`
- [ ] `admin-delete-button`
- [ ] `admin-unauthorized-message`
- [ ] `admin-loading-skeleton`

#### FAQs Feature (8 test IDs)
**FAQsPage (`src/pages/FAQsPage.tsx`)**
- [ ] `faqs-page-title`
- [ ] `faq-search-input`
- [ ] `faq-category-filter`
- [ ] `faq-list`
- [ ] `faq-item`
- [ ] `faq-question`
- [ ] `faq-answer`
- [ ] `faq-expand-button`

#### UI Components (12 test IDs)
**Toast Notifications (`src/components/ui/Toaster.tsx`)**
- [ ] `toast-container`
- [ ] `toast-message`
- [ ] `toast-success`
- [ ] `toast-error`
- [ ] `toast-close-button`

**ConfirmDialog (`src/components/ui/ConfirmDialog.tsx`)**
- [ ] `confirm-dialog`
- [ ] `confirm-dialog-title`
- [ ] `confirm-dialog-description`
- [ ] `confirm-dialog-cancel-button`
- [ ] `confirm-dialog-confirm-button`

**Loading States**
- [ ] `loading-spinner`
- [ ] `loading-skeleton`

---

### Priority Test IDs (Add These First)

#### Phase 1 Priority (Auth - 22 test IDs)
**CRITICAL - Must add before Phase 1 tests:**
1. `login-email-input`
2. `login-password-input`
3. `login-submit-button`
4. `login-error-message`
5. `register-email-input`
6. `register-password-input`
7. `register-confirm-password-input`
8. `register-submit-button`
9. `reset-password-email-input`
10. `reset-password-submit-button`
11. `new-password-input`
12. `new-password-confirm-input`
13. `new-password-submit-button`
14. `header-user-menu`
15. `header-logout-button`
16. `sidebar-nav`
17. `sidebar-dashboard-link`
18. `sidebar-notebooks-link`
19. `sidebar-tracker-link`
20. `toast-message`
21. `loading-spinner`
22. `confirm-dialog-confirm-button`

#### Phase 2 Priority (Notebooks - 25 test IDs)
**HIGH - Must add before Phase 2 tests:**
1. `notebooks-page-title`
2. `create-notebook-button`
3. `notebooks-grid`
4. `notebook-card`
5. `notebook-card-title`
6. `notebooks-empty-state`
7. `create-notebook-dialog`
8. `notebook-name-input`
9. `notebook-description-input`
10. `notebook-save-button`
11. `notebook-cancel-button`
12. `edit-notebook-dialog`
13. `edit-notebook-save-button`
14. `delete-notebook-button`
15. `delete-notebook-confirm-dialog`
16. `notebook-detail-title`
17. `notebook-detail-stats`
18. `back-to-notebooks-link`
19. `custom-columns-section`
20. `add-custom-column-button`
21. `custom-column-name-input`
22. `custom-column-category-select`
23. `notebook-search-input`
24. `notebook-view-toggle`
25. `notebook-color-picker`

#### Phase 3 Priority (Bets - 32 test IDs)
**HIGH - Must add before Phase 3 tests:**
1. `bets-list`
2. `bets-empty-state`
3. `create-bet-button`
4. `bet-card`
5. `bet-description`
6. `bet-odds`
7. `bet-wager`
8. `bet-status`
9. `bet-date`
10. `bet-profit-loss`
11. `edit-bet-button`
12. `delete-bet-button`
13. `create-bet-dialog`
14. `bet-description-input`
15. `bet-odds-input`
16. `bet-wager-input`
17. `bet-date-input`
18. `bet-save-button`
19. `bet-cancel-button`
20. `edit-bet-dialog`
21. `edit-bet-status-select`
22. `edit-bet-result-input`
23. `bet-search-input`
24. `bet-filter-status-dropdown`
25. `bet-sort-dropdown`
26. `bet-custom-field`
27. `market-custom-field`
28. `sportsbook-custom-field`
29. `bet-payout-display`
30. `bet-profit-display`
31. `bet-dialog-error`
32. `delete-bet-confirm-dialog`

#### Phase 4 Priority (Tracker - 28 test IDs)
**MEDIUM - Must add before Phase 4 tests:**
1. `tracker-page-title`
2. `tracker-calendar-view`
3. `tracker-calendar-grid`
4. `tracker-day-cell`
5. `tracker-day-pl-value`
6. `tracker-prev-month-button`
7. `tracker-next-month-button`
8. `tracker-monthly-total`
9. `tracker-yearly-total`
10. `tracker-all-time-total`
11. `tracker-accounts-list`
12. `create-account-button`
13. `account-card`
14. `account-name`
15. `view-account-button`
16. `edit-account-button`
17. `delete-account-button`
18. `create-account-dialog`
19. `account-name-input`
20. `account-save-button`
21. `edit-daily-pl-dialog`
22. `daily-pl-value-input`
23. `daily-pl-save-button`
24. `tracker-day-date`
25. `account-balance`
26. `account-pl`
27. `daily-pl-notes-input`
28. `daily-pl-cancel-button`

---

### Test ID Naming Convention

**Format:** `{feature}-{component}-{element}-{modifier?}`

**Examples:**
- `login-email-input` ✅ (feature-element-type)
- `bet-description-input` ✅ (feature-element-type)
- `create-notebook-button` ✅ (action-feature-type)
- `edit-bet-dialog` ✅ (action-feature-type)
- `tracker-monthly-total` ✅ (feature-descriptor-type)
- `dashboard-total-bets-card` ✅ (feature-descriptor-type)

**Rules:**
1. Use kebab-case (lowercase with dashes)
2. Be specific and descriptive
3. Avoid generic names like `button-1` or `input-field`
4. Include action for interactive elements (`create-`, `edit-`, `delete-`)
5. Include feature context for reusable components
6. Keep names concise but meaningful
7. Use consistent suffixes:
   - `-input` for text/number inputs
   - `-button` for buttons
   - `-dialog` for modal dialogs
   - `-dropdown` for select menus
   - `-card` for card components
   - `-list` for lists/grids
   - `-display` for read-only displays

---

### Test ID Checklist by Phase

#### Phase 1: Authentication (Status: Not Started)
- [ ] Add 22 auth test IDs
- [ ] Add 12 navigation test IDs
- [ ] Add 6 UI component test IDs
- [ ] **Total: 40 test IDs**

#### Phase 2: Notebooks (Status: Not Started)
- [ ] Add 10 notebooks page test IDs
- [ ] Add 7 create dialog test IDs
- [ ] Add 8 edit dialog test IDs
- [ ] Add 11 notebook detail test IDs
- [ ] **Total: 36 test IDs**

#### Phase 3: Bets (Status: Not Started)
- [ ] Add 14 bets list test IDs
- [ ] Add 10 create bet test IDs
- [ ] Add 11 edit bet test IDs
- [ ] Add 7 bet search test IDs
- [ ] Add 3 custom fields test IDs
- [ ] **Total: 45 test IDs**

#### Phase 4: Tracker (Status: Not Started)
- [ ] Add 8 tracker page test IDs
- [ ] Add 6 calendar view test IDs
- [ ] Add 10 accounts test IDs
- [ ] Add 5 daily P&L test IDs
- [ ] **Total: 29 test IDs**

#### Phase 5: Advanced Features (Status: Not Started)
- [ ] Add 14 dashboard test IDs
- [ ] Add 28 calculator test IDs
- [ ] Add 10 settings test IDs
- [ ] Add 12 support test IDs
- [ ] Add 8 admin test IDs
- [ ] Add 8 FAQs test IDs
- [ ] **Total: 80 test IDs**

#### Phase 6: Non-Functional (Status: Not Started)
- [ ] Reuse existing test IDs
- [ ] Add performance monitoring IDs if needed
- [ ] Add accessibility-specific ARIA labels
- [ ] **Total: ~10 new test IDs**

---

## Components Requiring Test IDs (by category)

### Forms & Inputs (65 test IDs)
**Text Inputs:**
- Login email/password
- Register email/password/confirm
- Reset password email/new password
- Notebook name/description
- Bet description/notes
- Custom column name
- Account name
- Support title/description
- FAQ search
- Daily P&L value/notes

**Number Inputs:**
- Bet odds
- Bet wager amount
- Calculator inputs (bankroll, probability, stakes, etc.)

**Date Inputs:**
- Bet date
- Date range filters

**Select/Dropdown:**
- Bet status
- Custom column type/category
- Filter dropdowns
- Sort dropdowns

**Buttons:**
- Submit buttons (login, register, save, etc.)
- Cancel buttons
- Delete buttons
- Action buttons (create, edit, etc.)
- Navigation buttons (prev/next month)

**Validation Messages:**
- Error messages
- Success messages
- Field-level validation

### Navigation & Layout (24 test IDs)
**Header:**
- User menu
- Logout button
- Settings link
- Dashboard link

**Sidebar:**
- Navigation links (dashboard, notebooks, tracker, etc.)
- Collapse/expand button
- Active link indicators

**Breadcrumbs:**
- Back to notebooks link
- Back to tracker link

**Pagination:**
- Previous/next buttons
- Page numbers

**Tabs:**
- Calculator tabs
- Support tabs
- View toggle (history/calendar)

### Dialogs & Modals (48 test IDs)
**Create Dialogs:**
- Create Notebook
- Create Bet
- Create Account

**Edit Dialogs:**
- Edit Notebook
- Edit Bet
- Edit Account
- Edit Daily P&L

**Confirm Dialogs:**
- Delete confirmations
- Action confirmations

**Dialog Elements:**
- Dialog containers
- Dialog titles
- Dialog content
- Save buttons
- Cancel buttons
- Delete buttons
- Error messages

### Tables & Lists (32 test IDs)
**Lists:**
- Notebooks grid
- Bets list
- Accounts list
- Recent bets
- Top notebooks
- Support submissions

**List Items:**
- Notebook cards
- Bet cards
- Account cards
- FAQ items

**Table Controls:**
- Search inputs
- Filter dropdowns
- Sort controls
- Column headers

**Empty States:**
- No notebooks
- No bets
- No accounts
- No search results

### Status & Feedback (24 test IDs)
**Loading States:**
- Loading spinners
- Skeleton loaders
- Progress indicators

**Messages:**
- Toast notifications
- Success messages
- Error messages
- Info messages

**Status Indicators:**
- Bet status badges
- Account balance indicators
- P&L color indicators

**Empty States:**
- Empty notebooks
- Empty bets
- Empty tracker

**Help/Tooltips:**
- Help buttons
- Tooltip triggers
- Info icons

---

## Cross-Cutting Concerns

### Test Data Setup and Teardown
**Strategy:**
- Use `beforeEach` hooks for test data creation
- Use `afterEach` hooks for cleanup
- Implement fixture factories for common data types
- Use database transactions where possible for isolation

**Fixtures Location:** `tests/fixtures/`
- `auth-fixtures.ts` - User accounts, auth tokens
- `notebook-fixtures.ts` - Notebook data
- `bet-fixtures.ts` - Bet data
- `tracker-fixtures.ts` - Tracker and account data
- `helpers.ts` - Common test utilities

**Example Fixture:**
```typescript
// tests/fixtures/notebook-fixtures.ts
export const createTestNotebook = async (page, overrides = {}) => {
  const notebook = {
    name: 'Test Notebook',
    description: 'Test Description',
    color: 'blue',
    ...overrides
  };

  await page.getByTestId('create-notebook-button').click();
  await page.getByTestId('notebook-name-input').fill(notebook.name);
  await page.getByTestId('notebook-description-input').fill(notebook.description);
  await page.getByTestId('notebook-save-button').click();

  return notebook;
};
```

### Authentication State Management
**Strategy:**
- Create reusable auth helpers
- Store auth state in fixtures
- Use Playwright's `storageState` for session persistence
- Implement login once, reuse across tests

**Example:**
```typescript
// tests/fixtures/auth-fixtures.ts
export const loginUser = async (page, credentials) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(credentials.email);
  await page.getByTestId('login-password-input').fill(credentials.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL('/dashboard');
};

// Store auth state
export const getAuthState = async (page) => {
  await loginUser(page, testUser);
  return page.context().storageState();
};
```

### Database State Isolation
**Strategy:**
- Each test should start with clean database state
- Use Supabase test database or local PostgreSQL
- Implement database seeding scripts
- Use RLS policies to ensure data isolation per user

**Approach:**
1. Create test-specific user accounts
2. Ensure RLS policies prevent cross-user data access
3. Clean up test data after each test run
4. Use database transactions for faster rollback

### Visual Regression Testing
**Strategy:**
- Use Playwright's screenshot comparison
- Take screenshots of key pages/components
- Store baseline images in version control
- Run visual diffs on CI

**Example:**
```typescript
// tests/e2e/responsive/mobile.spec.ts
test('mobile layout matches baseline', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-mobile.png');
});
```

### A11y Compliance Checks
**Strategy:**
- Use `@axe-core/playwright` for automated a11y testing
- Check WCAG 2.1 AA compliance
- Verify keyboard navigation
- Test with screen reader tools

**Example:**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('login page is accessible', async ({ page }) => {
  await page.goto('/login');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

---

## Implementation Order

### Dependency Tree
```
Phase 1: Auth
  └─> Phase 2: Notebooks
       └─> Phase 3: Bets
            ├─> Phase 4: Tracker
            └─> Phase 5: Advanced Features
                 └─> Phase 6: Non-Functional
```

### Sequential Test Phases

#### Week 1: Foundation (Phase 1)
**Prerequisites:** None
**Deliverables:**
- Auth test infrastructure
- Test fixtures and helpers
- Global setup/teardown
- 58 auth tests passing
- 40 test IDs added

**Tasks:**
1. Set up Playwright configuration
2. Create test fixtures (auth-fixtures.ts, helpers.ts)
3. Add Phase 1 test IDs to auth pages
4. Write auth tests (login, register, password reset, OAuth)
5. Verify RLS policies work correctly
6. Document auth test patterns

#### Week 2: Core Features Part 1 (Phase 2)
**Prerequisites:** Phase 1 complete
**Deliverables:**
- 68 notebook tests passing
- 36 test IDs added
- Notebook fixtures

**Tasks:**
1. Add Phase 2 test IDs to notebook pages/components
2. Create notebook fixtures (notebook-fixtures.ts)
3. Write notebook CRUD tests
4. Write custom columns tests
5. Write navigation tests
6. Write search/filter tests

#### Week 3-4: Core Features Part 2 (Phase 3)
**Prerequisites:** Phase 2 complete
**Deliverables:**
- 86 bet tests passing
- 45 test IDs added
- Bet fixtures

**Tasks:**
1. Add Phase 3 test IDs to bet pages/components
2. Create bet fixtures (bet-fixtures.ts)
3. Write bet CRUD tests
4. Write custom fields tests
5. Write validation tests
6. Write search tests
7. Write status update tests

#### Week 4-5: Tracker (Phase 4)
**Prerequisites:** Phase 3 complete
**Deliverables:**
- 62 tracker tests passing
- 29 test IDs added
- Tracker fixtures

**Tasks:**
1. Add Phase 4 test IDs to tracker pages/components
2. Create tracker fixtures (tracker-fixtures.ts)
3. Write calendar view tests
4. Write accounts tests
5. Write daily P&L tests
6. Write aggregation tests

#### Week 5-6: Advanced Features (Phase 5)
**Prerequisites:** Phase 4 complete
**Deliverables:**
- 96 advanced feature tests passing
- 80 test IDs added

**Tasks:**
1. Add Phase 5 test IDs to dashboard/calculators/settings/support/admin
2. Write dashboard tests
3. Write calculator tests (4 calculators)
4. Write settings tests
5. Write support tests
6. Write admin tests
7. Write FAQs tests

#### Week 6-8: Non-Functional (Phase 6)
**Prerequisites:** Phase 5 complete
**Deliverables:**
- 78 non-functional tests passing
- ~10 test IDs added
- Performance benchmarks
- A11y compliance report

**Tasks:**
1. Write mobile responsive tests
2. Write tablet responsive tests
3. Write page load performance tests
4. Write data load performance tests
5. Write keyboard navigation tests
6. Write screen reader tests
7. Generate coverage report
8. Document results

---

## Success Criteria & Milestones

### Phase 1 Success Criteria
- [ ] All 58 auth tests passing
- [ ] Login flow working end-to-end
- [ ] Registration flow working end-to-end
- [ ] Password reset flow working end-to-end
- [ ] OAuth flow working (or documented limitation)
- [ ] Protected routes enforce authentication
- [ ] 40 test IDs added and verified
- [ ] Test fixtures documented
- [ ] Coverage: 95%+ of auth module

### Phase 2 Success Criteria
- [ ] All 68 notebook tests passing
- [ ] Create/edit/delete notebook flows working
- [ ] Custom columns functionality working
- [ ] Navigation between notebooks working
- [ ] Search and filtering working
- [ ] 36 test IDs added and verified
- [ ] Coverage: 95%+ of notebooks module

### Phase 3 Success Criteria
- [ ] All 86 bet tests passing
- [ ] Create/edit/delete bet flows working
- [ ] Bet validation logic working correctly
- [ ] Custom fields in bets working
- [ ] Bet search and filtering working
- [ ] Status updates working correctly
- [ ] 45 test IDs added and verified
- [ ] Coverage: 95%+ of bets module

### Phase 4 Success Criteria
- [ ] All 62 tracker tests passing
- [ ] Calendar view displaying correctly
- [ ] Accounts CRUD working
- [ ] Daily P&L tracking working
- [ ] Aggregations calculating correctly
- [ ] 29 test IDs added and verified
- [ ] Coverage: 95%+ of tracker module

### Phase 5 Success Criteria
- [ ] All 96 advanced feature tests passing
- [ ] Dashboard displaying correctly
- [ ] All calculators functioning correctly
- [ ] Settings page working
- [ ] Support system working
- [ ] Admin dashboard working (with proper access control)
- [ ] FAQs displaying correctly
- [ ] 80 test IDs added and verified
- [ ] Coverage: 95%+ of remaining modules

### Phase 6 Success Criteria
- [ ] All 78 non-functional tests passing
- [ ] Mobile layout working on all target devices
- [ ] Tablet layout working
- [ ] Page load times < 3s (dashboard, notebooks, tracker)
- [ ] Data load times < 2s for typical datasets
- [ ] Keyboard navigation working throughout app
- [ ] Screen reader compatibility verified
- [ ] WCAG 2.1 AA compliance achieved
- [ ] Performance benchmarks documented
- [ ] Coverage: 95%+ across entire application

### Overall Project Success Criteria
- [ ] All 292 tests passing
- [ ] 95%+ code coverage achieved
- [ ] ~240 test IDs added
- [ ] All critical user flows tested
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Test suite runs in < 10 minutes
- [ ] CI/CD integration complete
- [ ] Test documentation complete
- [ ] Test maintenance guide written

---

## Definition of "Done" for Each Phase

### Phase Done Criteria
A phase is considered "done" when:
1. ✅ All planned tests are written and passing
2. ✅ All required test IDs have been added to components
3. ✅ Code coverage meets 95% threshold for that module
4. ✅ All tests pass in CI environment
5. ✅ Test fixtures and helpers are documented
6. ✅ No flaky tests (tests must pass consistently)
7. ✅ Code review completed
8. ✅ Test scenarios cover happy path, error cases, and edge cases
9. ✅ Test execution time is reasonable (< 2 minutes per phase)
10. ✅ Any issues found during testing are documented or fixed

### Test Done Criteria
An individual test is considered "done" when:
1. ✅ Test name clearly describes what is being tested
2. ✅ Test follows AAA pattern (Arrange, Act, Assert)
3. ✅ Test uses proper locators (getByRole, getByTestId, etc.)
4. ✅ Test uses web-first assertions
5. ✅ Test is isolated and doesn't depend on other tests
6. ✅ Test cleans up after itself
7. ✅ Test passes consistently (run 10 times successfully)
8. ✅ Test has appropriate timeouts and waits
9. ✅ Test error messages are clear and actionable
10. ✅ Test is documented if complex logic is involved

---

## Test Execution Guidelines

### Running Tests Locally
```bash
# Run all tests
npm run test

# Run specific phase tests
npm run test tests/e2e/auth/
npm run test tests/e2e/notebooks/

# Run specific test file
npm run test tests/e2e/auth/login.spec.ts

# Run in headed mode (see browser)
npm run test:headed

# Run with debug mode
npm run test -- --debug

# Generate coverage report
npm run test:coverage

# Run with trace
npm run test -- --trace on
```

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Parallel Execution
```bash
# Run tests in parallel (default)
npm run test

# Run tests in parallel with custom worker count
npm run test -- --workers=4

# Run specific phase in parallel
npm run test tests/e2e/bets/ -- --workers=4
```

### Debugging Failed Tests
```bash
# Run with trace viewer
npm run test -- --trace on
npx playwright show-report

# Run single test in debug mode
npm run test tests/e2e/auth/login.spec.ts:25 -- --debug

# Run with video recording
npm run test -- --video=on
```

---

## Test Maintenance

### Regular Maintenance Tasks
1. **Weekly:**
   - Review and fix any flaky tests
   - Update test data fixtures if schema changes
   - Check test execution time and optimize slow tests

2. **Monthly:**
   - Review test coverage reports
   - Update test documentation
   - Refactor duplicate test code into helpers

3. **Quarterly:**
   - Review and update this test planning document
   - Audit test IDs for consistency
   - Evaluate new testing tools/techniques
   - Update Playwright version

### Adding New Tests
When adding new features to the application:
1. Add test IDs to new components first
2. Write tests before or alongside feature implementation
3. Follow existing test patterns and conventions
4. Update this planning document with new test scenarios
5. Ensure new tests integrate with existing test suite
6. Verify test coverage remains above 95%

### Handling Test Failures
When tests fail:
1. Check if failure is due to code change or test issue
2. If code change: update tests to match new behavior
3. If test issue: fix flaky test or improve reliability
4. Document any known issues in test comments
5. Never skip or disable tests without documenting why

---

## Appendix

### Useful Resources
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [PaperEdge Development Guide](../.claude/CLAUDE.md)

### Test Tooling
- **Playwright Test**: E2E testing framework
- **Axe-core**: Accessibility testing
- **Playwright Trace Viewer**: Debugging tool
- **VS Code Playwright Extension**: IDE integration

### Contact & Support
For questions about this test plan:
- Refer to PaperEdge development team
- Check existing test examples in `tests/e2e/`
- Review CLAUDE.md for project conventions

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Next Review:** After Phase 3 completion or December 2025
