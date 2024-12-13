<?php
/**
 * ProductImageBySKUServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\ProductImage\MatchImageBySKU;

/**
 * Service provider for the ProductImageBySKUServiceProvider namespace.
 */
class ProductImageBySKUServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		MatchImageBySKU::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( MatchImageBySKU::class );
	}
}
