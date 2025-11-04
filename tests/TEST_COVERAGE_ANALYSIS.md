# Playwright Test Coverage Analysis

## Current Test Suite Status

### ✅ Currently Covered (4 test files)

#### 1. **P&L Accuracy Tests** (`e2e/calculations/pl-accuracy.spec.ts`)
- Dashboard total P&L display
- Notebook detail P&L calculations
- Handling of different bet statuses (won, lost, push, pending)
- Consistency between dashboard and notebook views
- **Test Data**: 7 bets across 3 notebooks (NFL, NBA, MLB)

#### 2. **Custom Fields Tests** (`e2e/bets/custom-fields.spec.ts`)
- Adding custom field values when creating bets
- Custom field persistence when editing bets
- Toggle show/hide functionality for additional fields
- No duplicate custom fields verification

#### 3. **Notebook Navigation Tests** (`e2e/notebooks/navigation.spec.ts`)
- Switching between different notebooks
- Correct data display per notebook
- Navigation without errors or crashes
- Notebook list displays all created notebooks
- Console error tracking for unmounted components

#### 4. **Support Page Tests** (`e2e/support/support-page.spec.ts`)
- Help Center browsing and search
- Bug report form validation and submission
- Feature request form and voting
- Accessibility checks (heading hierarchy, ARIA labels)
- Mobile responsiveness (375x667 viewport)

**Total Tests: 23**

---

## 🚨 Missing Test Coverage - Priority Map

### HIGH PRIORITY (Critical User Flows)

#### 1. **Authentication & Authorization** ⚠️
- [ ] User registration
- [ ] User login/logout
- [ ] Session management
- [ ] Handling invalid credentials
- [ ] Password reset flow (partially in code but not tested)
- [ ] Protected routes redirect to login when needed
- [ ] Admin role detection and access
- **Why critical**: Core feature, security-sensitive, affects all other tests

#### 2. **Notebook CRUD Operations** ⚠️
- [ ] Create notebook with custom columns
- [ ] Edit notebook (name, bankroll)
- [ ] Delete notebook (with confirmation)
- [ ] Change notebook color
- [ ] Starting bankroll validation
- **Why critical**: Foundation for all betting functionality

#### 3. **Bet CRUD Operations** ⚠️
- [ ] Create bet (all fields, all odds formats: American, Decimal, Fractional)
- [ ] Edit existing bet
- [ ] Delete bet (with confirmation)
- [ ] Change bet status (won → lost, pending → won, etc.)
- [ ] Validate required fields
- [ ] Handle edge cases (zero wager, negative odds, etc.)
- **Why critical**: Core betting data operations

#### 4. **Bet Tracker/Accounts** ⚠️
- [ ] Create new account
- [ ] Edit account name/settings
- [ ] View account calendar
- [ ] Edit daily P&L entries
- [ ] Navigate between accounts at `/tracker/accounts/:id`
- [ ] Account deletion
- **Why critical**: New major feature in recent development

#### 5. **Analytics & Dashboard** ⚠️
- [ ] ROI calculation accuracy
- [ ] Win rate percentage display
- [ ] Bankroll growth chart
- [ ] Date range filtering
- [ ] Win/loss streaks
- [ ] Bet status distribution (pie chart or breakdown)
- **Why critical**: Business-critical calculations and analytics

---

### MEDIUM PRIORITY (Important Features)

#### 6. **Calculators** 
- [ ] Kelly Criterion Calculator
- [ ] Parlay Calculator
- [ ] Arbitrage Calculator
- [ ] Unit Betting Calculator
- [ ] Input validation
- [ ] Result accuracy
- **Files**: `CalculatorsPage.tsx`, `components/calculators/`

#### 7. **Settings Page**
- [ ] Edit user profile
- [ ] Change password
- [ ] Manage preferences
- [ ] Account security settings
- [ ] Logout from other sessions
- **File**: `pages/SettingsPage.tsx`

#### 8. **Admin Dashboard**
- [ ] Admin role verification
- [ ] Bug reports admin panel
- [ ] Feature requests admin panel
- [ ] User management (if applicable)
- **Files**: `pages/AdminDashboard.tsx`, `components/admin/`

#### 9. **FAQs Page**
- [ ] Display FAQ items
- [ ] Search/filter FAQs
- [ ] Expand/collapse items
- [ ] Mobile responsiveness
- **File**: `pages/FAQsPage.tsx`

---

### LOW PRIORITY (UX/Polish)

#### 10. **Responsive Design**
- [ ] Mobile layout (375px) - support page only tested
- [ ] Tablet layout (768px)
- [ ] Desktop layout (1920px+)
- [ ] Touch interactions on mobile
- [ ] Navigation on mobile (sidebar vs. mobile nav)
- **Files**: `components/layout/MobileNav.tsx`, responsive Tailwind

#### 11. **Accessibility**
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader announcements (success/error toasts)
- [ ] Color contrast compliance (WCAG AA)
- [ ] Focus indicators visible
- [ ] Semantic HTML

