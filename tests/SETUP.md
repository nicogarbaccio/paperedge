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
