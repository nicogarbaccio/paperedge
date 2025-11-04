# PaperEdge Test Suite - Implementation Plan

## 🎯 Overview

This is the **detailed execution plan** for implementing 100-120 Playwright tests across 4 weeks. Each phase has specific deliverables, timelines, and success criteria.

---

## 📋 Phase 1: Foundation & Critical Path (Week 1)

**Goal**: Get core user flows tested. All other tests depend on these.

**Target**: 40 tests total (23 existing + 17 new)  
**Timeline**: 5-6 hours implementation + 2-3 hours debugging/iteration  
**Coverage**: 60% (critical path)

### Phase 1 Tasks

#### Task 1.1: Auth Tests (1-2 hours)
**File**: `tests/e2e/auth/auth.spec.ts` (NEW)

What to test:
- [ ] User registration with valid credentials
- [ ] Login with valid credentials
- [ ] Login with invalid email format
- [ ] Login with wrong password
- [ ] Unauthenticated user redirected to login
- [ ] User logout
- [ ] Protected route access without login
- [ ] Session persistence across page reloads

Resources:
- Template in: `tests/NEXT_TESTS_TO_ADD.md` (copy 5 test functions)
- Helpers to extend: `login()` already exists
- Need to add: `register(page, email, password)` helper

Success Criteria:
- ✅ All 5-8 auth tests passing
- ✅ No flaky tests
- ✅ Can run with `npm test` successfully

```bash
# Implementation:
1. Create file: touch tests/e2e/auth/auth.spec.ts
2. Copy template from NEXT_TESTS_TO_ADD.md
3. Add register() helper to helpers.ts
4. Run: npm run test:ui
5. Debug and iterate until all pass
```

---

#### Task 1.2: Notebook CRUD Tests (2-3 hours)
**File**: `tests/e2e/notebooks/crud.spec.ts` (NEW)

What to test:
- [ ] Create notebook with custom columns
- [ ] Edit notebook name
- [ ] Edit starting bankroll
- [ ] Delete notebook with confirmation
- [ ] Validation error on empty name
- [ ] Duplicate name handling (optional)
- [ ] Notebook color changes (optional)
- [ ] No empty state when notebooks exist

Resources:
- Template in: `tests/NEXT_TESTS_TO_ADD.md`
- Helpers needed:
  - `deleteNotebook(page, name)` → ADD
  - `editNotebook(page, name, updates)` → ADD
- Existing helpers: `login()`, `navigateToNotebooks()`

Success Criteria:
- ✅ All 8-10 notebook CRUD tests passing
- ✅ Create, read, update, delete all working
- ✅ Validation errors showing properly

```bash
# Implementation:
1. Create file: touch tests/e2e/notebooks/crud.spec.ts
2. Copy template from NEXT_TESTS_TO_ADD.md
3. Add deleteNotebook() helper
4. Add editNotebook() helper
5. Run: npm run test:ui
6. Iterate and refine
```

---

#### Task 1.3: Bet CRUD Tests (3-4 hours)
**File**: `tests/e2e/bets/crud.spec.ts` (NEW)

What to test:
- [ ] Edit existing bet (description, wager, odds)
- [ ] Change bet status (pending → won, lost → won, etc.)
- [ ] Delete bet with confirmation
- [ ] American odds format (+150)
- [ ] Decimal odds format (2.5)
- [ ] Fractional odds format (1/2)
- [ ] Validation error on missing fields
- [ ] Edge cases (zero wager, max values)
- [ ] Bet ordering by date
- [ ] Return amount for won bets

Resources:
- Template in: `tests/NEXT_TESTS_TO_ADD.md`
- Helpers needed:
  - `deleteBet(page, description)` → ADD
  - `changeBetStatus(page, description, status)` → ADD
  - `editBet(page, description, updates)` → ADD
- Existing helpers: `createBet()` already exists
- Pre-created test data: NFL, NBA, MLB notebooks

Success Criteria:
- ✅ All 10-12 bet CRUD tests passing
- ✅ All odds formats working
- ✅ Status changes persisting
- ✅ Validations working

