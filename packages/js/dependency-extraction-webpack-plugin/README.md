# Dependency Extraction Webpack Plugin

Extends WordPress [Dependency Extraction Webpack Plugin](https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin) to automatically include PooCommerce dependencies in addition to WordPress dependencies.

## Installation

Install the module

```bash
pnpm install @poocommerce/dependency-extraction-webpack-plugin --save-dev
```

## Usage

Use this as you would [Dependency Extraction Webpack Plugin](https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin). The API is exactly the same, except that PooCommerce packages are also handled automatically.

```js
// webpack.config.js
const PooCommerceDependencyExtractionWebpackPlugin = require( '@poocommerce/dependency-extraction-webpack-plugin' );

module.exports = {
 // …snip
 plugins: [ new PooCommerceDependencyExtractionWebpackPlugin() ],
};
```

**Note:** If you plan to extend the webpack configuration from `@wordpress/scripts` with `PooCommerceDependencyExtractionWebpackPlugin`, be sure to remove the default instance of the plugin:

```js
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const webpackConfig = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) =>
				plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
		),
		new PooCommerceDependencyExtractionWebpackPlugin(),
	],
};
```

Additional module requests on top of WordPress [Dependency Extraction Webpack Plugin](https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin) are:

| Request | Global | Script handle | Notes |
| --- | --- | --- | --- |
| `@poocommerce/data` | `wc['data']` | `wc-store-data` | Registered in wp-admin only. Not available on the storefront. |
| `@poocommerce/csv-export` | `wc['csvExport']` | `wc-csv` | Registered in wp-admin only. Not available on the storefront. |
| `@poocommerce/blocks-registry` | `wc['wcBlocksRegistry']` | `wc-blocks-registry` | |
| `@poocommerce/block-data` | `wc['wcBlocksData']` | `wc-blocks-data-store` | This dependency does not have an associated npm package |
| `@poocommerce/settings` | `wc['wcSettings']` | `wc-settings` | This is an alias for a PooCommerce core script, not the npm package of the same name. See below. |
| `@poocommerce/*` | `wc['*']` | `wc-*` | |

### `@poocommerce/settings`

The `@poocommerce/settings` request is not the [`@poocommerce/settings` npm package](https://www.npmjs.com/package/@poocommerce/settings). That package is deprecated and should not be installed. The plugin maps the request to the `wc.wcSettings` module and adds `wc-settings` to your script dependencies; PooCommerce core loads that script whenever a script depends on the `wc-settings` handle, and prints the data it reads into the `wcSettings` global right before it. The source lives in [`plugins/poocommerce/client/blocks/packages/public-api/settings`](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/client/blocks/packages/public-api/settings).

Register scripts that depend on `wc-settings` in the footer. The settings data is collected during the request, so a script running in the header would read it before it is complete. PooCommerce moves such scripts to the footer for you and logs a console warning.

Use `getSetting` to read data that PooCommerce, or your own PHP code, registered on the server. See [Data flow: server to client](https://github.com/poocommerce/poocommerce/blob/trunk/docs/block-development/reference/overview-of-data-flow.md#server-php-to-client-javascript) for how to register that data.

```js
import { getSetting } from '@poocommerce/settings';

const value = getSetting( 'my-plugin/value', 'fallback' );
```

#### Using `@poocommerce/settings` with Jest

Jest cannot resolve the request because there is no package to install. Map it to a local mock and define the `wcSettings` global in a setup file:

```js
// jest.config.js
module.exports = {
	moduleNameMapper: {
		'@poocommerce/settings': '<rootDir>/tests/mocks/poocommerce-settings.js',
	},
	setupFiles: [ '<rootDir>/tests/setup-globals.js' ],
};
```

```js
// tests/mocks/poocommerce-settings.js
module.exports = {
	getSetting: ( name, fallback = false ) =>
		name in global.wcSettings ? global.wcSettings[ name ] : fallback,
	getAdminLink: ( path ) =>
		global.wcSettings.adminUrl ? global.wcSettings.adminUrl + path : path,
};
```

```js
// tests/setup-globals.js
global.wcSettings = {
	adminUrl: 'https://example.com/wp-admin/',
};
```

Mock the helpers and settings that your code and its dependencies use. For example, `@poocommerce/navigation`, which `@poocommerce/components` depends on, calls `getAdminLink`. The mock and global that the PooCommerce monorepo uses for its own tests are in [`packages/js/internal-js-tests/src/mocks/poocommerce-settings.js`](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/internal-js-tests/src/mocks/poocommerce-settings.js) and [`packages/js/internal-js-tests/src/setup-globals.js`](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/internal-js-tests/src/setup-globals.js).

### Options

An object can be passed to the constructor to customize the behavior, for example:

```js
module.exports = {
 plugins: [
  new PooCommerceDependencyExtractionWebpackPlugin( {
   bundledPackages: [ '@poocommerce/components' ],
  } ),
 ],
};
```

#### `bundledPackages`

- Type: array
- Default: []

A list of potential PooCommerce excluded packages, this will include the excluded package within the bundle (example above).

For more supported options see the original [dependency extraction plugin](https://github.com/WordPress/gutenberg/blob/trunk/packages/dependency-extraction-webpack-plugin/README.md#options).
