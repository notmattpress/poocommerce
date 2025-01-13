# PooCommerce Beta Tester

A plugin that makes it easy to test out pre-releases such as betas release candidates and even final releases. It also comes with PooCommerce Admin Test Helper that helps test PooCommerce Admin functionalities.

## Installation

You can either install the latest version from [wp.org](https://wordpress.org/plugins/poocommerce-beta-tester/) or symlink this directory by running `ln -s ./ :path-to-your-wp-plugin-directory/poocommerce-beta-tester`

## Development

To get started, run the following commands:

```text
pnpm --filter=@poocommerce/plugin-poocommerce-beta-tester install
pnpm --filter=@poocommerce/plugin-poocommerce-beta-tester start
```

See [wp-scripts](https://github.com/WordPress/gutenberg/tree/trunk/packages/scripts) for more usage information.

## Usage

You can get to the settings and features from your top admin bar under the name WC Beta Tester.

For more information about PooCommerce Admin Test Helper usage, click [here](./EXTENDING-WC-ADMIN-HELPER.md).

Run `./bin/build-zip.sh` to make a zip file.
