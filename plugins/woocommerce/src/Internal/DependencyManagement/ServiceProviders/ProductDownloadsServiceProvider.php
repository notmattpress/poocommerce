<?php

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;
use Automattic\PooCommerce\Internal\ProductDownloads\ApprovedDirectories\Admin\SyncUI;
use Automattic\PooCommerce\Internal\ProductDownloads\ApprovedDirectories\Admin\UI;
use Automattic\PooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register;
use Automattic\PooCommerce\Internal\ProductDownloads\ApprovedDirectories\Synchronize;

/**
 * Service provider for the Product Downloads-related services.
 */
class ProductDownloadsServiceProvider extends AbstractServiceProvider {
	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		Register::class,
		Synchronize::class,
		SyncUI::class,
		UI::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( Register::class );
		$this->share( Synchronize::class )->addArgument( Register::class );
		$this->share( SyncUI::class )->addArgument( Register::class );
		$this->share( UI::class )->addArgument( Register::class );
	}
}