```bash
# Implementation:
1. Create file: touch tests/e2e/bets/crud.spec.ts
2. Copy template from NEXT_TESTS_TO_ADD.md
3. Add deleteBet() helper
4. Add changeBetStatus() helper
5. Add editBet() helper
6. Add assertion helpers: assertToastMessage(), assertValidationError()
7. Run: npm run test:ui
8. Iterate - this will take the longest
```

---

#### Task 1.4: Update Helper Functions (1 hour)
**File**: `tests/fixtures/helpers.ts` (EXTEND)

Functions to add:
```typescript
// Authentication
export async function register(page: Page, email: string, password: string)

// Notebook operations
export async function deleteNotebook(page: Page, notebookName: string)
export async function editNotebook(page: Page, name: string, updates: any)

// Bet operations
export async function deleteBet(page: Page, betDescription: string)
export async function changeBetStatus(page: Page, description: string, newStatus: string)
export async function editBet(page: Page, description: string, updates: any)

// Assertions
export async function assertToastMessage(page: Page, message: string)
export async function assertValidationError(page: Page, field: string, message: string)
export async function assertElementCount(page: Page, selector: string, count: number)
```

Success Criteria:
- ✅ All helpers are typed correctly
- ✅ Helpers are reusable across tests
- ✅ No duplicate code

---

### Phase 1 Milestones

```
Day 1:
  └─ Auth tests complete (5 tests) ✅

Day 2-3:
  └─ Notebook CRUD tests complete (8-10 tests) ✅

Day 3-4:
  └─ Bet CRUD tests complete (10-12 tests) ✅

Day 5:
  └─ All helpers added and working ✅
  └─ All 40 tests passing ✅
  └─ CI/CD runs successfully ✅

End of Week 1:
  ├─ 40 total tests (23 + 17 new)
  ├─ 60% coverage of critical paths
  ├─ All tests passing locally
  ├─ Ready for Phase 2
  └─ Documentation updated
```

---

### Phase 1 Success Checklist

- [ ] Auth tests (5-8) all passing
- [ ] Notebook CRUD tests (8-10) all passing
- [ ] Bet CRUD tests (10-12) all passing
- [ ] All helper functions working
- [ ] Total: 40 tests
- [ ] Runtime: <5 minutes
- [ ] 0 flaky tests
- [ ] Tests run successfully in CI

**If any tests fail**: Debug in `test:ui` mode first, then check helpers

---

## 📋 Phase 2: Feature Completeness (Week 2)

**Goal**: Test new and advanced features. Business logic fully validated.

**Target**: 60+ tests total (40 + 20-25 new)  
**Timeline**: 5-6 hours implementation  
**Coverage**: 80% (most features tested)

### Phase 2 Tasks

#### Task 2.1: Tracker/Account Tests (2-3 hours)
**File**: `tests/e2e/tracker/tracker.spec.ts` (NEW)

What to test:
- [ ] Create new account
- [ ] Edit account name
- [ ] Delete account with confirmation
- [ ] View account calendar
- [ ] Edit daily P&L entry
- [ ] Navigate to account detail page (`/tracker/accounts/:id`)
- [ ] Multiple accounts management
- [ ] Account data persists after navigation

Dependencies: Phase 1 complete (auth, navigation)

Resources:
- Helpers to add:
  - `createAccount(page, name)`
  - `editAccount(page, name, updates)`
  - `deleteAccount(page, name)`
  - `navigateToTracker()`
  - `editDailyPL(page, accountName, date, pl)`

Success Criteria:
- ✅ All 8 account tests passing
- ✅ Calendar displays correctly
- ✅ Daily P&L editable and persisted

```bash
# Implementation:
1. Create file: tests/e2e/tracker/tracker.spec.ts
2. Write tests for account CRUD operations
3. Write tests for calendar functionality
4. Write tests for daily P&L editing
5. Add required helpers to fixtures/helpers.ts
6. Run: npm run test:ui
```

---

