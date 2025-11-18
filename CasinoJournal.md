# Casino Journal Format Documentation

## Overview

The Casino Journal is a financial tracking spreadsheet designed to monitor deposits, withdrawals, and net value across multiple online casino accounts. It provides a comprehensive view of bankroll management and promotional value generation across different platforms.

## Sheet Structure

### Header Row (Row 2)

| Column | Field Name | Data Type | Description |
|--------|------------|-----------|-------------|
| A | Row Label | Text | Identifying label for the row (casino name or transaction) |
| B | SportsBook | Text | Name of the casino/sportsbook |
| C | Date | Date | Transaction date |
| D | Deposited USD | Currency | Amount deposited in USD |
| E | Withdrew USD | Currency | Amount withdrawn in USD |
| F | In Sportsbook | Currency | Current balance remaining in the account |
| G | NET | Currency | Net profit/loss (Withdrew - Deposited) |
| H | USD Value | Currency | Dollar value of promotional items/bonuses |
| I | Tokens Received | Numeric/Text | Promotional tokens or rewards earned |
| J | Net Value Generated | Currency | Total value including bonuses and net |
| K | Deposit Method | Text | Payment method used (e.g., credit card, crypto, bank transfer) |
| L | Notes | Text | Additional comments or observations |
| M | (Unused) | - | Reserved column |

## Data Organization

### Top-Level Summary
- **Row 4**: "USD CASINOS" - Aggregate totals across all casino accounts
  - Displays cumulative values for all tracked columns

### Casino Sections
The sheet is organized into separate sections for each casino:

- **Casino #1** (starts ~Row 6)
- **Casino #2** (starts ~Row 29)
- **Casino #3** (starts ~Row 41)
- **Casino #4** (starts ~Row 65)
- **Casino #5** (starts ~Row 73)

### Section Structure
Each casino section includes:
1. **Header row** with casino name and subtotals
2. **Transaction rows** (multiple rows for individual deposits/withdrawals)
3. **Blank rows** between sections for visual separation

### Subtotal Rows
Casino header rows contain formulas that sum:
- Total Deposited USD
- Total Withdrew USD
- Current balance (In Sportsbook)
- Net profit/loss
- Total USD value of promotions
- Total net value generated

## Key Metrics

### NET
Calculated as: `Withdrew USD - Deposited USD`
- Positive values indicate profit
- Negative values indicate current losses

### Net Value Generated
Total value including both cash profit and promotional value:
`NET + USD Value`

This metric captures the full value proposition of each casino relationship, including bonuses, free bets, and promotional offers.

## Use Cases

1. **Bankroll Tracking**: Monitor deposits and withdrawals across multiple accounts
2. **Profitability Analysis**: Calculate net profit/loss per casino
3. **Promotional Value**: Track value of bonuses and rewards programs
4. **Account Balancing**: See current balance in each sportsbook
5. **Bonus Hunting**: Measure success of promotional offers and signup bonuses
6. **Payment Method Tracking**: Record which deposit methods are used where
7. **Tax Preparation**: Comprehensive record of all gambling transactions

## Data Entry Workflow

1. Enter transaction date
2. Record sportsbook/casino name
3. Log deposit amount OR withdrawal amount
4. Update "In Sportsbook" balance
5. Record any promotional tokens or bonuses received
6. Calculate/note USD value of promotions
7. Add deposit method and notes as needed
8. Formulas automatically calculate NET and Net Value Generated

## Format Specifications

- **Currency Format**: USD with two decimal places ($0.00)
- **Date Format**: Standard date format (format may vary by locale)
- **Color Coding**: Not visible in export, but typically used for visual organization
- **Formula Rows**: Header rows contain SUM formulas aggregating section data

## Technical Notes for App Integration

### Required Fields
- Date
- SportsBook name
- Either Deposited USD OR Withdrew USD (at minimum)

### Optional Fields
- In Sportsbook (can be calculated)
- USD Value
- Tokens Received
- Deposit Method
- Notes

### Calculated Fields
- NET: Automated calculation from deposits/withdrawals
- Net Value Generated: Automated sum of NET + USD Value

### Data Validation Recommendations
- Ensure deposits are positive values
- Ensure withdrawals are positive values
- Date should be in valid format
- Currency values should allow decimals (2 places)
- "In Sportsbook" should not go negative (indicates data entry error)

## Example Transaction Entry

```
Date: 11/15/2025
SportsBook: Casino #1
Deposited USD: $100.00
Withdrew USD: $0.00
In Sportsbook: $100.00
NET: -$100.00
USD Value: $50.00 (signup bonus)
Tokens Received: 1000 reward points
Net Value Generated: -$50.00
Deposit Method: Credit Card
Notes: Used promo code WELCOME100
```

## Summary Dashboard (Row 4)
The top summary row provides at-a-glance totals:
- Total amount deposited across all casinos
- Total amount withdrawn
- Total currently held in all accounts
- Overall net profit/loss
- Total promotional value captured
- Total net value (profit + promotions)

This enables quick assessment of overall casino portfolio performance.