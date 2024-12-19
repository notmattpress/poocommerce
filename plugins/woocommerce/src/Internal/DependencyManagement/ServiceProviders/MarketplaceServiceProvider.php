<?php
/**
 * MarketplaceServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\Admin\Marketplace;

/**
 * Service provider for the Marketplace namespace.
 */
class MarketplaceServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		Marketplace::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( Marketplace::class );
	}
}
