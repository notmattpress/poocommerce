<?php

namespace Automattic\PooCommerce\Admin\Features\OnboardingTasks\Tasks;

use Automattic\PooCommerce\Admin\API\Reports\Taxes\Stats\DataStore as TaxDataStore;
use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Task;
use Automattic\PooCommerce\Admin\PluginsHelper;
use Automattic\PooCommerce\Internal\Admin\WCAdminAssets;

/**
 * Tax Task
 */
class Tax extends Task {

	private const TAX_RATE_EXISTS_CACHE_KEY = 'poocommerce_onboarding_task_tax_rates_exist';

	/**
	 * Used to cache is_complete() method result.
	 *
	 * @var null
	 */
	private $is_complete_result = null;

	/**
	 * Constructor
	 *
	 * @param TaskList $task_list Parent task list.
	 */
	public function __construct( $task_list ) {
		parent::__construct( $task_list );
		add_action( 'admin_enqueue_scripts', array( $this, 'possibly_add_return_notice_script' ) );
		add_action( 'poocommerce_tax_rate_added', array( $this, 'on_tax_rate_added' ) );
		add_action( 'poocommerce_tax_rate_deleted', array( $this, 'on_tax_rate_deleted' ) );
	}

	/**
	 * Adds a return to task list notice when completing the task.
	 */
	public function possibly_add_return_notice_script() {
		$page = isset( $_GET['page'] ) ? $_GET['page'] : ''; // phpcs:ignore csrf ok, sanitization ok.
		$tab  = isset( $_GET['tab'] ) ? $_GET['tab'] : ''; // phpcs:ignore csrf ok, sanitization ok.

		if ( $page !== 'wc-settings' || $tab !== 'tax' ) {
			return;
		}

		if ( ! $this->is_active() || $this->is_complete() ) {
			return;
		}

		WCAdminAssets::register_script( 'wp-admin-scripts', 'onboarding-tax-notice', true );
	}

	/**
	 * ID.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'tax';
	}

	/**
	 * Title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Collect sales tax', 'poocommerce' );
	}

	/**
	 * Content.
	 *
	 * @return string
	 */
	public function get_content() {
		return self::can_use_automated_taxes()
			? __(
				'Good news! PooCommerce Tax can automate your sales tax calculations for you.',
				'poocommerce'
			)
			: __(
				'Set your store location and configure tax rate settings.',
				'poocommerce'
			);
	}

	/**
	 * Time.
	 *
	 * @return string
	 */
	public function get_time() {
		return __( '1 minute', 'poocommerce' );
	}

	/**
	 * Action label.
	 *
	 * @return string
	 */
	public function get_action_label() {
		return self::can_use_automated_taxes()
			? __( 'Yes please', 'poocommerce' )
			: __( "Let's go", 'poocommerce' );
	}

	/**
	 * Task completion.
	 *
	 * @return bool
	 */
	public function is_complete() {
		if ( $this->is_complete_result === null ) {
			$wc_connect_taxes_enabled    = get_option( 'wc_connect_taxes_enabled' );
			$is_wc_connect_taxes_enabled = ( $wc_connect_taxes_enabled === 'yes' ) || ( $wc_connect_taxes_enabled === true ); // seems that in some places boolean is used, and other places 'yes' | 'no' is used

			// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment -- We will replace this with a formal system by WC 9.6 so lets not advertise it yet.
			$third_party_complete = apply_filters( 'poocommerce_admin_third_party_tax_setup_complete', false );

			/**
			 * Ideally we would check against `wc_tax_enabled()` instead of `false !== get_option( 'poocommerce_no_sales_tax' )`,
			 * however, tax is disabled by default making this task complete by default if we use it.  If we change taxes
			 * to be enabled by default in the future, this can be updated to check against `wc_tax_enabled()` which is
			 * more accurate for this evaluation.
			 */
			$this->is_complete_result = $is_wc_connect_taxes_enabled ||
				$third_party_complete ||
				false !== get_option( 'poocommerce_no_sales_tax' ) ||
				$this->has_existing_tax_rates();
		}

		return $this->is_complete_result;
	}

