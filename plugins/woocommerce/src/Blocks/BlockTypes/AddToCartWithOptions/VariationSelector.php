<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\BlockTypes\AddToCartWithOptions;

use Automattic\PooCommerce\Blocks\BlockTypes\AbstractBlock;
use Automattic\PooCommerce\Blocks\BlockTypes\EnableBlockJsonAssetsTrait;

/**
 * Block type for variation selector in add to cart with options.
 */
class VariationSelector extends AbstractBlock {

	use EnableBlockJsonAssetsTrait;

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-variation-selector';

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

		if ( $product instanceof \WC_Product && $product->is_type( 'variable' ) && ! Utils::is_not_purchasable_product( $product ) ) {
			return $content;
		}

		return '';
	}
}
