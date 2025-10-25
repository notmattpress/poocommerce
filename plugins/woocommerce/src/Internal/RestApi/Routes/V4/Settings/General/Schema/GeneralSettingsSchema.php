<?php
/**
 * GeneralSettingsSchema class.
 *
 * @package PooCommerce\RestApi
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\RestApi\Routes\V4\Settings\General\Schema;

use Automattic\PooCommerce\Internal\RestApi\Routes\V4\AbstractSchema;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * GeneralSettingsSchema class.
 */
class GeneralSettingsSchema extends AbstractSchema {
	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'general_settings';

	/**
	 * Return all properties for the item schema.
	 *
	 * @return array
	 */
	public function get_item_schema_properties(): array {
		return array(
			'id'          => array(
				'description' => __( 'Unique identifier for the settings group.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'title'       => array(
				'description' => __( 'Settings title.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'description' => array(
				'description' => __( 'Settings description.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'values'      => array(
				'description'          => __( 'Flat key-value mapping of all setting field values.', 'poocommerce' ),
				'type'                 => 'object',
				'context'              => self::VIEW_EDIT_CONTEXT,
				'additionalProperties' => array(
					'description' => __( 'Setting field value.', 'poocommerce' ),
					'type'        => array( 'string', 'number', 'array', 'boolean' ),
				),
			),
			'groups'      => array(
				'description'          => __( 'Collection of setting groups.', 'poocommerce' ),
				'type'                 => 'object',
				'context'              => self::VIEW_EDIT_CONTEXT,
				'additionalProperties' => array(
					'type'        => 'object',
					'description' => __( 'Settings group.', 'poocommerce' ),
					'properties'  => array(
						'title'       => array(
							'description' => __( 'Group title.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => self::VIEW_EDIT_CONTEXT,
						),
						'description' => array(
							'description' => __( 'Group description.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => self::VIEW_EDIT_CONTEXT,
						),
						'order'       => array(
							'description' => __( 'Display order for the group.', 'poocommerce' ),
							'type'        => 'integer',
							'context'     => self::VIEW_EDIT_CONTEXT,
							'readonly'    => true,
						),
						'fields'      => array(
							'description' => __( 'Settings fields.', 'poocommerce' ),
							'type'        => 'array',
							'context'     => self::VIEW_EDIT_CONTEXT,
							'items'       => $this->get_field_schema(),
						),
					),
				),
			),
		);
	}

	/**
	 * Get the schema for individual setting fields.
	 *
	 * @return array
	 */
	private function get_field_schema(): array {
		return array(
			'type'       => 'object',
			'properties' => array(
				'id'      => array(
					'description' => __( 'Setting field ID.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => self::VIEW_EDIT_CONTEXT,
				),
				'label'   => array(
					'description' => __( 'Setting field label.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => self::VIEW_EDIT_CONTEXT,
				),
				'type'    => array(
					'description' => __( 'Setting field type.', 'poocommerce' ),
					'type'        => 'string',
					'enum'        => array( 'text', 'number', 'select', 'multiselect', 'checkbox' ),
					'context'     => self::VIEW_EDIT_CONTEXT,
				),
				'options' => array(
					'description' => __( 'Available options for select/multiselect fields.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => self::VIEW_EDIT_CONTEXT,
				),
				'desc'    => array(
					'description' => __( 'Description for the setting field.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => self::VIEW_EDIT_CONTEXT,
				),
			),
		);
	}

	/**
	 * Get general settings data by transforming raw settings into REST API format.
	 *
	 * @param mixed           $item             Raw settings array.
	 * @param WP_REST_Request $request          Request object.
	 * @param array           $include_fields   Fields to include.
	 * @return array
	 */
	public function get_item_response( $item, WP_REST_Request $request, array $include_fields = array() ): array {
		$raw_settings = $item;

		// Transform raw settings into grouped format based on title/sectionend markers.
		$groups           = array();
		$values           = array();
		$current_group    = null;
		$current_group_id = null;

		foreach ( $raw_settings as $setting ) {
			$setting_type = $setting['type'] ?? '';

			// Handle section titles - start of a new group.
			if ( 'title' === $setting_type ) {
				$current_group_id = $setting['id'] ?? '';
				$current_group    = array(
					'title'       => $setting['title'] ?? '',
					'description' => $setting['desc'] ?? '',
					'order'       => isset( $setting['order'] ) ? (int) $setting['order'] : 999,
					'fields'      => array(),
				);
				continue;
			}

			// Handle section ends - save the current group.
			if ( 'sectionend' === $setting_type ) {
				if ( $current_group && $current_group_id ) {
					$groups[ $current_group_id ] = $current_group;
				}
				$current_group    = null;
				$current_group_id = null;
				continue;
			}

			// Skip title and sectionend types.
			if ( in_array( $setting_type, array( 'title', 'sectionend' ), true ) ) {
				continue;
			}

			// Convert setting to field format.
			if ( isset( $setting['id'] ) && $current_group ) {
				$field = $this->transform_setting_to_field( $setting );
				if ( $field ) {
					$current_group['fields'][] = $field;
					// Add field value to the flat values array.
					$raw_value              = get_option( $field['id'], $setting['default'] ?? '' );
					$values[ $field['id'] ] = $this->validate_field_value( $raw_value, $field['type'] );
				}
			}
		}

		// Sort groups by their order if available.
		uasort(
			$groups,
			function ( $a, $b ) {
				$a_order = $a['order'] ?? 999;
				$b_order = $b['order'] ?? 999;
				return $a_order - $b_order;
			}
		);

		$response = array(
			'id'          => 'general',
			'title'       => __( 'General', 'poocommerce' ),
			'description' => __( 'Set your store\'s address, visibility, currency, language, and timezone.', 'poocommerce' ),
			'values'      => $values,
			'groups'      => $groups,
		);

		if ( ! empty( $include_fields ) ) {
			$response = array_intersect_key( $response, array_flip( $include_fields ) );
		}

		return $response;
	}

	/**
	 * Transform a PooCommerce setting into REST API field format.
	 *
	 * @param array $setting PooCommerce setting array.
	 * @return array|null Transformed field or null if should be skipped.
	 */
	private function transform_setting_to_field( array $setting ): ?array {
		$setting_id   = $setting['id'] ?? '';
		$setting_type = $setting['type'] ?? 'text';

		$field = array(
			'id'    => $setting_id,
			'label' => $setting['title'] ?? $setting_id,
			'type'  => $this->normalize_field_type( $setting_type ),
			'desc'  => $setting['desc'] ?? '',
		);

		// Add options for select fields.
		if ( isset( $setting['options'] ) && is_array( $setting['options'] ) ) {
			$field['options'] = $setting['options'];
		} else {
			// Generate options for special field types.
			$field['options'] = $this->get_field_options( $setting_id );
		}

		return $field;
	}

	/**
	 * Get options for specific field types.
	 *
	 * @param string $field_id Field ID.
	 * @return array Field options.
	 */
	private function get_field_options( string $field_id ): array {
		switch ( $field_id ) {
			case 'poocommerce_currency':
				if ( ! function_exists( 'get_poocommerce_currencies' ) || ! function_exists( 'get_poocommerce_currency_symbol' ) ) {
					return array();
				}

				$currencies = get_poocommerce_currencies();
				$options    = array();

				foreach ( $currencies as $code => $name ) {
					$label            = wp_specialchars_decode( (string) $name );
					$symbol           = wp_specialchars_decode( (string) get_poocommerce_currency_symbol( $code ) );
					$options[ $code ] = $label . ' (' . $symbol . ') — ' . $code;
				}

				return $options;

			case 'poocommerce_default_country':
			case 'poocommerce_specific_allowed_countries':
			case 'poocommerce_specific_ship_to_countries':
				if ( ! function_exists( 'WC' ) ) {
					return array();
				}

				$countries = WC()->countries->get_countries();
				$states    = WC()->countries->get_states();
				$options   = array();

				foreach ( $countries as $country_code => $country_name ) {
					$country_states = $states[ $country_code ] ?? array();

					if ( empty( $country_states ) ) {
						$options[ $country_code ] = $country_name;
					} else {
						foreach ( $country_states as $state_code => $state_name ) {
							$options[ $country_code . ':' . $state_code ] = $country_name . ' — ' . $state_name;
						}
					}
				}

				return $options;
		}

		return array();
	}

	/**
	 * Normalize PooCommerce field types to REST API field types.
	 *
	 * @param string $wc_type PooCommerce field type.
	 * @return string Normalized field type.
	 */
	private function normalize_field_type( string $wc_type ): string {
		$type_map = array(
			'single_select_country'  => 'select',
			'multi_select_countries' => 'multiselect',
		);

		return $type_map[ $wc_type ] ?? $wc_type;
	}

	/**
	 * Validate and sanitize field value based on its type.
	 *
	 * @param mixed  $value Field value.
	 * @param string $type  Field type.
	 * @return mixed Validated value.
	 */
	private function validate_field_value( $value, string $type ) {
		switch ( $type ) {
			case 'number':
				return is_numeric( $value ) ? (float) $value : 0;
			case 'checkbox':
				if ( function_exists( 'wc_string_to_bool' ) ) {
					return wc_string_to_bool( $value );
				}
				if ( is_bool( $value ) ) {
					return $value;
				}
				return filter_var( $value, FILTER_VALIDATE_BOOLEAN );
			case 'multiselect':
				return is_array( $value ) ? $value : array();
			case 'text':
			case 'select':
			default:
				return is_string( $value ) ? $value : (string) $value;
		}
	}
}
