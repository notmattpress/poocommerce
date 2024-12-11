<?php
/**
 * REST API bootstrap.
 */

namespace Automattic\PooCommerce\Admin\API;

use AllowDynamicProperties;
use Automattic\PooCommerce\Admin\Features\Features;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Internal\Admin\Loader;

/**
 * Init class.
 *
 * @internal
 */
#[AllowDynamicProperties]
class Init {
	/**
	 * The single instance of the class.
	 *
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return object Instance.
	 */
	final public static function instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	/**
	 * Bootstrap REST API.
	 */
	public function __construct() {
		// Hook in data stores.
		add_filter( 'poocommerce_data_stores', array( __CLASS__, 'add_data_stores' ) );
		// REST API extensions init.
		add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );

		// Add currency symbol to orders endpoint response.
		add_filter( 'poocommerce_rest_prepare_shop_order_object', array( __CLASS__, 'add_currency_symbol_to_order_response' ) );

		include_once WC_ABSPATH . 'includes/admin/class-wc-admin-upload-downloadable-product.php';
	}

	/**
	 * Init REST API.
	 */
	public function rest_api_init() {
		$controllers           = array();
		$analytics_controllers = array();

		if ( wc_rest_should_load_namespace( 'wc-admin' ) ) {
			// Controllers in the wc-admin namespace.
			$controllers = array(
				'Automattic\PooCommerce\Admin\API\Notice',
				'Automattic\PooCommerce\Admin\API\Features',
				'Automattic\PooCommerce\Admin\API\Experiments',
				'Automattic\PooCommerce\Admin\API\Marketing',
				'Automattic\PooCommerce\Admin\API\MarketingOverview',
				'Automattic\PooCommerce\Admin\API\MarketingRecommendations',
				'Automattic\PooCommerce\Admin\API\MarketingChannels',
				'Automattic\PooCommerce\Admin\API\MarketingCampaigns',
				'Automattic\PooCommerce\Admin\API\MarketingCampaignTypes',
				'Automattic\PooCommerce\Admin\API\Options',
				'Automattic\PooCommerce\Admin\API\PaymentGatewaySuggestions',
				'Automattic\PooCommerce\Admin\API\Themes',
				'Automattic\PooCommerce\Admin\API\Plugins',
				'Automattic\PooCommerce\Admin\API\OnboardingFreeExtensions',
				'Automattic\PooCommerce\Admin\API\OnboardingProductTypes',
				'Automattic\PooCommerce\Admin\API\OnboardingProfile',
				'Automattic\PooCommerce\Admin\API\OnboardingTasks',
				'Automattic\PooCommerce\Admin\API\OnboardingThemes',
				'Automattic\PooCommerce\Admin\API\OnboardingPlugins',
				'Automattic\PooCommerce\Admin\API\OnboardingProducts',
				'Automattic\PooCommerce\Admin\API\MobileAppMagicLink',
				'Automattic\PooCommerce\Admin\API\ShippingPartnerSuggestions',
				'Automattic\PooCommerce\Admin\API\AI\StoreTitle',
				'Automattic\PooCommerce\Admin\API\AI\BusinessDescription',
				'Automattic\PooCommerce\Admin\API\AI\StoreInfo',
				'Automattic\PooCommerce\Admin\API\AI\Images',
				'Automattic\PooCommerce\Admin\API\AI\Patterns',
				'Automattic\PooCommerce\Admin\API\AI\Product',
			);
		}

		if ( Features::is_enabled( 'launch-your-store' ) ) {
			$controllers[] = 'Automattic\PooCommerce\Admin\API\LaunchYourStore';
		}

		if ( wc_rest_should_load_namespace( 'wc-analytics' ) ) {
			// Controllers in wc-analytics namespace, but loaded irrespective of analytics feature value.
			$analytic_mu_controllers = array(
				'Automattic\PooCommerce\Admin\API\Notes',
				'Automattic\PooCommerce\Admin\API\NoteActions',
				'Automattic\PooCommerce\Admin\API\Coupons',
				'Automattic\PooCommerce\Admin\API\Data',
				'Automattic\PooCommerce\Admin\API\DataCountries',
				'Automattic\PooCommerce\Admin\API\DataDownloadIPs',
				'Automattic\PooCommerce\Admin\API\Orders',
				'Automattic\PooCommerce\Admin\API\Products',
				'Automattic\PooCommerce\Admin\API\ProductAttributes',
				'Automattic\PooCommerce\Admin\API\ProductAttributeTerms',
				'Automattic\PooCommerce\Admin\API\ProductCategories',
				'Automattic\PooCommerce\Admin\API\ProductVariations',
				'Automattic\PooCommerce\Admin\API\ProductReviews',
				'Automattic\PooCommerce\Admin\API\ProductVariations',
				'Automattic\PooCommerce\Admin\API\ProductsLowInStock',
				'Automattic\PooCommerce\Admin\API\SettingOptions',
				'Automattic\PooCommerce\Admin\API\Taxes',
			);

			if ( Features::is_enabled( 'analytics' ) ) {
				$analytics_controllers = array(
					'Automattic\PooCommerce\Admin\API\Customers',
					'Automattic\PooCommerce\Admin\API\Leaderboards',
					'Automattic\PooCommerce\Admin\API\Reports\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Import\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Export\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Products\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Variations\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Products\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Variations\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Revenue\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Orders\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Orders\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Categories\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Taxes\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Taxes\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Coupons\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Coupons\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Stock\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Stock\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Downloads\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Downloads\Stats\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Customers\Controller',
					'Automattic\PooCommerce\Admin\API\Reports\Customers\Stats\Controller',
				);

				// The performance indicators controllerq must be registered last, after other /stats endpoints have been registered.
				$analytics_controllers[] = 'Automattic\PooCommerce\Admin\API\Reports\PerformanceIndicators\Controller';

				$analytics_controllers = array_merge( $analytics_controllers, $analytic_mu_controllers );
			}

			$controllers = array_merge( $controllers, $analytics_controllers, $analytic_mu_controllers );
		}

		/**
		 * Filter for the PooCommerce Admin REST controllers.
		 *
		 * @since 3.5.0
		 * @param array $controllers List of rest API controllers.
		 */
		$controllers = apply_filters( 'poocommerce_admin_rest_controllers', $controllers );

		foreach ( $controllers as $controller ) {
			$this->$controller = new $controller();
			$this->$controller->register_routes();
		}
	}

	/**
	 * Adds data stores.
	 *
	 * @internal
	 * @param array $data_stores List of data stores.
	 * @return array
	 */
	public static function add_data_stores( $data_stores ) {
		return array_merge(
			$data_stores,
			array(
				'report-revenue-stats'    => 'Automattic\PooCommerce\Admin\API\Reports\Orders\Stats\DataStore',
				'report-orders'           => 'Automattic\PooCommerce\Admin\API\Reports\Orders\DataStore',
				'report-orders-stats'     => 'Automattic\PooCommerce\Admin\API\Reports\Orders\Stats\DataStore',
				'report-products'         => 'Automattic\PooCommerce\Admin\API\Reports\Products\DataStore',
				'report-variations'       => 'Automattic\PooCommerce\Admin\API\Reports\Variations\DataStore',
				'report-products-stats'   => 'Automattic\PooCommerce\Admin\API\Reports\Products\Stats\DataStore',
				'report-variations-stats' => 'Automattic\PooCommerce\Admin\API\Reports\Variations\Stats\DataStore',
				'report-categories'       => 'Automattic\PooCommerce\Admin\API\Reports\Categories\DataStore',
				'report-taxes'            => 'Automattic\PooCommerce\Admin\API\Reports\Taxes\DataStore',
				'report-taxes-stats'      => 'Automattic\PooCommerce\Admin\API\Reports\Taxes\Stats\DataStore',
				'report-coupons'          => 'Automattic\PooCommerce\Admin\API\Reports\Coupons\DataStore',
				'report-coupons-stats'    => 'Automattic\PooCommerce\Admin\API\Reports\Coupons\Stats\DataStore',
				'report-downloads'        => 'Automattic\PooCommerce\Admin\API\Reports\Downloads\DataStore',
				'report-downloads-stats'  => 'Automattic\PooCommerce\Admin\API\Reports\Downloads\Stats\DataStore',
				'admin-note'              => 'Automattic\PooCommerce\Admin\Notes\DataStore',
				'report-customers'        => 'Automattic\PooCommerce\Admin\API\Reports\Customers\DataStore',
				'report-customers-stats'  => 'Automattic\PooCommerce\Admin\API\Reports\Customers\Stats\DataStore',
				'report-stock-stats'      => 'Automattic\PooCommerce\Admin\API\Reports\Stock\Stats\DataStore',
			)
		);
	}

	/**
	 * Add the currency symbol (in addition to currency code) to each Order
	 * object in REST API responses. For use in formatAmount().
	 *
	 * @internal
	 * @param WP_REST_Response $response REST response object.
	 * @returns WP_REST_Response
	 */
	public static function add_currency_symbol_to_order_response( $response ) {
		$response_data                    = $response->get_data();
		$currency_code                    = $response_data['currency'];
		$currency_symbol                  = get_poocommerce_currency_symbol( $currency_code );
		$response_data['currency_symbol'] = html_entity_decode( $currency_symbol );
		$response->set_data( $response_data );

		return $response;
	}
}
