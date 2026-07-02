<?php
/**
 * Plugin Name: PooCommerce Blocks Test Item Data Display
 * Description: Adds custom item_data to cart items for testing HTML rendering and entity decoding.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-item-data-display
 */

declare(strict_types=1);

add_action(
	'poocommerce_init',
	function () {
		add_filter(
			'poocommerce_get_item_data',
			function ( $item_data ) {
				// Plain text item data.
				$item_data[] = array(
					'key'   => 'Gift Message',
					'value' => 'Happy Birthday!',
				);

				// HTML in display field (should render as formatted HTML).
				$item_data[] = array(
					'key'     => 'Engraving',
					'value'   => 'Best Wishes',
					'display' => '<em>Best Wishes</em>',
				);

				// Entity-encoded less-than sign (should decode properly).
				$item_data[] = array(
					'key'   => 'Size',
					'value' => '1 &lt; 2',
				);

				// Entity-encoded HTML tag. wp_kses_post sees no actual tags
				// (just text with entities), so it passes through.
				$item_data[] = array(
					'key'   => 'Note',
					'value' => '&lt;b&gt;important&lt;/b&gt;',
				);

				return $item_data;
			},
			10,
			1
		);
	}
);
