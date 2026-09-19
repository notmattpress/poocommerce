<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\BlockTypes\MiniCart;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry;

/**
 * MiniCartMock used to test MiniCart block functions.
 */
class MiniCartMock extends MiniCart {
	/**
	 * Initialize our mock class.
	 */
	public function __construct() {
		parent::__construct(
			Package::container()->get( Api::class ),
			Package::container()->get( AssetDataRegistry::class ),
			new IntegrationRegistry()
		);
	}

	/**
	 * Public wrapper for the process_template_contents method.
	 *
	 * @param string $template_contents The template contents to process.
	 * @return string The processed template contents.
	 */
	public function call_process_template_contents( $template_contents ) {
		return $this->process_template_contents( $template_contents );
	}
}
