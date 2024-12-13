<?php
declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\Internal\Integrations\WPConsentAPI;
use Automattic\PooCommerce\Internal\Orders\OrderAttributionController;
use Automattic\PooCommerce\Internal\Orders\OrderAttributionBlocksController;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema;
use Automattic\PooCommerce\StoreApi\StoreApi;

/**
 * Class OrderAttributionServiceProvider
 *
 * @since 8.5.0
 */
class OrderAttributionServiceProvider extends AbstractInterfaceServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		OrderAttributionController::class,
		OrderAttributionBlocksController::class,
		WPConsentAPI::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share_with_implements_tags( WPConsentAPI::class );
		$this->share_with_implements_tags( OrderAttributionController::class )
			->addArguments(
				array(
					LegacyProxy::class,
					FeaturesController::class,
					WPConsentAPI::class,
				)
			);
		$this->share_with_implements_tags( OrderAttributionBlocksController::class )
			->addArguments(
				array(
					StoreApi::container()->get( ExtendSchema::class ),
					FeaturesController::class,
					OrderAttributionController::class,
				)
			);
	}
}
