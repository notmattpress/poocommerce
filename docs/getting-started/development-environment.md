---
post_title: Setting up your development environment
sidebar_label: Local Development
sidebar_position: 2
---

# Setting up your development environment

## Recommended software

There are some specific software requirements you will need to consider when developing PooCommerce extensions. The necessary software includes:

* [Git](https://git-scm.com/) for version control of your source code  
* [Node.js](https://nodejs.org/) and [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) to manage node-based scripts and build processes  
* [Pnpm](https://pnpm.io/) is an npm alternative required if you are building PooCommerce from the repository  
* [Composer](https://getcomposer.org/) is an optional dependency management tool for PHP-based development  
* [WP-CLI](http://wp-cli.org/) is the command line interface for WordPress

Most WordPress hosting environments *do not include Node and Composer* by default, so when distributing extensions and themes, it’s important to include all built assets.

Note: A POSIX compliant operating system (e.g., Linux, macOS) is assumed. If you're working on a Windows machine, the recommended approach is to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (available since Windows 10).

## Setting up a reusable WordPress development environment

In addition to the software shared above, you'll also want to have some way of setting up a local development server stack. There are a number of different tools available for this, each with a certain set of functionality and limitations. We recommend choosing from the options below that fit your preferred workflow best.

### Studio - Recommended Approach

For easy local development environments, we recommend [Studio](https://developer.wordpress.com/studio/), the local development environment provided by [WordPress.com](https://developer.wordpress.com). Studio includes the ability to manage multiple local website environments, as well as integrations with your code editor and terminal. Studio also features a WordPress-specific AI Assistant, easy imports from WordPress backups, free public preview sites, and two-way sync with sites hosted on WordPress.com.

### wp-env

[wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) is a command-line utility maintained by the WordPress community that allows you to set up and run custom WordPress environments with [Docker](https://www.docker.com/) and JSON manifests. The repository includes a `.wp-env.json` file specifically for contributing to PooCommerce core.

### General PHP-based web stack tools

Below is a collection of tools to help you manage your environment that are not WordPress-specific.

* [MAMP](https://www.mamp.info/en/mac/) - A local server environment that can be installed on Mac or Windows.  
* [WAMP](https://www.wampserver.com/en/) - A Windows web development environment that lets you create applications with Apache2, PHP, and MySQL.  
* [XAMPP](https://www.apachefriends.org/index.html) - An easy-to-install Apache distribution containing MariaDB, PHP, and Perl. It's available for Windows, Linux, and OS X.  
* [Laravel Herd / Valet](https://herd.laravel.com/) - A minimalist and fast development environment for macOS (Valet) and Windows (Herd), optimized for Laravel and other PHP applications.
* [Lando](https://lando.dev/) - A powerful, Docker-based tool for defining and managing local development services across various languages and frameworks.
* [DDEV](https://ddev.com/) - An open-source, Docker-based tool for streamlined local web development, supporting many CMS and frameworks like Drupal and WordPress.
* [vvv](https://varyingvagrantvagrants.org/) is a highly configurable, cross-platform, and robust environment management tool powered by VirtualBox and Vagrant. 

### Minimum server requirements

Regardless of the tool you choose for managing your development environment, you should make sure it [meets the server recommendations](https://poocommerce.com/document/server-requirements/?utm_source=wooextdevguide) for PooCommerce as well as the [requirements for running WordPress](https://wordpress.org/about/requirements/).

## Add PooCommerce Core to your environment

When developing for PooCommerce, it's helpful to install a development version of PooCommerce Core.

### Option 1: PooCommerce Beta Tester

If installing PooCommerce through the traditional WordPress dashboard, you can also install the [PooCommerce Beta Tester](/docs/contribution/testing/beta-testing) extension to change the version, including access to upcoming betas and release candidates. The PooCommerce Beta tester is available through the [Woo Marketplace](https://poocommerce.com/marketplace). 

### Option 2: Clone the PooCommerce Core repository

You can also work directly against the `trunk` or upcoming release branch of PooCommerce Core in your development environment by:

1. Cloning the PooCommerce Core repository.  
2. Installing and activating the required Node version and PNPM.  
3. Installing PooCommerce’s dependencies.  
4. Building PooCommerce.  
5. Symlinking the `plugin/poocommerce` directory to your `wp-content/plugins` directory

#### Clone the PooCommerce Core repository

You can clone the PooCommerce Core repository locally using the following CLI command:

```shell
cd /your/server/wp-content/plugins
git clone https://github.com/poocommerce/poocommerce.git
cd poocommerce
```

#### Install and activate Node

It is recommended to install and activate Node using [Node Version Manager](https://github.com/nvm-sh/nvm) (or nvm). You can install nvm using the following CLI command:

```shell
nvm install
```

You can learn more about how to install and utilize nvm in [the nvm GitHub repository](https://github.com/nvm-sh/nvm?tab=readme-ov-file#intro).

#### Install dependencies

To install PooCommerce dependencies, use the following CLI command:

```shell
pnpm install --frozen-lockfile
```

#### Build PooCommerce

Use the following CLI command to compile the JavaScript and CSS that PooCommerce needs to operate:

```shell
pnpm build
```

Note: If you try to run PooCommerce on your server without generating the compiled assets, you may experience errors and other unwanted side-effects.

#### Symlink the PooCommerce plugin 

To load the PooCommerce plugin into your local development environment, you can create a symbolic link from the PooCommerce plugin in your cloned repository to your local WordPress development environment.

```shell
ln -s poocommerce/plugins/poocommerce /path-to-local/wp-content/plugins
```

#### Generating a `poocommerce.zip` asset

Alternatively, you can generate a `poocommerce.zip` file with the following command:

```shell
pnpm build:zip
```

A `poocommerce.zip` file may be helpful if you’d like to upload a modified version of PooCommerce to a separate test environment.
