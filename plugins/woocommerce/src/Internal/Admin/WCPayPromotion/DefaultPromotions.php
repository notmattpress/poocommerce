<?php
/**
 * Gets a list of fallback promotions if remote fetching is disabled.
 */

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\Admin\WCPayPromotion;

use Automattic\PooCommerce\Admin\Features\PaymentGatewaySuggestions\DefaultPaymentGateways;

defined( 'ABSPATH' ) || exit;

/**
 * Default Promotions
 */
class DefaultPromotions {

	/**
	 * Get the specs.
	 *
	 * @return array Suggestion specs.
	 */
	public static function get_all(): array {
		return array(
			array(
				'id'         => 'poocommerce_payments:woopay',
				'title'      => __( 'WooPayments', 'poocommerce' ),
				'content'    => __( 'Payments made simple — including WooPay, a new express checkout feature.', 'poocommerce' ),
				'image'      => plugins_url( 'assets/images/onboarding/wcpay.svg', WC_PLUGIN_FILE ),
				'plugins'    => array( 'poocommerce-payments' ),
				'is_visible' => array(
					DefaultPaymentGateways::get_rules_for_cbd( false ),
					DefaultPaymentGateways::get_rules_for_countries( self::get_woopay_available_countries() ),
				),
				'sub_title'  => self::get_wcpay_payment_icons(),
			),
			array(
				'id'         => 'poocommerce_payments',
				'title'      => __( 'WooPayments', 'poocommerce' ),
				'content'    => __( 'Payments made simple, with no monthly fees – designed exclusively for PooCommerce stores. Accept credit cards, debit cards, and other popular payment methods.', 'poocommerce' ),
				'image'      => plugins_url( 'assets/images/onboarding/wcpay.svg', WC_PLUGIN_FILE ),
				'plugins'    => array( 'poocommerce-payments' ),
				'is_visible' => array(
					DefaultPaymentGateways::get_rules_for_cbd( false ),
					DefaultPaymentGateways::get_rules_for_countries( DefaultPaymentGateways::get_wcpay_countries() ),
				),
				'sub_title'  => self::get_wcpay_payment_icons(),
			),
		);
	}

	/**
	 * Get the list of WooPay available countries.
	 *
	 * @return array The list of WooPay available countries.
	 */
	private static function get_woopay_available_countries(): array {
		return array( 'US' );
	}

	/**
	 * Get the list of payment icons as HTML img tags.
	 *
	 * @return string Payment icons as HTML img tags.
	 */
	private static function get_wcpay_payment_icons(): string {
		$icons              = array(
			'visa',
			'mastercard',
			'amex',
			'googlepay',
			'applepay',
		);
		$convert_to_img_tag = function ( $icon ) {
			return sprintf(
				'<img class="wcpay-%s-icon wcpay-icon" src="%s" alt="%s">',
				$icon,
				plugins_url( "assets/images/payment-methods/$icon.svg", WC_PLUGIN_FILE ),
				ucfirst( $icon )
			);
		};

		return implode( '', array_map( $convert_to_img_tag, $icons ) );
	}
}
