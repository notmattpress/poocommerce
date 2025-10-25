<?php
/**
 * Class WC_Mock_Payment_Gateway
 *
 * @package PooCommerce\Tests\Framework
 */

use Automattic\PooCommerce\Enums\PaymentGatewayFeature;

/**
 * Class WC_Mock_Payment_Gateway
 */
class WC_Mock_Payment_Gateway extends WC_Payment_Gateway {
	/**
	 * Constructor for the gateway.
	 */
	public function __construct() {
		$this->enabled            = 'yes';
		$this->id                 = 'mock';
		$this->has_fields         = false;
		$this->order_button_text  = __( 'Proceed to PayPal', 'poocommerce' );
		$this->method_title       = 'Mock Gateway';
		$this->method_description = 'Mock Gateway for unit tests';
		$this->pay_button_id      = 'mock-pay-button';
		$this->supports           = array(
			PaymentGatewayFeature::PRODUCTS,
			PaymentGatewayFeature::PAY_BUTTON,
		);

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();
	}

	/**
	 * Initialise Gateway Settings Form Fields.
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'enabled' => array(
				'title'   => '',
				'type'    => 'checkbox',
				'label'   => '',
				'default' => 'yes',
			),
		);
	}
}

