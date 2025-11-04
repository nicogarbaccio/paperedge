# PaperEdge Admin Dashboard - Guide

## Admin Dashboard Overview

The Admin Dashboard is a comprehensive moderation tool for managing bug reports and feature requests from your user community.

## Table of Contents

1. [Accessing Admin Dashboard](#accessing-admin-dashboard)
2. [Bug Report Management](#bug-report-management)
3. [Feature Request Management](#feature-request-management)
4. [Dashboard Statistics](#dashboard-statistics)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Accessing Admin Dashboard

### Admin Requirements

- User account must have admin role enabled in user metadata
- Only authenticated admins can access `/admin`

### Navigating to Admin Dashboard

1. Go to `/admin` in your browser
2. If you have admin access, you'll see the Admin Dashboard
3. If not, you'll be redirected to the home page

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Admin Dashboard Header with Shield Icon    │
│  "Manage bug reports and feature requests"  │
├─────────────────────────────────────────────┤
│  [Bug Reports] [Feature Requests] Tabs      │
├─────────────────────────────────────────────┤
│  Content Area (changes based on active tab) │
└─────────────────────────────────────────────┘
```

---

## Bug Report Management

### Bug Report Tab Overview

The Bug Reports tab shows all bug reports submitted by users.

### Accessing Bug Reports

1. Click the **"Bug Reports"** tab at the top of the dashboard
2. You'll see a list of all bug reports
3. Reports are displayed as expandable cards

### Filtering Bug Reports

The dashboard provides multiple ways to filter and find bug reports.

**Search Box:**
- Located at the top of the page
- Search by title or description content
- Filters in real-time as you type
- Example searches: "button", "dashboard", "crash"

**Status Filter:**
- Dropdown with 5 options:
  - **All Statuses** (default): Shows all reports
  - **Open**: Newly reported, not yet reviewed
  - **Investigating**: Team is looking into it
  - **Fixed**: Issue has been resolved
  - **Closed**: No longer actively being worked on

**Severity Filter:**
- Dropdown with 5 options:
  - **All Severity** (default): Shows all reports
  - **Low**: Minor issues
  - **Medium**: Noticeable impact
  - **High**: Significant impact
  - **Critical**: App-breaking

**Combined Filtering:**
- Use multiple filters together
- Example: Show "Investigating" reports with "Critical" severity
- Search + Status + Severity all filter simultaneously

### Bug Report Details

Click on any bug report card to expand and see:

**Report Information:**
- Title (user-provided)
- Description (full details)
- Severity level (Low, Medium, High, Critical)
- Status (color-coded badge)

**Browser Information:**
- User Agent
- Platform (Windows, Mac, Linux, etc.)
- Language setting
- Screen resolution
- Timezone

**Timestamps:**
- When the report was submitted
- Last time it was updated

### Changing Bug Status

1. Expand a bug report by clicking on it
2. Scroll to the bottom to "Update Status" section
3. You'll see 4 status buttons:
   - **Open** (red)
   - **Investigating** (amber)
   - **Fixed** (green)
   - **Closed** (gray)

4. Click the desired status button
5. The report updates immediately in the database
6. Toast notification confirms the change

**Status Workflow Recommendations:**

```
Open → Investigating → Fixed → Closed

Open
  └─> Report is new, not yet reviewed
      └─> Next: Move to Investigating when team starts work

Investigating
  └─> Team is actively working on the issue
      └─> Next: Move to Fixed when resolved
      └─> Alt: Move to Closed if won't be fixed

Fixed
  └─> Issue has been resolved
      └─> Next: Move to Closed after verification

Closed
  └─> No longer being worked on
      └─> Final state: Can't be changed back easily
```

### Best Practices for Bug Reports

✅ **Do:**
- Review reports regularly (daily if possible)
- Mark obvious duplicates as "Closed"
- Move to "Investigating" quickly to show action
- Update status to "Fixed" when issue is resolved
- Close non-reproducible bugs after investigation
- Use the severity level to prioritize work

❌ **Don't:**
- Leave all reports as "Open"
- Ignore critical severity bugs
- Update without notifying users (consider in-app notifications)
- Skip steps in the workflow

---

## Feature Request Management

### Feature Request Tab Overview

The Feature Requests tab displays all feature requests from your community.

### Accessing Feature Requests

1. Click the **"Feature Requests"** tab at the top of the dashboard
2. You'll see all feature requests with vote counts
3. Each request is an expandable card

### Filtering Feature Requests

**Search Box:**
- Search by title or description
- Real-time filtering
- Example: "dark", "export", "calendar"

**Status Filter:**
- **All Statuses**: Shows everything
- **Open**: New request, not yet planned
- **Planned**: Approved, scheduled for development
- **In Progress**: Currently being built
- **Completed**: Already implemented

**Priority Filter:**
- **All Priorities**: Shows everything
- **Nice to Have**: Low priority, good-to-have features
- **Important**: Medium priority, would improve experience
- **Critical**: High priority, essential functionality

**Combined Filtering:**
- Use all three filters together
- Example: Show "Completed" features with "Critical" priority
- Results update instantly

### Feature Request Details

Expand any request to see:

**Request Information:**
- Title
- Description
- Priority level (color-coded)
- Status (color-coded badge)

**Community Metrics:**
- Vote count (thumbs-up number)
- Related features (if provided)

**Timeline:**
- When submitted
- Last updated

### Updating Feature Status

1. Expand a feature request
2. Scroll to "Update Status" section
3. Click one of 4 status buttons:
   - **Open** (blue)
   - **Planned** (purple)
   - **In Progress** (amber)
   - **Completed** (green)

4. Status updates immediately
5. Toast confirms change

**Status Workflow:**

```
Open → Planned → In Progress → Completed

Open
  └─> Community suggestion, being evaluated
      └─> Next: Move to "Planned" if approved

Planned
  └─> Approved for development roadmap
      └─> Next: Move to "In Progress" when work starts

In Progress
  └─> Currently being built by the team
      └─> Next: Move to "Completed" when done

Completed
  └─> Feature has been implemented
      └─> Final state: Feature is live for users
```

### Updating Feature Priority

Feature requests can also have their priority level changed independently from status.

1. Expand a feature request
2. Scroll to "Update Priority" section
3. Click one of 3 priority buttons:
   - **Nice to Have** (blue)
   - **Important** (amber)
   - **Critical** (red)

4. Priority updates immediately
5. Toast confirms change

**Using Priority Levels:**

- **Nice to Have**: Community-suggested features that are low priority
- **Important**: Features that would significantly improve the product
- **Critical**: Essential features that impact core functionality

### Managing by Vote Count

Feature requests are sorted by vote count (highest first).

**High Vote Features:**
- Community priorities are clear
- Consider prioritizing these
- Can indicate market demand

**Low Vote Features:**
- Niche requests
- Might still be valuable
- Can be useful for specific user segments

---

## Dashboard Statistics

### Understanding the Metrics

Each tab shows:
- **Results Counter**: "Showing X of Y"
  - X = Filtered results
  - Y = Total items in database
  - Helps you understand filtering effectiveness

### Using Statistics

- Monitor total report/request volume
- Track filtering patterns
- Identify trends in bug severity
- See which features are most requested

---

## Best Practices

### Daily Routine

1. **Morning Check-in** (5-10 minutes)
   - Review new bug reports (Open status)
   - Check for critical severity items
   - Move critical issues to "Investigating"

2. **Update Progress**
   - Change status as work progresses
   - Mark bugs as "Fixed" when resolved
   - Update feature status when deploying

3. **Community Engagement**
   - Look at high-vote features
   - Consider what's coming next
   - Use admin dashboard to prioritize roadmap

### Handling Bug Reports

**For Critical Severity:**
1. Move to "Investigating" immediately
2. Investigate reproduction steps
3. Update to "Fixed" as soon as resolved
4. Move to "Closed" once verified

**For High Severity:**
- Same workflow, but less urgent
- Can wait 24 hours for initial review

**For Medium/Low Severity:**
- Review weekly
- Batch similar issues
- Move duplicates to "Closed"

### Handling Feature Requests

**For Critical Priority + High Votes:**
- Consider in next sprint
- Move to "Planned"
- Update status as development progresses

**For Important Priority + Medium Votes:**
- Evaluate feasibility
- Determine timeline
- Update status regularly

**For Nice to Have + Few Votes:**
- Archive or leave as "Open"
- Revisit if votes increase
- Combine similar requests

### Communication Strategy

While the admin dashboard doesn't send notifications, consider:

1. **In-App Notifications**: Notify users when report status changes
2. **Email Updates**: Send summary of feature completions
3. **Status Page**: Display what's being worked on
4. **Changelog**: Document completed features

---

## Troubleshooting

### Common Issues

**"Admin access denied"**
- Ensure your user has admin role in database
- Check user metadata has `role: "admin"`
- Re-authenticate if needed

**"Can't change status"**
- Ensure you have proper permissions
- Try refreshing the page
- Check for database errors in browser console

**"Reports not loading"**
- Check internet connection
- Try clearing browser cache
- Try incognito/private mode
- Check database connection in backend

**"Search not working"**
- Try refreshing the page
- Clear browser cache
- Check that report titles/descriptions contain search terms

### Performance Tips

- Use specific filters to reduce loading
- Search for specific keywords (narrows results)
- Avoid huge unfiltered lists if possible
- Refresh periodically to get latest data

### Getting Help

If you encounter issues:

1. Check browser console for error messages
2. Verify your admin access level
3. Try the steps in troubleshooting section
4. Contact development team with error details

---

## Security Notes

✅ **Access Control:**
- Only users with admin role can access `/admin`
- All database queries respect RLS (Row Level Security)
- Admin actions are logged (implementation recommended)

⚠️ **Best Practices:**
- Don't share admin credentials
- Log out when not using admin dashboard
- Change passwords regularly
- Review audit logs if available

---

## API Integration (For Developers)

### Accessing Data Programmatically

Database tables used:
- `bug_reports` - All bug reports
- `feature_requests` - All feature requests
- `feature_request_votes` - Voting data

### Example Queries

**Get all critical bugs:**
```sql
SELECT * FROM bug_reports 
WHERE severity = 'critical' 
AND status = 'open'
ORDER BY created_at DESC;
```

**Get most popular features:**
```sql
SELECT * FROM feature_requests 
WHERE vote_count > 5 
ORDER BY vote_count DESC;
```

---

## Summary

The Admin Dashboard provides a powerful way to manage community feedback and prioritize development work. Regular use helps you:

✅ Stay on top of bugs and issues
✅ Prioritize work based on community input
✅ Show users that feedback is valued
✅ Make data-driven decisions

Happy administrating! 🎉
