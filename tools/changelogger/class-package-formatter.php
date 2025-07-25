<?php
/**
 * Package_Formatter class
 *
 * @package  PooCommerce
 */

namespace Automattic\PooCommerce\MonorepoTools\Changelogger;

use Automattic\Jetpack\Changelogger\FormatterPlugin;

/**
 * Jetpack Changelogger Formatter for PooCommerce packages
 */

require_once 'class-formatter.php';

/**
 * Jetpack Changelogger Formatter for PooCommerce Packages
 *
 * Class Formatter
 */
class Package_Formatter extends Formatter implements FormatterPlugin {
	/**
	 * Prologue text.
	 *
	 * @var string
	 */
	public $prologue = "# Changelog \n\nThis project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).";

	/**
	 * Return the epilogue string based on the package being released.
	 */
	public function getEpilogue() {
		$cwd     = getcwd();
		$pos     = stripos( $cwd, 'packages/js/' );
		$package = substr( $cwd, $pos + 12 );

		return '[See legacy changelogs for previous versions](https://github.com/poocommerce/poocommerce/blob/68581955106947918d2b17607a01bdfdf22288a9/packages/js/' . $package . '/CHANGELOG.md).';
	}

	/**
	 * Get Release link given a version number.
	 *
	 * @throws \InvalidArgumentException When directory parsing fails.
	 * @param string $version Release version.
	 *
	 * @return string Link to the version's release.
	 */
	public function getReleaseLink( string $version ): string {
		// Capture anything past /poocommerce in the current working directory.
		preg_match( '/\/packages\/js\/(.+)/', getcwd(), $path );

		if ( ! count( $path ) ) {
			throw new \InvalidArgumentException( 'Invalid directory.' );
		}

		return 'https://www.npmjs.com/package/@poocommerce/' . $path[1] . '/v/' . $version;
	}
}
