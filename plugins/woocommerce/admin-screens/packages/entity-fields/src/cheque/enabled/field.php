<?php
/**
 * Whether check payments are enabled.
 *
 * @package PooCommerce\Admin
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

return array(
	'type'  => 'boolean',
	'Edit'  => 'toggle',
	'label' => __( 'Enable check payments', 'poocommerce' ),
);
