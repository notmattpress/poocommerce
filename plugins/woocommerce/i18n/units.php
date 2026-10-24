<?php
/**
 * Units
 *
 * Returns a multidimensional array of measurement units and their labels.
 * Unit labels should be defined in English and translated native through localization files.
 *
 * @package PooCommerce\i18n
 * @version
 */

defined( 'ABSPATH' ) || exit;

return array(
	'weight'     => array(
		'kg'  => __( 'kg', 'poocommerce' ),
		'g'   => __( 'g', 'poocommerce' ),
		'lbs' => __( 'lbs', 'poocommerce' ),
		'oz'  => __( 'oz', 'poocommerce' ),
	),
	'dimensions' => array(
		'm'  => __( 'm', 'poocommerce' ),
		'cm' => __( 'cm', 'poocommerce' ),
		'mm' => __( 'mm', 'poocommerce' ),
		'in' => __( 'in', 'poocommerce' ),
		'yd' => __( 'yd', 'poocommerce' ),
	),
);
