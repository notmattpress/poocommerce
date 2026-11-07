/*
 * Shared `import/core-modules` list for the monorepo's package ESLint configs.
 *
 * These specifiers are webpack externals or WordPress-provided globals resolved
 * at runtime (`window.wc.*` / `window.wp.*`), so they never resolve on disk.
 * Listing them here stops `import/no-unresolved` and
 * `import/no-extraneous-dependencies` firing on every such import, and gives the
 * package configs one source of truth instead of drifting per-package copies.
 *
 * It holds the monorepo `@poocommerce/*` siblings plus the `@wordpress/*`
 * packages that recur across multiple configs. Package-specific specifiers
 * (one-off `@wordpress/*` and third-party externals) stay in the consuming
 * config, spread after this list.
 */
const coreModules = [
	// Monorepo @poocommerce/* siblings (webpack externals / aliases).
	'@poocommerce/admin-layout',
	'@poocommerce/components',
	'@poocommerce/csv-export',
	'@poocommerce/currency',
	'@poocommerce/customer-effort-score',
	'@poocommerce/data',
	'@poocommerce/date',
	'@poocommerce/experimental',
	'@poocommerce/explat',
	'@poocommerce/internal-js-tests',
	'@poocommerce/navigation',
	'@poocommerce/number',
	'@poocommerce/onboarding',
	'@poocommerce/settings',
	'@poocommerce/tracks',

	// @wordpress/* packages used across multiple package configs.
	'@wordpress/block-editor',
	'@wordpress/blocks',
	'@wordpress/components',
	'@wordpress/core-data',
	'@wordpress/data',
	'@wordpress/editor',
	'@wordpress/element',
	'@wordpress/media-utils',
	'@wordpress/notices',
];

module.exports = { coreModules };
