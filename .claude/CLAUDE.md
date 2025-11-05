# PaperEdge Development Guide

This document outlines the conventions, best practices, and development standards for the PaperEdge application. All team members and AI assistants should follow these guidelines when contributing to this codebase.

## Project Overview

**PaperEdge** is a comprehensive sports betting analytics and tracking platform built with:
- **Frontend**: Vue 3 (Composition API) + TypeScript + Vite
- **Styling**: Tailwind CSS + Element Plus + Headless UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Testing**: Playwright (E2E tests with 95% code coverage)
- **Deployment**: Netlify

## Code Style and Structure

### General Principles

- **Conciseness**: Write clean, maintainable, technically accurate code.
- **Functional Programming**: Use functional and declarative patterns; avoid classes and object-oriented paradigms.
- **DRY Principle**: Iterate and modularize code to avoid duplication.
- **Single Responsibility**: Each file should contain only related content.
- **Descriptive Naming**: Use auxiliary verbs in variable names (e.g., `isLoading`, `hasError`, `canDelete`).

### File Organization

Each component, utility, or store file should follow this structure:

```
1. Imports (types first, then libraries, then local modules)
2. Types/Interfaces (defined at the top level)
3. Constants (if applicable)
4. Main export (component, function, or store)
5. Helper functions (if needed)
6. Sub-components (if needed)
```

**Example structure for a component:**
```
components/
  my-component/
    MyComponent.tsx          # Main component
    types.ts                # Component-specific types
    helpers.ts              # Component-specific utilities
    index.ts                # Optional: barrel export
```

### File Size and Scope

- Keep component files under 300 lines when possible.
- If a file exceeds this, break it into smaller, composable pieces.
- Group related components in directories (e.g., `components/tracker/`, `components/calculators/`).

## TypeScript Guidelines

### Type Definitions

- **Prefer Interfaces over Types**: Use `interface` for object shapes (extendable and mergeable).
- **Use Types for Unions**: Reserve `type` for union types, primitives, and complex type operations.
- **Avoid Enums**: Use maps or discriminated unions instead for better type safety and flexibility.

```typescript
// ✅ Good: Interface for objects
interface Bet {
  id: string;
  description: string;
  odds: number;
  stake: number;
}

// ✅ Good: Map instead of enum
const betStatusMap = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
  voided: 'Voided',
} as const;

type BetStatus = keyof typeof betStatusMap;

// ❌ Avoid: Enums
enum BetStatus {
  Pending = 'pending',
  Won = 'won',
  Lost = 'lost',
}
```

### Type Annotations

- Always annotate function parameters and return types.
- Use strict null checking (`strictNullChecks: true` in tsconfig).
- Export types that are used across multiple files.

```typescript
// ✅ Good: Full type annotations
function calculateProfit(stake: number, odds: number): number {
  return (stake * odds) - stake;
}

// ✅ Good: Return type from interface
function createBet(data: CreateBetInput): Promise<Bet> {
  // implementation
}
```

### Avoid

- `any` type (use `unknown` if necessary and narrow it down)
- Implicit `any` from complex destructuring
- Optional chaining abuse (use type guards instead when possible)

## Vue 3 Composition API

### Script Setup Syntax

Always use `<script setup lang="ts">` for all components:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Bet } from '@/types';

interface Props {
  bet: Bet;
  isEditable?: boolean;
}

withDefaults(defineProps<Props>(), {
  isEditable: false,
});

const emit = defineEmits<{
  update: [bet: Bet];
  delete: [id: string];
}>();

const isLoading = ref(false);

const profitPercentage = computed(() => {
  // computed logic
});

function handleUpdate(updatedBet: Bet) {
  emit('update', updatedBet);
}
</script>

<template>
  <div><!-- template --></div>
</template>
```

### Reactive State Management

- Use `ref()` for primitive reactive values.
- Use `computed()` for derived state.
- Use `reactive()` only for complex objects where reactivity of nested properties is essential.
- Prefer `ref()` over `reactive()` in most cases (more predictable, better TypeScript support).

```typescript
// ✅ Good: ref for primitives
const count = ref(0);
const isLoading = ref(false);

