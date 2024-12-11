<?php

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\LayoutTemplates\LayoutTemplateRegistry;

/**
 * Service provider for layout templates.
 */
class LayoutTemplatesServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		LayoutTemplateRegistry::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( LayoutTemplateRegistry::class );
	}
}
