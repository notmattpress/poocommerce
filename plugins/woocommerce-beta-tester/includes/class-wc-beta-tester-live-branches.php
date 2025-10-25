<?php
/**
 * Beta Tester Plugin Live Branches feature class.
 *
 * @package WC_Beta_Tester
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC_Beta_Tester Live Branches Feature Class.
 */
class WC_Beta_Tester_Live_Branches {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_page' ) );
		add_action( 'admin_init', array( $this, 'register_scripts' ) );
	}

	/**
	 * Check if PooCommerce is installed.
	 *
	 * @return bool - True if PooCommerce is installed, false otherwise.
	 */
	private function poocommerce_is_installed() {
		return class_exists( 'PooCommerce' );
	}

	/**
	 * Register live branches scripts.
	 */
	public function register_scripts() {
		if ( ! $this->poocommerce_is_installed() ) {
			return;
		}

		if ( ! is_admin() ) {
			return;
		}

		$script_path       = '/build/live-branches.js';
		$script_asset_path = dirname( __FILE__ ) . '/../build/live-branches.asset.php';
		$script_asset      = file_exists( $script_asset_path )
			? require $script_asset_path
			: array(
				'dependencies' => array(),
				'version'      => filemtime( $script_path ),
			);
		$script_url        = WC_Beta_Tester::instance()->plugin_url() . $script_path;

		wp_register_script(
			'poocommerce-beta-tester-live-branches',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		wp_enqueue_script( 'poocommerce-beta-tester-live-branches' );
	}

	/**
	 * Register live branches page.
	 */
	public function register_page() {
		if ( ! $this->poocommerce_is_installed() ) {
			return;
		}

		if ( ! function_exists( 'wc_admin_register_page' ) ) {
			return;
		}

		wc_admin_register_page(
			array(
				'id'         => 'poocommerce-beta-tester-live-branches',
				'title'      => __( 'Live Branches', 'poocommerce-beta-tester' ),
				'path'       => '/live-branches',
				'parent'     => 'poocommerce',
				'capability' => 'read',
			)
		);
	}
}

return new WC_Beta_Tester_Live_Branches();
