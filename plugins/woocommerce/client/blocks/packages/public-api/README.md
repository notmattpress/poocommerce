# PooCommerce Blocks public API packages

This directory contains JavaScript package entry points that PooCommerce
extensions may consume. Stable exports from each package root are public
contracts and require backward-compatibility handling.

## API contract

- Import packages through their `@poocommerce/*` package root.
- Treat stable root exports as public API.
- Add new APIs instead of renaming or removing existing APIs.
- Deprecate an existing API before removing it.
- Treat exports prefixed with `__experimental` or `__unstable` as unstable.
- Treat deep imports and files not exported from a package root as internal
  unless they are documented separately.

The `"private": true` field in the Blocks `package.json` only prevents npm
publication. It does not make these browser APIs private.

## Packages

| Package | Script handle | Browser global |
| --- | --- | --- |
| `@poocommerce/block-data` | `wc-blocks-data-store` | `wc.wcBlocksData` |
| `@poocommerce/blocks-checkout` | `wc-blocks-checkout` | `wc.blocksCheckout` |
| `@poocommerce/blocks-checkout-events` | `wc-blocks-checkout-events` | `wc.blocksCheckoutEvents` |
| `@poocommerce/blocks-components` | `wc-blocks-components` | `wc.blocksComponents` |
| `@poocommerce/blocks-registry` | `wc-blocks-registry` | `wc.wcBlocksRegistry` |
| `@poocommerce/price-format` | `wc-price-format` | `wc.priceFormat` |
| `@poocommerce/settings` | `wc-settings` | `wc.wcSettings` |
| `@poocommerce/shared-context` | `wc-blocks-shared-context` | `wc.wcBlocksSharedContext` |
| `@poocommerce/shared-hocs` | `wc-blocks-shared-hocs` | `wc.wcBlocksSharedHocs` |
| `@poocommerce/types` | `wc-types` | `wc.wcTypes` |

## Loading the scripts

PooCommerce does not guarantee that these scripts will be enqueued on any
particular page. Any plugin, extension, or custom code that uses these APIs
must enqueue the corresponding script handle listed above.

The independently published `@poocommerce/data` and `@poocommerce/sanitize`
packages remain in the monorepo-level `packages/js` directory.

Being externalized is not, by itself, evidence that a package is public. See
the [internal packages](../internal/README.md) for runtime-only packages that
also produce separate scripts.
