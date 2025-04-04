<?php
namespace Automattic\PooCommerce\Blocks\BlockTypes;

/**
 * AllProducts class.
 */
class AllProducts extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'all-products';

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param array $attributes  Any attributes that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
	protected function enqueue_data( array $attributes = [] ) {
		parent::enqueue_data( $attributes );
		// Set this so filter blocks being used as widgets know when to render.
		$this->asset_data_registry->add( 'hasFilterableProducts', true );
		$this->asset_data_registry->add( 'minColumns', wc_get_theme_support( 'product_blocks::min_columns', 1 ) );
		$this->asset_data_registry->add( 'maxColumns', wc_get_theme_support( 'product_blocks::max_columns', 6 ) );
		$this->asset_data_registry->add( 'defaultColumns', wc_get_theme_support( 'product_blocks::default_columns', 3 ) );
		$this->asset_data_registry->add( 'minRows', wc_get_theme_support( 'product_blocks::min_rows', 1 ) );
		$this->asset_data_registry->add( 'maxRows', wc_get_theme_support( 'product_blocks::max_rows', 6 ) );
		$this->asset_data_registry->add( 'defaultRows', wc_get_theme_support( 'product_blocks::default_rows', 3 ) );

		// Hydrate the All Product block with data from the API. This is for the add to cart buttons which show current quantity in cart, and events.
		if ( ! is_admin() && ! WC()->is_rest_api_request() ) {
			$this->asset_data_registry->hydrate_api_request( '/wc/store/v1/cart' );
		}
	}

	/**
	 * It is necessary to register and enqueue assets during the render phase because we want to load assets only if the block has the content.
	 */
	protected function register_block_type_assets() {
		parent::register_block_type_assets();
		$this->register_chunk_translations( [ $this->block_name ] );
	}
}
