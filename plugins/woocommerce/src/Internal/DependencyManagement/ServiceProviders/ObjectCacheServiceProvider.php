<?php

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Caching\WPCacheEngine;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;

/**
 * Service provider for the object cache mechanism.
 */
class ObjectCacheServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		WPCacheEngine::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( WPCacheEngine::class );
	}
}
