<?php
/**
 * DownloadPermissionsAdjusterServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\DownloadPermissionsAdjuster;

/**
 * Service provider for the DownloadPermissionsAdjuster class.
 */
class DownloadPermissionsAdjusterServiceProvider extends AbstractServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		DownloadPermissionsAdjuster::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( DownloadPermissionsAdjuster::class );
	}
}
