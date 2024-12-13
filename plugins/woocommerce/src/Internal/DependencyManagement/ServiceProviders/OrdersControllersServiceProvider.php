<?php
/**
 * OrdersControllersServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\Orders\CouponsController;
use Automattic\PooCommerce\Internal\Orders\OrderActionsRestController;
use Automattic\PooCommerce\Internal\Orders\TaxesController;

/**
 * Service provider for the orders controller classes in the Automattic\PooCommerce\Internal\Orders namespace.
 */
class OrdersControllersServiceProvider extends AbstractInterfaceServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		CouponsController::class,
		TaxesController::class,
		OrderActionsRestController::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( CouponsController::class );
		$this->share( TaxesController::class );
		$this->share_with_implements_tags( OrderActionsRestController::class );
	}
}
