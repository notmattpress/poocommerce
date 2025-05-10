<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\ProductFilters\MainQueryController;
use Automattic\PooCommerce\Internal\ProductFilters\FilterDataProvider;
use Automattic\PooCommerce\Internal\ProductFilters\QueryClauses;

/**
 * ProductFiltersServiceProvider class.
 */
class ProductFiltersServiceProvider extends AbstractInterfaceServiceProvider {
	/**
	 * List services provided by this class.
	 *
	 * @var string[]
	 */
	protected $provides = array(
		QueryClauses::class,
		MainQueryController::class,
		FilterDataProvider::class,
	);

	/**
	 * Registers services provided by this class.
	 *
	 * @return void
	 */
	public function register() {
		$this->share( QueryClauses::class );
		$this->share_with_implements_tags( MainQueryController::class )->addArgument( QueryClauses::class );
		$this->share( FilterDataProvider::class );
	}
}
