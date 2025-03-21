# External Packages

This directory holds Composer packages containing functionality developed outside of PooCommerce core.

## Installing Composer

You need Composer to use the packages. If you don't have it installed, go and check how to [install Composer](https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment) and then continue here.

## Developing new packages

To create a package and/or feature plugin for core, you can base your plugin on [the example package](https://github.com/poocommerce/poocommerce-example-package).

Packages require a Package class which inits the package and returns version information, and Packages also require that you use the `jetpack-autoloader` package which prevents version conflicts should the same package be used by multiple plugins at once. This is shown in the example package above.

## Publishing a package

Your package should be published to Packagist ([example](https://packagist.org/packages/poocommerce/poocommerce-example-package)). The package name in this case is `poocommerce/poocommerce-example-package`.

## Including packages in core

Edit `composer.json` in the root directory and add the package and package version under the "require" section. For example:

```json
{
  "name": "poocommerce/poocommerce",
  "description": "An eCommerce toolkit that helps you sell anything. Beautifully.",
  "homepage": "https://poocommerce.com/",
  "type": "wordpress-plugin",
  "license": "GPL-3.0-or-later",
  "prefer-stable": true,
  "minimum-stability": "dev",
  "require": {
    "composer/installers": "1.6.0",
    "poocommerce/poocommerce-rest-api": "dev-test/jetpack-autoloader",
    "poocommerce/poocommerce-blocks": "dev-build/2.2.0-dev",
    "automattic/jetpack-autoloader": "1.2.0",
    "poocommerce/poocommerce-example-package": "1.0.0"
  },
  ...
```

Finally, you will need to tell core to load your package. Edit `src/Packages.php` and add your package to the list of packages there:

```php
	protected static $packages = [
		'poocommerce-blocks'          => '\\Automattic\\PooCommerce\\Blocks\\Package',
    'poocommerce-rest-api'        => '\\Automattic\\PooCommerce\\RestApi\\Package',
    'poocommerce-example-package' => '\\Automattic\\PooCommerce\\ExamplePackage\\Package',
	];
```

You can add tests to ensure your package is loaded to the PooCommerce unit-tests. Some tests exist in `unit-tests/tests/packages/packages.php` which you can use as an example.

## Installing packages

Once you have defined your package requirements, run

```shell
composer install
```

and that will install the required Composer packages.

### Using packages

To use something from a package, you have to declare it at the top of the file before any other instruction, and then use it in the code. For example:

```php
use Automattic\PooCommerce\ExamplePackage\ExampleClass;

// other code...

$class = new ExampleClass();
```

If you need to rule out conflicts, you can alias it:

```php
use Automattic\PooCommerce\ExamplePackage\ExampleClass as Example_Class_Alias;

// other code...

$class = new Example_Class_Alias();
```
