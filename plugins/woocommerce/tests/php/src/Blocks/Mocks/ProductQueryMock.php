<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\Mocks;

use Automattic\PooCommerce\Blocks\BlockTypes\ProductQuery;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Assets\Api;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry;

/**
 * ProductQueryMock used to test Product Query block functions.
 */
class ProductQueryMock extends ProductQuery {

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

	/**
	 * For now don't need to initialize anything in tests so let's
	 * just override the default behaviour.
	 */
	protected function initialize() {
	}

	/**
	 * Allow test to set the parsed block data.
	 *
	 * @param array $parsed_block The block data.
	 */
	public function set_parsed_block( $parsed_block ) {
		$this->parsed_block = $parsed_block;
	}

	/**
	 * Allow test to set the $attributes_filter_query_args.
	 *
	 * @param array $data The attribute data.
	 */
	public function set_attributes_filter_query_args( $data ) {
		$this->attributes_filter_query_args = $data;
	}
}
