<?php
/**
 * Plugin Name: PooCommerce Blocks Test Update Price
 * Description: Update price of products.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-update-price
 */

// Only requests from specs that enable this plugin send the cookie.
if ( ! isset( $_COOKIE['poocommerce-blocks-test-update-price'] ) ) {
	return;
}

function calc_price( $cart_object ) {
	foreach ( $cart_object->get_cart() as $hash => $value ) {
		$value['data']->set_price( 50 );
	}
}

add_action( 'poocommerce_before_calculate_totals', 'calc_price' );
