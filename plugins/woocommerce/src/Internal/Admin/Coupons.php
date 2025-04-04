<?php
/**
 * PooCommerce Marketing > Coupons.
 */

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Admin\PageController;

/**
 * Contains backend logic for the Coupons feature.
 */
class Coupons {

	use CouponsMovedTrait;

	/**
	 * Class instance.
	 *
	 * @var Coupons instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Hook into PooCommerce.
	 */
	public function __construct() {
		if ( ! is_admin() ) {
			return;
		}

		// If the main marketing feature is disabled, don't modify coupon behavior.
		if ( ! Features::is_enabled( 'marketing' ) ) {
			return;
		}

		// Only support coupon modifications if coupons are enabled.
		if ( ! wc_coupons_enabled() ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_add_marketing_coupon_script' ) );
		add_action( 'poocommerce_register_post_type_shop_coupon', array( $this, 'move_coupons' ) );
		add_action( 'admin_head', array( $this, 'fix_coupon_menu_highlight' ), 99 );
		add_action( 'admin_menu', array( $this, 'maybe_add_coupon_menu_redirect' ) );
	}

	/**
	 * Maybe add menu item back in original spot to help people transition
	 */
	public function maybe_add_coupon_menu_redirect() {
		if ( ! $this->should_display_legacy_menu() ) {
			return;
		}

		add_submenu_page(
			'poocommerce',
			__( 'Coupons', 'poocommerce' ),
			__( 'Coupons', 'poocommerce' ),
			'manage_options',
			'coupons-moved',
			array( $this, 'coupon_menu_moved' )
		);
	}

	/**
	 * Call back for transition menu item
	 */
	public function coupon_menu_moved() {
		wp_safe_redirect( $this->get_legacy_coupon_url(), 301 );
		exit();
	}

	/**
	 * Modify registered post type shop_coupon
	 *
	 * @param array $args Array of post type parameters.
	 *
	 * @return array the filtered parameters.
	 */
	public function move_coupons( $args ) {
		$args['show_in_menu'] = current_user_can( 'manage_poocommerce' ) ? 'poocommerce-marketing' : true;
		return $args;
	}

	/**
	 * Undo WC modifications to $parent_file for 'shop_coupon'
	 */
	public function fix_coupon_menu_highlight() {
		global $parent_file, $post_type;

		if ( $post_type === 'shop_coupon' ) {
			$parent_file = 'poocommerce-marketing'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
		}
	}

	/**
	 * Maybe add our wc-admin coupon scripts if viewing coupon pages
	 */
	public function maybe_add_marketing_coupon_script() {
		$curent_screen = PageController::get_instance()->get_current_page();
		if ( ! isset( $curent_screen['id'] ) || $curent_screen['id'] !== 'poocommerce-coupons' ) {
			return;
		}

		WCAdminAssets::register_style( 'marketing-coupons', 'style' );
		WCAdminAssets::register_script( 'wp-admin-scripts', 'marketing-coupons', true );
	}
}