// ✅ Good: computed for derived state
const doubledCount = computed(() => count.value * 2);

// ✅ Acceptable: reactive for complex objects (use sparingly)
const formData = reactive({
  email: '',
  password: '',
});
```

### Composables

Create composables for reusable logic (located in `src/hooks/`):

```typescript
// hooks/useBetCalculations.ts
import { computed } from 'vue';

export function useBetCalculations(stake: number, odds: number) {
  const profit = computed(() => (stake * odds) - stake);
  const roi = computed(() => (profit.value / stake) * 100);

  return { profit, roi };
}
```

**Guidelines for composables:**
- Start with `use` prefix.
- Export named functions.
- Keep composables focused on a single responsibility.
- Return reactive refs/computed values and functions.

## Naming Conventions

### Directory and File Naming

- **Directories**: lowercase with dashes (e.g., `my-component/`, `auth-wizard/`)
- **Components**: PascalCase (e.g., `BetCard.tsx`, `CreateBetDialog.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useBetSearch.ts`, `calculateProfit.ts`)
- **Types**: PascalCase (e.g., `types.ts` containing `interface Bet`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_STAKE`, `DEFAULT_ODDS`)

### Variable and Function Naming

- **Boolean values**: Use auxiliary verbs (`is`, `has`, `can`, `should`)
  ```typescript
  isLoading, hasError, canDelete, shouldRender
  ```
- **Functions**: Verb + Noun pattern
  ```typescript
  calculateProfit(), fetchBets(), validateEmail()
  ```
- **Event handlers**: `handle` + EventName
  ```typescript
  handleClick(), handleSubmit(), handleDelete()
  ```
- **Callbacks/References**: `on` + EventName
  ```typescript
  onUpdate, onChange, onError
  ```

### API and Data Functions

- **Queries**: `use` + Entity pattern
  ```typescript
  useBets(), useNotebooks(), useAccounts()
  ```
- **Mutations**: Verb + Entity pattern
  ```typescript
  createBet(), updateBet(), deleteBet()
  ```
- **Fetch functions**: `fetch` + Entity pattern
  ```typescript
  fetchBets(), fetchNotebookDetails()
  ```

## UI and Styling

### Tailwind CSS

- **Mobile-First Approach**: Start with mobile styles, then add responsive prefixes.
- **Utility Classes**: Use Tailwind utilities rather than custom CSS when possible.
- **Dark Mode**: Consider dark mode in design (use Tailwind's dark mode support).

```vue
<!-- ✅ Good: Mobile-first responsive -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <p class="text-sm md:text-base lg:text-lg">Content</p>
</div>
```

### Component Libraries

- **Headless UI**: For unstyled, accessible UI primitives (Dialogs, Popovers, Menus, Combobox).
- **Element Plus**: For pre-styled components when Headless UI isn't sufficient.
- **Radix UI (via Headless)**: For accessible components with full control.

**Usage hierarchy:**
1. Tailwind utilities (first choice)
2. Headless UI + Tailwind (accessible primitives)
3. Element Plus (when Headless UI insufficient)

### Custom Components

Store custom components in `src/components/ui/`:

```
ui/
  Button.tsx           # Custom button with Tailwind + variants
  Card.tsx             # Custom card layout
  Dialog.tsx           # Headless UI dialog + styling
  Input.tsx            # Custom input with validation
  Toast.tsx            # Toast notification
  Tooltip.tsx          # Tooltip with Headless UI
```

## Performance Optimization

### Code Splitting

- Use dynamic imports for non-critical routes and components.
- Implement route-based lazy loading in Vue Router.

```typescript
// router.ts
const TrackerPage = () => import('@/pages/TrackerPage.vue');
const AnalyticsPage = () => import('@/pages/AnalyticsPage.vue');
```

### Component Optimization

- Use `<Suspense>` for async components with fallback UI:
  ```vue
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <DashboardSkeleton />
    </template>
  </Suspense>
  ```
- Implement skeleton loaders for loading states (see `src/components/skeletons/`).
- Lazy load images with `loading="lazy"` attribute.
- Use WebP format for images with fallbacks.

### VueUse Integration

Leverage VueUse composables for common patterns:

```typescript
import { useVModel, useDebounce, useThrottled } from '@vueuse/core';

// Debounced search
const searchQuery = ref('');
const debouncedQuery = useDebounce(searchQuery, 500);

// Model binding synchronization
const modelValue = useVModel(props, 'modelValue', emit);
```

### Bundle Optimization

Vite configuration includes:
- Code splitting for vendor dependencies
- Dynamic imports for routes and non-critical components
- Minification and compression in production

See `vite.config.ts` for current configuration.

## Supabase Integration

### Authentication

- Use Supabase Auth for user authentication.
- Store auth state in `src/stores/authStore.ts`.
- Always check auth status before accessing protected routes.
- Use public routes for `/login`, `/register`, `/reset-password`.

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Reset password
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: getAuthRedirectUrl('/reset-password'),
});

