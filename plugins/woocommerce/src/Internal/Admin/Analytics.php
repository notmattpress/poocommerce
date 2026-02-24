<?php
/**
 * PooCommerce Analytics.
 */

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Admin\API\Reports\Cache;
use Automattic\PooCommerce\Utilities\OrderUtil;
use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\Admin\API\Reports\Orders\Stats\DataStore as OrderStatsDataStore;
use Automattic\PooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;

/**
 * Contains backend logic for the Analytics feature.
 */
class Analytics {
	/**
	 * Option name used to toggle this feature.
	 */
	const TOGGLE_OPTION_NAME = 'poocommerce_analytics_enabled';
	/**
	 * Clear cache tool identifier.
	 */
	const CACHE_TOOL_ID = 'clear_poocommerce_analytics_cache';

	/**
	 * Class instance.
	 *
	 * @var Analytics instance
	 */
	protected static $instance = null;

	/**
	 * Determines if the feature has been toggled on or off.
	 *
	 * @var boolean
	 */
	protected static $is_updated = false;

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
		add_action( 'update_option_' . self::TOGGLE_OPTION_NAME, array( $this, 'reload_page_on_toggle' ), 10, 2 );
		add_action( 'poocommerce_settings_saved', array( $this, 'maybe_reload_page' ) );

		if ( ! Features::is_enabled( 'analytics' ) ) {
			return;
		}

