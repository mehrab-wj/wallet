# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **PHP 8.3** / **Laravel 12** (streamlined structure — no `Kernel.php`, bootstrap via `bootstrap/app.php`)
- **Inertia.js v2** + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **SQLite** (default dev DB), **database** driver for queues/cache/sessions
- **exchangerate-api.com** for currency conversion (cached 3 hours)
- Telegram logging channel for job errors/info (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

## Commands

### Development
```bash
composer run dev        # starts server + queue listener + vite dev concurrently
```

### Build
```bash
npm run build           # production asset build
npm run dev             # vite dev server only
```

### Testing
```bash
composer run test                                      # clear config + run all tests
php artisan test                                       # run all tests
php artisan test tests/Feature/BudgetTest.php          # run single file
php artisan test --filter=test_name                    # run by test name
./vendor/bin/phpunit                                   # direct phpunit
```

### Code Style
```bash
vendor/bin/pint --dirty     # fix PHP formatting (run before finalizing PHP changes)
npm run lint                # ESLint fix
npm run format              # Prettier format resources/
npm run types               # TypeScript type check (no emit)
```

## Architecture

### Multi-currency Design
Transactions store both `input_amount`/`input_currency` (what the user entered) and `amount` (converted to the account's currency). The `ExchangeRate` service (`app/Services/ExchangeRate.php`) is accessed via the `App\Facades\ExchangeRate` facade and is called at transaction creation/update time. The dashboard further converts amounts to `user->main_currency` for display.

### Budget System
Budgets can be `fixed` (fixed monthly amount) or `percentage` (% of previous month's income). `ProcessMonthlyBudgets` job runs on the 1st of each month to create `BudgetAllocation` records. Budgets link to categories via a many-to-many pivot (`budget_category`). Allocation amounts are computed on-demand if no allocation record exists yet.

### Scheduled Jobs
Defined in `routes/console.php`:
- `ProcessSubscriptions` — runs daily, creates expense transactions for due subscriptions, logs to Telegram
- `ProcessMonthlyBudgets` — runs monthly on the 1st at 00:00, creates budget allocations

### Inertia + React Pages
Pages live in `resources/js/pages/` (lowercase). Controllers use `Inertia::render('dashboard', [...])`. UI components are in `resources/js/components/` with shadcn/ui primitives in `components/ui/`. Feature-specific components (transaction, budget, subscription drawers) are in named subdirectories.

### shadcn/ui
The project uses **shadcn/ui** (style: `new-york`, base color: `neutral`, icon library: `lucide-react`). All primitive components (Button, Card, Dialog, Drawer, Select, etc.) live in `resources/js/components/ui/` and are the first place to look before building new UI. Add new shadcn components with:
```bash
npx shadcn@latest add <component>
```

### Authorization
All resources use Laravel Policies (`app/Policies/`). Controllers call `Gate::authorize('update', $model)` directly — no middleware-level policy binding.

### Default Categories
On user registration, `CreateDefaultCategoriesForUser` listener (fired from `EventServiceProvider`) seeds default expense/income categories for the new user.

### Key Environment Variables
```
EXCHANGE_RATE_API_KEY=   # required for currency conversion
TELEGRAM_BOT_TOKEN=      # optional, for Telegram log channel
TELEGRAM_CHAT_ID=        # optional, for Telegram log channel
```

## Conventions

- **PHP**: PHP 8 constructor property promotion; explicit return types on all methods; use `config()` never `env()` outside config files; run `vendor/bin/pint --dirty` after PHP changes
- **Validation**: Always use Form Request classes (`app/Http/Requests/`), not inline validation
- **Queries**: Prefer `Model::query()` over `DB::`. Eager-load to prevent N+1s.
- **Tailwind**: Use `gap-*` for list spacing (not margins); support `dark:` if surrounding components do
- **Tailwind v4**: Use `@import "tailwindcss"` not `@tailwind` directives; use `shrink-*`/`grow-*` not `flex-shrink-*`/`flex-grow-*`
- **Inertia navigation**: Use `<Link>` or `router.visit()`, not `<a>` tags; use `router.post/patch/delete` for mutations
- **Tests**: Feature tests are preferred; use model factories with existing states; most tests in `tests/Feature/`