// Update password
await supabase.auth.updateUser({ password: newPassword });
```

### Row Level Security (RLS)

- All tables must have RLS enabled.
- Use RLS policies to enforce data ownership and access control.
- Never rely solely on frontend checks; always validate on the backend.

Example RLS policy:
```sql
CREATE POLICY "Users can only view their own bets"
  ON public.bets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bets"
  ON public.bets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Database Queries

- Use the TypeScript Supabase client for all queries.
- Always handle errors gracefully.
- Use `select()`, `insert()`, `update()`, `delete()` appropriately.

```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('bets')
  .select('*')
  .eq('notebook_id', notebookId);

if (error) throw error;
return data;

// Insert
const { data, error } = await supabase
  .from('bets')
  .insert([{ description, odds, stake, notebook_id: notebookId }])
  .select();

// Update
const { data, error } = await supabase
  .from('bets')
  .update({ description, odds, stake })
  .eq('id', betId)
  .select();

// Delete
const { error } = await supabase
  .from('bets')
  .delete()
  .eq('id', betId);
```

### Real-Time Subscriptions

Use Supabase realtime for live updates when necessary:

```typescript
const subscription = supabase
  .channel('bets-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'bets' },
    (payload) => {
      handleBetsUpdate(payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Testing with Playwright

### Testing Philosophy

**Test user-visible behavior, not implementation details:**
- Automated tests should verify that the application works for end users.
- Avoid relying on implementation details like function names, CSS classes, or DOM structure that users won't see.
- Tests should interact with what's rendered on the page, just like real users would.

**Example:**
```typescript
// ❌ Bad: Testing CSS classes (implementation detail)
await expect(page.locator('.btn-primary.loading')).toBeVisible();

// ✅ Good: Testing visible behavior
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
```

### Test Isolation

Each test must be completely isolated and run independently:

- Use `test.beforeEach()` and `test.afterEach()` hooks for setup/teardown.
- Each test should have its own data, auth state, and local/session storage.
- Tests should NOT depend on other tests or rely on execution order.
- Test isolation improves reproducibility, makes debugging easier, and prevents cascading failures.

**Example:**
```typescript
import { test, expect } from '@playwright/test';
import { loginUser } from '../fixtures/helpers';

test.beforeEach(async ({ page }) => {
  // Set up clean state before each test
  await loginUser(page, testUser);
  await page.goto('/notebooks');
});

test('should create a notebook', async ({ page }) => {
  // Test runs with fresh auth state
  await page.getByRole('button', { name: 'New Notebook' }).click();
  await expect(page.getByRole('heading', { name: 'Untitled' })).toBeVisible();
});

test('should delete a notebook', async ({ page }) => {
  // This test is isolated; doesn't depend on the previous test
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted')).toBeVisible();
});
```

### Locator Strategies

**Use locators with auto-waiting and retry-ability:**
Playwright locators automatically wait for elements to be actionable (visible, enabled, etc.) before performing actions.

**Locator priority (from most to least resilient):**

1. **User-facing attributes (best):**
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')
   page.getByTestId('create-bet-button')
   page.getByText('Welcome')
   ```

