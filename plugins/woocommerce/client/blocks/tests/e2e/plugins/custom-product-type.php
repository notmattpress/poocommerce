<?php
/**
 * Plugin Name: PooCommerce Blocks Test Custom Product Type
 * Description: Registers a custom product type.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-custom-product-type
 */

function poocommerce_register_custom_product_type( $product_types ) {
	$product_types[ 'custom-product-type' ] = 'Custom Product Type';
	return $product_types;
}

add_filter( 'product_type_selector', 'poocommerce_register_custom_product_type' );
