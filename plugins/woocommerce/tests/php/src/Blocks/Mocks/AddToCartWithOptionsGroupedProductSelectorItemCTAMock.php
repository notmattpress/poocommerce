<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\BlockTypes\AddToCartWithOptions\GroupedProductSelectorItemCTA;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry;

/**
 * AddToCartWithOptionsGroupedProductSelectorItemCTAMock used to test GroupedProductSelectorItemCTA block functions.
 */
class AddToCartWithOptionsGroupedProductSelectorItemCTAMock extends GroupedProductSelectorItemCTA {
	/**
	 * Initialize our mock class.
	 */
	public function __construct() {
		parent::__construct(
			Package::container()->get( API::class ),
			Package::container()->get( AssetDataRegistry::class ),
			new IntegrationRegistry(),
		);
	}
}
