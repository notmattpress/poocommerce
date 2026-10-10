<?php
/**
 * Plugin Name: PooCommerce Blocks Test Custom Add to Cart Button Text
 * Description: Modifies the "Add to Cart" button text for PooCommerce products.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-custom-add-to-cart-button-text
 */

function poocommerce_add_to_cart_button_text_archives() {
	return 'Buy Now';
}

add_filter( 'poocommerce_product_add_to_cart_text', 'poocommerce_add_to_cart_button_text_archives' );
