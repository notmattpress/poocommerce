<?php
/**
 * PooCommerce Coupons Functions
 *
 * Functions for coupon specific things.
 *
 * @package PooCommerce\Functions
 * @version 3.0.0
 */

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Utilities\StringUtil;

/**
 * Get coupon types.
 *
 * @return array
 */
function wc_get_coupon_types() {
	return (array) apply_filters(
		'poocommerce_coupon_discount_types',
		array(
			'percent'       => __( 'Percentage discount', 'poocommerce' ),
			'fixed_cart'    => __( 'Fixed cart discount', 'poocommerce' ),
			'fixed_product' => __( 'Fixed product discount', 'poocommerce' ),
		)
	);
}

/**
 * Get a coupon type's name.
 *
 * @param string $type Coupon type.
 * @return string
 */
function wc_get_coupon_type( $type = '' ) {
	$types = wc_get_coupon_types();
	return isset( $types[ $type ] ) ? $types[ $type ] : '';
}

/**
 * Coupon types that apply to individual products. Controls which validation rules will apply.
 *
 * @since  2.5.0
 * @return array
 */
function wc_get_product_coupon_types() {
	return (array) apply_filters( 'poocommerce_product_coupon_types', array( 'fixed_product', 'percent' ) );
}

/**
 * Coupon types that apply to the cart as a whole. Controls which validation rules will apply.
 *
 * @since  2.5.0
 * @return array
 */
function wc_get_cart_coupon_types() {
	return (array) apply_filters( 'poocommerce_cart_coupon_types', array( 'fixed_cart' ) );
}

/**
 * Check if coupons are enabled.
 * Filterable.
 *
 * @since  2.5.0
 *
 * @return bool
 */
function wc_coupons_enabled() {
	return apply_filters( 'poocommerce_coupons_enabled', 'yes' === get_option( 'poocommerce_enable_coupons' ) );
}

/**
 * Check if two coupon codes are the same.
 * Lowercasing to ensure case-insensitive comparison.
 *
 * @since 9.9.0
 *
 * @param string $coupon_1 Coupon code 1.
 * @param string $coupon_2 Coupon code 2.
 * @return bool
 */
function wc_is_same_coupon( $coupon_1, $coupon_2 ) {
	return wc_strtolower( $coupon_1 ) === wc_strtolower( $coupon_2 );
}

/**
 * Get coupon code by ID.
 *
 * @since 3.0.0
 * @param int $id Coupon ID.
 * @return string
 */
function wc_get_coupon_code_by_id( $id ) {
	$data_store = WC_Data_Store::load( 'coupon' );
	return empty( $id ) ? '' : (string) $data_store->get_code_by_id( $id );
}

/**
 * Get coupon ID by code.
 *
 * @since 3.0.0
 * @param string $code    Coupon code.
 * @param int    $exclude Used to exclude an ID from the check if you're checking existence.
 * @return int
 */
function wc_get_coupon_id_by_code( $code, $exclude = 0 ) {

	if ( StringUtil::is_null_or_whitespace( $code ) ) {
		return 0;
	}

	$data_store = WC_Data_Store::load( 'coupon' );
	// Coupon code allows spaces, which doesn't work well with some cache engines (e.g. memcached).
	$hashed_code = md5( $code );
	$cache_key   = WC_Cache_Helper::get_cache_prefix( 'coupons' ) . 'coupon_id_from_code_' . $hashed_code;

	$ids = wp_cache_get( $cache_key, 'coupons' );

	if ( false === $ids ) {
		$ids = $data_store->get_ids_by_code( $code );
		if ( $ids ) {
			wp_cache_set( $cache_key, $ids, 'coupons' );
		}
	}

	$ids = array_diff( array_filter( array_map( 'absint', (array) $ids ) ), array( $exclude ) );

	return apply_filters( 'poocommerce_get_coupon_id_from_code', absint( current( $ids ) ), $code, $exclude );
}