2. **Semantic HTML:**
   ```typescript
   page.getByRole('heading', { level: 1 })
   page.getByRole('listitem')
   page.getByRole('link', { name: 'Home' })
   ```

3. **Avoid (fragile, breaks with styling changes):**
   ```typescript
   page.locator('.btn-primary')      // ❌ CSS class
   page.locator('button:nth-child(2)') // ❌ Position-based
   page.locator('//button[@id="submit"]') // ❌ XPath
   ```

**Chaining and filtering:**
```typescript
// Filter to narrow down search
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });

// Chain for specificity
await page
  .getByRole('listitem')
  .filter({ hasText: 'Product 2' })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

**Add `data-testid` attributes for testability:**
When building new features, include `data-testid` attributes on interactive elements:
```typescript
// Component
<button data-testid="create-bet-button">Create Bet</button>
<input data-testid="bet-description" />

// Test
await page.getByTestId('create-bet-button').click();
await page.getByTestId('bet-description').fill('Test Bet');
```

### Web-First Assertions

Use web-first assertions that automatically retry until conditions are met:

```typescript
// ✅ Good: Auto-waits until visible (with retry)
await expect(page.getByText('welcome')).toBeVisible();

// ✅ Good: Auto-waits for element to have text
await expect(page.getByRole('heading')).toHaveText('Dashboard');

// ✅ Good: Auto-waits for input value
await expect(page.getByTestId('odds')).toHaveValue('2.5');

// ❌ Bad: No retry, fails immediately if element not ready
expect(page.locator('.bet-card')).toBeTruthy();
```

**Common assertions:**
```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// State
await expect(element).toBeEnabled();
await expect(element).toBeDisabled();
await expect(element).toBeChecked();

// Content
await expect(element).toHaveText('Expected text');
await expect(element).toContainText('partial text');

// Attributes
await expect(element).toHaveAttribute('href', '/path');
await expect(element).toHaveClass('active');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);
```

### Test Structure and Organization

Tests are organized by feature in `tests/e2e/`:

```
e2e/
  auth/
    auth.spec.ts              # Authentication flows
  bets/
    crud.spec.ts              # Bet CRUD operations
    custom-fields.spec.ts     # Custom fields functionality
  tracker/
    tracker.spec.ts           # Bet tracker features
  performance/
    performance.spec.ts       # Performance metrics
  responsive/
    mobile.spec.ts            # Mobile responsiveness
```

### Writing Resilient Tests

**General guidelines:**
- Use descriptive test names: `test('should create a new bet with custom fields')`
- Group related tests with `test.describe()`
- Use fixtures for setup/teardown (see `tests/fixtures/`)
- Leverage helper functions for common actions (see `tests/fixtures/helpers.ts`)
- Aim for 95%+ code coverage
- Never guess about functionality—inspect the app or UI when uncertain

**Guidance when writing tests:**
- **Never guess**: If uncertain about how a feature works, use browser tools to inspect and understand actual behavior before writing tests.
- **Always use test IDs first**: Look for `data-testid` attributes before using other selectors.
- **Add missing test IDs**: If a component lacks a test ID, add it rather than using fragile selectors.
- **Follow Playwright best practices**: Use `getByRole()`, `getByLabel()`, `getByTestId()` - avoid CSS class or overly specific DOM queries.

**Example test with best practices:**
```typescript
import { test, expect } from '@playwright/test';
import { testBetData } from '../fixtures/test-data';
import { loginUser, createNotebook } from '../fixtures/helpers';

