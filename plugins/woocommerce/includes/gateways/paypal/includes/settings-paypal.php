<?php
/**
 * Settings for PayPal Standard Gateway.
 *
 * @package PooCommerce\Classes\Payment
 */

use Automattic\PooCommerce\Utilities\LoggingUtil;

defined( 'ABSPATH' ) || exit;

return array(
	'enabled'               => array(
		'title'   => __( 'Enable/Disable', 'poocommerce' ),
		'type'    => 'checkbox',
		'label'   => __( 'Enable PayPal Standard', 'poocommerce' ),
		'default' => 'no',
	),
	'title'                 => array(
		'title'       => __( 'Title', 'poocommerce' ),
		'type'        => 'safe_text',
		'description' => __( 'This controls the title which the user sees during checkout.', 'poocommerce' ),
		'default'     => __( 'PayPal', 'poocommerce' ),
		'desc_tip'    => true,
	),
	'description'           => array(
		'title'       => __( 'Description', 'poocommerce' ),
		'type'        => 'text',
		'desc_tip'    => true,
		'description' => __( 'This controls the description which the user sees during checkout.', 'poocommerce' ),
		'default'     => __( "Pay via PayPal; you can pay with your credit card if you don't have a PayPal account.", 'poocommerce' ),
	),
	'email'                 => array(
		'title'       => __( 'PayPal email', 'poocommerce' ),
		'type'        => 'email',
		'description' => __( 'Please enter your PayPal email address; this is needed in order to take payment.', 'poocommerce' ),
		'default'     => get_option( 'admin_email' ),
		'desc_tip'    => true,
		'placeholder' => 'you@youremail.com',
	),
	'advanced'              => array(
		'title'       => __( 'Advanced options', 'poocommerce' ),
		'type'        => 'title',
		'description' => '',
	),
	'testmode'              => array(
		'title'       => __( 'PayPal sandbox', 'poocommerce' ),
		'type'        => 'checkbox',
		'label'       => __( 'Enable PayPal sandbox', 'poocommerce' ),
		'default'     => 'no',
		/* translators: %s: URL */
		'description' => sprintf( __( 'PayPal sandbox can be used to test payments. Sign up for a <a href="%s">developer account</a>.', 'poocommerce' ), 'https://developer.paypal.com/' ),
	),
	'debug'                 => array(
		'title'       => __( 'Debug log', 'poocommerce' ),
		'type'        => 'checkbox',
		'label'       => __( 'Enable logging', 'poocommerce' ),
		'default'     => 'no',
		/* translators: %s: URL */
		'description' => sprintf(
			// translators: %s is a placeholder for a URL.
			__( 'Log PayPal events such as IPN requests and review them on the <a href="%s">Logs screen</a>. Note: this may log personal information. We recommend using this for debugging purposes only and deleting the logs when finished.', 'poocommerce' ),
			esc_url( LoggingUtil::get_logs_tab_url() )
		),
	),
	'ipn_notification'      => array(
		'title'       => __( 'IPN email notifications', 'poocommerce' ),
		'type'        => 'checkbox',
		'label'       => __( 'Enable IPN email notifications', 'poocommerce' ),
		'default'     => 'yes',
		'description' => __( 'Send notifications when an IPN is received from PayPal indicating refunds, chargebacks and cancellations.', 'poocommerce' ),
	),
	'receiver_email'        => array(
		'title'       => __( 'Receiver email', 'poocommerce' ),
		'type'        => 'email',
		'description' => __( 'If your main PayPal email differs from the PayPal email entered above, input your main receiver email for your PayPal account here. This is used to validate IPN requests.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => 'you@youremail.com',
	),
	'identity_token'        => array(
		'title'       => __( 'PayPal identity token', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Optionally enable "Payment Data Transfer" (Profile > Profile and Settings > My Selling Tools > Website Preferences) and then copy your identity token here. This will allow payments to be verified without the need for PayPal IPN.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => '',
	),
	'invoice_prefix'        => array(
		'title'       => __( 'Invoice prefix', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Please enter a prefix for your invoice numbers. If you use your PayPal account for multiple stores ensure this prefix is unique as PayPal will not allow orders with the same invoice number.', 'poocommerce' ),
		'default'     => 'WC-',
		'desc_tip'    => true,
	),
	'send_shipping'         => array(
		'title'       => __( 'Shipping details', 'poocommerce' ),
		'type'        => 'checkbox',
		'label'       => __( 'Send shipping details to PayPal instead of billing.', 'poocommerce' ),
		'description' => __( 'PayPal allows us to send one address. If you are using PayPal for shipping labels you may prefer to send the shipping address rather than billing. Turning this option off may prevent PayPal Seller protection from applying.', 'poocommerce' ),
		'default'     => 'yes',
	),
	'address_override'      => array(
		'title'       => __( 'Address override', 'poocommerce' ),
		'type'        => 'checkbox',
		'label'       => __( 'Enable "address_override" to prevent address information from being changed.', 'poocommerce' ),
		'description' => __( 'PayPal verifies addresses therefore this setting can cause errors (we recommend keeping it disabled).', 'poocommerce' ),
		'default'     => 'no',
	),
	'paymentaction'         => array(
		'title'       => __( 'Payment action', 'poocommerce' ),
		'type'        => 'select',
		'class'       => 'wc-enhanced-select',
		'description' => __( 'Choose whether you wish to capture funds immediately or authorize payment only.', 'poocommerce' ),
		'default'     => 'sale',
		'desc_tip'    => true,
		'options'     => array(
			'sale'          => __( 'Capture', 'poocommerce' ),
			'authorization' => __( 'Authorize', 'poocommerce' ),
		),
	),
	'image_url'             => array(
		'title'       => __( 'Image url', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Optionally enter the URL to a 150x50px image displayed as your logo in the upper left corner of the PayPal checkout pages.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'api_details'           => array(
		'title'       => __( 'API credentials', 'poocommerce' ),
		'type'        => 'title',
		/* translators: %s: URL */
		'description' => sprintf( __( 'Enter your PayPal API credentials to process refunds via PayPal. Learn how to access your <a href="%s">PayPal API Credentials</a>.', 'poocommerce' ), 'https://developer.paypal.com/webapps/developer/docs/classic/api/apiCredentials/#create-an-api-signature' ),
	),
	'api_username'          => array(
		'title'       => __( 'Live API username', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'api_password'          => array(
		'title'       => __( 'Live API password', 'poocommerce' ),
		'type'        => 'password',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'api_signature'         => array(
		'title'       => __( 'Live API signature', 'poocommerce' ),
		'type'        => 'password',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'sandbox_api_username'  => array(
		'title'       => __( 'Sandbox API username', 'poocommerce' ),
		'type'        => 'text',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'sandbox_api_password'  => array(
		'title'       => __( 'Sandbox API password', 'poocommerce' ),
		'type'        => 'password',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
	'sandbox_api_signature' => array(
		'title'       => __( 'Sandbox API signature', 'poocommerce' ),
		'type'        => 'password',
		'description' => __( 'Get your API credentials from PayPal.', 'poocommerce' ),
		'default'     => '',
		'desc_tip'    => true,
		'placeholder' => __( 'Optional', 'poocommerce' ),
	),
);
