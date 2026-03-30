# Claude Code Documentation for PooCommerce Blocks

**Scope**: All PooCommerce blocks — storefront, cart, checkout, product displays, filters, mini cart, order confirmation. Covers editor UI (JS/TS), frontend rendering (PHP + Interactivity API), and supporting services (payments, shipping, patterns).
**pnpm filter**: `@poocommerce/block-library` (internal workspace package, not published)

**See also:**

- `../../CLAUDE.md` - Plugin-level docs, PHP workflow, changelog process
- `../../src/Blocks/` - PHP block classes (registration, rendering, services)
- `docs/README.md` - Full handbook (contributors, extensibility, theming)

## Quick Reference Commands

```bash

# All commands use --filter shorthand. Run from monorepo root.

# Test
pnpm --filter=@poocommerce/block-library test:js                      # Jest unit tests
pnpm --filter=@poocommerce/block-library test:js -- path/to/test      # Specific test file
pnpm --filter=@poocommerce/block-library test:watch                   # Jest watch mode
pnpm --filter=@poocommerce/block-library test:update                  # Update snapshots
pnpm --filter=@poocommerce/block-library test:e2e                     # Playwright E2E tests

# Lint (target specific files only)
npx eslint --fix path/to/file.tsx                                      # Fix JS/TS file
pnpm --filter=@poocommerce/block-library lint:css                      # Stylelint for SCSS
pnpm --filter=@poocommerce/block-library ts:check                     # TypeScript type checking

# Environment
pnpm --filter=@poocommerce/block-library env:start                    # Start wp-env + setup
pnpm --filter=@poocommerce/block-library env:restart                  # Clean restart

# Analysis
pnpm --filter=@poocommerce/block-library knip                         # Find unused code (dead code detector)
pnpm --filter=@poocommerce/block-library analyze-bundles              # Webpack bundle analysis
```

## Directory Structure

### JavaScript/TypeScript (`client/blocks/`)

```text
client/blocks/
├── assets/js/
│   ├── blocks/              # ~56 block implementations (cart, checkout, product-*, filter-*)
│   ├── atomic/              # Atomic/primitive blocks (product elements)
│   ├── base/                # Shared components, context, hooks, stores
│   │   └── stores/poocommerce/  # Interactivity API stores (LOCKED)
│   ├── data/                # WordPress @data stores (Collections, Query State, Schema)
│   ├── editor-components/   # 33+ shared editor UI components
│   ├── extensions/          # Extension integrations
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Utility functions
├── packages/                # Packages exposed as window.wc.* globals (see below)
│   ├── checkout/            # Checkout registry, slot/fill, filters
│   ├── components/          # 23+ shared components
│   └── prices/              # Price formatting and currency
├── tests/
│   ├── js/                  # Jest unit tests
│   └── e2e/                 # Playwright E2E tests
├── bin/                     # Build scripts (webpack configs, ESLint plugin)
└── storybook/               # Storybook config
```

### PHP (`src/Blocks/`)

```text
src/Blocks/
├── BlockTypes/              # ~144 block classes (extend AbstractBlock)
│   ├── AbstractBlock.php         # Base: initialization, assets, render
│   ├── AbstractDynamicBlock.php  # Server-rendered blocks
│   ├── AbstractInnerBlock.php    # Base class for child blocks used inside parent blocks
│   ├── AbstractProductGrid.php   # Product grid blocks
│   └── [Cart, Checkout, ProductCollection, OrderConfirmation, ...]
├── Domain/
│   ├── Bootstrap.php        # DI setup, hooks registration (entry point)
│   ├── Package.php          # Version, paths, feature gating
│   └── Services/            # CheckoutFields, Hydration, DraftOrders, etc.
├── Payments/                # Payment method integrations (Cheque, BankTransfer, etc.)
├── Assets/
│   ├── Api.php              # Script/style registration
│   └── AssetDataRegistry.php # PHP-to-JS data bridge (window.wcSettings)
├── Integrations/            # Extension points (IntegrationInterface)
├── Registry/                # DI container (Container, SharedType, FactoryType)
├── Patterns/                # Block patterns
├── Templates/               # FSE block templates
├── Shipping/                # Shipping method integration
└── Utils/                   # StyleAttributes, CartCheckout, MiniCart utils
```

**Namespace**: `Automattic\PooCommerce\Blocks`

## PHP Block Class Hierarchy

Block types live in `src/Blocks/BlockTypes/` and extend one of:

- `AbstractBlock` - Base class (JS-driven rendering)
- `AbstractDynamicBlock` - Server-rendered blocks (most common)
- `AbstractProductGrid` - Product grid blocks with query/filter logic
- `AbstractInnerBlock` - Child/nested blocks

Key methods to override:

