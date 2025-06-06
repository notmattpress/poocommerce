<?php
/**
 * PooCommerce Admin Helper - React admin interface
 *
 * @package PooCommerce\Admin\Helper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_Helper_Subscriptions_API
 *
 * The main entry-point for all things related to the Marketplace Subscriptions API.
 * The Subscriptions API manages PooCommerce.com Subscriptions.
 */
class WC_Helper_Subscriptions_API {

	/**
	 * Loads the class, runs on init
	 *
	 * @return void
	 */
	public static function load() {
		add_filter( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	/**
	 * Registers the REST routes for the Marketplace Subscriptions API.
	 * These endpoints are used by the Marketplace Subscriptions React UI.
	 */
	public static function register_rest_routes() {
		register_rest_route(
			'wc/v3',
			'/marketplace/refresh',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'refresh' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_subscriptions' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions/connect',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'connect' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
				'args'                => array(
					'product_key' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions/activate-plugin',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'activate_plugin' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
				'args'                => array(
					'product_key' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions/disconnect',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'disconnect' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
				'args'                => array(
					'product_key' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions/activate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'activate' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
				'args'                => array(
					'product_key' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);

		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions/install-url',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'install_url' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
				'args'                => array(
					'product_key' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
	}

	/**
	 * The Extensions page can only be accessed by users with the manage_poocommerce
	 * capability. So the API mimics that behavior.
	 */
	public static function get_permission() {
		return current_user_can( 'manage_poocommerce' );
	}

	/**
	 * Fetch subscriptions from PooCommerce.com and serve them
	 * as JSON.
	 */
	public static function get_subscriptions() {
		// If the site is connected, mark the time when the my subscriptions tab is first loaded.
		if ( WC_Helper::is_site_connected() === true && empty( WC_Helper_Options::get( 'my_subscriptions_tab_loaded' ) ) ) {
			WC_Helper_Options::update( 'my_subscriptions_tab_loaded', date( 'Y-m-d H:i:s' ) );
		}

		$subscriptions = WC_Helper::get_subscription_list_data();
		wp_send_json(
			array_values(
				$subscriptions
			)
		);
	}

	/**
	 * Refresh account and subscriptions from PooCommerce.com and serve subscriptions
	 * as JSON.
	 */
	public static function refresh() {
		try {
			WC_Helper::refresh_helper_subscriptions();
			WC_Helper::get_subscriptions();
			WC_Helper::get_product_usage_notice_rules();
			self::get_subscriptions();
		} catch ( Exception $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage(),
				),
				400
			);
		}

		WC_Helper::fetch_helper_connection_info();
	}

	/**
	 * Connect a PooCommerce.com subscription.
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public static function connect( $request ) {
		$product_key = $request->get_param( 'product_key' );
		try {
			$success = WC_Helper::activate_helper_subscription( $product_key );
		} catch ( Exception $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage(),
				),
				400
			);
		}
		if ( $success ) {
			wp_send_json_success(
				array(
					'message' => __( 'Your subscription has been connected.', 'poocommerce' ),
				)
			);
		} else {
			wp_send_json_error(
				array(
					'message' => __( 'There was an error connecting your subscription. Please try again.', 'poocommerce' ),
				),
				400
			);
		}
	}

	/**
	 * Activate a plugin for a PooCommerce.com subscription.
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public static function activate_plugin( $request ) {
		$product_key = $request->get_param( 'product_key' );
		try {
			$success = WC_Helper::activate_plugin( $product_key );
		} catch ( Exception $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage(),
				),
				400
			);
		}
		if ( $success ) {
			wp_send_json_success(
				array(
					'message' => __( 'The plugin for your subscription has been activated.', 'poocommerce' ),
				)
			);
		} else {
			wp_send_json_error(
				array(
					'message' => __( 'The plugin for your subscription couldn\'t be activated.', 'poocommerce' ),
				),
				400
			);
		}
	}

	/**
	 * Disconnect a PooCommerce.com subscription.
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public static function disconnect( $request ) {
		$product_key = $request->get_param( 'product_key' );
		try {
			$success = WC_Helper::deactivate_helper_subscription( $product_key );
		} catch ( Exception $e ) {
			wp_send_json_error(
				array(
					'message' => $e->getMessage(),
				),
				400
			);
		}
		if ( $success ) {
			wp_send_json_success(
				array(
					'message' => __( 'Your subscription has been disconnected.', 'poocommerce' ),
				)
			);
		} else {
			wp_send_json_error(
				array(
					'message' => __( 'There was an error disconnecting your subscription. Please try again.', 'poocommerce' ),
				),
				400
			);
		}
	}

	/**
	 * Activate a PooCommerce.com product.
	 * This activates the plugin/theme on the site.
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public static function activate( $request ) {
		$product_key  = $request->get_param( 'product_key' );
		$subscription = WC_Helper::get_subscription( $product_key );

		if ( ! $subscription ) {
			wp_send_json_error(
				array(
					'message' => __( 'We couldn\'t find a subscription for this product.', 'poocommerce' ),
				),
				400
			);
		}

		if ( true !== $subscription['local']['installed'] || ! isset( $subscription['local']['active'] ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'This product is not installed.', 'poocommerce' ),
				),
				400
			);
		}

		if ( true === $subscription['local']['active'] ) {
			wp_send_json_success(
				array(
					'message' => __( 'This product is already active.', 'poocommerce' ),
				),
			);
		}

		if ( 'plugin' === $subscription['product_type'] ) {
			$success = activate_plugin( $subscription['local']['path'] );
			if ( is_wp_error( $success ) ) {
				wp_send_json_error(
					array(
						'message' => __( 'There was an error activating this plugin.', 'poocommerce' ),
					),
					400
				);
			}
		} elseif ( 'theme' === $subscription['product_type'] ) {
			switch_theme( $subscription['local']['slug'] );
			$theme = wp_get_theme();
			if ( $subscription['local']['slug'] !== $theme->get_stylesheet() ) {
				wp_send_json_error(
					array(
						'message' => __( 'There was an error activating this theme.', 'poocommerce' ),
					),
					400
				);
			}
		}

		wp_send_json_success(
			array(
				'message' => __( 'This product has been activated.', 'poocommerce' ),
			),
		);
	}

	/**
	 * Get the install URL for a PooCommerce.com product.
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public static function install_url( $request ) {
		$product_key  = $request->get_param( 'product_key' );
		$subscription = WC_Helper::get_subscription( $product_key );

		if ( ! $subscription ) {
			wp_send_json_error(
				array(
					'message' => __( 'We couldn\'t find a subscription for this product.', 'poocommerce' ),
				),
				400
			);
		}

		if ( true === $subscription['local']['installed'] ) {
			wp_send_json_success(
				array(
					'message' => __( 'This product is already installed.', 'poocommerce' ),
				),
			);
		}

		$install_url = WC_Helper::get_subscription_install_url(
			$subscription['product_key'],
			$subscription['product_slug']
		);

		if ( ! $install_url ) {
			wp_send_json_error(
				array(
					'message' => __( 'There was an error getting the install URL for this product.', 'poocommerce' ),
				),
				400
			);
		}

		wp_send_json_success(
			array(
				'url' => $install_url,
			),
		);
	}
}

WC_Helper_Subscriptions_API::load();
