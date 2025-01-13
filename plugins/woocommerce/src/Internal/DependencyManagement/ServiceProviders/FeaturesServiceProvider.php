<?php

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Utilities\PluginUtil;

/**
 * Service provider for the features enabling/disabling/compatibility engine.
 */
class FeaturesServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		FeaturesController::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( FeaturesController::class )
			->addArguments( array( LegacyProxy::class, PluginUtil::class ) );
	}
}
