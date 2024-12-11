<?php
/**
 * AssignDefaultCategoryServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\AssignDefaultCategory;

/**
 * Service provider for the AssignDefaultCategory class.
 */
class AssignDefaultCategoryServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		AssignDefaultCategory::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( AssignDefaultCategory::class );
	}
}
