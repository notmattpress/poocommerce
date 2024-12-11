---
post_title: Setting up your development environment
menu_title: Development environment setup
tags: tutorial, setup
---

## Introduction

This guide will walk you through the steps of setting up a basic development environment, which can be useful for store builders, contributors, and extending PooCommerce.

Creating a PooCommerce extension — a plugin which extends the functionality of PooCommerce — or developing a PooCommerce-compatible theme can be an excellent way to build custom functionality into your store and potentially monetize your development through the [PooCommerce Marketplace](https://poocommerce.com/products/?utm_source=wooextdevguide). 

If you would like to contribute to the PooCommerce core platform, please read our [contributor documentation and guidelines](https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment).

If you want to sell your extensions or themes on the PooCommerce marketplace, please [read more about becoming a Woo partner](https://poocommerce.com/partners/?utm_source=wooextdevguide).

## Prerequisites

PooCommerce adheres to WordPress code standards and guidelines, so it's best to familiarize yourself with [WordPress Development](https://learn.wordpress.org/tutorial/introduction-to-wordpress/) as well as [PHP](https://www.php.net/). Currently PooCommerce requires PHP 7.4 or newer.

Knowledge and understanding of [PooCommerce hooks and filters](https://poocommerce.com/document/introduction-to-hooks-actions-and-filters/?utm_source=wooextdevguide) will allow you to add and change code without editing core files. You can learn more about WordPress hooks and filters in the [WordPress Plugin Development Handbook](https://developer.wordpress.org/plugins/hooks/).

### Recommended reading

PooCommerce extensions are a specialized type of WordPress plugin. If you are new to WordPress plugin development, take a look at some of the articles in the [WordPress Plugin Developer Handbook](https://developer.wordpress.org/plugins/).

### Required software

There are some specific software requirements you will need to consider when developing PooCommerce extensions. The necessary software includes:

- [Git](https://git-scm.com/)
- [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Composer](https://getcomposer.org/)

Note: A POSIX compliant operating system (e.g., Linux, macOS) is assumed. If you're working on a Windows machine, the recommended approach is to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (available since Windows 10).

### Setting up a reusable WordPress development environment

In addition to the software listed above, you'll also want to have some way of setting up a local development server stack. There are a number of different tools available for this, each with a certain set of functionality and limitations. We recommend choosing from the options below that fit your preferred workflow best.

#### WordPress-specific tools

Below are a couple of tools designed specifically for a WordPress environment:

- [vvv](https://varyingvagrantvagrants.org/) is a highly configurable, cross-platform, and robust environment management tool powered by VirtualBox and Vagrant. This is one tool that the PooCommerce Core team recommends to contributors.
- [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) is a command-line utility maintained by the WordPress community that allows you to set up and run custom WordPress environments with [Docker](https://www.docker.com/) and JSON manifests.

#### General PHP-based web stack tools

Below is a collection of tools to help you manage your environment that are not WordPress-specific.

- [MAMP](https://www.mamp.info/en/mac/) - A local server environment that can be installed on Mac or Windows.
- [WAMP](https://www.wampserver.com/en/) - A Windows web development environment that lets you create applications with Apache2, PHP, and MySQL.
- [XAMPP](https://www.apachefriends.org/index.html) - An easy-to-install Apache distribution containing MariaDB, PHP, and Perl. It's available for Windows, Linux, and OS X.

#### Minimum server requirements

Regardless of the tool you choose for managing your development environment, you should make sure it [meets the server recommendations](https://poocommerce.com/document/server-requirements/?utm_source=wooextdevguide) for PooCommerce as well as the [requirements for running WordPress](https://wordpress.org/about/requirements/).

## Anatomy of a WordPress development environment

While development environments can vary, the basic file structure for a WordPress environment should be consistent.

When developing a PooCommerce extension, you'll usually be doing most of your work within the `public_html/` directory of your local server. Take some time to familiarize yourself with a few key paths:

- `wp-content/debug.log` is the file where WordPress writes the important output such as errors and other messages that can be useful for debugging.
- `wp-content/plugins/` is the directory on the server where WordPress plugin folders live.
- `wp-content/themes/` is the directory on the server where WordPress theme folders live.

## Add PooCommerce Core to your environment

When developing an extension for PooCommerce, it's helpful to install a development version of PooCommerce Core. 

You can install PooCommerce Core on your development environment by:

1. Cloning the PooCommerce Core repository.
2. Installing and activating the required Node version.
3. Installing PooCommerce’s dependencies.
4. Building PooCommerce.

### Clone the PooCommerce Core repository

You can clone the PooCommerce Core repository into `wp-content/plugins/` using the following CLI command:

```sh
cd /your/server/wp-content/plugins
git clone https://github.com/poocommerce/poocommerce.git
cd poocommerce
```

### Install and activate Node

It is recommended to install and activate Node using [Node Version Manager](https://github.com/nvm-sh/nvm) (or **nvm**). You can install nvm using the following CLI command:

```sh
nvm install
```

You can learn more about how to install and utilize nvm in [the nvm GitHub repository](https://github.com/nvm-sh/nvm?tab=readme-ov-file#intro).

### Install dependencies

To install PooCommerce dependencies, use the following CLI command:

```sh
pnpm install
composer install
```

### Build PooCommerce

Use the following CLI command to compile the JavaScript and CSS that PooCommerce needs to operate:

```sh
pnpm build
```

Note: If you try to run PooCommerce on your server without generating the compiled assets, you may experience errors and other unwanted side-effects.

Alternatively, you can generate a `poocommerce.zip` file with the following command: 

```sh
pnpm build:zip
```

A `poocommerce.zip` file may be helpful if you’d like to upload a modified version of PooCommerce to a separate test environment.
