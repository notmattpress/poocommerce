<?php

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\ComingSoon\ComingSoonAdminBarBadge;
use Automattic\PooCommerce\Internal\ComingSoon\ComingSoonCacheInvalidator;
use Automattic\PooCommerce\Internal\ComingSoon\ComingSoonRequestHandler;
use Automattic\PooCommerce\Internal\ComingSoon\ComingSoonHelper;

/**
 * Service provider for the Coming Soon mode.
 */
class ComingSoonServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		ComingSoonAdminBarBadge::class,
		ComingSoonCacheInvalidator::class,
		ComingSoonHelper::class,
		ComingSoonRequestHandler::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->add( ComingSoonAdminBarBadge::class );
		$this->add( ComingSoonCacheInvalidator::class );
		$this->add( ComingSoonHelper::class );
		$this->add( ComingSoonRequestHandler::class )->addArgument( ComingSoonHelper::class );
	}
}
