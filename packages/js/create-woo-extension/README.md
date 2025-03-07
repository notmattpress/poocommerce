# @poocommerce/create-woo-extension

Create Woo Extension scaffolds a fully functional modern development environment for integrating with PooCommerce. Use it to build extensions leveraging the power of PooCommerce.

## Configuration Free

With build tooling already configured, getting started developing modern Javascript screens requires no effort. Create Woo Extension adds a React page integrating with PooCommerce Admin. Also included are PHP and Javascript unit testing, linting, and Prettier IDE configuration for PooCommerce and WordPress.

Add a project inside of your favorite environment setup or use the built in [wp-env](https://github.com/WordPress/gutenberg/tree/trunk/packages/env) for easily setting up a local WordPress environment for building and testing plugins and themes. `wp-env` is configured to load the latest PooCommerce to easily start developing with a single command.

## Usage

```bash
npx @wordpress/create-block -t @poocommerce/create-woo-extension my-extension-name
```

Navigate to the newly created folder and get started.

```bash
cd my-extension-name
npm install # Install dependencies
npm run build # Build the javascript
npm -g i @wordpress/env # If you don't already have wp-env
wp-env start # Start Wordpress environment
```

See the new plugin activated from the WordPress plugins page and navigate to `wp-admin/admin.php?page=wc-admin&path=%2Fmy-extension-name` to check it out.

## Development

For development on this tool itself, you can also install from a local directory.

```bash
npx @wordpress/create-block -t ./path/to/poocommerce/packages/js/create-woo-extension my-extension-name
```

This is a template to used with [`@wordpress/create-block`](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) to create a PooCommerce Extension starting point.