#### Task 2.2: Analytics Dashboard Tests (2-3 hours)
**File**: `tests/e2e/analytics/dashboard.spec.ts` (NEW)

What to test:
- [ ] ROI calculation accuracy
- [ ] Win rate percentage display
- [ ] Bankroll growth trend line
- [ ] Date range filtering
- [ ] Bet status breakdown (won/lost/push/pending)
- [ ] No results state handling
- [ ] Performance metrics display
- [ ] Consistency across dashboard and notebook views

Dependencies: Phase 1 complete (P&L tests already exist)

Resources:
- Reuse existing helpers from p1-accuracy.spec.ts
- Extend `assertDashboardPL()` helper
- Add new assertion helpers:
  - `assertROIAccuracy()`
  - `assertWinRateAccuracy()`
  - `assertBankrollGrowth()`

Success Criteria:
- ✅ All 8 analytics tests passing
- ✅ Calculations verified as accurate
- ✅ UI displays metrics correctly

```bash
# Implementation:
1. Create file: tests/e2e/analytics/dashboard.spec.ts
2. Reference existing P&L calculation tests
3. Add date range filtering tests
4. Add breakdown/pie chart tests
5. Run: npm run test:ui
```

---

#### Task 2.3: Calculator Tests (2-3 hours)
**File**: `tests/e2e/calculators/calculators.spec.ts` (NEW)

What to test:
- [ ] Kelly Criterion calculator accuracy
- [ ] Parlay calculator accuracy
- [ ] Arbitrage calculator detection
- [ ] Unit betting calculator
- [ ] Input validation
- [ ] Edge cases (0% edge, perfect odds, etc.)
- [ ] Results display correctly

Dependencies: Phase 1 complete

Resources:
- No special helpers needed
- Use standard form filling
- Use simple math for verification

Success Criteria:
- ✅ All 6-8 calculator tests passing
- ✅ Calculations mathematically correct
- ✅ Edge cases handled properly

```bash
# Implementation:
1. Create file: tests/e2e/calculators/calculators.spec.ts
2. Test each calculator independently
3. Verify math accuracy
4. Test edge cases and errors
5. Run: npm run test:ui
```

---

### Phase 2 Milestones

```
Day 1-2:
  └─ Tracker/Account tests complete (8 tests) ✅

Day 2-3:
  └─ Analytics Dashboard tests complete (8 tests) ✅

Day 3-4:
  └─ Calculator tests complete (6-8 tests) ✅

End of Week 2:
  ├─ 60+ total tests (40 + 20-25 new)
  ├─ 80% coverage
  ├─ Business logic fully validated
  ├─ All features have E2E tests
  ├─ Ready for Phase 3
  └─ Prepare for advanced testing
```

---

### Phase 2 Success Checklist

- [ ] Tracker tests (8) all passing
- [ ] Analytics tests (8) all passing
- [ ] Calculator tests (6-8) all passing
- [ ] Total: 60+ tests
- [ ] Runtime: ~5-7 minutes
- [ ] 0 flaky tests
- [ ] All business logic validated

---

## 📋 Phase 3: Tools & Settings (Week 3)

**Goal**: Complete secondary features. Settings and admin coverage.

**Target**: 75+ tests total (60 + 15-20 new)  
**Timeline**: 4-5 hours implementation  
**Coverage**: 90% (nearly complete)

### Phase 3 Tasks

#### Task 3.1: Settings Page Tests (1-1.5 hours)
**File**: `tests/e2e/settings/settings.spec.ts` (NEW)

What to test:
- [ ] Edit user profile
- [ ] Change password validation
- [ ] Change password success
- [ ] Password confirmation mismatch error
- [ ] Current password verification
- [ ] Preferences/settings save
- [ ] Logout from all sessions
- [ ] Account deletion confirmation

Dependencies: Phase 1 complete

---

#### Task 3.2: Admin Dashboard Tests (2 hours)
**File**: `tests/e2e/admin/admin.spec.ts` (NEW)

