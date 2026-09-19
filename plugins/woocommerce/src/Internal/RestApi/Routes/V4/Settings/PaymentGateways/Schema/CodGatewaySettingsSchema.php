<?php
/**
 * CodGatewaySettingsSchema class.
 *
 * @package PooCommerce\RestApi
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\RestApi\Routes\V4\Settings\PaymentGateways\Schema;

defined( 'ABSPATH' ) || exit;

use WC_Payment_Gateway;

/**
 * CodGatewaySettingsSchema class.
 *
 * Extends AbstractPaymentGatewaySettingsSchema for Cash on Delivery payment gateway
 * with design-aligned field labels and descriptions.
 */
class CodGatewaySettingsSchema extends AbstractPaymentGatewaySettingsSchema {

	/**
	 * Get custom groups for the COD gateway.
	 *
	 * Provides design-aligned labels and descriptions for the cash on delivery
	 * settings form fields. Derives fields from the gateway's form_fields
	 * to preserve any extension-injected settings.
	 *
	 * @param WC_Payment_Gateway $gateway Gateway instance.
	 * @return array Custom group structure.
	 */
	protected function get_custom_groups_for_gateway( WC_Payment_Gateway $gateway ): array {
		// Design-aligned overrides for core fields.
		$core_field_overrides = array(
			'enabled'      => array(
				'label' => __( 'Enable/Disable', 'poocommerce' ),
				'type'  => 'checkbox',
				'desc'  => __( 'Enable Cash on delivery at checkout', 'poocommerce' ),
			),
			'title'        => array(
				'label' => __( 'Checkout label', 'poocommerce' ),
				'type'  => 'text',
				'desc'  => __( 'Shown to customers on the payment methods list at checkout.', 'poocommerce' ),
			),
			'description'  => array(
				'label' => __( 'Checkout instructions', 'poocommerce' ),
				'type'  => 'text',
				'desc'  => __( 'Shown below the checkout label.', 'poocommerce' ),
			),
			'order'        => array(
				'label' => __( 'Order', 'poocommerce' ),
				'type'  => 'number',
				'desc'  => __( 'Determines the display order of payment gateways during checkout.', 'poocommerce' ),
			),
			'instructions' => array(
				'label' => __( 'Order confirmation instructions', 'poocommerce' ),
				'type'  => 'text',
				'desc'  => __( 'Shown on the order confirmation page and in order emails.', 'poocommerce' ),
			),
		);

		$core_field_overrides = array_merge( $core_field_overrides, $this->get_shipping_method_restriction_field_overrides( $gateway ) );

		$fields = $this->build_fields_from_form_fields( $gateway, $core_field_overrides );

		$group = array(
			'title'       => __( 'Cash on delivery settings', 'poocommerce' ),
			'description' => __( 'Manage how Cash on delivery appears at checkout and in order emails.', 'poocommerce' ),
			'order'       => 1,
			'fields'      => $fields,
		);

		return array( 'settings' => $group );
	}
}
