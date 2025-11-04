# Quick Test Coverage Gap Summary

## 📊 Coverage Status
- **Current**: 4 test files, 23 tests
- **Target**: ~100-120 tests
- **Gap**: 77-97 tests needed

## 🎯 Critical Gaps (Must Have)

### 1. Authentication (5-8 tests needed)
```
- ✅ [PARTIAL] Login via test helpers
- ❌ Register new user
- ❌ Login/logout complete flow
- ❌ Invalid credentials error handling
- ❌ Password reset flow
- ❌ Session persistence
- ❌ Redirect to login when unauthorized
```
**Impact**: All tests depend on auth working
**Time**: ~1-2 hours
**Suggested**: Create `tests/e2e/auth/auth.spec.ts`

### 2. Notebook CRUD (8-10 tests needed)
```
- ✅ [PARTIAL] Create via test helpers
- ✅ [PARTIAL] Navigate between notebooks
- ❌ Edit notebook (name, bankroll)
- ❌ Delete notebook with confirmation
- ❌ Notebook color changes
- ❌ Starting bankroll validation
- ❌ Duplicate name handling
- ❌ No notebooks empty state
```
**Impact**: Users can't manage notebooks
**Time**: ~2-3 hours
**Suggested**: Create `tests/e2e/notebooks/crud.spec.ts`

### 3. Bet CRUD (10-12 tests needed)
```
- ✅ [PARTIAL] Create bet (via test helpers + UI test)
- ✅ [PARTIAL] Custom field values
- ✅ Delete implied in other tests
- ❌ Edit existing bet
- ❌ Delete bet confirmation
- ❌ Change bet status (lifecycle)
- ❌ All odds formats (American, Decimal, Fractional)
- ❌ Validation errors
- ❌ Edge cases (zero wager, max values)
- ❌ Bet date ordering
```
**Impact**: Core functionality, data integrity
**Time**: ~3-4 hours
**Suggested**: Create `tests/e2e/bets/crud.spec.ts`

### 4. Tracker/Accounts (8-10 tests needed)
```
- ❌ Create account
- ❌ Edit account
- ❌ Delete account
- ❌ View account calendar
- ❌ Edit daily P&L
- ❌ Account detail page loads correctly
- ❌ Navigate from tracker to account detail
- ❌ Multiple accounts management
```
**Impact**: New major feature, recently implemented
**Time**: ~3 hours
**Suggested**: Create `tests/e2e/tracker/tracker.spec.ts`

### 5. Analytics Dashboard (6-8 tests needed)
```
- ❌ ROI accuracy
- ❌ Win rate accuracy
- ❌ Bankroll growth trend
- ❌ Date range filtering
- ❌ Bet status breakdown
- ❌ Performance metrics display
- ❌ Empty state handling
```
**Impact**: Business-critical metrics
**Time**: ~2-3 hours
**Suggested**: Extend `tests/e2e/calculations/pl-accuracy.spec.ts` or create `tests/e2e/analytics/dashboard.spec.ts`

## 📱 Medium Priority (Nice to Have)

### 6. Calculators (8-10 tests)
- Kelly Criterion validation
- Parlay calculations
- Arbitrage detection
- Unit betting
**File**: `tests/e2e/calculators/calculators.spec.ts`
**Time**: ~3 hours

### 7. Settings Page (4-6 tests)
- Password change
- User preferences
- Account settings
**File**: `tests/e2e/settings/settings.spec.ts`
**Time**: ~1.5 hours

### 8. Admin Dashboard (6-8 tests)
- Admin access verification
- Bug report management
- Feature request management
**File**: `tests/e2e/admin/admin.spec.ts`
**Time**: ~2 hours

### 9. FAQs Page (4-5 tests)
- Display FAQs
- Search functionality
- Expand/collapse
**File**: `tests/e2e/faqs/faqs.spec.ts`
**Time**: ~1 hour

## 🌐 Low Priority (Polish)

### 10. Responsive Design (6-8 tests)
- Mobile viewports
- Tablet viewports
- Navigation responsiveness
**File**: `tests/e2e/responsive/mobile.spec.ts`
**Time**: ~2 hours

### 11. Accessibility (8-10 tests)
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader compatibility
**Time**: ~2-3 hours

### 12. Error Scenarios (6-8 tests)
- Network timeouts
- Concurrent operations
- Invalid data
- Large datasets
**Time**: ~2-3 hours

## 📋 Implementation Checklist

### Phase 1: Core (Week 1)
- [ ] Auth tests (auth.spec.ts)
- [ ] Notebook CRUD (crud.spec.ts in notebooks/)
- [ ] Bet CRUD (crud.spec.ts in bets/)
- **Estimated time**: 6-8 hours
- **New tests**: ~30-40

### Phase 2: Features (Week 2)
- [ ] Tracker accounts (tracker.spec.ts)
- [ ] Analytics dashboard (dashboard.spec.ts)
- [ ] Extend P&L tests if needed
- **Estimated time**: 5-6 hours
- **New tests**: ~20-25

### Phase 3: Tools (Week 3)
- [ ] Calculators
- [ ] Settings
- [ ] Admin dashboard
- [ ] FAQs
- **Estimated time**: 5-6 hours
- **New tests**: ~20-25

### Phase 4: UX/Performance (Week 4)
- [ ] Responsive design
- [ ] Accessibility
- [ ] Error scenarios
- [ ] Performance baselines
- **Estimated time**: 5-6 hours
- **New tests**: ~20-30

## 🚀 Quick Start: Auth Tests

```typescript
// tests/e2e/auth/auth.spec.ts - Template

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('User can register', async ({ page }) => {
    // TODO: Implement
  });

  test('User can login', async ({ page }) => {
    // TODO: Implement
  });

  test('Invalid credentials show error', async ({ page }) => {
    // TODO: Implement
  });

  test('Password reset works', async ({ page }) => {
    // TODO: Implement
  });

  test('Redirects to login when not authenticated', async ({ page }) => {
    // TODO: Implement
  });
});
```

## 📞 Helper Functions Needed

Add to `tests/fixtures/helpers.ts`:

```typescript
// Authentication
export async function register(page: Page, email: string, password: string)
export async function resetPassword(page: Page, email: string)

// Notebooks
export async function deleteNotebook(page: Page, name: string)
export async function editNotebook(page: Page, name: string, updates: any)

// Bets
export async function deleteBet(page: Page, description: string)
export async function changeBetStatus(page: Page, description: string, status: string)
export async function editBet(page: Page, description: string, updates: any)

// Tracker
export async function createAccount(page: Page, name: string)
export async function editDailyPL(page: Page, accountName: string, date: string, pl: number)

// Assertions
export async function assertToastMessage(page: Page, message: string)
export async function assertValidationError(page: Page, field: string, message: string)
```

## 📈 Success Metrics

- [ ] All HIGH priority tests passing
- [ ] 80+ tests total
- [ ] CI/CD integration working
- [ ] <10 minutes total test run time
- [ ] 0 flaky tests on CI
- [ ] Documentation complete

---

**Last Updated**: November 4, 2025
**Total Test Estimate**: 100-120 tests across 4 weeks