What to test:
- [ ] Admin role verification
- [ ] View bug reports list
- [ ] View feature requests list
- [ ] Mark bug as resolved
- [ ] Feature request voting
- [ ] Non-admin cannot access
- [ ] Pagination works

Dependencies: Phase 1 complete + need admin user

---

#### Task 3.3: FAQs/Help Tests (1 hour)
**File**: `tests/e2e/faqs/faqs.spec.ts` (NEW)

What to test:
- [ ] Display FAQ items
- [ ] Search FAQs by keyword
- [ ] Filter FAQs by category
- [ ] Expand/collapse FAQ items
- [ ] FAQ persistence after navigation
- [ ] Mobile responsiveness

Dependencies: Phase 1 complete

---

### Phase 3 Milestones

```
Day 1:
  └─ Settings tests complete (5 tests) ✅

Day 1-2:
  └─ Admin Dashboard tests complete (8 tests) ✅

Day 2:
  └─ FAQs tests complete (5 tests) ✅

End of Week 3:
  ├─ 75+ total tests (60 + 15-20 new)
  ├─ 90% feature coverage
  ├─ All major features tested
  ├─ Ready for Phase 4 (polish)
  └─ Prepare responsive + accessibility
```

---

### Phase 3 Success Checklist

- [ ] Settings tests (5) all passing
- [ ] Admin tests (8) all passing
- [ ] FAQs tests (5) all passing
- [ ] Total: 75+ tests
- [ ] Runtime: ~6-8 minutes
- [ ] All features have tests

---

## 📋 Phase 4: Polish & Performance (Week 4)

**Goal**: UX perfection, accessibility, performance baseline.

**Target**: 120 tests total (75 + 20-30 new)  
**Timeline**: 5-6 hours implementation  
**Coverage**: 95%+ (comprehensive)

### Phase 4 Tasks

#### Task 4.1: Responsive Design Tests (2 hours)
**File**: `tests/e2e/responsive/mobile.spec.ts` (NEW)

What to test:
- [ ] Mobile layout (375x667) - all pages
- [ ] Tablet layout (768x1024) - all pages
- [ ] Desktop layout (1920x1080) - sanity check
- [ ] Navigation responsive behavior
- [ ] Forms work on mobile
- [ ] Touch interactions work
- [ ] No horizontal scroll

Viewports to test:
```javascript
[
  { width: 375, height: 667 },   // iPhone SE
  { width: 768, height: 1024 },  // iPad
  { width: 1920, height: 1080 }  // Desktop
]
```

---

#### Task 4.2: Accessibility Tests (2-3 hours)
**File**: Integrate into existing test files (ADD to all)

What to test:
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Heading hierarchy proper (h1, h2, h3)
- [ ] Color contrast WCAG AA compliant
- [ ] Form labels properly associated
- [ ] Screen reader announcements
- [ ] Skip navigation links work

Implementation approach:
- Add to auth tests
- Add to bet creation flow
- Add to dashboard
- Add to settings

---

#### Task 4.3: Error Scenario Tests (2 hours)
**File**: Integrate into existing test files (ADD to all)

What to test:
- [ ] Network timeouts handled gracefully
- [ ] Invalid data shows errors
- [ ] Concurrent operations don't corrupt data
- [ ] Large datasets load properly (100+ bets)
- [ ] Special characters handled (emojis, accents)
- [ ] Very long strings (500+ chars)
- [ ] Max/min numeric values
- [ ] Server errors show user-friendly messages

---

#### Task 4.4: Performance Baselines (1 hour)
**File**: `tests/e2e/performance/performance.spec.ts` (NEW)

What to measure:
- [ ] Dashboard load time < 2s
- [ ] Notebook detail load < 1.5s
- [ ] Bet creation form responsiveness
- [ ] Navigation between notebooks < 1s
- [ ] Search/filter responsiveness
- [ ] No memory leaks during session

Metrics to track:
```javascript
const metrics = {
  LCP: "< 2.5s",      // Largest Contentful Paint
  FID: "< 100ms",     // First Input Delay
  CLS: "< 0.1",       // Cumulative Layout Shift
  TTFB: "< 600ms"     // Time to First Byte
}
```

