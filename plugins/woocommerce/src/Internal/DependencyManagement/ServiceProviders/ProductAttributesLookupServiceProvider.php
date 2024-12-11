<?php
/**
 * ProductAttributesLookupServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\ProductAttributesLookup\CLIRunner;
use Automattic\PooCommerce\Internal\ProductAttributesLookup\DataRegenerator;
use Automattic\PooCommerce\Internal\ProductAttributesLookup\Filterer;
use Automattic\PooCommerce\Internal\ProductAttributesLookup\LookupDataStore;

/**
 * Service provider for the ProductAttributesLookupServiceProvider namespace.
 */
class ProductAttributesLookupServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		DataRegenerator::class,
		Filterer::class,
		LookupDataStore::class,
		CLIRunner::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( DataRegenerator::class )->addArgument( LookupDataStore::class );
		$this->share( Filterer::class )->addArgument( LookupDataStore::class );
		$this->share( LookupDataStore::class );
		$this->share( CLIRunner::class )->addArguments( array( DataRegenerator::class, LookupDataStore::class ) );
	}
}
