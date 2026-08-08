<?php
/**
 * Plugin Name: PooCommerce Blocks Test extensionCartUpdate
 * Description: Adds an extensionCartUpdate endpoint.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-extension-cart-update
 */

use Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema;
use Automattic\PooCommerce\StoreApi\StoreApi;

add_action(
	'poocommerce_init',
	function () {
		$extend = StoreApi::container()->get( ExtendSchema::class );
		if (
			is_callable(
				array(
					$extend,
					'register_update_callback',
				)
			)
		) {
			$extend->register_update_callback(
				array(
					'namespace' => 'poocommerce-blocks-test-extension-cart-update',
					'callback'  => function ( $data ) {
						if ( ! empty( $data['test-name-change'] ) ) {
							WC()->cart->get_customer()->set_shipping_first_name( 'Mr. Test' );
							WC()->cart->get_customer()->save();
						}
					},
				)
			);
		}
	}
);