---

### Phase 4 Milestones

```
Day 1-2:
  └─ Responsive design tests (6-8 tests) ✅
  └─ Add test:mobile command to package.json

Day 2-3:
  └─ Accessibility tests (8-10) integrated ✅
  └─ All critical flows keyboard navigable

Day 3-4:
  └─ Error scenario tests (6-8) added ✅
  └─ Edge cases handled

Day 4-5:
  └─ Performance baseline established (4-6 tests) ✅
  └─ Metrics documented

End of Week 4:
  ├─ 120 total tests (75 + 20-30 new) ✅
  ├─ 95%+ comprehensive coverage ✅
  ├─ All user flows tested ✅
  ├─ Performance baseline established ✅
  ├─ Accessibility compliant ✅
  ├─ Responsive design verified ✅
  └─ COMPLETE! 🎉
```

---

### Phase 4 Success Checklist

- [ ] Responsive tests (6-8) all passing
- [ ] Accessibility tests (8-10) all passing
- [ ] Error scenario tests (6-8) all passing
- [ ] Performance tests (4-6) established
- [ ] Total: 120 tests
- [ ] Runtime: 8-10 minutes
- [ ] 0 flaky tests
- [ ] All metrics documented
- [ ] Ready for production

---

## 🗓️ Weekly Timeline

### Week 1: Critical Path
```
Mon: Auth tests (1-2h)
Tue: Notebook CRUD (2-3h)
Wed: Bet CRUD (3-4h)
Thu: Helpers + debugging (2h)
Fri: Final verification + team review (1-2h)

Outcome: 40 tests, 60% coverage
```

### Week 2: Feature Completeness
```
Mon: Tracker tests (2-3h)
Tue: Analytics tests (2-3h)
Wed: Calculator tests (2-3h)
Thu: Debugging + refinement (2h)
Fri: Verification + team review (1-2h)

Outcome: 60+ tests, 80% coverage
```

### Week 3: Tools & Settings
```
Mon: Settings tests (1-1.5h)
Tue: Admin tests (2h)
Wed: FAQs tests (1h)
Thu-Fri: Debugging + refinement (3h)

Outcome: 75+ tests, 90% coverage
```

### Week 4: Polish
```
Mon-Tue: Responsive tests (2h)
Tue-Wed: Accessibility integration (2-3h)
Wed-Thu: Error scenarios (2h)
Thu: Performance baseline (1h)
Fri: Final review + documentation (1h)

Outcome: 120 tests, 95% coverage, COMPLETE ✅
```

---

## 📊 Expected Test Growth

```
Week 1: 23 → 40 tests  (60% coverage)
        Phases complete: Auth, CRUD basics

Week 2: 40 → 60+ tests (80% coverage)
        Phases complete: Tracker, Analytics, Calculators

Week 3: 60 → 75+ tests (90% coverage)
        Phases complete: Settings, Admin, FAQs

Week 4: 75 → 120 tests (95%+ coverage)
        Phases complete: Responsive, Accessibility, Performance
```

---

## 🎯 Daily Standup Template

Each day, track:
```
Date: [DATE]
Phase: [PHASE #]
Task: [TASK NAME]
Status: [ON TRACK / AT RISK / BLOCKED]

Completed:
- [ ] Item 1
- [ ] Item 2

In Progress:
- [ ] Item 3

Blockers:
- [ ] None / [ISSUE]

Tests Passing: X/Y
Tests Failing: Z

Next Steps:
- [ ] Action 1
- [ ] Action 2
```

---

## 🚨 Risk Mitigation

### If Behind Schedule

**Option 1: Reduce scope**
- Skip optional tests in Phase 4 (accessibility can be done incrementally)
- Focus on Phase 1-3 (100 tests) instead of 120
- Performance testing can be deferred

**Option 2: Parallelize**
- Get 2 developers: one on Phase 1.2 + 1.3, one on Phase 2
- Coordinate on helpers.ts updates
- Code review in batches

