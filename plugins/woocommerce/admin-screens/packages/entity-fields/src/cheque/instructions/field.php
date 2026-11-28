<?php
/**
 * The instructions added to the thank you page and emails. Its value is read and written in
 * `field.ts`, next to this file.
 *
 * @package PooCommerce\Admin
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

return array(
	'type'        => 'text',
	'Edit'        => 'textarea',
	'label'       => __( 'Instructions', 'poocommerce' ),
	'description' => __( 'Instructions that will be added to the thank you page and emails.', 'poocommerce' ),
);
