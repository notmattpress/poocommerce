<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\BlockTypes\ProductDetails;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry;

// phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found

/**
 * ProductDetailsMock used to test ProductDetails block functions.
 */
class ProductDetailsNoRegisterMock extends ProductDetails {

	/**
	 * Initialize our mock class.
	 */
	public function __construct() {
		parent::__construct(
			Package::container()->get( Api::class ),
			Package::container()->get( AssetDataRegistry::class ),
			new IntegrationRegistry(),
		);
	}

	/**
	 * Mock implementation of register_block_type method.
	 *
	 * @return void
	 */
	protected function register_block_type() {}
}
