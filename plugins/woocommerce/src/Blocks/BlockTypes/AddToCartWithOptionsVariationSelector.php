<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes;

/**
 * Block type for variation selector in add to cart with options.
 */
class AddToCartWithOptionsVariationSelector extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-variation-selector';

	/**
	 * Get variations data.
	 *
	 * @param WC_Product $product Product instance.
	 * @return array|false
	 */
	private function get_variations_data( $product ) {
		/**
		 * Filter the number of variations threshold.
		 *
		 * @since 9.7.0
		 *
		 * @param int        $threshold Maximum number of variations to load upfront.
		 * @param WC_Product $product   Product object.
		 */
		$get_variations = count( $product->get_children() ) <= apply_filters( 'poocommerce_ajax_variation_threshold', 30, $product );
		return $get_variations ? $product->get_available_variations() : false;
	}

	/**
	 * Render the block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content Block content.
	 * @param WP_Block $block Block instance.
	 * @return string Rendered block output.
	 */
	protected function render( $attributes, $content, $block ): string {
		global $product;

		if ( $product instanceof \WC_Product && $product->is_type( 'variable' ) ) {
			$variation_attributes = $product->get_variation_attributes();

			if ( empty( $variation_attributes ) ) {
				return '';
			}

			$variations = $this->get_variations_data( $product );
			if ( empty( $variations ) ) {
				return '';
			}

			add_filter( 'poocommerce_product_supports', array( $this, 'check_product_supports' ), 10, 3 );

			wp_enqueue_script_module( $this->get_full_block_name() );

			return $content;
		}

		return '';
	}

	/**
	 * Disable the frontend script for this block type, it's built with script modules.
	 *
	 * @param string $key Data to get, or default to everything.
	 * @return array|string|null
	 */
	protected function get_block_type_script( $key = null ) {
		return null;
	}

	/**
	 * Add 'ajax_add_to_cart' support to a Variable Product.
	 *
	 * This is needed so the ProductButton block could add a Variable Product to
	 * the Cart without a page refresh.
	 *
	 * @param  bool        $supports If features are already supported or not.
	 * @param  string      $feature  The feature to check if is supported.
	 * @param  \WC_Product $product  The product to check.
	 * @return bool True if the product supports the feature, false otherwise.
	 * @since  9.9.0
	 */
	public function check_product_supports( $supports, $feature, $product ) {
		if ( 'ajax_add_to_cart' === $feature ) {
			return true;
		}

		return $supports;
	}
}
