<?php
/**
 * Plugin Name: PooCommerce Admin Add Report Example
 *
 * @package PooCommerce\Admin
 */

/**
 * Register the JS.
 */
function add_report_register_script() {

	if ( ! class_exists( 'Automattic\PooCommerce\Admin\PageController' ) || ! \Automattic\PooCommerce\Admin\PageController::is_admin_page() ) {
		return;
	}

	$asset_file = require __DIR__ . '/dist/index.asset.php';
	wp_register_script(
		'add-report',
		plugins_url( '/dist/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);

	wp_enqueue_script( 'add-report' );
}
add_action( 'admin_enqueue_scripts', 'add_report_register_script' );

/**
 * Add "Example" as a Analytics submenu item.
 *
 * @param array $report_pages Report page menu items.
 * @return array Updated report page menu items.
 */
function add_report_add_report_menu_item( $report_pages ) {
	$report_pages[] = array(
		'id'     => 'example-analytics-report',
		'title'  => __( 'Example', 'poocommerce-admin' ),
		'parent' => 'poocommerce-analytics',
		'path'   => '/analytics/example',
	);

	return $report_pages;
}
add_filter( 'poocommerce_analytics_report_menu_items', 'add_report_add_report_menu_item' );
