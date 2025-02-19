# [![PooCommerce](https://poocommerce.com/wp-content/themes/woo/images/logo-poocommerce@2x.png 'PooCommerce')](https://poocommerce.com/)

[![License](https://poser.pugx.org/poocommerce/poocommerce/license 'License')](https://packagist.org/packages/poocommerce/poocommerce)
![WordPress.org downloads](https://img.shields.io/wordpress/plugin/dt/poocommerce.svg 'WordPress.org downloads')
![WordPress.org rating](https://img.shields.io/wordpress/plugin/r/poocommerce.svg 'WordPress.org rating')
[![Build Status](https://github.com/poocommerce/poocommerce/actions/workflows/ci.yml/badge.svg?branch=trunk 'Build Status')](https://github.com/poocommerce/poocommerce/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/poocommerce/poocommerce/branch/trunk/graph/badge.svg 'codecov')](https://codecov.io/gh/poocommerce/poocommerce)

This is the PooCommerce Core plugin. Here you can browse the source and keep track of development. We recommend all developers to follow the [PooCommerce development blog](https://poocommerce.wordpress.com/) to stay up to date about everything happening in the project. You can also [follow @deviorobert](https://twitter.com/deviorobert) on Twitter for the latest development updates.

If you are not a developer, please use the [PooCommerce plugin page](https://wordpress.org/plugins/poocommerce/) on WordPress.org.

## Getting Started

### Quick start

Ensure your system meets [the requirements](../../README.md#getting-started) (TLDR: NVM, PNPM, PHP 7.4+, Composer are required for development).

Depending on the preferred environment for running the development instance of PooCommerce, you might need [Docker](https://docs.docker.com/get-docker/) as well. You can learn more about supported environments [here](https://developer.poocommerce.com/docs/setting-up-your-development-environment/).

Once you have verified the prerequisites, you can start the development environment:

```bash
## Watch for changes in PooCommerce and all of its dependencies.
pnpm --filter='@poocommerce/plugin-poocommerce' watch:build

# Start a wp-env based development environment, which will be accessible via http://localhost:8888/.
# This step is optional and you can skip it if you are running PooCommerce on a custom setup.
pnpm --filter='@poocommerce/plugin-poocommerce' env:dev
```

If desired, you can also run commands without `--filter='@poocommerce/plugin-poocommerce'` by running `pnpm <command>` from within the `plugins/poocommerce` directory.

## Building Components

There are three major client-side components included in PooCommerce Core that can be built, linted, and tested independently. We've organized these components
in this way to take advantage of caching to prevent unnecessarily performing expensive rebuilds when only working in one of them.

### `plugins/poocommerce/client/legacy`

This directory contains the Classic CSS and jQuery code for PooCommerce.

```bash
# Build the assets.
pnpm --filter='@poocommerce/plugin-poocommerce' build:classic-assets
# Lint the assets.
pnpm --filter='@poocommerce/classic-assets' lint
```

### `plugins/poocommerce/client/admin`

This directory contains the React-based admin interface.

```bash
# Build the React-based admin client.
pnpm --filter='@poocommerce/plugin-poocommerce' build:admin
# Lint the React-based admin client.
pnpm --filter='@poocommerce/admin-library' lint
# Test the React-based admin client.
pnpm --filter='@poocommerce/admin-library' test
# Watch the tests of the React-based admin client.
pnpm --filter='@poocommerce/admin-library' test:watch
# Run a type check over the React-based admin client's TypeScript files.
pnpm --filter='@poocommerce/admin-library' ts:check
```

### `plugins/poocommerce-blocks`

This directory contains the client for PooCommerce + Gutenberg.

```bash
# Build the Blocks client.
pnpm --filter='@poocommerce/plugin-poocommerce' build:blocks
# Lint the Blocks client.
pnpm run --filter='@poocommerce/block-library' lint
# Test the Blocks client.
pnpm run --filter='@poocommerce/block-library' test
```

## Documentation

- [PooCommerce Documentation](https://poocommerce.com/)
- [PooCommerce Developer Documentation](https://github.com/poocommerce/poocommerce/wiki)
- [PooCommerce Code Reference](https://poocommerce.com/wc-apidocs/)
- [PooCommerce REST API Docs](https://poocommerce.github.io/poocommerce-rest-api-docs/)

## Reporting Security Issues

To disclose a security issue to our team, [please submit a report via HackerOne here](https://hackerone.com/automattic/).
