# Casino Tracker User Experience

## Visual Flow

### 1. Adding a Casino Account

**Bet Tracker Page → Add Account Button**

```
┌─────────────────────────────────────────────┐
│ Add Account                            [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Name                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ BetMGM Casino                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Type                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Main                                  ▼ │ │
│ │ Offshore                                │ │
│ │ Casino         ← NEW!                   │ │
│ │ Other                                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [Cancel]    [Create]           │
└─────────────────────────────────────────────┘
```

### 2. Tracker Page with Casino Account

```
┌───────────────────────────────────────────────────────────┐
│ Bet Tracker                        [Add Account]          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ Accounts                                                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│ │ DraftKings   │ │ FanDuel      │ │ BetMGM Casino│      │
│ │ (main)     ↗ │ │ (main)     ↗ │ │ (casino)   ↗ │      │
│ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                           │
│ NOVEMBER 2025                              +$1,250       │
│ ┌─────────────────────────────────────────────────────┐  │
│ │  S   M   T   W   TH   F   S                         │  │
│ ├─────────────────────────────────────────────────────┤  │
│ │              1   2    3    4    5                   │  │
│ │                  +50  -30  +100  -20                │  │
│ │  6   7   8   9   10   11   12                       │  │
│ │  +75 -25 +200 ...                                   │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### 3. Daily P/L Entry - Standard Account

**Clicking a date with standard accounts shows simple P/L:**

```
┌─────────────────────────────────────────────┐
│ Edit P/L - November 15, 2025          [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ DraftKings                              │ │
│ │ main                                    │ │
│ │                        P/L              │ │
│ │                        ┌──────────┐     │ │
│ │                        │  +150.00 │     │ │
│ │                        └──────────┘     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ FanDuel                                 │ │
│ │ main                                    │ │
│ │                        P/L              │ │
│ │                        ┌──────────┐     │ │
│ │                        │   -50.00 │     │ │
│ │                        └──────────┘     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [Cancel]    [Save]             │
└─────────────────────────────────────────────┘
```

### 4. Daily P/L Entry - Casino Account (Enhanced Form)

**Clicking a date with casino account shows full transaction form:**

```
┌────────────────────────────────────────────────────────┐
│ Edit P/L - November 15, 2025                      [×]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ BetMGM Casino                                    │  │
│ │ casino                                           │  │
│ │                                                  │  │
│ │ ┌────────────────────────────────────────────┐   │  │
│ │ │  Deposited USD       Withdrew USD          │   │  │
│ │ │  ┌──────────┐       ┌──────────┐          │   │  │
│ │ │  │  100.00  │       │  250.00  │          │   │  │
│ │ │  └──────────┘       └──────────┘          │   │  │
│ │ │                                            │   │  │
│ │ │  In Casino           NET (Auto)            │   │  │
│ │ │  ┌──────────┐       ┌──────────┐          │   │  │
│ │ │  │  150.00  │       │ +150.00  │ (readonly)│   │  │
│ │ │  └──────────┘       └──────────┘          │   │  │
│ │ │                                            │   │  │
│ │ │  Promo Value USD     Tokens Received       │   │  │
│ │ │  ┌──────────┐       ┌──────────┐          │   │  │
│ │ │  │   50.00  │       │ 500 pts  │          │   │  │
│ │ │  └──────────┘       └──────────┘          │   │  │
│ │ │                                            │   │  │
│ │ │  Deposit Method                            │   │  │
│ │ │  ┌────────────────────────────┐            │   │  │
│ │ │  │ Credit Card                │            │   │  │
│ │ │  └────────────────────────────┘            │   │  │
│ │ │                                            │   │  │
│ │ │  Notes                                     │   │  │
│ │ │  ┌────────────────────────────┐            │   │  │
│ │ │  │ Used promo code WELCOME100 │            │   │  │
│ │ │  └────────────────────────────┘            │   │  │
│ │ └────────────────────────────────────────────┘   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│                     [Cancel]    [Save]                 │
└────────────────────────────────────────────────────────┘
```

### 5. Mixed Account Types in Same Dialog

**When you have both standard and casino accounts:**

```
┌────────────────────────────────────────────────────────┐
│ Edit P/L - November 15, 2025                      [×]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ DraftKings                                       │  │
│ │ main                                             │  │
│ │                        P/L                       │  │
│ │                        ┌──────────┐              │  │
│ │                        │  +150.00 │              │  │
│ │                        └──────────┘              │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ BetMGM Casino                                    │  │
│ │ casino                                           │  │
│ │                                                  │  │
│ │ ┌────────────────────────────────────────────┐   │  │
│ │ │  Deposited USD       Withdrew USD          │   │  │
│ │ │  ┌──────────┐       ┌──────────┐          │   │  │
│ │ │  │  100.00  │       │  250.00  │          │   │  │
│ │ │  └──────────┘       └──────────┘          │   │  │
│ │ │                                            │   │  │
│ │ │  In Casino           NET (Auto)            │   │  │
│ │ │  ┌──────────┐       ┌──────────┐          │   │  │
│ │ │  │  150.00  │       │ +150.00  │          │   │  │
│ │ │  └──────────┘       └──────────┘          │   │  │
│ │ │  ... (more casino fields)                  │   │  │
│ │ └────────────────────────────────────────────┘   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│                     [Cancel]    [Save]                 │
└────────────────────────────────────────────────────────┘
```

## Key UX Principles

### 1. Progressive Disclosure
- Standard accounts see simple P/L entry
- Casino accounts see enhanced transaction form
- Users never see casino fields unless they create a casino account

### 2. Auto-Calculation
- NET is automatically calculated from deposits/withdrawals
- Field is read-only to prevent confusion
- Updates in real-time as user types

### 3. Visual Hierarchy
- Casino fields are grouped in a visually distinct section
- Light background (`bg-surface-secondary/30`) separates from standard fields
- Border around each account for clear separation

### 4. Flexibility
- All casino fields are optional (except deposits/withdrawals for NET calc)
- Users can track as much or as little detail as they want
- Can mix casino and standard accounts freely

### 5. Consistent Calendar View
- Same calendar interface for all account types
- Click any date to edit
- Color coding for profit (green) vs loss (red)
- Monthly, YTD, and all-time totals

## Mobile Responsiveness

The enhanced casino form uses a responsive grid:
- **Desktop**: 2-column layout for field pairs
- **Mobile**: Stacks to single column
- All fields remain accessible and usable on small screens

## Accessibility

- All fields have proper labels
- Semantic HTML structure
- Keyboard navigation supported
- Test IDs for E2E testing

## Color Coding

Same as standard tracker:
- **Green** (`text-profit`): Positive P/L
- **Red** (`text-loss`): Negative P/L
- **Gray** (`text-text-secondary`): Zero or neutral

## Next Steps for User

After implementation is deployed:

1. **Run database migration** (see CASINO_TRACKER_IMPLEMENTATION.md)
2. **Create casino account** via "Add Account" button
3. **Start tracking** casino transactions with full detail
4. **View analytics** in the same calendar view as sports betting

That's it! The casino tracker is ready to use.
