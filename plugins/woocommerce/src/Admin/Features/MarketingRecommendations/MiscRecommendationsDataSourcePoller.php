<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Admin\Features\MarketingRecommendations;

use Automattic\PooCommerce\Admin\RemoteSpecs\DataSourcePoller;
use WC_Helper;

/**
 * Specs data source poller class for misc recommendations.
 *
 * The misc recommendations are fetched from the PooCommerce.com API, the data structure looks like this:
 *
 * [
 *   {
 *     "id": "poocommerce-analytics",
 *     "order_attribution_promotion_percentage": [
 *       [ "9.7", 100 ],
 *       [ "9.6", 60 ],
 *       [ "9.5", 10 ]
 *     ]
 *   }
 * ]
 *
 * @since 9.5.0
 */
class MiscRecommendationsDataSourcePoller extends DataSourcePoller {

	/**
	 * Data Source Poller ID.
	 */
	const ID = 'misc_recommendations';

	/**
	 * Class instance.
	 *
	 * @var MiscRecommendationsDataSourcePoller instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self(
				self::ID,
				self::get_data_sources(),
				array(
					'transient_expiry' => DAY_IN_SECONDS,
				)
			);
		}
		return self::$instance;
	}

	/**
	 * Get data sources.
	 *
	 * @return array
	 */
	public static function get_data_sources() {
		return array(
			WC_Helper::get_poocommerce_com_base_url() . 'wp-json/wccom/marketing-tab/misc/recommendations.json',
		);
	}
}
