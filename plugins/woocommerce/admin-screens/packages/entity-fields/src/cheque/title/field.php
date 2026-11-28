<?php
/**
 * The payment method name shown at checkout.
 *
 * @package PooCommerce\Admin
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

return array(
	'type'        => 'text',
	'label'       => __( 'Title', 'poocommerce' ),
	'description' => __( 'Payment method name that the customer will see during checkout.', 'poocommerce' ),
);
