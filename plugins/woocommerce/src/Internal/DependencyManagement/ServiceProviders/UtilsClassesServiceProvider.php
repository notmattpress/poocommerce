<?php
/**
 * UtilsClassesServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Automattic\PooCommerce\Internal\DataStores\Orders\DataSynchronizer;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\Utilities\COTMigrationUtil;
use Automattic\PooCommerce\Internal\Utilities\DatabaseUtil;
use Automattic\PooCommerce\Internal\Utilities\HtmlSanitizer;
use Automattic\PooCommerce\Internal\Utilities\LegacyRestApiStub;
use Automattic\PooCommerce\Internal\Utilities\PluginInstaller;
use Automattic\PooCommerce\Internal\Utilities\WebhookUtil;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Utilities\PluginUtil;
use Automattic\PooCommerce\Utilities\OrderUtil;
use Automattic\PooCommerce\Utilities\RestApiUtil;
use Automattic\PooCommerce\Utilities\TimeUtil;

/**
 * Service provider for the non-static utils classes in the Automattic\PooCommerce\src namespace.
 */
class UtilsClassesServiceProvider extends AbstractInterfaceServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		DatabaseUtil::class,
		HtmlSanitizer::class,
		OrderUtil::class,
		PluginUtil::class,
		COTMigrationUtil::class,
		WebhookUtil::class,
		RestApiUtil::class,
		TimeUtil::class,
		PluginInstaller::class,
		LegacyRestApiStub::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( DatabaseUtil::class );
		$this->share( HtmlSanitizer::class );
		$this->share( OrderUtil::class );
		$this->share( PluginUtil::class )
			->addArgument( LegacyProxy::class );
		$this->share( COTMigrationUtil::class )
			->addArguments( array( CustomOrdersTableController::class, DataSynchronizer::class ) );
		$this->share( WebhookUtil::class );
		$this->share( RestApiUtil::class );
		$this->share( TimeUtil::class );
		$this->share_with_implements_tags( PluginInstaller::class );
		$this->share_with_implements_tags( LegacyRestApiStub::class )->addArgument( RestApiUtil::class );
	}
}
