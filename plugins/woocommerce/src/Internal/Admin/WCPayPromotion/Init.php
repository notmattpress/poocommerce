<?php
/**
 * Handles WooPayments promotion.
 */

namespace Automattic\PooCommerce\Internal\Admin\WCPayPromotion;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\Features\PaymentGatewaySuggestions\EvaluateSuggestion;
use Automattic\PooCommerce\Internal\Admin\WCAdminAssets;
use Automattic\PooCommerce\Admin\RemoteSpecs\RemoteSpecsEngine;
use Automattic\PooCommerce\Utilities\FeaturesUtil;

/**
 * WooPayments Promotion engine.
 *
 * @deprecated 9.9.0 The WooPayments promotion engine is deprecated and will be removed in a future version of PooCommerce.
 */
class Init extends RemoteSpecsEngine {

	/**
	 * Possibly registers the pre-install WooPayments promoted gateway.
	 *
	 * @param array $gateways List of gateway classes.
	 *
	 * @return array List of gateway classes.
	 */
	public static function possibly_register_pre_install_wc_pay_promotion_gateway( $gateways ) {
		if ( self::can_show_promotion() && ! WCPaymentGatewayPreInstallWCPayPromotion::is_dismissed() ) {
			$gateways[] = 'Automattic\PooCommerce\Internal\Admin\WCPayPromotion\WCPaymentGatewayPreInstallWCPayPromotion';
		}
		return $gateways;
	}

	/**
	 * Checks if promoted gateway can be registered.
	 *
	 * @return boolean If promoted gateway should be registered.
	 */
	public static function can_show_promotion() {
		// Don't show if WooPayments is enabled.
		if ( class_exists( '\WC_Payments' ) ) {
			return false;
		}

		// Don't show if there is no WooPayments promotion spec.
		$wc_pay_spec = self::get_wc_pay_promotion_spec();
		if ( ! $wc_pay_spec ) {
			return false;
		}

		return true;
	}

	/**
	 * By default, new payment gateways are put at the bottom of the list on the admin "Payments" settings screen.
	 * For visibility, we want WooPayments to be at the top of the list.
	 *
	 * @param array $ordering Existing ordering of the payment gateways.
	 *
	 * @return array Modified ordering.
	 */
	public static function set_gateway_top_of_list( $ordering ) {
		$ordering = (array) $ordering;
		$id       = WCPaymentGatewayPreInstallWCPayPromotion::GATEWAY_ID;
		// Only tweak the ordering if the list hasn't been reordered with WooPayments in it already.
		if ( ! isset( $ordering[ $id ] ) || ! is_numeric( $ordering[ $id ] ) ) {
			$is_empty        = empty( $ordering ) || ( count( $ordering ) === 1 && in_array( $ordering[0], array( false, '' ) ) );
			$ordering[ $id ] = $is_empty ? 0 : ( min( array_map( 'intval', $ordering ) ) - 1 );
		}

		return $ordering;
	}

	/**
	 * Get WooPayments promotion spec.
	 *
	 * @param boolean $fetch_from_remote Whether to fetch the spec from remote or not.
	 *
	 * @return object|false WooPayments promotion spec or false if there isn't one.
	 */
	public static function get_wc_pay_promotion_spec( $fetch_from_remote = true ) {
		$promotions            = $fetch_from_remote ? self::get_promotions() : self::get_cached_or_default_promotions();
		$wc_pay_promotion_spec = array_values(
			array_filter(
				$promotions,
				function ( $promotion ) {
					return isset( $promotion->plugins ) && in_array( 'poocommerce-payments', $promotion->plugins, true );
				}
			)
		);

		return current( $wc_pay_promotion_spec );
	}

	/**
	 * Go through the specs and run them.
	 *
	 * @return array List of promotions.
	 */
	public static function get_promotions() {
		$locale = get_user_locale();

		$specs           = self::get_specs();
		$results         = EvaluateSuggestion::evaluate_specs( $specs, array( 'source' => 'wc-wcpay-promotions' ) );
		$specs_to_return = $results['suggestions'];
		$specs_to_save   = null;

		if ( empty( $specs_to_return ) ) {
			// When specs are empty, replace it with defaults and save for 3 hours.
			$specs_to_save   = DefaultPromotions::get_all();
			$specs_to_return = EvaluateSuggestion::evaluate_specs( $specs_to_save )['suggestions'];
		} elseif ( count( $results['errors'] ) > 0 ) {
			// When specs are not empty but have errors, save for 3 hours.
			$specs_to_save = $specs;
		}

		if ( count( $results['errors'] ) > 0 ) {
			self::log_errors( $results['errors'] );
		}

		if ( $specs_to_save ) {
			WCPayPromotionDataSourcePoller::get_instance()->set_specs_transient( array( $locale => $specs_to_save ), 3 * HOUR_IN_SECONDS );
		}

		return $specs_to_return;
	}

	/**
	 * Gets either cached or default promotions.
	 *
	 * @return array
	 */
	public static function get_cached_or_default_promotions() {
		$specs = 'no' === get_option( 'poocommerce_show_marketplace_suggestions', 'yes' )
			? DefaultPromotions::get_all()
			: WCPayPromotionDataSourcePoller::get_instance()->get_cached_specs();

		if ( ! is_array( $specs ) || 0 === count( $specs ) ) {
			$specs = DefaultPromotions::get_all();
		}
		$results = EvaluateSuggestion::evaluate_specs( $specs, array( 'source' => 'wc-wcpay-promotions' ) );
		return $results['suggestions'];
	}

	/**
	 * Get merchant WooPay eligibility.
	 *
	 * @return boolean If merchant is eligible for WooPay.
	 */
	public static function is_woopay_eligible() {
		$wcpay_promotion = self::get_wc_pay_promotion_spec( false );

		return $wcpay_promotion && 'poocommerce_payments:woopay' === $wcpay_promotion->id;
	}

	/**
	 * Delete the specs transient.
	 */
	public static function delete_specs_transient() {
		WCPayPromotionDataSourcePoller::get_instance()->delete_specs_transient();
	}

	/**
	 * Get specs or fetch remotely if they don't exist.
	 *
	 * @return array List of specs.
	 */
	public static function get_specs() {
		if ( get_option( 'poocommerce_show_marketplace_suggestions', 'yes' ) === 'no' ) {
			return DefaultPromotions::get_all();
		}

		$specs = WCPayPromotionDataSourcePoller::get_instance()->get_specs_from_data_sources();
		// On empty remote specs, fallback to default ones.
		if ( ! is_array( $specs ) || 0 === count( $specs ) ) {
			$specs = DefaultPromotions::get_all();
		}

		return $specs;
	}

	/**
	 * Loads the payment method promotions scripts and styles.
	 */
	public static function load_payment_method_promotions() {
		WCAdminAssets::register_style( 'payment-method-promotions', 'style', array( 'wp-components' ) );
		WCAdminAssets::register_script( 'wp-admin-scripts', 'payment-method-promotions', true );
	}
}
