<?php
/**
 * The payment method description shown at checkout.
 *
 * @package PooCommerce\Admin
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

return array(
	'type'        => 'text',
	'Edit'        => 'textarea',
	'label'       => __( 'Description', 'poocommerce' ),
	'description' => __( 'Payment method description that the customer will see during checkout.', 'poocommerce' ),
);
