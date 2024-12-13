# Dependency Extraction Webpack Plugin

Extends Wordpress [Dependency Extraction Webpack Plugin](https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin) to automatically include PooCommerce dependencies in addition to WordPress dependencies.

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

Additional module requests on top of Wordpress [Dependency Extraction Webpack Plugin](https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin) are:

| Request                        | Global                   | Script handle          | Notes                                                   |
| ------------------------------ | ------------------------ | ---------------------- | --------------------------------------------------------|
| `@poocommerce/data`            | `wc['data']`             | `wc-store-data`        | |
| `@poocommerce/csv-export`      | `wc['csvExport']`        | `wc-csv`               | |
| `@poocommerce/blocks-registry` | `wc['wcBlocksRegistry']` | `wc-blocks-registry`   | |
| `@poocommerce/block-data`      | `wc['wcBlocksData']`     | `wc-blocks-data-store` | This dependency does not have an associated npm package |
| `@poocommerce/settings`        | `wc['wcSettings']`       | `wc-settings`          | |
| `@poocommerce/*`               | `wc['*']`                | `wc-*`                 | |

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
