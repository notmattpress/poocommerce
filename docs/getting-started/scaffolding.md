---
post_title: Scaffolding and sample store data
sidebar_label: Scaffolding and sample data
sidebar_position: 4
---

# Scaffolding and sample store data

PooCommerce offers a number of starter kits and scaffolds depending on what you are building.

## Starter Themes

If you’re designing a PooCommerce store, you have two options for theme development: Classic Themes and Block Themes.

-   Classic themes use PHP templates to override designs to key pages on your store, including your product pages, product archives, shopping cart, and checkout page. While sites running a classic theme can use the WordPress block editor, many of the templates are not editable within the editor itself.
-   Block themes use the WordPress site editor to generate every aspect of the WordPress site, including the header and footer, product pages, archives, and the cart and checkout pages. Designs built in the site editor can be exported into flat HTML files, but the files themselves are typically edited in the WordPress editor.

### Storefront Theme (Classic)

Storefront is Woo’s flagship classic theme, available in the [WordPress Theme Directory](https://wordpress.org/themes/). You can either rename and modify the theme itself, or override specific aspects of it using a child theme.

For more information on building a classic PooCommerce theme, read our classic theme development handbook. For a comprehensive guide on creating a child block theme and understanding the differences between a classic and block theme, please refer to [PooCommerce block theme development](/docs/theming/block-theme-development/theming-woo-blocks) and [WordPress block child theme development](https://learn.wordpress.org/lesson-plan/create-a-basic-child-theme-for-block-themes/).

### Block Starter Themes

If you are completely new to block theme development, please check [Develop Your First Low-Code Block Theme](https://learn.wordpress.org/course/develop-your-first-low-code-block-theme/) to learn about block theme development, and explore the [Create Block Theme plugin](https://wordpress.org/plugins/create-block-theme/) tool when you're ready to create a new theme.

For more information, check out our [Block Theme Development handbook](/docs/theming/block-theme-development/theming-woo-blocks).

## Extension Scaffolds

### @poocommerce/create-woo-extension

[Create Woo Extension](https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/create-woo-extension/) is an NPX command that scaffolds an entire PooCommerce extension for your store. The generated extensions adds a React-based settings page integrating with PooCommerce Admin. Also included are PHP and Javascript unit testing, linting, and Prettier IDE configuration for PooCommerce and WordPress.

Read our full tutorial on using the [create-woo-extension package](/docs/extensions/getting-started-extensions/building-your-first-extension).

### @poocommerce/extend-cart-checkout-block

This is a template to be used with `@wordpress/create-block` to create a PooCommerce Blocks extension starting point. To install and use it, follow the instructions in [`@poocommerce/extend-cart-checkout-block`](https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/extend-cart-checkout-block/). Please note that this example contains multiple other examples of extensibility, not just inner blocks.

### PooCommerce admin extension examples

Inside of the PooCommerce plugin are a set of example extensions that showcase different use-cases for modifying PooCommerce core functionality. Some examples include adding a custom report, a custom payment gateway, and modifying the PooCommerce dashboard.

Read our full tutorial showcasing [how to extend PooCommerce analytics reports](/docs/features/analytics/extending-poocommerce-admin-reports).

## Relevant WordPress Scaffolds

### Default WordPress Theme

The default WordPress theme (Twenty-Twenty Five as of the time of this writing) is a great place to see the best practices and standard conventions of a WordPress block theme. Using the Create Block Theme tool, you can modify the theme design from within the site edtitor and then export your new design to a custom child theme.

### @wordpress/create-block

If you’re adding additional content or design elements to WordPress, it may make sense to create a custom block. The WordPress block editor package library includes a scaffolding tool called WordPress Create Block that helps you spin up custom blocks that can be inserted into any page or template.

Read more about the [`wordpress/create-block` package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/).

## Sample Store Data

### Core Plugin Sample Data

It may be helpful to load your local store with sample data. In the PooCommerce core plugin, you can find CSV and XML files that can be imported directly into PooCommerce using the WordPress admin or via WC-CLI. The sample data is located in [`/plugins/poocommerce/sample-data/`](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/sample-data).

### Smooth Generator

For more advanced testing, you may want sample customers and order data. [Smooth Generator](https://github.com/poocommerce/wc-smooth-generator) is a plugin to help you generate PooCommerce-related data for testing. Use the WP Admin interface for basic operations, or the CLI tool for more advanced features. Download and install the latest version from the [Releases page](https://github.com/poocommerce/wc-smooth-generator/releases) and browse the repository for more documentation.