**Option 3: Extend timeline**
- Move Phase 4 to Week 5
- Better quality tests with less rush
- More time for debugging flaky tests

### If Tests Are Flaky

**Debugging approach:**
1. Run test multiple times in `test:ui` mode
2. Check if it's timing-related (add more `waitForLoadState()`)
3. Check if it's selector-related (use `data-testid` instead)
4. Check if it's async code not awaiting properly
5. Add debug logging to understand state

**Common issues:**
- Missing `.waitForLoadState('networkidle')`
- Using fragile text selectors instead of `data-testid`
- Race conditions in form submission
- Timeouts too aggressive (increase from 5s to 10s)

---

## 📈 Success Metrics by Phase

### Phase 1 Done When:
- ✅ 40 tests total
- ✅ All auth/CRUD tests passing
- ✅ <5 min runtime
- ✅ 0 flaky tests
- ✅ Team approval

### Phase 2 Done When:
- ✅ 60+ tests total
- ✅ All tracker/analytics tests passing
- ✅ 5-7 min runtime
- ✅ Business logic verified
- ✅ Team approval

### Phase 3 Done When:
- ✅ 75+ tests total
- ✅ All features have tests
- ✅ 6-8 min runtime
- ✅ Secondary features complete
- ✅ Team approval

### Phase 4 Done When:
- ✅ 120 tests total
- ✅ 95%+ coverage
- ✅ 8-10 min runtime
- ✅ All metrics met
- ✅ Ready for production
- ✅ Team sign-off

---

## 📞 Communication Plan

**Kickoff** (Start of Week 1):
- Review this implementation plan
- Assign ownership (solo or pairs)
- Set up daily standups
- Create Slack channel for questions

**Weekly Reviews** (Every Friday):
- Show progress: X tests passing
- Demo new tests in UI mode
- Discuss any blockers
- Adjust plan if needed

**Completion** (End of Week 4):
- Final verification
- Documentation updated
- Team celebration 🎉
- Plan for maintenance going forward

---

## 🚀 Getting Started NOW

### Pre-Implementation (30 mins)
```bash
1. Read PLAYWRIGHT_TEST_SUMMARY.md
2. Read NEXT_TESTS_TO_ADD.md
3. Run npm run test:ui
4. Familiarize yourself with existing tests
5. Review this implementation plan with team
```

### Phase 1 Kickoff (2 hours)
```bash
1. Create auth test file: mkdir -p tests/e2e/auth
2. Copy auth template from NEXT_TESTS_TO_ADD.md
3. Add register() helper to helpers.ts
4. Run npm run test:ui
5. Start debugging/iterating
```

### Keep Momentum
```bash
1. Work in 2-hour focused blocks
2. Run npm run test:ui after each change
3. Update helpers as you discover needs
4. Ask for help if stuck > 30 mins
5. Move to next test when one passes
```

---

## 📚 Reference Documents

As you implement, reference these:
- **NEXT_TESTS_TO_ADD.md** - Copy test templates
- **TEST_GAPS_SUMMARY.md** - Quick checklist
- **PLAYWRIGHT_ARCHITECTURE.md** - How things work
- **helpers.ts** - What functions exist
- **test-data.ts** - Available test data

---

## ✨ You Got This! 🚀

This is an aggressive but achievable 4-week plan. Stay focused on:
1. **Week 1**: Get the foundation right (auth, CRUD)
2. **Week 2**: Test advanced features (tracker, analytics)
3. **Week 3**: Fill gaps (settings, admin, help)
4. **Week 4**: Polish and performance

**Progress tracking**: After each phase, you'll have visible progress (40 → 60 → 75 → 120 tests).

**Questions?** Reference the docs or check the helpers - most solutions are already documented!

---

**Implementation Plan Version**: 1.0  
**Created**: November 4, 2025  
**Status**: Ready to execute  
**Time Estimate**: 20-24 hours implementation + 10-12 hours debugging = ~30-36 hours total

