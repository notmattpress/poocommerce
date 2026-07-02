<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes\AddToCartWithOptions;

use Automattic\PooCommerce\Blocks\BlockTypes\AbstractBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EnableBlockJsonAssetsTrait;
use Automattic\PooCommerce\Enums\ProductType;

/**
 * Block type for grouped product selector in add to cart with options.
 */
class GroupedProductSelector extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-grouped-product-selector';

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

		if ( $product instanceof \WC_Product && $product->is_type( ProductType::GROUPED ) ) {

			$p = new \WP_HTML_Tag_Processor( $content );

			if ( $p->next_tag( array( 'class_name' => 'wp-block-poocommerce-add-to-cart-with-options-grouped-product-selector' ) ) ) {
				$p->set_attribute( 'data-wp-init', 'callbacks.validateQuantities' );
			}

			return $p->get_updated_html();

		}

		return '';
	}
}
