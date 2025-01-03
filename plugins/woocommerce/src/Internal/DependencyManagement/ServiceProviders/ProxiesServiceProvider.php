<?php
/**
 * ProxiesServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Proxies\ActionsProxy;

/**
 * Service provider for the classes in the Automattic\PooCommerce\Proxies namespace.
 */
class ProxiesServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		LegacyProxy::class,
		ActionsProxy::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( ActionsProxy::class );
		$this->share_with_auto_arguments( LegacyProxy::class );
	}
}
