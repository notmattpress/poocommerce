<?php
/**
 * Service provider for various order admin classes.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\Admin\Orders\COTRedirectionController;
use Automattic\PooCommerce\Internal\Admin\Orders\Edit;
use Automattic\PooCommerce\Internal\Admin\Orders\EditLock;
use Automattic\PooCommerce\Internal\Admin\Orders\ListTable;
use Automattic\PooCommerce\Internal\Admin\Orders\MetaBoxes\TaxonomiesMetaBox;
use Automattic\PooCommerce\Internal\Admin\Orders\PageController;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;

/**
 * OrderAdminServiceProvider class.
 */
class OrderAdminServiceProvider extends AbstractServiceProvider {

	/**
	 * List services provided by this class.
	 *
	 * @var string[]
	 */
	protected $provides = array(
		COTRedirectionController::class,
		PageController::class,
		Edit::class,
		ListTable::class,
		EditLock::class,
		TaxonomiesMetaBox::class,
	);

	/**
	 * Registers services provided by this class.
	 *
	 * @return void
	 */
	public function register() {
		$this->share( COTRedirectionController::class );
		$this->share( PageController::class );
		$this->share( Edit::class )->addArgument( PageController::class );
		$this->share( ListTable::class )->addArgument( PageController::class );
		$this->share( EditLock::class );
		$this->share( TaxonomiesMetaBox::class )->addArgument( OrdersTableDataStore::class );
	}
}
