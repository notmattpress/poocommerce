<?php
declare(strict_types=1);
/**
 * Plugin Name: PooCommerce Blocks Test Additional Checkout Fields
 * Description: Adds custom checkout fields to the checkout form.
 * Plugin URI: https://github.com/poocommerce/poocommerce
 * Author: PooCommerce
 * @package poocommerce-blocks-test-additional-checkout-fields
 */
class Additional_Checkout_Fields_Test_Helper {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'enable_custom_checkout_fields' ) );
		add_action( 'plugins_loaded', array( $this, 'disable_custom_checkout_fields' ) );
		add_action( 'poocommerce_loaded', array( $this, 'register_custom_checkout_fields' ) );
	}

	/**
	 * @var string Define option name to decide if additional fields should be turned on.
	 */
	private string $additional_checkout_fields_option_name = 'poocommerce_additional_checkout_fields';

	/**
	 * Define URL endpoint for enabling additional checkout fields.
	 */
	public function enable_custom_checkout_fields(): void {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['enable_custom_checkout_fields'] ) ) {
			update_option( $this->additional_checkout_fields_option_name, 'yes' );
			echo 'Enabled custom checkout fields';
		}
	}
	/**
	 * Define URL endpoint for disabling additional checkout fields.
	 */
	public function disable_custom_checkout_fields(): void {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['disable_custom_checkout_fields'] ) ) {
			update_option( $this->additional_checkout_fields_option_name, 'no' );
			echo 'Disabled custom checkout fields';
		}
	}

	/**
	 * Registers custom checkout fields for the PooCommerce checkout form.
	 *
	 * @return void
	 * @throws Exception If there is an error during the registration of the checkout fields.
	 */
	public function register_custom_checkout_fields(): void {
		// Address fields, checkbox, textbox, select.
		poocommerce_register_additional_checkout_field(
			array(
				'id'                => 'first-plugin-namespace/government-ID',
				'label'             => 'Government ID',
				'location'          => 'address',
				'type'              => 'text',
				'required'          => true,
				'sanitize_callback' => function ( $field_value ) {
					return str_replace( ' ', '', $field_value );
				},
				'validate_callback' => function ( $field_value ) {
					$match = preg_match( '/^[0-9]{5}$/', $field_value );
					if ( 0 === $match || false === $match ) {
						return new \WP_Error( 'invalid_government_id', 'Invalid government ID.' );
					}
				},
			),
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'                => 'first-plugin-namespace/confirm-government-ID',
				'label'             => 'Confirm government ID',
				'location'          => 'address',
				'type'              => 'text',
				'required'          => true,
				'sanitize_callback' => function ( $field_value ) {
					return str_replace( ' ', '', $field_value );
				},
				'validate_callback' => function ( $field_value ) {
					$match = preg_match( '/^[0-9]{5}$/', $field_value );
					if ( 0 === $match || false === $match ) {
						return new \WP_Error( 'invalid_government_id', 'Invalid government ID.' );
					}
				},
			),
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'first-plugin-namespace/truck-size-ok',
				'label'    => 'Can a truck fit down your road?',
				'location' => 'address',
				'type'     => 'checkbox',
			)
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'                => 'plugin-namespace/alt-email',
				'label'             => 'Alternative Email',
				'location'          => 'contact',
				'type'              => 'text',
				'required'          => true,
				'validate_callback' => function ( $field_value ) {
					if ( ! is_email( $field_value ) ) {
						return new \WP_Error( 'invalid_alt_email', 'Please ensure your alternative email matches the correct format.' );
					}
				},
			)
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'first-plugin-namespace/shipping-insurance',
				'label'    => 'Add shipping insurance',
				'location' => 'order',
				'type'     => 'checkbox',
				'hidden'   => array(
					'type'       => 'object',
					'properties' => array(
						'cart' => array(
							'properties' => array(
								'totals' => array(
									'properties' => array(
										'total_price' => array(
											'maximum' => 4000,
										),
									),
								),
							),
						),
					),

				),
				'required' => array( // Intentionally passing an unwrapped rule set.
					'cart' => array(
						'properties' => array(
							'totals' => array(
								'properties' => array(
									'total_price' => array(
										'minimum' => 5900,
									),
								),
							),

						),
					),
				),
			)
		);

		// Field with validation schema.
		poocommerce_register_additional_checkout_field(
			array(
				'id'         => 'first-plugin-namespace/vat-number',
				'label'      => 'VAT Number',
				'location'   => 'address',
				'type'       => 'text',
				'validation' => array(
					'type'         => 'string',
					'pattern'      => '^[A-Z]{2}[0-9]{8,12}$',
					'errorMessage' => 'Please enter a valid VAT number (country code + 8-12 digits)',
				),
			)
		);

		poocommerce_register_additional_checkout_field(
			array(
				'id'            => 'first-plugin-namespace/test-required-checkbox',
				'label'         => 'Test required checkbox',
				'location'      => 'contact',
				'required'      => true,
				'type'          => 'checkbox',
				'error_message' => 'Please check the box or you will be unable to order',
			)
		);

		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'first-plugin-namespace/road-size',
				'label'    => 'How wide is your road?',
				'location' => 'address',
				'type'     => 'select',
				'options'  => array(
					array(
						'label' => 'Wide',
						'value' => 'wide',
					),
					array(
						'label' => 'Super wide',
						'value' => 'super-wide',
					),
					array(
						'label' => 'Narrow',
						'value' => 'narrow',
					),
				),
			)
		);

		// Fake sanitization function that removes full stops from the Government ID string.
		add_filter(
			'poocommerce_sanitize_additional_field',
			function ( $field_value, $field_key ) {
				if ( 'first-plugin-namespace/government-ID' === $field_key ) {
					$field_value = str_replace( '.', '', $field_value );
				}
				return $field_value;
			},
			10,
			2
		);

		add_action(
			'poocommerce_validate_additional_field',
			function ( WP_Error $errors, $field_key, $field_value ) {
				if ( 'first-plugin-namespace/government-ID' === $field_key || 'first-plugin-namespace/confirm-government-ID' === $field_key ) {
					$match = preg_match( '/[A-Z0-9]{5}/', $field_value );
					if ( 0 === $match || false === $match ) {
						$errors->add( 'invalid_gov_id', 'Please ensure your government ID matches the correct format.' );
					}
				}

				if ( 'plugin-namespace/alt-email' === $field_key ) {
					if ( ! is_email( $field_value ) ) {
						$errors->add( 'invalid_alt_email', 'Please ensure your alternative email matches the correct format.' );
					}
				}
			},
			10,
			4
		);

		add_action(
			'poocommerce_blocks_validate_location_address_fields',
			function ( \WP_Error $errors, $fields, $group ) {
				if ( $fields['first-plugin-namespace/government-ID'] !== $fields['first-plugin-namespace/confirm-government-ID'] ) {
					$errors->add( 'gov_id_mismatch', 'Please ensure your government ID matches the confirmation.' );
				}
			},
			10,
			3
		);

		// Contact fields, one checkbox, select, and text input.
		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'second-plugin-namespace/marketing-opt-in',
				'label'    => 'Do you want to subscribe to our newsletter?',
				'location' => 'contact',
				'type'     => 'checkbox',
			)
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'second-plugin-namespace/gift-message-in-package',
				'label'    => 'Enter a gift message to include in the package',
				'location' => 'contact',
				'type'     => 'text',
			)
		);
		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'second-plugin-namespace/type-of-purchase',
				'label'    => 'Is this a personal purchase or a business purchase?',
				'location' => 'contact',
				'required' => true,
				'type'     => 'select',
				'options'  => array(
					array(
						'label' => 'Personal',
						'value' => 'personal',
					),
					array(
						'label' => 'Business',
						'value' => 'business',
					),
				),
			)
		);

		// A field of each type in additional information section.

		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'third-plugin-namespace/please-send-me-a-free-gift',
				'label'    => 'Would you like a free gift with your order?',
				'location' => 'order',
				'type'     => 'checkbox',
			)
		);

		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'third-plugin-namespace/what-is-your-favourite-colour',
				'label'    => 'What is your favourite colour?',
				'location' => 'order',
				'type'     => 'text',
			)
		);

		poocommerce_register_additional_checkout_field(
			array(
				'id'       => 'third-plugin-namespace/how-did-you-hear-about-us',
				'label'    => 'How did you hear about us?',
				'location' => 'order',
				'type'     => 'select',
				'options'  => array(
					array(
						'value' => 'google',
						'label' => 'Google',
					),
					array(
						'value' => 'facebook',
						'label' => 'Facebook',
					),
					array(
						'value' => 'friend',
						'label' => 'From a friend',
					),
					array(
						'value' => 'other',
						'label' => 'Other',
					),
				),
			)
		);
	}
}

new Additional_Checkout_Fields_Test_Helper();