```php
class MyBlock extends AbstractDynamicBlock {
    protected $block_name = 'my-block';

    protected function render($attributes, $content, $block) {
        // Server-side HTML output
    }

    protected function enqueue_data(array $attributes = []) {
        // Expose PHP data to JS
        $this->asset_data_registry->add('key', $value);
    }

    protected function get_block_type_script($key = null) {
        // Frontend script handle (or null if no JS needed)
    }
}
```

## Key Architectural Patterns

### AssetDataRegistry (PHP-to-JS bridge)

PHP data is exposed to JavaScript via `AssetDataRegistry`:

```php
$this->asset_data_registry->add('reviewRatingsEnabled', wc_review_ratings_enabled());
// Available in JS as window.wcSettings.reviewRatingsEnabled
```

### Interactivity API Stores (LOCKED)

All PooCommerce Interactivity API stores use `lock: true`. They are **private by design**:

- Not intended for third-party extension
- Removing/changing store state is NOT a breaking change
- `assets/js/base/stores/poocommerce/` contains cart, product-data, products stores
- Cart store uses mutation batching for performance

### IntegrationRegistry (Extension API)

External plugins hook into blocks via `IntegrationInterface`:

```php
add_action('poocommerce_blocks_cart_block_registration', function($registry) {
    $registry->register(new MyIntegration());
});
```

### Just-in-Time Asset Loading

Block scripts are only enqueued when the block is actually rendered on the page, not globally.

## Webpack Externals (`window.wc.*`)

Packages in `packages/` and core modules are built as webpack externals, exposed on `window.wc`. The mapping lives in `bin/webpack-helpers.js` (`wcDepMap`):

| Import | Global | Script handle |
| ------ | ------ | ------------- |
| `@poocommerce/blocks-checkout` | `wc.blocksCheckout` | `wc-blocks-checkout` |
| `@poocommerce/blocks-checkout-events` | `wc.blocksCheckoutEvents` | `wc-blocks-checkout-events` |
| `@poocommerce/blocks-components` | `wc.blocksComponents` | `wc-blocks-components` |
| `@poocommerce/blocks-registry` | `wc.wcBlocksRegistry` | `wc-blocks-registry` |
| `@poocommerce/block-data` | `wc.wcBlocksData` | `wc-blocks-data-store` |
| `@poocommerce/price-format` | `wc.priceFormat` | `wc-price-format` |
| `@poocommerce/settings` | `wc.wcSettings` | `wc-settings` |
| `@poocommerce/shared-context` | `wc.wcBlocksSharedContext` | `wc-blocks-shared-context` |
| `@poocommerce/shared-hocs` | `wc.wcBlocksSharedHocs` | `wc-blocks-shared-hocs` |
| `@poocommerce/types` | `wc.wcTypes` | `wc-types` |

`@poocommerce/blocks-checkout-events` is a pub/sub event emitter for checkout lifecycle hooks (`onCheckoutValidation`, `onCheckoutSuccess`, `onCheckoutFail`). Third-party extensions use it to run validation or react to checkout outcomes. Source: `assets/js/events/`.

Third-party extensions consume these as externals — changing the public API of these packages is a breaking change.

## Build System

Webpack is configured with **11 separate configs** in `bin/webpack-configs.js`:

- Core, Main, Frontend, Extensions, Payments, Styling, Site Editor, Interactivity, Cart/Checkout Frontend, Dependency Detection

Build is orchestrated by **wireit** for caching. TypeScript uses **60+ path aliases** defined in `tsconfig.base.json`.

## Testing

### Jest Unit Tests

- Config: `tests/js/jest.config.json`
- Environment: `jest-fixed-jsdom`
- Tests live in `test/` subdirectories alongside components
- Path aliases mapped in jest config (mirrors tsconfig)

### Playwright E2E Tests

- Config: `tests/e2e/playwright.config.ts`
- Test themes: `block-theme`, `classic-theme`, `block-theme-with-templates`
- Setup script: `tests/e2e/bin/test-env-setup.sh`
- Uses MSW for API mocking, Allure for reporting

### PHP Tests

- Location: `tests/php/src/Blocks/` (mirrors `src/Blocks/` structure)
- Mock blocks in `tests/php/src/Blocks/Mocks/`
- Base class: `WP_UnitTestCase`

## Gotchas

- **ESLint config** has custom PooCommerce rules and lodash import restrictions - use the local `.eslintrc.js`, not the monorepo root
- **`side-effects` in package.json** is extensive - many files cannot be tree-shaken (CSS, block registrations, filters)
- **StoreApi lives outside Blocks** at `src/StoreApi/`, not `src/Blocks/StoreApi/`
- **Two DI containers** exist: `src/Blocks/Registry/Container.php` (blocks-specific, legacy) and the main PooCommerce DI container in `src/`
- **`Package.php`** at the Blocks root is a back-compat facade - real entry point is `Domain/Bootstrap.php`