#### 12. **Performance Baseline**
- [ ] Page load times (LCP, FCP, CLS)
- [ ] Network throttling tests
- [ ] Large dataset performance (100+ bets)
- [ ] Memory usage during long sessions
- [ ] Image optimization verification

#### 13. **Error Handling & Edge Cases**
- [ ] Network errors during data loading
- [ ] Timeout handling
- [ ] Concurrent operations (race conditions)
- [ ] Very long strings in bet descriptions
- [ ] Special characters in notebook names
- [ ] Maximum/minimum numeric values
- [ ] No results state (empty notebooks, empty tracker)

---

## Test Organization Plan

```
tests/
├── e2e/
│   ├── auth/                    [NEW]
│   │   └── auth.spec.ts
│   ├── notebooks/
│   │   ├── navigation.spec.ts   [EXISTING]
│   │   └── crud.spec.ts         [NEW]
│   ├── bets/
│   │   ├── custom-fields.spec.ts [EXISTING]
│   │   └── crud.spec.ts         [NEW]
│   ├── tracker/                 [NEW]
│   │   └── tracker.spec.ts
│   ├── analytics/               [NEW]
│   │   └── dashboard.spec.ts
│   ├── calculators/             [NEW]
│   │   └── calculators.spec.ts
│   ├── settings/                [NEW]
│   │   └── settings.spec.ts
│   ├── admin/                   [NEW]
│   │   └── admin.spec.ts
│   ├── faqs/                    [NEW]
│   │   └── faqs.spec.ts
│   ├── calculations/
│   │   └── pl-accuracy.spec.ts  [EXISTING]
│   ├── support/
│   │   └── support-page.spec.ts [EXISTING]
│   └── responsive/              [NEW]
│       └── mobile.spec.ts
├── fixtures/
│   ├── helpers.ts               [EXISTING - will extend]
│   └── test-data.ts             [EXISTING - will extend]
└── README.md
```

---

## Test Data Requirements

### Current Setup
- Test user: `test@example.com` / `test123456`
- 3 test notebooks with pre-defined bets
- Custom columns (Sport, League, Bet Type, Notes, Confidence)

### Additional Needed
- Test data for tracker accounts
- Admin user for admin dashboard tests
- Multiple users for concurrent operation tests
- Fixtures for error scenarios (invalid data, etc.)
- Large dataset fixtures (100+ bets for performance testing)

---

## Recommended Implementation Order

1. **Phase 1 (Immediate)**: Authentication & basic CRUD
   - Auth tests (login, logout, invalid creds)
   - Notebook CRUD
   - Bet CRUD
   - Estimated: 30-40 tests

2. **Phase 2 (Week 2)**: Tracker & Analytics
   - Tracker account management
   - Analytics/dashboard advanced features
   - Estimated: 20-25 tests

3. **Phase 3 (Week 3)**: Calculators & Polish
   - Calculator accuracy tests
   - Settings & admin
   - Estimated: 15-20 tests

4. **Phase 4 (Week 4)**: UX/Performance
   - Responsive design
   - Accessibility
   - Performance baselines
   - Error scenarios
   - Estimated: 25-30 tests

**Total Projected Coverage**: ~100-120 comprehensive E2E tests

---

## CI/CD Integration Notes

- Tests run on every commit (currently in GitHub Actions)
- Retries on CI: 2x (helps with flaky network tests)
- Parallel workers: 1 on CI (sequential), unlimited locally
- Screenshots/traces: Only on failure
- Reporter: HTML report generated
- Timeout: 120s for webServer startup

Current: `npm test` runs in ~2-3 minutes
Projected with all tests: ~8-10 minutes

---

## Helper Functions to Add

```typescript
// New helpers in fixtures/helpers.ts

// Authentication
export async function register(page: Page, email: string, password: string): Promise<void>
export async function resetPassword(page: Page, email: string): Promise<void>

// Notebook operations
export async function deleteNotebook(page: Page, notebookName: string): Promise<void>
export async function editNotebook(page: Page, name: string, updates: { name?: string; bankroll?: number }): Promise<void>

// Bet operations
export async function deleteBet(page: Page, betDescription: string): Promise<void>
export async function changeBetStatus(page: Page, betDescription: string, newStatus: string): Promise<void>

// Tracker operations
export async function createAccount(page: Page, accountName: string): Promise<void>
export async function editDailyPL(page: Page, accountName: string, date: string, pl: number): Promise<void>

// Assertions
export async function assertToastMessage(page: Page, message: string): Promise<void>
export async function assertPageTitle(page: Page, title: string): Promise<void>
export async function assertElementCount(page: Page, selector: string, count: number): Promise<void>
```

---

## Success Criteria for Full Coverage

- ✅ All user flows tested (happy path + error cases)
- ✅ Critical calculations verified
- ✅ Data persistence confirmed
- ✅ No console errors in critical flows
- ✅ Accessibility baseline met
- ✅ Mobile responsiveness verified
- ✅ Performance benchmarks established
- ✅ Documentation complete for new tests
