<?php
/**
 * UtilsClassesServiceProvider class file.
 */

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\ReceiptRendering\ReceiptRenderingEngine;
use Automattic\PooCommerce\Internal\ReceiptRendering\ReceiptRenderingRestController;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Internal\TransientFiles\TransientFilesEngine;

/**
 * Service provider for the engine classes in the Automattic\PooCommerce\src namespace.
 */
class EnginesServiceProvider extends AbstractInterfaceServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		TransientFilesEngine::class,
		ReceiptRenderingEngine::class,
		ReceiptRenderingRestController::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share_with_implements_tags( TransientFilesEngine::class )->addArgument( LegacyProxy::class );
		$this->share( ReceiptRenderingEngine::class )->addArguments( array( TransientFilesEngine::class, LegacyProxy::class ) );
		$this->share_with_implements_tags( ReceiptRenderingRestController::class );
	}
}
