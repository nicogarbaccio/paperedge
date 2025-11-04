# End-to-End Tests

E2E tests for PaperEdge using Playwright. Run these before shipping any code to ensure critical functionality works.

## ⚠️ First Time Setup

**Before running tests**, you need to create test data. See **[SETUP.md](SETUP.md)** for step-by-step instructions.

TL;DR: Create test user (`test@example.com` / `test123456`) and three notebooks with specific bets.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with UI (recommended during development)
npm run test:ui

# Run tests in headed mode (see the browser)
npm run test:headed
```

## Test Structure

```
tests/
├── e2e/
│   ├── calculations/
│   │   └── pl-accuracy.spec.ts     # P&L calculation tests
│   ├── bets/
│   │   └── custom-fields.spec.ts   # Custom field functionality
│   └── notebooks/
│       └── navigation.spec.ts      # Notebook navigation
├── fixtures/
│   ├── test-data.ts                # Test data
│   └── helpers.ts                  # Helper functions
└── README.md
```

## What We Test

### P&L Calculations (`calculations/pl-accuracy.spec.ts`)
Critical business logic - ensures profit/loss calculations are accurate:
- Dashboard totals
- Individual notebook calculations
- Correct handling of won/lost/push/pending bets
- Consistency across different views

### Custom Fields (`bets/custom-fields.spec.ts`)
Core feature for bet customization:
- Adding custom field values when creating bets
- Editing and persisting custom values
- Toggle show/hide functionality
- No duplicate fields

### Navigation (`notebooks/navigation.spec.ts`)
Ensures navigation works without crashes or data corruption:
- Switching between notebooks
- Correct data displays for each notebook
- No errors when navigating away
- Notebooks list displays correctly

## Test Data Setup

Before running tests, you need test data in your database:

1. Create a test user:
   - Email: `test@example.com`
   - Password: `test123456`

2. Create three notebooks with bets (see [fixtures/test-data.ts](fixtures/test-data.ts) for details):
   - **NFL 2024**: 4 bets (won, lost, push, pending)
   - **NBA 2024**: 2 bets (won, lost)
   - **MLB 2024**: 1 bet (won)

You can create this data manually through the UI or use database seeding.

## Running Tests

```bash
# All tests (headless)
npm test

# UI mode - best for development
npm run test:ui

# See the browser while tests run
npm run test:headed

# Step through tests with debugger
npm run test:debug

# Run specific test file
npx playwright test tests/e2e/calculations/pl-accuracy.spec.ts

# Run specific test by name
npx playwright test -g "Dashboard shows correct"
```

## Debugging Failed Tests

### View test results
```bash
npx playwright show-report
```

### Common issues

**"Element not found" errors:**
- Your UI might use different selectors
- Update selectors in [fixtures/helpers.ts](fixtures/helpers.ts)
- Add `data-testid` attributes to components for stability

**Timeout errors:**
- Check dev server is running
- Increase timeout in [playwright.config.ts](../playwright.config.ts)
- Run in headed mode to see what's slow

**Wrong calculation values:**
- Verify test data matches [fixtures/test-data.ts](fixtures/test-data.ts)
- Check your P&L calculation logic
- Use `test:debug` to inspect values

## Making Tests More Stable

Add `data-testid` attributes to key elements:

```tsx
// Dashboard
<div data-testid="total-pl">Total P&L: ${totalPL}</div>
<div data-testid="win-rate">Win Rate: {winRate}%</div>
<div data-testid="roi">ROI: {roi}%</div>

// Bet status
<div data-status={bet.status}>...</div>

// Buttons
<button data-testid="edit-bet">Edit</button>
```

## CI/CD

Run in GitHub Actions:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test
```

## Adding New Tests

1. Create new `.spec.ts` file in appropriate directory
2. Import helpers from `fixtures/helpers.ts`
3. Focus on user-facing functionality, not implementation details
4. Make tests resilient with multiple selector strategies

Keep tests focused on what matters: **Does the feature work for users?**
