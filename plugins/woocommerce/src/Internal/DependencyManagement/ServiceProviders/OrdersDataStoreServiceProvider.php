<?php
/**
 * OrdersDataStoreServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Caches\OrderCache;
use Automattic\PooCommerce\Caches\OrderCacheController;
use Automattic\PooCommerce\Database\Migrations\CustomOrderTable\CLIRunner;
use Automattic\PooCommerce\Database\Migrations\CustomOrderTable\PostsToOrdersMigrationController;
use Automattic\PooCommerce\Internal\BatchProcessing\BatchProcessingController;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableRefundDataStore;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\DataStores\Orders\DataSynchronizer;
use Automattic\PooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Automattic\PooCommerce\Internal\DataStores\Orders\LegacyDataCleanup;
use Automattic\PooCommerce\Internal\DataStores\Orders\LegacyDataHandler;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableDataStoreMeta;
use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\Internal\Utilities\DatabaseUtil;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Utilities\PluginUtil;

/**
 * Service provider for the classes in the Internal\DataStores\Orders namespace.
 */
class OrdersDataStoreServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		DataSynchronizer::class,
		CustomOrdersTableController::class,
		OrdersTableDataStore::class,
		CLIRunner::class,
		OrdersTableDataStoreMeta::class,
		OrdersTableRefundDataStore::class,
		OrderCache::class,
		OrderCacheController::class,
		LegacyDataHandler::class,
		LegacyDataCleanup::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( OrdersTableDataStoreMeta::class );

		$this->share( OrdersTableDataStore::class )->addArguments( array( OrdersTableDataStoreMeta::class, DatabaseUtil::class, LegacyProxy::class ) );
		$this->share( DataSynchronizer::class )->addArguments(
			array(
				OrdersTableDataStore::class,
				DatabaseUtil::class,
				PostsToOrdersMigrationController::class,
				LegacyProxy::class,
				OrderCacheController::class,
				BatchProcessingController::class,
			)
		);
		$this->share( OrdersTableRefundDataStore::class )->addArguments( array( OrdersTableDataStoreMeta::class, DatabaseUtil::class, LegacyProxy::class ) );
		$this->share( CustomOrdersTableController::class )->addArguments(
			array(
				OrdersTableDataStore::class,
				DataSynchronizer::class,
				LegacyDataCleanup::class,
				OrdersTableRefundDataStore::class,
				BatchProcessingController::class,
				FeaturesController::class,
				OrderCache::class,
				OrderCacheController::class,
				PluginUtil::class,
				DatabaseUtil::class,
			)
		);
		$this->share( OrderCache::class );
		$this->share( OrderCacheController::class )->addArgument( OrderCache::class );
		if ( Constants::is_defined( 'WP_CLI' ) && WP_CLI ) {
			$this->share( CLIRunner::class )->addArguments( array( CustomOrdersTableController::class, DataSynchronizer::class, PostsToOrdersMigrationController::class ) );
		}

		$this->share( LegacyDataCleanup::class )->addArguments(
			array(
				BatchProcessingController::class,
				LegacyDataHandler::class,
				DataSynchronizer::class,
			)
		);
		$this->share( LegacyDataHandler::class )->addArguments(
			array(
				OrdersTableDataStore::class,
				DataSynchronizer::class,
				PostsToOrdersMigrationController::class,
			)
		);
	}
}
