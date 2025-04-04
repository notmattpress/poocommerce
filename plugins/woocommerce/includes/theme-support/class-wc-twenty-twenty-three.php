<?php
/**
 * Twenty Twenty-Three support.
 *
 * @since   7.0.1
 * @package PooCommerce\Classes
 */

use Automattic\Jetpack\Constants;

defined( 'ABSPATH' ) || exit;

/**
 * WC_Twenty_Twenty_Three class.
 */
class WC_Twenty_Twenty_Three {

	/**
	 * Theme init.
	 */
	public static function init() {

		// This theme doesn't have a traditional sidebar.
		remove_action( 'poocommerce_sidebar', 'poocommerce_get_sidebar', 10 );

		// Enqueue theme compatibility styles.
		add_filter( 'poocommerce_enqueue_styles', array( __CLASS__, 'enqueue_styles' ) );

		// Wrap checkout form elements for styling.
		add_action( 'poocommerce_checkout_before_order_review_heading', array( __CLASS__, 'before_order_review' ) );
		add_action( 'poocommerce_checkout_after_order_review', array( __CLASS__, 'after_order_review' ) );

		// Register theme features.
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		add_theme_support(
			'poocommerce',
			array(
				'thumbnail_image_width' => 450,
				'single_image_width'    => 600,
			)
		);

	}

	/**
	 * Enqueue CSS for this theme.
	 *
	 * @param  array $styles Array of registered styles.
	 * @return array
	 */
	public static function enqueue_styles( $styles ) {
		unset( $styles['poocommerce-general'] );

		$styles['poocommerce-general'] = array(
			'src'     => str_replace( array( 'http:', 'https:' ), '', WC()->plugin_url() ) . '/assets/css/twenty-twenty-three.css',
			'deps'    => '',
			'version' => Constants::get_constant( 'WC_VERSION' ),
			'media'   => 'all',
			'has_rtl' => true,
		);

		return apply_filters( 'poocommerce_twenty_twenty_three_styles', $styles );
	}

	/**
	 * Wrap checkout order review with a `col2-set` div.
	 */
	public static function before_order_review() {
		echo '<div class="col2-set">';
	}

	/**
	 * Close the div wrapper.
	 */
	public static function after_order_review() {
		echo '</div>';
	}
}

WC_Twenty_Twenty_Three::init();