test.describe('Bet CRUD Operations', () => {
  test('should create a new bet with custom fields', async ({ page }) => {
    // Setup
    await loginUser(page, testBetData.testUser);
    const notebookId = await createNotebook(page, 'Test Notebook');
    
    // Navigate to notebook
    await page.goto(`/notebooks/${notebookId}`);
    
    // Act: Create bet using semantic selectors and test IDs
    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('bet-description').fill('Test Bet');
    await page.getByTestId('bet-odds').fill('2.0');
    await page.getByTestId('submit-button').click();
    
    // Assert: Verify using role-based selectors
    await expect(page.getByRole('heading', { name: 'Test Bet' })).toBeVisible();
    await expect(page.getByText('Bet created successfully')).toBeVisible();
  });
});
```

### Debugging Tests

**VS Code Extension:**
- Use the Playwright Test for VS Code extension for live debugging.
- Edit locators in the editor and see them highlighted in the browser.

**Debug mode:**
```bash
npx playwright test --debug
npx playwright test tests/e2e/bets/crud.spec.ts:25 --debug
```

**Trace viewer (best for CI failures):**
```bash
npx playwright test --trace on
npx playwright show-report
```

Traces provide full timeline, DOM snapshots, network requests, and more—better than videos/screenshots for debugging.

### Test Attributes and Selectors

- Use `data-testid` attributes on elements that need testing.
- Keep test selectors stable and independent of CSS classes.
- Use semantic HTML and ARIA roles where applicable.

**Always add `data-testid` for:**
- Form inputs, buttons, and interactive controls
- Dialog/modal containers and key sections
- Important UI state indicators (loading, errors, success messages)
- Any element that tests need to verify or interact with

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test tests/e2e/bets/crud.spec.ts

# Run tests in headed mode (see browser)
npm run test:headed

# Generate coverage report
npm run test:coverage

# Run with trace viewer
npm run test -- --trace on

# Debug a specific test
npm run test -- tests/e2e/bets/crud.spec.ts --debug
```

### Parallelism and Sharding

Tests run in parallel by default. Tests within a file run sequentially in the same worker.

**For parallel execution within a file:**
```typescript
import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('runs in parallel 1', async ({ page }) => { /* ... */ });
test('runs in parallel 2', async ({ page }) => { /* ... */ });
test('runs in parallel 3', async ({ page }) => { /* ... */ });
```

**Sharding for CI (run tests across multiple machines):**
```bash
# Machine 1
npx playwright test --shard=1/3

# Machine 2
npx playwright test --shard=2/3

# Machine 3
npx playwright test --shard=3/3
```

### Testing Best Practices

**Avoid testing third-party dependencies:**
- Don't test external APIs or services you don't control.
- Use Playwright's network API to mock external responses:
  ```typescript
  await page.route('**/api/fetch_data_third_party', route =>
    route.fulfill({ status: 200, body: testData })
  );
  ```

**Database testing:**
- Use a staging environment with controlled data.
- Ensure data doesn't change unexpectedly between test runs.
- For visual regression tests, keep OS and browser versions consistent.

**Soft assertions (non-blocking):**
```typescript
// These don't stop test execution on failure
await expect.soft(page.getByTestId('status')).toHaveText('Success');

// Continue testing even if the above fails
await page.getByRole('link', { name: 'Next' }).click();
await expect(page.getByRole('heading')).toBeVisible();
```

### CI/CD Integration

**Configure tests to run on CI:**
- Run tests frequently: ideally on every commit and pull request.
- Ensure Playwright is up to date on CI for latest browser versions.
- Only install necessary browsers (saves download time and disk space):
  ```bash
  # Install only Chromium (vs all browsers)
  npx playwright install chromium --with-deps
  ```

**Best practices for CI:**
- Use Linux for cost efficiency (developers can use any OS locally).
- Configure sharding to parallelize test execution across machines.
- Enable trace recording on first retry for better debugging:
  ```typescript
  // playwright.config.ts
  use: {
    trace: 'on-first-retry'
  }
  ```

### Linting Tests

Use TypeScript and ESLint for tests to catch errors early:

```bash
npm run lint
tsc --noEmit
```

**Important ESLint rule:**
Enable `@typescript-eslint/no-floating-promises` to ensure no missing `await` statements before async Playwright calls.

### Code Coverage

Aim for 95%+ code coverage. Generate coverage reports:

```bash
npm run test:coverage
```

Review coverage reports to identify untested code paths and add tests accordingly.

## API and Data Flows

### Custom Fields

The app supports custom fields for notebooks and daily P&L entries:

- **Structure**: Custom fields are stored in `custom_columns` table with notebook ownership.
- **Display Order**: Market category fields display before Sportsbook category fields in the UI.
- **Implementation**: Use `CustomColumnsFields.tsx` component for rendering.

### Bet Tracker

Bet tracker aggregates data by account and date:

- **Accounts**: Managed in `/tracker/accounts/:id` route
- **Daily P&L**: Calculated from individual bets
- **Calendar View**: Visual representation of daily performance
- **UI**: `TrackerPage.tsx` displays aggregated metrics, `CalendarView.tsx` shows calendar

### Notebooks

Notebooks are collections of bets grouped by category:

- **CRUD**: Managed in `NotebooksPage.tsx`, `NotebookDetailPage.tsx`
- **Custom Fields**: Per-notebook custom columns
- **Navigation**: Sidebar navigation, URL-based routing

## Build and Development

### Development Server

```bash
npm run dev
```

Vite provides hot module replacement (HMR) for instant updates.

### Production Build

```bash
npm run build
```

Output is in `dist/` directory, optimized for Netlify deployment.

### Environment Variables

Create `.env.local` for local development:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env.local` or secrets to version control.

### Deployment

The app is deployed on Netlify:

- **Build command**: `npm run build`
- **Publish directory**: `dist/`
- **Redirects**: Configured in `netlify.toml` for SPA routing

## Error Handling

### General Approach

- Use try-catch for async operations.
- Provide user-friendly error messages via toast notifications.
- Log errors to console in development.
- Consider error boundaries for component failures.

```typescript
try {
  const { data, error } = await supabase.from('bets').select();
  if (error) throw error;
  // Process data
} catch (err) {
  const message = err instanceof Error ? err.message : 'An error occurred';
  toast.error(message);
}
```

### Error Boundary Component

Use `ErrorBoundary.tsx` to catch React-level errors:

```vue
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## Code Review Checklist

Before submitting code for review:

- [ ] TypeScript: No `any` types, all functions typed
- [ ] Naming: Follows conventions (PascalCase components, camelCase functions)
- [ ] Structure: Single responsibility, DRY principle followed
- [ ] Tests: E2E tests added/updated, minimum 95% coverage target
- [ ] Performance: No unnecessary re-renders, lazy loading used appropriately
- [ ] Accessibility: Semantic HTML, ARIA labels where needed
- [ ] Linting: `npm run lint` passes without errors
- [ ] Styling: Tailwind classes used, mobile-first responsive design
- [ ] Documentation: Complex logic has comments, new patterns documented

## Maintaining This Guide

**This document is a living guide and should be updated regularly as features and patterns evolve.**

### When to Update CLAUDE.md

- **New architectural patterns** are introduced (e.g., new composable patterns, state management approaches)
- **New technologies or libraries** are added to the stack (e.g., new UI library, testing framework)
- **Design patterns** emerge as best practices from feature development
- **API or database schema** changes that affect multiple parts of the codebase
- **Performance optimizations** that should be applied project-wide
- **Common pitfalls** are discovered that should be documented to prevent future issues
- **Testing strategies** evolve based on real-world E2E test experience
- **Supabase patterns** (RLS policies, database queries, auth flows) are refined

### Update Process

1. **After completing a feature**: If you discovered a useful pattern, document it here
2. **During code review**: If reviewers suggest a better pattern, add it to this guide
3. **When issues are fixed**: If a bug was caused by inconsistent patterns, document the fix
4. **Quarterly review**: Ensure the guide still reflects current practices

### Example Update Scenarios

- **New Custom Field Pattern**: If a more elegant way to handle custom fields is discovered, update the "Custom Fields" subsection in "API and Data Flows"
- **Dialog Component Enhancement**: If Dialog component patterns change, update the "UI and Styling" section
- **Test Helper Functions**: If new test helpers emerge, document them in "Testing with Playwright"
- **Supabase Query Optimization**: If new query patterns improve performance, update "Supabase Integration"

## Resources

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [VueUse](https://vueuse.org/)

---

**Last Updated**: November 2025
**Maintainers**: PaperEdge Development Team