	/**
	 * Determines if a tax rate exists in the database.  Result is indefinitely cached.
	 *
	 * @return bool
	 */
	private function has_existing_tax_rates() {
		global $wpdb;
		$has_existing_tax_rates = wp_cache_get( self::TAX_RATE_EXISTS_CACHE_KEY );
		if ( false === $has_existing_tax_rates ) {
			$rate_exists            = (bool) $wpdb->get_var( "SELECT 1 FROM {$wpdb->prefix}poocommerce_tax_rates limit 1" );
			$has_existing_tax_rates = $rate_exists ? 'yes' : 'no';
			wp_cache_set( self::TAX_RATE_EXISTS_CACHE_KEY, $has_existing_tax_rates );
		}

		return 'yes' === $has_existing_tax_rates;
	}

	/**
	 * Marks the task as actioned any time a tax rate has been added. Called from the `poocommerce_tax_rate_added` hook.
	 *
	 * @return void
	 */
	public function on_tax_rate_added() {
		$this->mark_actioned();
		wp_cache_set( self::TAX_RATE_EXISTS_CACHE_KEY, 'yes' );
	}

	/**
	 * Clears the tax rate exists cache when a tax rate is deleted. Called from the `poocommerce_tax_rate_added` hook.
	 *
	 * @return void
	 */
	public function on_tax_rate_deleted() {
		wp_cache_delete( self::TAX_RATE_EXISTS_CACHE_KEY );
	}

	/**
	 * Additional data.
	 *
	 * @return array
	 */
	public function get_additional_data() {
		return array(
			'avalara_activated'              => PluginsHelper::is_plugin_active( 'poocommerce-avatax' ),
			'tax_jar_activated'              => class_exists( 'WC_Taxjar' ),
			'stripe_tax_activated'           => PluginsHelper::is_plugin_active( 'stripe-tax-for-poocommerce' ),
			'poocommerce_tax_activated'      => PluginsHelper::is_plugin_active( 'poocommerce-tax' ),
			'poocommerce_shipping_activated' => PluginsHelper::is_plugin_active( 'poocommerce-shipping' ),
			'poocommerce_tax_countries'      => self::get_automated_support_countries(),
			'stripe_tax_countries'           => self::get_stripe_tax_support_countries(),
		);
	}

	/**
	 * Check if the store has any enabled gateways.
	 *
	 * @return bool
	 */
	public static function can_use_automated_taxes() {
		if ( ! class_exists( 'WC_Taxjar' ) ) {
			return false;
		}

		return in_array( WC()->countries->get_base_country(), self::get_automated_support_countries(), true );
	}

	/**
	 * Get an array of countries that support automated tax.
	 *
	 * @return array
	 */
	public static function get_automated_support_countries() {
		// https://developers.taxjar.com/api/reference/#countries .
		$tax_supported_countries = array_merge(
			array( 'US', 'CA', 'AU', 'GB' ),
			WC()->countries->get_european_union_countries()
		);

		return $tax_supported_countries;
	}

	/**
	 * Get an array of countries that support Stripe tax.
	 *
	 * @return array
	 */
	private static function get_stripe_tax_support_countries() {
		// https://docs.stripe.com/tax/supported-countries#supported-countries accurate as of 2024-08-26.
		// countries with remote sales not included.
		return array(
			'AU',
			'AT',
			'BE',
			'BG',
			'CA',
			'HR',
			'CY',
			'CZ',
			'DK',
			'EE',
			'FI',
			'FR',
			'DE',
			'GR',
			'HK',
			'HU',
			'IE',
			'IT',
			'JP',
			'LV',
			'LT',
			'LU',
			'MT',
			'NL',
			'NZ',
			'NO',
			'PL',
			'PT',
			'RO',
			'SG',
			'SK',
			'SI',
			'ES',
			'SE',
			'CH',
			'AE',
			'GB',
			'US',
		);
	}
}
