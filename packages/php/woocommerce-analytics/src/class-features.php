<?php
/**
 * Features class for PooCommerce Analytics.
 *
 * @package automattic/poocommerce-analytics
 */

namespace Automattic\Woocommerce_Analytics;

/**
 * Features class for PooCommerce Analytics.
 */
class Features {

	/**
	 * Check if proxy tracking is enabled.
	 *
	 * @return bool
	 */
	public static function is_proxy_tracking_enabled() {
		/**
		 * Filter to enable/disable experimental proxy tracking for PooCommerce Analytics
		 *
		 * @since 0.9.0
		 *
		 * @param bool $enabled Whether proxy tracking is enabled. Default false.
		 */
		return apply_filters( 'poocommerce_analytics_experimental_proxy_tracking_enabled', false );
	}

	/**
	 * Check if ClickHouse is enabled.
	 *
	 * @return bool
	 */
	public static function is_clickhouse_enabled() {
		/**
		 * Filter to enable/disable ClickHouse event tracking.
		 *
		 * @module poocommerce-analytics
		 *
		 * @since 0.5.0
		 *
		 * @param bool $enabled Whether ClickHouse event tracking is enabled.
		 */
		return apply_filters( 'poocommerce_analytics_clickhouse_enabled', false );
	}

	/**
	 * Check if auto-installation of the proxy speed module MU-plugin is enabled.
	 *
	 * @return bool
	 */
	public static function is_proxy_speed_module_enabled() {
		/**
		 * Filter to control auto-installation of the proxy speed module mu-plugin.
		 *
		 * When this filter returns false, the mu-plugin file can't be added automatically.
		 *
		 * @since 0.15.0
		 *
		 * @param bool $auto_install Whether to auto-install the mu-plugin. Default false.
		 */
		return apply_filters( 'poocommerce_analytics_auto_install_proxy_speed_module', false );
	}
}
