<?php
/**
 * ShippingZoneSchema class.
 *
 * @package PooCommerce\RestApi
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\RestApi\Routes\V4\ShippingZones;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\RestApi\Routes\V4\AbstractSchema;

/**
 * ShippingZoneSchema class.
 */
class ShippingZoneSchema extends AbstractSchema {
	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'shipping_zone';

	/**
	 * Return all properties for the item schema.
	 *
	 * @return array
	 */
	public static function get_item_schema_properties(): array {
		$schema = array(
			'id'        => array(
				'description' => __( 'Unique identifier for the shipping zone.', 'poocommerce' ),
				'type'        => 'integer',
				'readonly'    => true,
			),
			'name'      => array(
				'description' => __( 'Shipping zone name.', 'poocommerce' ),
				'type'        => 'string',
				'readonly'    => true,
			),
			'order'     => array(
				'description' => __( 'Shipping zone order.', 'poocommerce' ),
				'type'        => 'integer',
				'readonly'    => true,
			),
			'locations' => array(
				'description' => __( 'Array of location names for this zone.', 'poocommerce' ),
				'type'        => 'array',
				'readonly'    => true,
				'items'       => array(
					'type' => 'string',
				),
			),
			'methods'   => array(
				'description' => __( 'Shipping methods for this zone.', 'poocommerce' ),
				'type'        => 'array',
				'readonly'    => true,
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'instance_id' => array(
							'description' => __( 'Shipping method instance ID.', 'poocommerce' ),
							'type'        => 'integer',
						),
						'title'       => array(
							'description' => __( 'Shipping method title.', 'poocommerce' ),
							'type'        => 'string',
						),
						'enabled'     => array(
							'description' => __( 'Whether the shipping method is enabled.', 'poocommerce' ),
							'type'        => 'boolean',
						),
						'method_id'   => array(
							'description' => __( 'Shipping method ID (e.g., flat_rate, free_shipping).', 'poocommerce' ),
							'type'        => 'string',
						),
						'settings'    => array(
							'description' => __( 'Raw shipping method settings for frontend processing.', 'poocommerce' ),
							'type'        => 'object',
						),
					),
				),
			),
		);

		return $schema;
	}

	/**
	 * Get the schema.
	 *
	 * @return array
	 */
	public function get_schema(): array {
		return self::get_item_schema();
	}
}
