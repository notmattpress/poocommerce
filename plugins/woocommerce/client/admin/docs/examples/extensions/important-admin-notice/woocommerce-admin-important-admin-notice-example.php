<?php
/**
 * Plugin Name: PooCommerce Admin Important Notice Example
 *
 * @package PooCommerce\Admin
 */

/**
 * Register the JS.
 */
function wc_admin_important_notice_register_script() {
	if ( ! class_exists( 'Automattic\PooCommerce\Internal\Admin\Loader' ) ) {
		return;
	}

	if (
		! \Automattic\PooCommerce\Admin\PageController::is_admin_page() &&
		! \Automattic\PooCommerce\Admin\PageController::is_embed_page()
	) {
		return;
	}

	$asset_file = require __DIR__ . '/dist/index.asset.php';
	wp_register_script(
		'wc-admin-important-notice',
		plugins_url( '/dist/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);

	wp_enqueue_script( 'wc-admin-important-notice' );
}
add_action( 'admin_enqueue_scripts', 'wc_admin_important_notice_register_script' );

/**
 * Create an Admin Notice we want to remain visible.
 */
function wc_admin_add_important_notice() {
	?>
	<div class="updated poocommerce-message">
		<p class="notice-text">Important notice targeted by inspecting DOM.</p>
	</div>
	<div class="updated poocommerce-admin poocommerce-message">
		<p>Important notice targeted by class.</p>
	</div>
	<div class="updated poocommerce-admin poocommerce-message ok-to-hide">
		<p>Notice excluded from importance clause targeted by class.</p>
	</div>
	<div id="poocommerce-admin-important-notice" class="updated poocommerce-message">
		<p>Important notice targeted by ID.</p>
	</div>
	<?php
}
add_action( 'admin_notices', 'wc_admin_add_important_notice' );
