<?php
/**
 * Admin notices
 *
 * @package Woo_AI\Admin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Admin notices class.
 */
class Woo_AI_Admin_Notices {

	/**
	 * PooCommerce not installed notice.
	 */
	public function woocoommerce_not_installed() {
		include_once dirname( __FILE__ ) . '/views/html-admin-missing-poocommerce.php';
	}

	/**
	 * Jetpack not installed notice.
	 */
	public function jetpack_not_installed() {
		include_once dirname( __FILE__ ) . '/views/html-admin-missing-jetpack.php';
	}
}
