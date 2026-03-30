<?php
/**
 * Plugin Name: PooCommerce Blocks Test Single Product Template Compatibility Layer
 * Description: Adds custom content to the Shop page with Product Collection included
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-single-product-template-compatibility-layer
 */

$hooks = array(
	'poocommerce_before_main_content',
	'poocommerce_sidebar',
	'poocommerce_before_add_to_cart_button',
	'poocommerce_before_single_product',
	'poocommerce_before_single_product_summary',
	'poocommerce_single_product_summary',
	'poocommerce_product_meta_start',
	'poocommerce_product_meta_end',
	'poocommerce_share',
	'poocommerce_after_single_product_summary',
	'poocommerce_after_single_product',
	'poocommerce_after_main_content',
	'poocommerce_before_add_to_cart_form',
	'poocommerce_after_add_to_cart_form',
	'poocommerce_before_add_to_cart_quantity',
	'poocommerce_after_add_to_cart_quantity',
	'poocommerce_after_add_to_cart_button',
	'poocommerce_before_variations_form',
	'poocommerce_after_variations_form'
);

foreach ( $hooks as $hook ) {
	add_action(
		$hook,
		function () use ( $hook ) {
			echo '<p data-testid="' . esc_attr( $hook ) . '">
			Hook: ' . esc_html( $hook ) . '
		</p>';
		}
	);
}
