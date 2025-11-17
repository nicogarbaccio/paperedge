# Notebook Tests Gap Analysis

## Overview
This document identifies missing test coverage for the notebooks feature by comparing existing tests with the actual application implementation.

## Current Test Coverage

### Existing Test Files
1. **crud.spec.ts** (24 tests) - Basic CRUD operations
2. **custom-columns.spec.ts** (18 tests) - Custom fields UI interactions
3. **navigation.spec.ts** (12 tests) - Basic navigation flows
4. **search-filter.spec.ts** (14 tests) - Search and filter functionality

**Total: 68 tests**

## Missing Test Coverage

### 1. Calendar View Features ⚠️ **CRITICAL MISSING**

**What exists in code:**
- Calendar view with month navigation
- Day click to open day details drawer
- Monthly profit display
- "Today" button when viewing different month
- Auto-initialization to most recent bet month
- Desktop grid vs mobile timeline layouts
- Daily P&L calculation and display

**Missing tests:**
```typescript
// tests/e2e/notebooks/calendar-view.spec.ts
- should display calendar view when toggled
- should navigate to previous month
- should navigate to next month
- should show "Today" button when viewing different month
- should click on day with bets to open day details drawer
- should display monthly profit correctly
- should initialize to most recent bet month
- should handle empty calendar (no bets)
- should display daily P&L on calendar days
- should show correct color coding for profit/loss days
```

**Test IDs needed:**
- `calendar-month-navigation`
- `calendar-prev-month-button`
- `calendar-next-month-button`
- `calendar-today-button`
- `calendar-day-cell`
- `calendar-monthly-profit`
- `calendar-summary-stats`

---

### 2. Day Details Drawer ⚠️ **CRITICAL MISSING**

**What exists in code:**
- Drawer opens from calendar day click
- Displays grouped and ungrouped bets
- Expandable/collapsible bet groups
- Daily P&L display
- "Add Bet for This Day" button
- "View in History" button
- Edit bet from drawer
- Group statistics (record, total wager, total return)

**Missing tests:**
```typescript
// tests/e2e/notebooks/day-details-drawer.spec.ts
- should open day details drawer when clicking calendar day
- should display daily P&L in drawer header
- should show grouped bets with expand/collapse
- should display group statistics (record, wager, return)
- should expand and collapse bet groups
- should show ungrouped bets section
- should add bet from day details drawer
- should edit bet from day details drawer
- should navigate to history view from drawer
- should close drawer when adding bet
- should handle empty day (no bets)
- should display custom fields in drawer bet cards
```

**Test IDs needed:**
- `day-details-drawer`
- `day-details-title`
- `day-details-profit`
- `day-details-bet-group`
- `day-details-bet-card`
- `day-details-add-bet-button`
- `day-details-view-history-button`

---

### 3. Grouped/Flat View Toggle ⚠️ **CRITICAL MISSING**

**What exists in code:**
- Toggle between grouped and flat view
- Bet grouping by game name
- Expandable/collapsible groups
- Group statistics display
- Individual bets section when groups exist

**Missing tests:**
```typescript
// tests/e2e/notebooks/grouped-view.spec.ts
- should display grouped view by default
- should toggle to flat view
- should toggle back to grouped view
- should group bets by game name
- should expand bet group to show individual bets
- should collapse bet group to hide individual bets
- should display group statistics (wins-losses-pushes)
- should display group total wager
- should display group total return
- should show individual bets section when groups exist
- should handle bets without game grouping
- should persist view preference during session
```

**Test IDs needed:**
- `toggle-grouped-view-button`
- `bet-group-header`
- `bet-group-name`
- `bet-group-date`
- `bet-group-count`
- `bet-group-bets`

---

### 4. Custom Columns Management ⚠️ **HIGH PRIORITY**

**What exists in code:**
- Creating custom columns (via Settings or Notebook Detail)
- Editing custom columns
- Deleting custom columns
- Column types: select, text, number
- Column categories: Market, Sportsbook, Other
- Select options management
- "Other" option handling

**Missing tests:**
```typescript
// tests/e2e/notebooks/custom-columns-management.spec.ts
- should create text custom column
- should create number custom column
- should create select custom column with options
- should edit custom column name
- should edit custom column type
- should add options to select column
- should remove options from select column
- should delete custom column
- should handle duplicate column names
- should validate column name requirements
- should filter "Other" options correctly
- should persist custom columns across sessions
```

**Test IDs needed:**
- `custom-columns-section` (in Settings or Notebook Detail)
- `add-custom-column-button`
- `custom-column-name-input`
- `custom-column-type-select`
- `custom-column-category-select`
- `custom-column-options-input`
- `custom-column-save-button`
- `custom-column-delete-button`
- `custom-column-list`
- `custom-column-item`

---

### 5. Statistics Display ⚠️ **MEDIUM PRIORITY**

