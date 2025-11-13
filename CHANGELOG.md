# Changelog

All notable changes to PaperEdge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Calendar Day View Feature**: Interactive calendar days now open a detailed drawer showing all bets for that day
  - Click any calendar day with bets to view day-specific details
  - Day Details Drawer with formatted date, bet count, and daily P&L
  - Quick edit functionality - click any bet to edit directly
  - "Add Bet for This Day" button pre-fills create dialog with selected date
  - "View in History" button switches to history view with date filter applied
  - Smart navigation - returns to day drawer after editing instead of closing entirely
  - Live updates - drawer refreshes automatically after bet edits/deletes
  - Graceful handling when last bet is deleted from a day

### Changed
- **Dialog Button Spacing**: Improved spacing between buttons on mobile devices
  - Added vertical spacing (8px) between stacked buttons
  - Buttons no longer appear cramped on smaller screens
- **Button Styling**: Changed Cancel and Delete Account buttons from ghost to outline variant
  - Better visual hierarchy and easier to identify clickable buttons
- **Delete Account Button Position**: Moved to bottom-left of dialog footer
  - Separated from primary actions (Cancel/Save) for better UX
  - Reduces accidental clicks on destructive action
- **Dropdown Arrow Styling**: Custom dropdown arrow with consistent spacing
  - Removed native browser arrow with `appearance-none`
  - Added custom SVG arrow positioned 12px from right edge
  - Consistent with other input styling across the app
- **Filter Layout**: Reorganized bet filter inputs for better alignment
  - Date Range inputs now side-by-side under single label
  - Odds Range inputs side-by-side under single label
  - Improved visual hierarchy and reduced clutter
- **Calendar View Behavior**: Calendar now always shows all bets regardless of active filters
  - History view respects filters for searching/filtering
  - Calendar provides complete picture of betting activity

### Fixed
- Dialog X button no longer overlaps with header text (added 32px right padding)
- Form inputs and footer buttons now have proper spacing (24px margin)
- Calendar view correctly displays all days with bets even when filters are active
- Edit dialog properly returns to day drawer when canceled (instead of closing everything)

## [0.1.0] - 2025-11-01

### Added
- Initial release of PaperEdge
- Notebook management with custom columns
- Bet tracking with American odds calculations
- Calendar view with monthly P&L
- User authentication with Supabase
- Dashboard with analytics
- Responsive design for mobile and desktop

---

**Note**: This changelog tracks user-facing changes. For detailed technical changes, see commit history.
