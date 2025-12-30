<?php
/**
 * Plugin Name: PooCommerce Blocks Test Cart Extensions
 * Description: Adds callbacks for cart extensions.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-cart-extensions
 */

class Cart_Extensions_Test_Helper {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'poocommerce_blocks_loaded', array( $this, 'register_update_callbacks' ) );
	}

	/**
	 * Register callbacks.
	 */
	public function register_update_callbacks() {
		poocommerce_store_api_register_update_callback(
			array(
				'namespace' => 'cart-extensions-test-helper',
				'callback'  => function () {
					throw new Automattic\PooCommerce\StoreApi\Exceptions\RouteException( 'test_error', 'This is an error with cart context.', 400, array( 'context' => 'wc/cart' ) );
				},
			)
		);
		poocommerce_store_api_register_update_callback(
			array(
				'namespace' => 'cart-extensions-test-helper-2',
				'callback'  => function () {
					throw new Automattic\PooCommerce\StoreApi\Exceptions\RouteException( 'poocommerce_rest_cart_extensions_error', 'This is an error with cart context.', 400, array( 'context' => 'wc/cart' ) );
				},
			)
		);
	}
}

new Cart_Extensions_Test_Helper();
