# PooCommerce extension changelog formatter

`poocommerce/extension-changelogger` formats the `changelog.txt` used by PooCommerce extensions. It works with Jetpack Changelogger 6 and PHP 7.4 or later. Install it from the extension root:

```sh
composer require --dev poocommerce/extension-changelogger:^1.0
```

Set `extra.changelogger.formatter.class` to `Automattic\PooCommerce\ExtensionTools\Changelogger\Changelog_Formatter`. Keep the plugin's title under `extra.changelogger.formatter.title` and its change types, entry ordering and versioning under `extra.changelogger`. Use the extension's existing Changelogger commands to validate change files and compile releases.

## PHPUnit bootstrap

With version 1.1.0 or later, use `Automattic\PooCommerce\ExtensionTools\Testing\Test_Bootstrap` in an extension's PHPUnit bootstrap after loading Composer's autoloader.

- Call `Test_Bootstrap::load_core_test_cases( $wc_tests_dir )` where the suite loads PooCommerce's `wp-http-testcase.php` and `class-wc-unit-test-case.php` in that order. Pass the path to PooCommerce's legacy tests directory and load any additional test classes in the suite.
- Call `Test_Bootstrap::initialize_test_container()` once, when the suite finishes loading PooCommerce and its test tools. By default it wraps the inner container in `TestingContainer`. Pass `true` in suites that already replace the legacy proxy on the inner container when service replacement and reset are available. The helper leaves the container alone if PooCommerce uses a different container layout.

## Test with a local checkout

To rehearse unpublished changes, add a Composer path repository to the extension's root `composer.json`. Use a distinct development version and adjust the path to your PooCommerce checkout.

```json
{
	"repositories": [
		{
			"type": "path",
			"url": "../poocommerce/packages/php/extension-tooling",
			"options": {
				"versions": { "poocommerce/extension-changelogger": "dev-local" }
			}
		}
	],
	"require-dev": { "poocommerce/extension-changelogger": "dev-local" }
}
```

From the extension root, run `composer update poocommerce/extension-changelogger` to install the package and update the extension's lockfile for the rehearsal.

Run `composer install` and `composer test` from this directory to test the formatter itself.
