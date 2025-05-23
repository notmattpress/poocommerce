<?php
/**
 * Plugin Name: PooCommerce Blocks Test Helper
 * Description: A helper plugin to control settings within Woo E2E tests.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 *
 * @package poocommerce-blocks-test-helper
 */

defined( 'ABSPATH' ) || exit;

/**
 * Define URL endpoints for setting up and tearing down the T&C and Privacy Policy pages.
 */
function poocommerce_setup_terms_and_privacy_page() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['setup_terms_and_privacy'] ) ) {
		publish_privacy_page();
		publish_terms_page();
		exit( 'Terms & Privacy pages set up.' );
	}

  	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['teardown_terms_and_privacy'] ) ) {
		unpublish_privacy_page();
		delete_terms_page();
		exit( 'Terms & Privacy pages teared down.' );
	}
}
add_action( 'init', 'poocommerce_setup_terms_and_privacy_page' );

/**
 * Publish Privacy Policy page.
 */
function publish_privacy_page() {
	global $wpdb;

	$table = $wpdb->prefix . 'posts';
	$data  = array( 'post_status' => 'publish' );
	$where = array(
		'post_title'  => 'Privacy Policy',
		'post_status' => 'draft',
	);
	$wpdb->update( $table, $data, $where );
}

/**
 * Publish and set Terms & Conditions page.
 */
function publish_terms_page() {
	global $wpdb;

	$table = $wpdb->prefix . 'posts';
	$data  = array(
		'post_title'  => 'Terms & Conditions',
		'post_status' => 'publish',
		'post_type'   => 'page',
		'post_author' => 1,
	);
	$wpdb->replace( $table, $data );
	update_option( 'poocommerce_terms_page_id', $wpdb->insert_id );
}

/**
 * Unpublish Privacy Policy page.
 */
function unpublish_privacy_page() {
	global $wpdb;

	$table = $wpdb->prefix . 'posts';
	$data  = array( 'post_status' => 'draft' );
	$where = array(
		'post_title'  => 'Privacy Policy',
		'post_status' => 'publish',
	);
	$wpdb->update( $table, $data, $where );
}

/**
 * Delete Terms & Conditions page.
 */
function delete_terms_page() {
	global $wpdb;

	$table = $wpdb->prefix . 'posts';
	$data  = array( 'post_title' => 'Terms & Conditions' );
	$wpdb->delete( $table, $data );
}

/**
 * Registers a third party local pickup method, this will have a different ID to the ones we add in the WC Settings.
 */
function register_third_party_local_pickup_method() {
	/**
	 * This function initialises our local pickup method.
	 */
	function woo_collection_shipping_init() {

		if ( 'yes' !== get_option( 'poocommerce_enable_third_party_local_pickup_method_registration' ) ) {
			return;
		}

		/**
		 * Custom Local Pickup method.
		 */
		class Woo_Collection_Shipping_Method extends WC_Shipping_Method {

			/**
			 * Min amount to be valid.
			 *
			 * @var integer
			 */
			public $min_amount = 0;

			/**
			 * Requires option.
			 *
			 * @var string
			 */
			public $requires = '';

			/**
			 * Constructor.
			 *
			 * @param int $instance_id Shipping method instance.
			 */
			public function __construct( $instance_id = 0 ) {
				$this->id                 = 'woo_collection_shipping';
				$this->instance_id        = absint( $instance_id );
				$this->title              = 'Woo Collection';
				$this->method_title       = __( 'Woo Collection', 'woo-gutenberg-products-block' );
				$this->method_description = __( 'Get your order shipped to an Woo Collection point.', 'woo-gutenberg-products-block' );
				$this->supports           = array(
					'instance-settings',
					'instance-settings-modal',
					'local-pickup',
				);

				$this->init();
			}

			/**
			 * Initialize Woo Collection shipping.
			 */
			public function init() {
			}

			/**
			 * See if Woo Collection shipping is available based on the package and cart.
			 *
			 * @param array $package Shipping package.
			 * @return bool
			 */
			public function is_available( $package ) {
				return true;
			}

			/**
			 * Called to calculate shipping rates for this method. Rates can be added using the add_rate() method.
			 *
			 * @param array $package Shipping package.
			 * @uses WC_Shipping_Method::add_rate()
			 */
			public function calculate_shipping( $package = array() ) {
				$this->add_rate(
					array(
						'label'   => $this->title,
						'cost'    => 0,
						'taxes'   => false,
						'package' => $package,
					)
				);
			}
		}
	}

	// Use this hook to initialize your new custom method.
	add_action( 'poocommerce_shipping_init', 'woo_collection_shipping_init' );

	/**
	 * Adds the Woo Collection shipping method to the list of available methods in PooCommerce.
	 * @param array $methods The current list of methods.
	 * @return array The modified list of methods.
	 */
	function add_woo_collection_shipping( $methods ) {
		$methods['woo_collection_shipping'] = 'Woo_Collection_Shipping_Method';

		return $methods;
	}
	add_filter( 'poocommerce_shipping_methods', 'add_woo_collection_shipping' );
}

register_third_party_local_pickup_method();

/**
 * Define URL endpoints for setting an option to determine if the third party local pickup method is registered.
 */
function poocommerce_enable_third_party_local_pickup_method_registration() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['enable_third_party_local_pickup_method_registration'] ) ) {
		update_option( 'poocommerce_enable_third_party_local_pickup_method_registration', 'yes' );
		exit( 'Third party local pickup method registration enabled.' );
	}
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['disable_third_party_local_pickup_method_registration'] ) ) {
		delete_option( 'poocommerce_enable_third_party_local_pickup_method_registration' );
		exit( 'Third party local pickup method registration disabled.' );
	}
}
add_action( 'init', 'poocommerce_enable_third_party_local_pickup_method_registration' );

/**
 * Define URL endpoint for setting up third party local pickup method.
 */
function check_third_party_local_pickup_method() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['check_third_party_local_pickup_method'] ) ) {
		add_action(
			'poocommerce_blocks_loaded',
			function () {
				$method_titles = array_map(
					function ( $method ) {
						return $method->title;
					},
					wc()->shipping()->get_shipping_methods()
				);
				exit( wp_kses( implode( ', ', $method_titles ), array() ) );
			}
		);
	}
}
add_action( 'plugins_loaded', 'check_third_party_local_pickup_method' );
