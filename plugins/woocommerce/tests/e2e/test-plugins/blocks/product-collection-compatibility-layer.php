<?php
/**
 * Plugin Name: PooCommerce Blocks Test Product Collection Compatibility Layer
 * Description: Adds custom content to the Shop page with Product Collection included
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-product-collection-compatibility-layer
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
	'poocommerce_after_main_content',
	function () {
		echo '<p data-testid="poocommerce_after_main_content">
			Hook: poocommerce_after_main_content
		</p>';
	}
);
add_action(
	'poocommerce_before_shop_loop_item_title',
	function () {
		echo '<p data-testid="poocommerce_before_shop_loop_item_title">
			Hook: poocommerce_before_shop_loop_item_title
		</p>';
	}
);

add_action(
	'poocommerce_shop_loop_item_title',
	function () {
		echo '<p data-testid="poocommerce_shop_loop_item_title">
			Hook: poocommerce_shop_loop_item_title
		</p>';
	}
);

add_action(
	'poocommerce_after_shop_loop_item_title',
	function () {
		echo '<p data-testid="poocommerce_after_shop_loop_item_title">
			Hook: poocommerce_after_shop_loop_item_title
		</p>';
	}
);

add_action(
	'poocommerce_before_shop_loop_item',
	function () {
		echo '<p data-testid="poocommerce_before_shop_loop_item">
			Hook: poocommerce_before_shop_loop_item
		</p>';
	}
);

add_action(
	'poocommerce_after_shop_loop_item',
	function () {
		echo '<p data-testid="poocommerce_after_shop_loop_item">
			Hook: poocommerce_after_shop_loop_item
		</p>';
	}
);

add_action(
	'poocommerce_before_shop_loop',
	function () {
		echo '<p data-testid="poocommerce_before_shop_loop">
			Hook: poocommerce_before_shop_loop
		</p>';
	}
);

add_action(
	'poocommerce_after_shop_loop',
	function () {
		echo '<p data-testid="poocommerce_after_shop_loop">
			Hook: poocommerce_after_shop_loop
		</p>';
	}
);

add_action(
	'poocommerce_no_products_found',
	function () {
		echo '<p data-testid="poocommerce_no_products_found">
			Hook: poocommerce_no_products_found
		</p>';
	}
);