		add_filter( 'poocommerce_component_settings_preload_endpoints', array( $this, 'add_preload_endpoints' ) );
		add_filter( 'poocommerce_admin_get_user_data_fields', array( $this, 'add_user_data_fields' ) );
		add_action( 'admin_menu', array( $this, 'register_pages' ) );
		add_filter( 'poocommerce_debug_tools', array( $this, 'register_cache_clear_tool' ) );
		add_filter( 'poocommerce_debug_tools', array( $this, 'register_regenerate_order_fulfillment_status_tool' ), 12 );
	}

	/**
	 * Add the feature toggle to the features settings.
	 *
	 * @deprecated 7.0 The PooCommerce Admin features are now handled by the PooCommerce features engine (see the FeaturesController class).
	 *
	 * @param array $features Feature sections.
	 * @return array
	 */
	public static function add_feature_toggle( $features ) {
		return $features;
	}

	/**
	 * Reloads the page when the option is toggled to make sure all Analytics features are loaded.
	 *
	 * @param string $old_value Old value.
	 * @param string $value     New value.
	 */
	public static function reload_page_on_toggle( $old_value, $value ) {
		if ( $old_value === $value ) {
			return;
		}

		self::$is_updated = true;
	}

	/**
	 * Reload the page if the setting has been updated.
	 */
	public static function maybe_reload_page() {
		if ( ! isset( $_SERVER['REQUEST_URI'] ) || ! self::$is_updated ) {
			return;
		}

		wp_safe_redirect( wp_unslash( $_SERVER['REQUEST_URI'] ) );
		exit();
	}

	/**
	 * Preload data from the countries endpoint.
	 *
	 * @param array $endpoints Array of preloaded endpoints.
	 * @return array
	 */
	public function add_preload_endpoints( $endpoints ) {
		$screen_id = ( function_exists( 'get_current_screen' ) && get_current_screen() ) ? get_current_screen()->id : '';

		// Only preload endpoints on wc-admin pages.
		if ( 'poocommerce_page_wc-admin' === $screen_id ) {
			$endpoints['performanceIndicators'] = '/wc-analytics/reports/performance-indicators/allowed';
			$endpoints['leaderboards']          = '/wc-analytics/leaderboards/allowed';
		}

		return $endpoints;
	}

	/**
	 * Adds fields so that we can store user preferences for the columns to display on a report.
	 *
	 * @param array $user_data_fields User data fields.
	 * @return array
	 */
	public function add_user_data_fields( $user_data_fields ) {
		return array_merge(
			$user_data_fields,
			array(
				'categories_report_columns',
				'coupons_report_columns',
				'customers_report_columns',
				'orders_report_columns',
				'products_report_columns',
				'revenue_report_columns',
				'taxes_report_columns',
				'variations_report_columns',
				'dashboard_sections',
				'dashboard_chart_type',
				'dashboard_chart_interval',
				'dashboard_leaderboard_rows',
				'order_attribution_install_banner_dismissed',
				'scheduled_updates_promotion_notice_dismissed',
			)
		);
	}

	/**
	 * Register the cache clearing tool on the PooCommerce > Status > Tools page.
	 *
	 * @param array $debug_tools Available debug tool registrations.
	 * @return array Filtered debug tool registrations.
	 */
	public function register_cache_clear_tool( $debug_tools ) {
		$settings_url = add_query_arg(
			array(
				'page' => 'wc-admin',
				'path' => '/analytics/settings',
			),
			get_admin_url( null, 'admin.php' )
		);

		$debug_tools[ self::CACHE_TOOL_ID ] = array(
			'name'     => __( 'Clear analytics cache', 'poocommerce' ),
			'button'   => __( 'Clear', 'poocommerce' ),
			'desc'     => sprintf(
				/* translators: 1: opening link tag, 2: closing tag */
				__( 'This tool will reset the cached values used in PooCommerce Analytics. If numbers still look off, try %1$sReimporting Historical Data%2$s.', 'poocommerce' ),
				'<a href="' . esc_url( $settings_url ) . '">',
				'</a>'
			),
			'callback' => array( $this, 'run_clear_cache_tool' ),
		);

		return $debug_tools;
	}

	/**
	 * Register the regenerate order fulfillment status tool on the PooCommerce > Status > Tools page.
	 *
	 * @param array $debug_tools Available debug tool registrations.
	 * @return array Filtered debug tool registrations.
	 */
	public function register_regenerate_order_fulfillment_status_tool( $debug_tools ) {
		// Check if the fulfillments feature is enabled.
		$container           = wc_get_container();
		$features_controller = $container->get( FeaturesController::class );

		if ( ! $features_controller->feature_is_enabled( 'fulfillments' ) ) {
			return $debug_tools;
		}

		// If the order fulfillment status has already been regenerated, don't register the tool again.
		if ( true === (bool) get_option( 'poocommerce_analytics_order_fulfillment_status_regenerated' ) ) {
			return $debug_tools;
		}

		$debug_tools['regenerate_order_fulfillment_status'] = array(
			'name'     => __( 'Regenerate order fulfillment status for Analytics', 'poocommerce' ),
			'button'   => __( 'Regenerate', 'poocommerce' ),
			'desc'     => __( 'This tool will regenerate the order fulfillment status for all orders and update the Analytics data using a direct SQL query.', 'poocommerce' ),
			'callback' => array( $this, 'run_regenerate_order_fulfillment_status_tool' ),
		);

		return $debug_tools;
	}

	/**
	 * Regenerate order fulfillment status directly using SQL.
	 *
	 * @return string Success message or error message.
	 */
	public function run_regenerate_order_fulfillment_status_tool() {
		global $wpdb;

		// Check if the column exists, create it if not.
		if ( ! OrderStatsDataStore::has_fulfillment_status_column() ) {
			$create_column_result = OrderStatsDataStore::add_fulfillment_status_column();

			if ( true !== $create_column_result ) {
				return sprintf(
					/* translators: %s: error message */
					__( 'Failed to create fulfillment status column: %s', 'poocommerce' ),
					$create_column_result
				);
			}
		}

		$order_stats_table = $wpdb->prefix . 'wc_order_stats';

		// If HPOS is enabled, use the wc_orders_meta table, else use wp_postmeta.
		if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
			$order_meta_table  = OrdersTableDataStore::get_meta_table_name();
			$order_meta_column = 'order_id';
		} else {
			$order_meta_table  = $wpdb->postmeta;
			$order_meta_column = 'post_id';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated = $wpdb->query(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table and column names cannot be prepared.
				"UPDATE {$order_stats_table} os INNER JOIN {$order_meta_table} om ON os.order_id = om.{$order_meta_column}
				SET os.fulfillment_status = CASE
					WHEN om.meta_value = %s THEN NULL
					ELSE om.meta_value
				END
				WHERE om.meta_key = %s",
				'no_fulfillments',
				'_fulfillment_status'
			)
		);

		if ( false === $updated ) {
			return __( 'Failed to update order fulfillment status. Please check the database logs for errors.', 'poocommerce' );
		}

		// Mark as completed.
		update_option( 'poocommerce_analytics_order_fulfillment_status_regenerated', true, false );

		return sprintf(
			/* translators: %d: number of orders updated */
			__( 'Successfully updated fulfillment status for %d orders.', 'poocommerce' ),
			$updated
		);
	}

	/**
	 * Registers report pages.
	 */
	public function register_pages() {
		$report_pages = self::get_report_pages();
		foreach ( $report_pages as $report_page ) {
			if ( ! is_null( $report_page ) ) {
				wc_admin_register_page( $report_page );
			}
		}
	}

	/**
	 * Get report pages.
	 */
	public static function get_report_pages() {
		$overview_page = array(
			'id'       => 'poocommerce-analytics',
			'title'    => __( 'Analytics', 'poocommerce' ),
			'path'     => '/analytics/overview',
			'icon'     => 'dashicons-chart-bar',
			'position' => 57, // After PooCommerce & Product menu items.
		);

		$report_pages = array(
			$overview_page,
			array(
				'id'     => 'poocommerce-analytics-overview',
				'title'  => __( 'Overview', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/overview',
			),
			array(
				'id'     => 'poocommerce-analytics-products',
				'title'  => __( 'Products', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/products',
			),
			array(
				'id'     => 'poocommerce-analytics-revenue',
				'title'  => __( 'Revenue', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/revenue',
			),
			array(
				'id'     => 'poocommerce-analytics-orders',
				'title'  => __( 'Orders', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/orders',
			),
			array(
				'id'     => 'poocommerce-analytics-variations',
				'title'  => __( 'Variations', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/variations',
			),
			array(
				'id'     => 'poocommerce-analytics-categories',
				'title'  => __( 'Categories', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/categories',
			),
			array(
				'id'     => 'poocommerce-analytics-coupons',
				'title'  => __( 'Coupons', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/coupons',
			),
			array(
				'id'     => 'poocommerce-analytics-taxes',
				'title'  => __( 'Taxes', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/taxes',
			),
			array(
				'id'     => 'poocommerce-analytics-downloads',
				'title'  => __( 'Downloads', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/downloads',
			),
			'yes' === get_option( 'poocommerce_manage_stock' ) ? array(
				'id'     => 'poocommerce-analytics-stock',
				'title'  => __( 'Stock', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/stock',
			) : null,
			array(
				'id'     => 'poocommerce-analytics-customers',
				'title'  => __( 'Customers', 'poocommerce' ),
				'parent' => 'poocommerce',
				'path'   => '/customers',
			),
			array(
				'id'     => 'poocommerce-analytics-settings',
				'title'  => __( 'Settings', 'poocommerce' ),
				'parent' => 'poocommerce-analytics',
				'path'   => '/analytics/settings',
			),
		);

		/**
		 * The analytics report items used in the menu.
		 *
		 * @since 6.4.0
		 */
		return apply_filters( 'poocommerce_analytics_report_menu_items', $report_pages );
	}

	/**
	 * "Clear" analytics cache by invalidating it.
	 */
	public function run_clear_cache_tool() {
		Cache::invalidate();

		return __( 'Analytics cache cleared.', 'poocommerce' );
	}
}
