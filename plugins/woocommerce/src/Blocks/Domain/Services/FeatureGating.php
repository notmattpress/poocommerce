<?php
namespace Automattic\PooCommerce\Blocks\Domain\Services;

use Automattic\PooCommerce\Admin\DeprecatedClassFacade;

/**
 * Service class that used to handle feature flags. That functionality
 * is removed now and it is only used to determine "environment".
 *
 * @internal
 *
 * @deprecated since 9.6.0, use wp_get_environment_type() instead.
 */
class FeatureGating extends DeprecatedClassFacade {
	/**
	 * The version that this class was deprecated in.
	 *
	 * @var string
	 */
	protected static $deprecated_in_version = '9.6.0';

	/**
	 * Constructor
	 *
	 * @param string $environment Hardcoded environment value. Useful for tests.
	 */
	public function __construct( $environment = 'unset' ) {
	}
}
