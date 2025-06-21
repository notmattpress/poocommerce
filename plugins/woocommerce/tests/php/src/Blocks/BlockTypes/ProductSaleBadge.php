<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\BlockTypes;

/**
 * Tests for the ProductSaleBadge block type
 */
class ProductSaleBadge extends \WP_UnitTestCase {

	/**
	 * Tests that the Product Sale Badge block is rendered correctly on the Single Product Block
	 */
	public function test_product_sale_badge_render_single_product_block() {
		global $product;
		$product = new \WC_Product_Simple();
		$product->set_regular_price( 10 );
		$product->set_sale_price( 5 );
		$product_id = $product->save();
		$markup     = do_blocks( '<!-- wp:poocommerce/single-product {"productId":' . $product_id . '} --><!-- wp:poocommerce/product-sale-badge /--><!-- /wp:poocommerce/single-product -->' );

		$this->assertStringContainsString( 'wp-block-poocommerce-product-sale-badge', $markup, 'The Single Product Block contains the Product Sale Badge block.' );
		$this->assertStringContainsString( 'Sale', $markup, 'The Product Sale Badge block contains the sale text.' );
	}
}
