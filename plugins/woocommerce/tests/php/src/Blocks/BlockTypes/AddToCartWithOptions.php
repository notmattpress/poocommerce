<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Blocks\BlockTypes;

use Automattic\PooCommerce\Tests\Blocks\Utils\WC_Product_Custom;
use Automattic\PooCommerce\Tests\Blocks\Mocks\AddToCartWithOptionsMock;
use Automattic\PooCommerce\Tests\Blocks\Mocks\AddToCartWithOptionsQuantitySelectorMock;

/**
 * Tests for the AddToCartWithOptions block type
 */
class AddToCartWithOptions extends \WP_UnitTestCase {
	/**
	 * Initiate the mock object.
	 */
	protected function setUp(): void {
		parent::setUp();

		// We need to register the blocks after set up. They are no registered
		// on `init` because `init` is called with a classic theme.
		new AddToCartWithOptionsMock();
		new AddToCartWithOptionsQuantitySelectorMock();
	}

	/**
	 * Print custom product type add to cart markup.
	 *
	 * Outputs the HTML markup for the custom product type add to cart form.
	 */
	public function print_custom_product_type_add_to_cart_markup() {
		echo 'Custom Product Type Add to Cart Form';
	}

	/**
	 * Tests that the correct content is rendered for each product type.
	 */
	public function test_product_type_add_to_cart_render() {
		add_action( 'poocommerce_custom_add_to_cart', array( $this, 'print_custom_product_type_add_to_cart_markup' ) );

		global $product;
		$product = new \WC_Product_Simple();
		$product->set_regular_price( 10 );
		$product_id = $product->save();
		$markup     = do_blocks( '<!-- wp:poocommerce/single-product {"productId":' . $product_id . '} --><!-- wp:poocommerce/add-to-cart-with-options /--><!-- /wp:poocommerce/single-product -->' );

		// Single Products contain the Add to Cart button and the quantity selector blocks.
		$this->assertStringContainsString( 'wp-block-poocommerce-product-button', $markup, 'The Simple Product Add to Cart with Options contains the product button block.' );
		$this->assertStringContainsString( 'poocommerce/add-to-cart-with-options-quantity-selector', $markup, 'The Simple Product Add to Cart with Options contains the quantity selector block.' );

		$product    = new \WC_Product_External();
		$product_id = $product->save();
		$markup     = do_blocks( '<!-- wp:poocommerce/single-product {"productId":' . $product_id . '} --><!-- wp:poocommerce/add-to-cart-with-options /--><!-- /wp:poocommerce/single-product -->' );

		// External Products contain the Add to Cart button block but do not contain the quantity selector block.
		$this->assertStringContainsString( 'wp-block-poocommerce-product-button', $markup, 'The External Product Add to Cart with Options contains the product button block.' );
		$this->assertStringNotContainsString( 'poocommerce/add-to-cart-with-options-quantity-selector', $markup, 'The External Product Add to Cart with Options does not contain the quantity selector block.' );

		$product    = new WC_Product_Custom();
		$product_id = $product->save();
		$markup     = do_blocks( '<!-- wp:poocommerce/single-product {"productId":' . $product_id . '} --><!-- wp:poocommerce/add-to-cart-with-options /--><!-- /wp:poocommerce/single-product -->' );

		// Third-party product types use their own template.
		$this->assertStringContainsString( 'Custom Product Type Add to Cart Form', $markup, 'The Custom Product Type Add to Cart with Options contains the custom product type add to cart form.' );

		remove_action( 'poocommerce_custom_add_to_cart', array( $this, 'print_custom_product_type_add_to_cart_markup' ) );
	}
}
