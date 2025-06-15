<?php
/**
 * Class WC_Gateway_Cheque file.
 *
 * @package PooCommerce\Gateways
 */

use Automattic\PooCommerce\Enums\OrderStatus;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Cheque Payment Gateway.
 *
 * Provides a Cheque Payment Gateway, mainly for testing purposes.
 *
 * @class       WC_Gateway_Cheque
 * @extends     WC_Payment_Gateway
 * @version     2.1.0
 * @package     PooCommerce\Classes\Payment
 */
class WC_Gateway_Cheque extends WC_Payment_Gateway {

	/**
	 * Unique ID for this gateway.
	 *
	 * @var string
	 */
	const ID = 'cheque';

	/**
	 * Gateway instructions that will be added to the thank you page and emails.
	 *
	 * @var string
	 */
	public $instructions;

	/**
	 * Constructor for the gateway.
	 */
	public function __construct() {
		$this->id                 = self::ID;
		$this->icon               = apply_filters( 'poocommerce_cheque_icon', '' );
		$this->has_fields         = false;
		$this->method_title       = _x( 'Check payments', 'Check payment method', 'poocommerce' );
		$this->method_description = __( 'Take payments in person via checks. This offline gateway can also be useful to test purchases.', 'poocommerce' );

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();

		// Define user set variables.
		$this->title        = $this->get_option( 'title' );
		$this->description  = $this->get_option( 'description' );
		$this->instructions = $this->get_option( 'instructions' );

		// Actions.
		add_action( 'poocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'poocommerce_thankyou_cheque', array( $this, 'thankyou_page' ) );

		// Customer Emails.
		add_action( 'poocommerce_email_before_order_table', array( $this, 'email_instructions' ), 10, 3 );
	}

	/**
	 * Initialise Gateway Settings Form Fields.
	 */
	public function init_form_fields() {

		$this->form_fields = array(
			'enabled'      => array(
				'title'   => __( 'Enable/Disable', 'poocommerce' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable check payments', 'poocommerce' ),
				'default' => 'no',
			),
			'title'        => array(
				'title'       => __( 'Title', 'poocommerce' ),
				'type'        => 'safe_text',
				'description' => __( 'This controls the title which the user sees during checkout.', 'poocommerce' ),
				'default'     => _x( 'Check payments', 'Check payment method', 'poocommerce' ),
				'desc_tip'    => true,
			),
			'description'  => array(
				'title'       => __( 'Description', 'poocommerce' ),
				'type'        => 'textarea',
				'description' => __( 'Payment method description that the customer will see on your checkout.', 'poocommerce' ),
				'default'     => __( 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.', 'poocommerce' ),
				'desc_tip'    => true,
			),
			'instructions' => array(
				'title'       => __( 'Instructions', 'poocommerce' ),
				'type'        => 'textarea',
				'description' => __( 'Instructions that will be added to the thank you page and emails.', 'poocommerce' ),
				'default'     => '',
				'desc_tip'    => true,
			),
		);
	}

	/**
	 * Output for the order received page.
	 */
	public function thankyou_page() {
		if ( $this->instructions ) {
			echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
		}
	}

	/**
	 * Add content to the WC emails.
	 *
	 * @access public
	 * @param WC_Order $order Order object.
	 * @param bool     $sent_to_admin Sent to admin.
	 * @param bool     $plain_text Email format: plain text or HTML.
	 */
	public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
		if ( $this->instructions && ! $sent_to_admin && self::ID === $order->get_payment_method() ) {
			/**
			 * Filter the email instructions order status.
			 *
			 * @since 7.4
			 *
			 * @param string $status The default status.
			 * @param object $order  The order object.
			 */
			$instructions_order_status = apply_filters( 'poocommerce_cheque_email_instructions_order_status', OrderStatus::ON_HOLD, $order );
			if ( $order->has_status( $instructions_order_status ) ) {
				echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) . PHP_EOL );
			}
		}
	}

	/**
	 * Process the payment and return the result.
	 *
	 * @param int $order_id Order ID.
	 * @return array
	 */
	public function process_payment( $order_id ) {

		$order = wc_get_order( $order_id );

		if ( $order->get_total() > 0 ) {
			/**
			 * Filter the order status for cheque payment.
			 *
			 * @since 3.6.0
			 *
			 * @param string $status The default status.
			 * @param object $order  The order object.
			 */
			$process_payment_status = apply_filters( 'poocommerce_cheque_process_payment_order_status', OrderStatus::ON_HOLD, $order );
			// Mark as on-hold (we're awaiting the cheque).
			$order->update_status( $process_payment_status, _x( 'Awaiting check payment', 'Check payment method', 'poocommerce' ) );
		} else {
			$order->payment_complete();
		}

		// Remove cart.
		WC()->cart->empty_cart();

		// Return thankyou redirect.
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}
}
