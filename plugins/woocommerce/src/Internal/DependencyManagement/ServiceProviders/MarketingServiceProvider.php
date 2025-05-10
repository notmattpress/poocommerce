<?php
/**
 * MarketingServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Admin\Marketing\MarketingChannels;
use Automattic\PooCommerce\Internal\Admin\Marketing\MarketingSpecs;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;

// Indicates that the multichannel marketing classes exist.
// This constant will be checked by third-party extensions before utilizing any of the classes defined for this feature.
if ( ! defined( 'WC_MCM_EXISTS' ) ) {
	define( 'WC_MCM_EXISTS', true );
}

/**
 * Service provider for the non-static utils classes in the Automattic\PooCommerce\src namespace.
 *
 * @since x.x.x
 */
class MarketingServiceProvider extends AbstractServiceProvider {
	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		MarketingSpecs::class,
		MarketingChannels::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( MarketingSpecs::class );
		$this->share( MarketingChannels::class );
	}
}
