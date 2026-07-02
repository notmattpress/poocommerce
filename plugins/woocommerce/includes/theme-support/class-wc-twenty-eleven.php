<?php
/**
 * Twenty Eleven support.
 *
 * @since   3.3.0
 * @package PooCommerce\Classes
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC_Twenty_Eleven class.
 */
class WC_Twenty_Eleven {

	/**
	 * Theme init.
	 */
	public static function init() {
		// Remove default wrappers.
		remove_action( 'poocommerce_before_main_content', 'poocommerce_output_content_wrapper' );
		remove_action( 'poocommerce_after_main_content', 'poocommerce_output_content_wrapper_end' );

		// Add custom wrappers.
		add_action( 'poocommerce_before_main_content', array( __CLASS__, 'output_content_wrapper' ) );
		add_action( 'poocommerce_after_main_content', array( __CLASS__, 'output_content_wrapper_end' ) );

		// Declare theme support for features.
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		add_theme_support(
			'poocommerce',
			array(
				'thumbnail_image_width' => 150,
				'single_image_width'    => 300,
			)
		);
	}

	/**
	 * Open wrappers.
	 */
	public static function output_content_wrapper() {
		echo '<div id="primary"><div id="content" role="main" class="twentyeleven">';
	}

	/**
	 * Close wrappers.
	 */
	public static function output_content_wrapper_end() {
		echo '</div></div>';
	}
}

WC_Twenty_Eleven::init();
