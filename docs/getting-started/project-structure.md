---
post_title: Project structure
sidebar_label: Project structure
sidebar_position: 1
---

# Project Structure

## Prerequisites

PooCommerce adheres to WordPress code standards and guidelines, so it's best to familiarize yourself with [WordPress Development](https://learn.wordpress.org/tutorial/introduction-to-wordpress/) as well as [PHP](https://www.php.net/). Currently PooCommerce requires PHP 7.4 or newer.

Knowledge and understanding of [PooCommerce hooks and filters](https://poocommerce.com/document/introduction-to-hooks-actions-and-filters/?utm_source=wooextdevguide) will allow you to add and change code without editing core files. You can learn more about WordPress hooks and filters in the [WordPress Plugin Development Handbook](https://developer.wordpress.org/plugins/hooks/).

## Recommended reading

PooCommerce extensions are a specialized type of WordPress plugin. If you are new to WordPress plugin development, take a look at some of the articles in the [WordPress Plugin Developer Handbook](https://developer.wordpress.org/plugins/).

## Anatomy of a WordPress environment

While development environments can vary, the basic file structure for a WordPress environment should be consistent.

When developing a PooCommerce extension, you'll usually be doing most of your work within the `public_html/` directory of your local server.

There are three directories in a WordPress installation. The `wp-admin` and `wp-includes` directories include core functionality and should not be modified. The third directory, `wp-content` is where custom configurations and user-generated media is stored.

 Take some time to familiarize yourself with a few key paths inside `wp-content`:

* `wp-content/debug.log` is the file where WordPress writes the important output such as errors and other messages that can be useful for debugging.  
* `wp-content/plugins`/ is the directory on the server where WordPress plugin folders live.  
* `wp-content/themes/` is the directory on the server where WordPress theme folders live. A theme is a collection of templates and styles, and WordPress can have only one active theme.

Finally, at the root of your WordPress installation is one more configurable file, `wp-config.php`. This file acts similarly to a `.env` file and stores important security credentials and variables that define your environment configuration.

## PooCommerce Plugin Structure 

When adding PooCommerce to a WordPress installation, you can either install the plugin from inside the WordPress dashboard or manually upload the plugin directory to the `wp-content/plugins` directory. 

**Important:** The PooCommerce repository is a monorepo that includes multiple plugins and packages. To install PooCommerce from the repository, you cannot simply clone the entire repo into `wp-content/plugins`. The PooCommerce plugin sits in the monorepo inside the `plugins/` directory, so if you’re planning to develop from the repository, we recommend cloning it outside of your local WordPress installation and then using a symlink to “place” it in `wp-content/plugins`. 

Each plugin, package, and tool has its own `package.json` file containing project-specific dependencies and scripts. Most projects also contain a `README.md` file with any project-specific setup instructions and documentation.

* [**Plugins**](http://github.com/poocommerce/poocommerce/tree/trunk/plugins): Our repository contains plugins that relate to or otherwise aid in the development of PooCommerce.  
    * [**PooCommerce Core**](http://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce): The core PooCommerce plugin is available in the plugins directory.  
* [**Packages**](http://github.com/poocommerce/poocommerce/tree/trunk/packages): Contained within the packages directory are all of the [PHP](http://github.com/poocommerce/poocommerce/tree/trunk/packages/php) and [JavaScript](http://github.com/poocommerce/poocommerce/tree/trunk/packages/js) provided for the community. Some of these are internal dependencies and are marked with an `internal-` prefix.  
* [**Tools**](http://github.com/poocommerce/poocommerce/tree/trunk/tools): We also have a growing number of tools within our repository. Many of these are intended to be utilities and scripts for use in the monorepo, but, this directory may also contain external tools.

If you'd like to learn more about how our monorepo works, [please check out this guide here](http://github.com/poocommerce/poocommerce/tree/trunk/tools/README.md).

## Theming and Extending Functionality

Unless you’re contributing directly to PooCommerce core, you will not edit WordPress or PooCommerce files directly. All modification of functionality is done by creating a custom extension or modifying the `functions.php` file of your active theme. 

To edit the *design* of a PooCommerce store, we recommend modifying or creating a custom theme. Learn more about theming PooCommerce in our [Theme Development Handbook](/docs/theming/theme-development/classic-theme-developer-handbook).

To edit the *functionality* of a PooCommerce store, you have multiple options. First, you can use the [Woo Marketplace](https://poocommerce.com/marketplace) to find a suitable, pre-made extension that meets your needs. For simple customizations, you can learn more about easy ways to add [code snippets](/docs/code-snippets/) to your store. For more advanced development needs, we recommend building a custom extension (i.e. a WordPress plugin). 
