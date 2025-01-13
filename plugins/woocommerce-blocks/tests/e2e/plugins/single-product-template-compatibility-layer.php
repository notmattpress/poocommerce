<?php
/**
 * Plugin Name: PooCommerce Blocks Test Single Product Template Compatibility Layer
 * Description: Adds custom content to the Shop page with Product Collection included
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-single-product-template-compatibility-layer
 */

add_action(
	'poocommerce_before_main_content',
	function () {
		echo '<p data-testid="poocommerce_before_main_content">
			Hook: poocommerce_before_main_content
		</p>';
	}
);

add_action(
	'poocommerce_sidebar',
	function () {
		echo '<p data-testid="poocommerce_sidebar">
			Hook: poocommerce_sidebar
		</p>';
	}
);

add_action(
	'poocommerce_before_single_product',
	function () {
		echo '<p data-testid="poocommerce_before_single_product">
			Hook: poocommerce_before_single_product
		</p>';
	}
);

add_action(
	'poocommerce_before_single_product_summary',
	function () {
		echo '<p data-testid="poocommerce_before_single_product_summary">
			Hook: poocommerce_before_single_product_summary
		</p>';
	}
);

add_action(
	'poocommerce_single_product_summary',
	function () {
		echo '<p data-testid="poocommerce_single_product_summary">
			Hook: poocommerce_single_product_summary
		</p>';
	}
);

add_action(
	'poocommerce_before_add_to_cart_button',
	function () {
		echo '<p data-testid="poocommerce_before_add_to_cart_button">
			Hook: poocommerce_before_add_to_cart_button
		</p>';
	}
);


add_action(
	'poocommerce_product_meta_start',
	function () {
		echo '<p data-testid="poocommerce_product_meta_start">
			Hook: poocommerce_product_meta_start
		</p>';
	}
);

add_action(
	'poocommerce_product_meta_end',
	function () {
		echo '<p data-testid="poocommerce_product_meta_end">
			Hook: poocommerce_product_meta_end
		</p>';
	}
);

add_action(
	'poocommerce_share',
	function () {
		echo '<p data-testid="poocommerce_share">
			Hook: poocommerce_share
		</p>';
	}
);

add_action(
	'poocommerce_after_single_product_summary',
	function () {
		echo '<p data-testid="poocommerce_after_single_product_summary">
			Hook: poocommerce_after_single_product_summary
		</p>';
	}
);

add_action(
	'poocommerce_after_single_product',
	function () {
		echo '<p data-testid="poocommerce_after_single_product">
			Hook: poocommerce_after_single_product
		</p>';
	}
);

add_action(
	'poocommerce_after_main_content',
	function () {
		echo '<p data-testid="poocommerce_after_main_content">
			Hook: poocommerce_after_main_content
		</p>';
	}
);
