---
post_title: Handling SCSS and JS minification in PooCommerce
menu_title: Minification of SCSS and JS
tags: reference
---

## SCSS

When updating SCSS files in the PooCommerce project, please **commit only your changes to unminified SCSS files**. The minification will be handled as part of the release process.

To get the minified CSS files, run `pnpm --filter='@poocommerce/classic-assets' build` from the repository root directory. To set up the development environment from scratch, see the section on [how to install dependencies and generate assets](https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment#install-dependencies-and-generate-assets) in the guide to set up a PooCommerce development environment.

## Javascript

When changing the JS files, please **commit only unminified files** (i.e. the readable JS files). The minification will be handled as part of the release process.

To ensure you can test your changes, run with `SCRIPT_DEBUG` turned on, i.e. add `define( 'SCRIPT_DEBUG', true );` to your wp-config.php file.
