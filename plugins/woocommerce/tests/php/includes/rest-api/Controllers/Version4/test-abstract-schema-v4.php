<?php
declare(strict_types=1);

/**
 * Test implementation of AbstractSchema for testing purposes.
 */
class Test_Abstract_Schema_V4 extends Automattic\PooCommerce\RestApi\Routes\V4\AbstractSchema {

	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'test_resource';

	/**
	 * Return all properties for the item schema.
	 *
	 * @return array
	 */
	public static function get_item_schema_properties(): array {
		return array(
			'id'           => array(
				'description' => __( 'Unique identifier.', 'poocommerce' ),
				'type'        => 'integer',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
			'name'         => array(
				'description' => __( 'Resource name.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'required'    => true,
			),
			'status'       => array(
				'description' => __( 'Resource status.', 'poocommerce' ),
				'type'        => 'string',
				'enum'        => array( 'active', 'inactive' ),
				'context'     => self::VIEW_EDIT_CONTEXT,
			),
			'date_created' => array(
				'description' => __( 'Creation date.', 'poocommerce' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => self::VIEW_EDIT_CONTEXT,
				'readonly'    => true,
			),
		);
	}
}
