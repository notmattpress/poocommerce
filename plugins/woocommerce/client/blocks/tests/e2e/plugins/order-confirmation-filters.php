<?php
/**
 * Plugin Name: PooCommerce Blocks Test Order Confirmation Filters
 * Description: used to modify filters and actions present in the new Order Confirmation Template
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-order-confirmation-filters
 */

// Disable the Verify Known Shoppers feature for presenting order details
add_filter( 'poocommerce_order_received_verify_known_shoppers', '__return_false' );
