<?php
/**
 * Plugin Name: PooCommerce Beta Tester
 * Plugin URI: https://github.com/poocommerce/poocommerce-beta-tester
 * Description: Run bleeding edge versions of PooCommerce. This will replace your installed version of PooCommerce with the latest tagged release - use with caution, and not on production sites.
 * Version: 2.5.1
 * Author: PooCommerce
 * Author URI: https://poocommerce.com/
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Tested up to: 6.7
 * WC requires at least: 9.4
 * WC tested up to: 9.5
 * Text Domain: poocommerce-beta-tester
 *
 * @package WC_Beta_Tester
 */

defined( 'ABSPATH' ) || exit;


if ( defined( 'WP_CLI' ) ) {
	require_once dirname( __FILE__ ) . '/includes/class-wc-beta-tester-cli.php';
	WP_CLI::add_command( 'wc-beta-tester', WC_Beta_Tester_CLI::class );
}

// Define WC_BETA_TESTER_FILE.
if ( ! defined( 'WC_BETA_TESTER_FILE' ) ) {
	define( 'WC_BETA_TESTER_FILE', __FILE__ );
}

if ( ! defined( 'WC_BETA_TESTER_VERSION' ) ) {
	define( 'WC_BETA_TESTER_VERSION', '2.5.1' ); // WRCS: DEFINED_VERSION.
}

/**
 * Load text domain before all other code.
 *
 * @since 2.0.0
 */
function _wc_beta_tester_load_textdomain() {
	load_plugin_textdomain( 'poocommerce-beta-tester', false, basename( dirname( __FILE__ ) ) . '/languages' );
}

add_action( 'plugins_loaded', '_wc_beta_tester_load_textdomain' );

/**
 * Bootstrap plugin.
 */
function _wc_beta_tester_bootstrap() {

	// Check if PooCommerce is enabled.
	if ( ! class_exists( 'PooCommerce' ) ) {
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-admin-notices.php';
		$notices = new WC_Beta_Tester_Admin_Notices();

		add_action( 'admin_notices', array( $notices, 'woocoommerce_not_installed' ) );
	} elseif ( ! class_exists( 'WC_Beta_Tester' ) ) {
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester.php';
		// Settings.
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-channel.php';
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-import-export.php';
		new WC_Beta_Tester_Import_Export();
		// Tools.
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-version-picker.php';
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-override-coming-soon-options.php';
		include dirname( __FILE__ ) . '/includes/class-wc-beta-tester-wccom-requests.php';

		register_activation_hook( __FILE__, array( 'WC_Beta_Tester', 'activate' ) );

		add_action( 'admin_init', array( 'WC_Beta_Tester', 'instance' ) );
	}

	// Load admin.
	require 'plugin.php';
}

add_action( 'plugins_loaded', '_wc_beta_tester_bootstrap' );

/**
 * Register the JS.
 */
function add_extension_register_script() {
	if ( ! defined( 'WC_ADMIN_APP' ) ) {
		return;
	}
	$script_path       = '/build/index.js';
	$script_asset_path = dirname( __FILE__ ) . '/build/index.asset.php';
	$script_asset      = file_exists( $script_asset_path )
		? require $script_asset_path
		: array(
			'dependencies' => array(),
			'version'      => filemtime( $script_path ),
		);
	$script_url        = plugins_url( $script_path, __FILE__ );

	$script_asset['dependencies'][] = WC_ADMIN_APP; // Add WCA as a dependency to ensure it loads first.

	wp_register_script(
		'poocommerce-admin-test-helper',
		$script_url,
		$script_asset['dependencies'],
		$script_asset['version'],
		true
	);
	wp_enqueue_script( 'poocommerce-admin-test-helper' );

	$css_file_version = filemtime( dirname( __FILE__ ) . '/build/index.css' );

	wp_register_style(
		'wp-components',
		plugins_url( 'dist/components/style.css', __FILE__ ),
		array(),
		$css_file_version
	);

	wp_register_style(
		'poocommerce-admin-test-helper',
		plugins_url( '/build/index.css', __FILE__ ),
		// Add any dependencies styles may have, such as wp-components.
		array(
			'wp-components',
		),
		$css_file_version
	);

	wp_enqueue_style( 'poocommerce-admin-test-helper' );
}

add_action( 'admin_enqueue_scripts', 'add_extension_register_script' );

add_action(
	'before_poocommerce_init',
	function() {
		if ( class_exists( '\Automattic\PooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\PooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			\Automattic\PooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'product_block_editor', __FILE__, true );
		}
	}
);


/**
 * Simulate a PooCommerce error for remote logging testing.
 *
 * This function adds a filter to the 'poocommerce_template_path' hook
 * that throws an exception, then triggers the filter by calling WC()->template_path().
 *
 * @throws Exception A simulated PooCommerce error for testing purposes.
 */
function simulate_poocommerce_error() {
	// Return if PooCommerce is not loaded.
	if ( ! function_exists( 'WC' ) || ! class_exists( 'PooCommerce' ) ) {
		return;
	}

	// Define a constant to prevent the error from being caught by the WP Error Handler.
	if ( ! defined( 'WP_SANDBOX_SCRAPING' ) ) {
		define( 'WP_SANDBOX_SCRAPING', true );
	}

	add_filter(
		'poocommerce_template_path',
		function() {
			throw new Exception( 'Simulated PooCommerce error for remote logging test' );
		}
	);

	WC()->template_path();
}

$simulate_error = get_option( 'wc_beta_tester_simulate_poocommerce_php_error', false );

if ( $simulate_error ) {
	delete_option( 'wc_beta_tester_simulate_poocommerce_php_error' );

	if ( 'core' === $simulate_error ) {
		// Hook into the plugin_loaded action to simulate the error early before WP fully initializes.
		add_action( 'plugin_loaded', 'simulate_poocommerce_error' );
	} elseif ( 'beta-tester' === $simulate_error ) {
		throw new Exception( 'Test PHP exception from PooCommerce Beta Tester' );
	}
}


// Initialize the live branches feature.
require_once dirname( __FILE__ ) . '/includes/class-wc-beta-tester-live-branches.php';
