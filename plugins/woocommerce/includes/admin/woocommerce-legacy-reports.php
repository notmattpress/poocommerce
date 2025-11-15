<?php
declare( strict_types = 1 );

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// This will be the main plugin file after moving the legacy reports to a separate plugin.

if ( ! function_exists( 'poocommerce_legacy_reports_init' ) ) {
	/**
	 * Initialize the PooCommerce legacy reports.
	 */
	function poocommerce_legacy_reports_init() {
		require_once __DIR__ . '/class-wc-admin-reports.php';

		WC_Admin_Reports::register_hook_handlers();
	}

	add_action( 'poocommerce_init', 'poocommerce_legacy_reports_init' );
}
