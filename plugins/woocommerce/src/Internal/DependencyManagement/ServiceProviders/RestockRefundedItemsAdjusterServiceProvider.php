<?php
/**
 * RestockRefundedItemsAdjusterServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\RestockRefundedItemsAdjuster;

/**
 * Service provider for the RestockRefundedItemsAdjuster class.
 */
class RestockRefundedItemsAdjusterServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		RestockRefundedItemsAdjuster::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( RestockRefundedItemsAdjuster::class );
	}
}
