# Test Setup Instructions

Before running tests, you need to create test data manually through the app.

## Step 1: Create Test User

1. Start the app: `npm run dev`
2. Go to http://localhost:5173
3. Click "Sign up"
4. Create account with:
   - **Email:** `test@example.com`
   - **Password:** `test123456`

## Step 2: Create Test Notebooks

Log in as the test user and create these notebooks:

### NFL 2024 Notebook
- Starting bankroll: **$1000**
- Add these bets:

1. **Chiefs -3.5**
   - Status: Won
   - Wager: $100
   - Odds: +150 (American)
   - Return: $150
   - Date: 2024-01-15

2. **Cowboys ML**
   - Status: Lost
   - Wager: $50
   - Odds: -110 (American)
   - Date: 2024-01-16

3. **Bills vs Dolphins Over 47**
   - Status: Push
   - Wager: $75
   - Odds: +200
   - Date: 2024-01-17

4. **Ravens ML**
   - Status: Pending
   - Wager: $25
   - Odds: -150
   - Date: 2024-01-18

### NBA 2024 Notebook
- Starting bankroll: **$500**
- Add these bets:

1. **Lakers ML**
   - Status: Won
   - Wager: $200
   - Odds: +100
   - Return: $200
   - Date: 2024-01-15

2. **Celtics -5.5**
   - Status: Lost
   - Wager: $150
   - Odds: -120
   - Date: 2024-01-16

### MLB 2024 Notebook
- Starting bankroll: **$750**
- Add these bets:

1. **Yankees ML**
   - Status: Won
   - Wager: $100
   - Odds: +110
   - Return: $110
   - Date: 2024-04-01

## Step 3: Run Tests

```bash
npm test
```

## Expected Results

With this test data:
- **Dashboard Total P&L:** +$260
- **NFL 2024 P&L:** +$100
- **NBA 2024 P&L:** +$50
- **MLB 2024 P&L:** +$110

## Alternative: Skip Test Data Setup

If you just want to test that the app works without exact calculations, you can create any notebooks and bets, and the navigation/functionality tests will still work (calculation tests will fail but that's okay for manual testing).

## Authentication Test Setup

### Test User Account

Before running auth tests, create a test user account in your Supabase project:

**Email**: `test@example.com`
**Password**: `test123456`

Add these to your `.env.test` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123456
```

### Running Auth Tests

To run only the authentication tests:

```bash
npm test -- tests/e2e/auth/auth.spec.ts
```

To run with UI mode (helpful for debugging):

```bash
npm test -- tests/e2e/auth/auth.spec.ts --ui
```

To run a specific test:

```bash
npm test -- tests/e2e/auth/auth.spec.ts -g "User can login"
```

### Debugging Failed Tests

If tests fail:

1. **Check the HTML report**: After tests run, open `playwright-report/index.html`
2. **Look at screenshots**: Failed tests have screenshots showing what the page looked like
3. **Check error messages**: Test output shows exact assertion failures
4. **Enable trace mode**: Add `trace: 'on'` to playwright.config.ts to record browser traces

### Common Issues

**Issue**: "Target page, context or browser has been closed"
- **Solution**: This usually indicates a Chromium crash in sandboxed environments. Try running on a non-sandboxed system.

**Issue**: "Timeout waiting for element"
- **Solution**: Page might still be loading. Check that the dev server is running and Supabase is reachable.

**Issue**: "Login failed"
- **Solution**: 
  - Verify test user exists in Supabase
  - Check that Supabase credentials in `.env.test` are correct
  - Ensure test user email matches TEST_USER_EMAIL in .env.test

### Auth Test Files

- `tests/e2e/auth/auth.spec.ts` - Main authentication tests
- `tests/fixtures/helpers.ts` - Login, logout, register helper functions
- `tests/fixtures/auth-fixtures.ts` - Custom Playwright fixtures for auth testing
- `tests/fixtures/test-data.ts` - Test user and notebook data

### Helper Functions

**`login(page, email, password)`**
- Navigates to /login
- Fills in email and password
- Clicks submit
- Waits for redirect away from login page

**`register(page, email, password)`**
- Navigates to /register
- Fills in email, password, confirm password
- Clicks submit
- Waits for success page or dashboard

**`logout(page)`**
- Finds user menu or logout button
- Clicks to trigger logout
- Waits for redirect to login/home

**`ensureLoggedOut(page)`**
- Clears all cookies and local storage
- Ensures clean logged-out state
