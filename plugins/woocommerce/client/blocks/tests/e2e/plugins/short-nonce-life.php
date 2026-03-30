<?php
/**
 * Plugin Name: PooCommerce Blocks Test Short Nonce Life
 * Description: Sets a very short nonce lifetime for testing nonce expiry scenarios.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-short-nonce-life
 */

declare( strict_types=1 );

/**
 * Set nonce lifetime to 2 seconds to simulate cache expiry scenarios.
 */
add_filter(
	'nonce_life',
	function () {
		return 2;
	}
);
