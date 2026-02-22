# @poocommerce/create-product-editor-block

Create Product Editor Block scaffolds a fully functional modern development environment for developing block-based extensions to the new block-based product editor in PooCommerce.

## Default tooling

You can use the built-in [wp-env](https://github.com/WordPress/gutenberg/tree/trunk/packages/env) support to easily get a local WordPress environment up and running. It is configured to load the latest released version of WordPress, the latest PooCommerce nightly build and the latest version of the [PooCommerce Beta Tester](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce-beta-tester).

If you want to change which version of WordPress and PooCommerce are used, you can do so by modifying the `.wp-env.override.json` file.

Tooling support for linting, code formatting, and compilation are configured by default.

If you already have a local WordPress development environment configured, you can map the generated project folder under your `plugins` folder.

## Usage

### Generate project folder

```
npx @wordpress/create-block --template @poocommerce/create-product-editor-block my-extension-name
```

### Get started developing


```bash
cd my-extension-name
npx wp-env start # Start Wordpress environment
```

By default, the `wp-env` environment created will have the new block-based product editor enabled. You can disable this by using the PooCommerce Beta Tester (disable the `product-block-editor` feature).

Navigate to http://localhost:8888/wp-admin/admin.php?page=wc-admin&path=%2Fadd-product to check out your new block!

### Make changes and re-build your block

```bash
cd my-extension-name
npm install # Install dependencies
npm run build # Build the javascript
```

## Development of this tool

For development of this tool itself, you can also point to a local directory when creating a product editor block:

```bash
npx @wordpress/create-block --template ./path/to/poocommerce/packages/js/create-product-editor-block my-extension-name
```

This tool is a template to be used with [`@wordpress/create-block`](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) to create a PooCommerce Product Editor Block starting point.
