<?php
/**
 * OfflinePaymentMethodSchema class.
 *
 * @package PooCommerce\RestApi
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\RestApi\Routes\V4\OfflinePaymentMethods;

use Automattic\PooCommerce\RestApi\Routes\V4\AbstractSchema;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * OfflinePaymentMethodSchema class.
 */
class OfflinePaymentMethodSchema extends AbstractSchema {
	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'offline_payment_method';

	/**
	 * Return all properties for the item schema.
	 *
	 * @return array
	 */
	public function get_item_schema_properties(): array {
		return array(
			'id'          => array(
				'description' => __( 'The unique identifier for the provider.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'_order'      => array(
				'description' => __( 'The sort order of the provider.', 'poocommerce' ),
				'type'        => 'integer',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'_type'       => array(
				'description' => __( 'The type of payment provider. Use this to differentiate between the various items in the list and determine their intended use.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'title'       => array(
				'description' => __( 'The title of the provider.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'description' => array(
				'description' => __( 'The description of the provider.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'supports'    => array(
				'description' => __( 'Supported features for this provider.', 'poocommerce' ),
				'type'        => 'array',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'items'       => array(
					'type' => 'string',
				),
			),
			'plugin'      => array(
				'description' => __( 'The corresponding plugin details of the provider.', 'poocommerce' ),
				'type'        => 'object',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'properties'  => array(
					'_type'  => array(
						'description' => __( 'The type of the containing entity. Generally this is a regular plugin but it can also be a non-standard entity like a theme or a must-user plugin.', 'poocommerce' ),
						'type'        => 'string',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'slug'   => array(
						'description' => __( 'The slug of the containing entity.', 'poocommerce' ),
						'type'        => 'string',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'file'   => array(
						'description' => __( 'The plugin main file. This is a relative path to the plugins directory.', 'poocommerce' ),
						'type'        => 'string',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'status' => array(
						'description' => __( 'The status of the containing entity.', 'poocommerce' ),
						'type'        => 'string',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
				),
			),
			'image'       => array(
				'description' => __( 'The URL of the provider image.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'format'      => 'uri',
				'readonly'    => true,
			),
			'icon'        => array(
				'description' => __( 'The URL of the provider icon (square aspect ratio - 72px by 72px).', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'format'      => 'uri',
				'readonly'    => true,
			),
			'links'       => array(
				'description' => __( 'Links for the provider.', 'poocommerce' ),
				'type'        => 'array',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'_type' => array(
							'description' => __( 'The type of the link.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => self::VIEW_EDIT_CONTEXT,
							'readonly'    => true,
						),
						'url'   => array(
							'description' => __( 'The URL of the link.', 'poocommerce' ),
							'type'        => 'string',
							'format'      => 'uri',
							'context'     => self::VIEW_EDIT_CONTEXT,
							'readonly'    => true,
						),
					),
				),
			),
			'state'       => array(
				'description' => __( 'The general state of the provider with regards to its payments processing.', 'poocommerce' ),
				'type'        => 'object',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'properties'  => array(
					'enabled'           => array(
						'description' => __( 'Whether the provider is enabled for use on checkout.', 'poocommerce' ),
						'type'        => 'boolean',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'account_connected' => array(
						'description' => __( 'Whether the provider has a payments processing account connected.', 'poocommerce' ),
						'type'        => 'boolean',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'needs_setup'       => array(
						'description' => __( 'Whether the provider needs setup.', 'poocommerce' ),
						'type'        => 'boolean',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'test_mode'         => array(
						'description' => __( 'Whether the provider is in test mode for payments processing.', 'poocommerce' ),
						'type'        => 'boolean',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'dev_mode'          => array(
						'description' => __( 'Whether the provider is in dev mode. Having this true usually leads to forcing test payments.', 'poocommerce' ),
						'type'        => 'boolean',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
				),
			),
			'management'  => array(
				'description' => __( 'Management-related details for the provider.', 'poocommerce' ),
				'type'        => 'object',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'properties'  => array(
					'_links' => array(
						'description' => __( 'Management-related links for the provider.', 'poocommerce' ),
						'type'        => 'object',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
						'properties'  => array(
							'settings' => array(
								'description' => __( 'The link to the settings page for the payment gateway.', 'poocommerce' ),
								'type'        => 'object',
								'context'     => self::VIEW_EDIT_CONTEXT,
								'readonly'    => true,
								'properties'  => array(
									'href' => array(
										'description' => __( 'The URL to the settings page for the payment gateway.', 'poocommerce' ),
										'type'        => 'string',
										'format'      => 'uri',
										'context'     => self::VIEW_EDIT_CONTEXT,
										'readonly'    => true,
									),
								),
							),
						),
					),
				),
			),
			'onboarding'  => array(
				'description' => __( 'Onboarding-related details for the provider.', 'poocommerce' ),
				'type'        => 'object',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
				'properties'  => array(
					'type'   => array(
						'description' => __( 'The type of onboarding process the provider supports.', 'poocommerce' ),
						'type'        => 'string',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
					),
					'state'  => array(
						'description' => __( 'The state of the onboarding process.', 'poocommerce' ),
						'type'        => 'object',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
						'properties'  => array(
							'started'   => array(
								'description' => __( 'Whether onboarding has been started.', 'poocommerce' ),
								'type'        => 'boolean',
								'context'     => self::VIEW_EDIT_CONTEXT,
								'readonly'    => true,
							),
							'completed' => array(
								'description' => __( 'Whether onboarding has been completed.', 'poocommerce' ),
								'type'        => 'boolean',
								'context'     => self::VIEW_EDIT_CONTEXT,
								'readonly'    => true,
							),
							'test_mode' => array(
								'description' => __( 'Whether the provider is in test mode onboarding.', 'poocommerce' ),
								'type'        => 'boolean',
								'context'     => self::VIEW_EDIT_CONTEXT,
								'readonly'    => true,
							),
						),
					),
					'_links' => array(
						'description' => __( 'Onboarding-related links for the provider.', 'poocommerce' ),
						'type'        => 'object',
						'context'     => self::VIEW_EDIT_CONTEXT,
						'readonly'    => true,
						'properties'  => array(
							'onboard' => array(
								'description' => __( 'The link to start onboarding.', 'poocommerce' ),
								'type'        => 'object',
								'context'     => self::VIEW_EDIT_CONTEXT,
								'readonly'    => true,
								'properties'  => array(
									'href' => array(
										'description' => __( 'The URL to start onboarding.', 'poocommerce' ),
										'type'        => 'string',
										'format'      => 'uri',
										'context'     => self::VIEW_EDIT_CONTEXT,
										'readonly'    => true,
									),
								),
							),
						),
					),
				),
			),
		);
	}

	/**
	 * Get the item response.
	 *
	 * @param mixed           $item Payment method data array.
	 * @param WP_REST_Request $request Request object.
	 * @param array           $include_fields Fields to include in the response.
	 * @return array The item response.
	 */
	public function get_item_response( $item, WP_REST_Request $request, array $include_fields = array() ): array {
		$response = $this->filter_item_by_schema( (array) $item, $this->get_item_schema_properties() );

		if ( ! empty( $include_fields ) ) {
			$response = array_intersect_key( $response, array_flip( $include_fields ) );
		}

		return $response;
	}

	/**
	 * Recursively filter an item by the given schema properties.
	 *
	 * @param array $item       Data to filter.
	 * @param array $properties Schema properties (name => schema).
	 * @return array
	 */
	private function filter_item_by_schema( array $item, array $properties ): array {
		// Early return for empty data.
		if ( empty( $item ) || empty( $properties ) ) {
			return isset( $item['_links'] ) ? array( '_links' => $item['_links'] ) : array();
		}

		$filtered = array();

		foreach ( $properties as $key => $prop_schema ) {
			if ( ! array_key_exists( $key, $item ) ) {
				continue;
			}

			$value = $item[ $key ];

			// Cache common checks.
			$is_array_value = is_array( $value );
			$has_properties = isset( $prop_schema['properties'] ) && is_array( $prop_schema['properties'] );

			// Object with defined properties.
			if ( $is_array_value && $has_properties ) {
				$filtered[ $key ] = $this->filter_item_by_schema( $value, $prop_schema['properties'] );
				continue;
			}

			// Array of objects with defined item properties.
			if ( $is_array_value &&
				( $prop_schema['type'] ?? null ) === 'array' &&
				isset( $prop_schema['items']['properties'] ) &&
				is_array( $prop_schema['items']['properties'] ) ) {

				$item_properties  = $prop_schema['items']['properties'];
				$filtered[ $key ] = array_map(
					function ( $row ) use ( $item_properties ) {
						return is_array( $row ) ? $this->filter_item_by_schema( $row, $item_properties ) : $row;
					},
					$value
				);
				continue;
			}

			$filtered[ $key ] = $value;
		}

		// Preserve _links added by WP REST API framework.
		if ( isset( $item['_links'] ) ) {
			$filtered['_links'] = $item['_links'];
		}

		return $filtered;
	}
}
