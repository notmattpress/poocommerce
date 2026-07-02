<?php
/**
 * Plugin Name: PooCommerce
 * Plugin URI: https://poocommerce.com/
 * Description: An ecommerce toolkit that helps you sell anything. Beautifully.
 * Version: 11.0.0-dev
 * Author: Automattic
 * Author URI: https://poocommerce.com
 * Text Domain: poocommerce
 * Domain Path: /i18n/languages/
 * Requires at least: 6.9
 * Requires PHP: 7.4
 *
 * @package PooCommerce
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'WC_PLUGIN_FILE' ) ) {
	define( 'WC_PLUGIN_FILE', __FILE__ );
}

// Load core packages and the autoloader.
require __DIR__ . '/src/Autoloader.php';
require __DIR__ . '/src/Packages.php';

if ( ! \Automattic\PooCommerce\Autoloader::init() ) {
	return;
}
\Automattic\PooCommerce\Packages::init();

// Register a PooCommerce-scoped Composer PSR-4 autoloader on the SPL stack as a
// low-priority (appended) fallback, consulted only after every other autoloader
// — including the primary Jetpack autoloader — has missed. When a WordPress
// in-place upgrade swaps PooCommerce's files mid-request, the Jetpack classmap
// snapshot (captured at request start, never refreshed) cannot resolve a class
// that is new in the upgraded version; this fallback resolves it from disk.
\Automattic\PooCommerce\Autoloader::register_poocommerce_psr4_fallback();

// Include the main PooCommerce class.
if ( ! class_exists( 'PooCommerce', false ) ) {
	include_once dirname( WC_PLUGIN_FILE ) . '/includes/class-poocommerce.php';
}

// Initialize dependency injection.
$GLOBALS['wc_container'] = new Automattic\PooCommerce\Container();

/**
 * Returns the main instance of WC.
 *
 * @since  2.1
 * @return PooCommerce
 */
function WC() { // phpcs:ignore WordPress.NamingConventions.ValidFunctionName.FunctionNameInvalid
	return PooCommerce::instance();
}

/**
 * Returns the PooCommerce object container.
 * Code in the `includes` directory should use the container to get instances of classes in the `src` directory.
 *
 * @since  4.4.0
 * @return \Automattic\PooCommerce\Container The PooCommerce object container.
 */
function wc_get_container() {
	return $GLOBALS['wc_container'];
}

// Global for backwards compatibility.
$GLOBALS['poocommerce'] = WC();

// Jetpack's Rest_Authentication needs to be initialized even before plugins_loaded.
if ( class_exists( \Automattic\Jetpack\Connection\Rest_Authentication::class ) ) {
	\Automattic\Jetpack\Connection\Rest_Authentication::init();
}
