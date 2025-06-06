<?php
/**
 * REST API WC Payment gateways controller
 *
 * Handles requests to the /payment_gateways endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   3.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Payment gateways controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Payment_Gateways_V2_Controller
 */
class WC_REST_Payment_Gateways_Controller extends WC_REST_Payment_Gateways_V2_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';

	/**
	 * Prepare a payment gateway for response.
	 *
	 * @param  WC_Payment_Gateway $gateway    Payment gateway object.
	 * @param  WP_REST_Request    $request    Request object.
	 * @return WP_REST_Response   $response   Response data.
	 */
	public function prepare_item_for_response( $gateway, $request ) {
		$order = (array) get_option( 'poocommerce_gateway_order' );
		$item  = array(
			'id'                 => $gateway->id,
			'title'              => $gateway->title,
			'description'        => $gateway->description,
			'order'              => isset( $order[ $gateway->id ] ) ? $order[ $gateway->id ] : '',
			'enabled'            => ( 'yes' === $gateway->enabled ),
			'method_title'       => $gateway->get_method_title(),
			'method_description' => $gateway->get_method_description(),
			'method_supports'    => $gateway->supports,
			'settings'           => $this->get_settings( $gateway ),
		);

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $item, $request );
		$data    = $this->filter_response_by_context( $data, $context );

		$response = rest_ensure_response( $data );
		$response->add_links( $this->prepare_links( $gateway, $request ) );

		/**
		 * Filter payment gateway objects returned from the REST API.
		 *
		 * @param WP_REST_Response   $response The response object.
		 * @param WC_Payment_Gateway $gateway  Payment gateway object.
		 * @param WP_REST_Request    $request  Request object.
		 */
		return apply_filters( 'poocommerce_rest_prepare_payment_gateway', $response, $gateway, $request );
	}

	/**
	 * Return settings associated with this payment gateway.
	 *
	 * @param WC_Payment_Gateway $gateway Gateway instance.
	 *
	 * @return array
	 */
	public function get_settings( $gateway ) {
		$settings = array();
		$gateway->init_form_fields();
		foreach ( $gateway->form_fields as $id => $field ) {
			// Make sure we at least have a title and type.
			if ( empty( $field['title'] ) || empty( $field['type'] ) ) {
				continue;
			}

			// Ignore 'enabled' and 'description' which get included elsewhere.
			if ( in_array( $id, array( 'enabled', 'description' ), true ) ) {
				continue;
			}

			$data = array(
				'id'          => $id,
				'label'       => empty( $field['label'] ) ? $field['title'] : $field['label'],
				'description' => empty( $field['description'] ) ? '' : $field['description'],
				'type'        => $field['type'],
				'value'       => empty( $gateway->settings[ $id ] ) ? '' : $gateway->settings[ $id ],
				'default'     => empty( $field['default'] ) ? '' : $field['default'],
				'tip'         => empty( $field['description'] ) ? '' : $field['description'],
				'placeholder' => empty( $field['placeholder'] ) ? '' : $field['placeholder'],
			);
			if ( ! empty( $field['options'] ) ) {
				$data['options'] = $field['options'];
			}
			$settings[ $id ] = $data;
		}
		return $settings;
	}

	/**
	 * Get the payment gateway schema, conforming to JSON Schema.
	 *
	 * @return array
	 */
	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'payment_gateway',
			'type'       => 'object',
			'properties' => array(
				'id'                 => array(
					'description' => __( 'Payment gateway ID.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'title'              => array(
					'description' => __( 'Payment gateway title on checkout.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'description'        => array(
					'description' => __( 'Payment gateway description on checkout.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'order'              => array(
					'description' => __( 'Payment gateway sort order.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'arg_options' => array(
						'sanitize_callback' => 'absint',
					),
				),
				'enabled'            => array(
					'description' => __( 'Payment gateway enabled status.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
				),
				'method_title'       => array(
					'description' => __( 'Payment gateway method title.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'method_description' => array(
					'description' => __( 'Payment gateway method description.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'method_supports'    => array(
					'description' => __( 'Supported features for this payment gateway.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
					'items'       => array(
						'type' => 'string',
					),
				),
				'settings'           => array(
					'description' => __( 'Payment gateway settings.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'properties'  => array(
						'id'          => array(
							'description' => __( 'A unique identifier for the setting.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'label'       => array(
							'description' => __( 'A human readable label for the setting used in interfaces.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'description' => array(
							'description' => __( 'A human readable description for the setting used in interfaces.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'type'        => array(
							'description' => __( 'Type of setting.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'enum'        => array( 'text', 'email', 'number', 'color', 'password', 'textarea', 'select', 'multiselect', 'radio', 'image_width', 'checkbox' ),
							'readonly'    => true,
						),
						'value'       => array(
							'description' => __( 'Setting value.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'default'     => array(
							'description' => __( 'Default value for the setting.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'tip'         => array(
							'description' => __( 'Additional help text shown to the user about the setting.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'placeholder' => array(
							'description' => __( 'Placeholder text to be displayed in text inputs.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
					),
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}

	/**
	 * Validate multiselect based settings (with support for nested options).
	 *
	 * @param array|string $values  The submitted values.
	 * @param array        $setting The field settings.
	 * @return array|WP_Error
	 */
	public function validate_setting_multiselect_field( $values, $setting ) {
		if ( empty( $values ) ) {
			return array();
		}

		if ( ! is_array( $values ) ) {
			return new WP_Error( 'rest_setting_value_invalid', __( 'An invalid setting value was passed.', 'poocommerce' ), array( 'status' => 400 ) );
		}

		$valid_keys = $this->flatten_options_keys( $setting['options'] );

		$final_values = array();
		foreach ( $values as $value ) {
			if ( in_array( $value, $valid_keys, true ) ) {
				$final_values[] = $value;
			}
		}

		return $final_values;
	}

	/**
	 * Helper: Recursively flatten option keys.
	 *
	 * @param array $options Nested options array.
	 * @return array Flat list of valid keys.
	 */
	private function flatten_options_keys( array $options ): array {
		$keys = array();

		foreach ( $options as $key => $value ) {
			if ( is_array( $value ) ) {
				$keys = array_merge( $keys, $this->flatten_options_keys( $value ) );
			} else {
				$keys[] = $key;
			}
		}

		return $keys;
	}
}