**What exists in code:**
- Notebook detail page statistics (Total P&L, Win Rate, ROI, Total Wagered)
- Progress bar visualization
- Color coding based on performance
- Notebook card statistics (bet count, win rate, ROI)
- Current bankroll vs starting bankroll

**Missing tests:**
```typescript
// tests/e2e/notebooks/statistics.spec.ts
- should display correct total P&L on detail page
- should display correct win rate on detail page
- should display correct ROI on detail page
- should display correct total wagered
- should show progress bar with correct percentage
- should color code progress bar based on performance
- should display statistics on notebook card
- should update statistics when bet status changes
- should handle zero bets scenario
- should calculate statistics correctly with mixed bet statuses
```

**Test IDs needed:**
- `notebook-detail-stats` (already exists)
- `notebook-card-stats` (already exists)
- `notebook-progress-bar`
- `notebook-stat-total-pl`
- `notebook-stat-win-rate`
- `notebook-stat-roi`
- `notebook-stat-total-wagered`

---

### 6. Error Handling & Edge Cases ⚠️ **MEDIUM PRIORITY**

**What exists in code:**
- Invalid notebook ID format validation
- Access denied handling
- Empty notebook handling
- Redirect on invalid ID
- Error toast notifications

**Missing tests:**
```typescript
// Add to existing error scenarios
- should redirect to notebooks list on invalid notebook ID format
- should show error toast on invalid notebook ID
- should handle access denied scenario
- should redirect when notebook not found
- should handle unauthorized notebook access
- should show appropriate error messages
```

---

### 7. Bet Status Updates ⚠️ **MEDIUM PRIORITY**

**What exists in code:**
- Updating bet status (pending → won/lost/push)
- Return amount calculation
- Statistics recalculation on status change
- Bankroll updates on status change

**Missing tests:**
```typescript
// tests/e2e/notebooks/bet-status.spec.ts
- should update bet status from pending to won
- should update bet status from pending to lost
- should update bet status to push
- should calculate return amount correctly
- should update notebook statistics on status change
- should update bankroll on status change
- should update win rate on status change
- should update ROI on status change
- should handle multiple status updates
```

**Test IDs needed:**
- `edit-bet-status-select` (already exists)
- `edit-bet-return-input` (already exists)

---

### 8. Custom Fields "Other" Option ⚠️ **LOW PRIORITY**

**What exists in code:**
- "Other..." option in select fields
- Text input when "Other" is selected
- Filtering out "Other" and "Other…" from options

**Missing tests:**
```typescript
// Add to custom-columns.spec.ts
- should show "Other..." option in select fields
- should display text input when "Other" is selected
- should save custom "Other" value
- should filter "Other" options from display
- should handle unicode ellipses in "Other" options
```

---

## Test Flow Recommendations

### Complete User Journey Tests

1. **Full Notebook Lifecycle:**
   - Create notebook → Add bets → View calendar → Click day → View details → Edit bet → Update status → View statistics

2. **Custom Columns Journey:**
   - Create custom column → Add bet with custom field → View in grouped view → Edit bet → Update custom field → Delete custom column

3. **Calendar Journey:**
   - Switch to calendar view → Navigate months → Click day → View drawer → Add bet → Return to history → Verify bet appears

4. **Grouped View Journey:**
   - Create multiple bets with same game → View grouped → Expand group → Edit bet → Collapse group → Toggle to flat view

## Priority Ranking

1. **CRITICAL** - Calendar View Features (0% coverage)
2. **CRITICAL** - Day Details Drawer (0% coverage)
3. **CRITICAL** - Grouped/Flat View Toggle (0% coverage)
4. **HIGH** - Custom Columns Management (partial coverage)
5. **MEDIUM** - Statistics Display (partial coverage)
6. **MEDIUM** - Error Handling (partial coverage)
7. **MEDIUM** - Bet Status Updates (partial coverage)
8. **LOW** - Custom Fields "Other" Option (partial coverage)

## Estimated Additional Tests Needed

- Calendar View: ~10 tests
- Day Details Drawer: ~12 tests
- Grouped View: ~12 tests
- Custom Columns Management: ~12 tests
- Statistics: ~10 tests
- Error Handling: ~6 tests
- Bet Status Updates: ~9 tests
- Other enhancements: ~5 tests

**Total: ~76 additional tests**

## Implementation Plan

### Phase 1: Critical Missing Features
1. Create `calendar-view.spec.ts`
2. Create `day-details-drawer.spec.ts`
3. Create `grouped-view.spec.ts`

### Phase 2: High Priority Features
4. Create `custom-columns-management.spec.ts`
5. Enhance `statistics.spec.ts`

### Phase 3: Medium Priority Features
6. Enhance error handling tests
7. Create `bet-status.spec.ts`

### Phase 4: Polish
8. Add edge cases and polish tests

## Notes

- Many test IDs already exist in the codebase
- Some features may require additional test IDs
- Consider adding visual regression tests for calendar and grouped views
- Performance tests may be needed for large datasets (many bets, many notebooks)

