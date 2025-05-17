---
post_title: PooCommerce developer tools
menu_title: Developer tools
tags: reference
---

This guide provides an overview of essential tools and libraries for PooCommerce development. It's intended for developers looking to enhance their PooCommerce projects efficiently.

## Productivity Tools

Use these resources to get a PooCommerce development environment up and running.

### Development

#### [wp-cli](https://wp-cli.org/)

This is the command-line interface for [WordPress](https://wordpress.org/). You can update plugins, configure multisite installations and much more, without using a web browser.

#### [wp-env](https://www.npmjs.com/package/@wordpress/env)

This command-line tool lets you easily set up a local WordPress environment for building and testing plugins and themes. It's simple to install and requires no configuration.

#### [eslint-plugin](https://www.npmjs.com/package/@poocommerce/eslint-plugin)

This is an [ESLint](https://eslint.org/) plugin including configurations and custom rules for PooCommerce development.

#### [WordPress Scripts](https://www.npmjs.com/package/@wordpress/scripts)

This is a collection of reusable scripts tailored for WordPress development.

### Testing

#### [Smooth Generator](https://github.com/poocommerce/wc-smooth-generator)

A plugin to help you generate PooCommerce-related data for testing. Use the WP Admin interface for basic operations, or the CLI tool for more advanced features. Download and install the latest version from the [Releases page](https://github.com/poocommerce/wc-smooth-generator/releases).

---

## Libraries

Use these resources to help take some of the heavy lifting off of fetching and transforming data -- as well as creating UI elements.

### API Clients

#### [PooCommerce REST API - JavaScript](https://www.npmjs.com/package/@poocommerce/poocommerce-rest-api)

The official JavaScript library for working with the PooCommerce REST API.

#### [api-fetch](https://www.npmjs.com/package/@wordpress/api-fetch)

This is a utility to make WordPress REST API requests. It's a wrapper around `window.fetch` that includes support for nonces, middleware, and custom fetch handlers.

### Components

#### [PooCommerce Components](https://www.npmjs.com/package/@poocommerce/components)

This package includes a library of React components that can be used to create pages in the PooCommerce admin area.

#### [WordPress Components](https://www.npmjs.com/package/@wordpress/components)

This packages includes a library of generic WordPress components that can be used for creating common UI elements shared between screens and features of the WordPress dashboard.

### Utilities

#### [CSV Export](https://www.npmjs.com/package/@poocommerce/csv-export)

A set of functions to convert data into CSV values, and enable a browser download of the CSV data.

#### [Currency](https://www.npmjs.com/package/@poocommerce/currency)

A collection of utilities to display and work with currency values.

#### [Data](https://www.npmjs.com/package/@poocommerce/data)

Utilities for managing the PooCommerce Admin data store.

#### [Date](https://www.npmjs.com/package/@poocommerce/date)

A collection of utilities to display and work with date values.

#### [Navigation](https://www.npmjs.com/package/@poocommerce/navigation)

A collection of navigation-related functions for handling query parameter objects, serializing query parameters, updating query parameters, and triggering path changes.

#### [Number](https://www.npmjs.com/package/@poocommerce/number)

A collection of utilities to properly localize numerical values in PooCommerce.
