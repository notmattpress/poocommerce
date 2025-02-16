<?php
namespace Automattic\PooCommerce\StoreApi\Schemas\V1;

/**
 * ProductAttributeSchema class.
 */
class ProductAttributeSchema extends AbstractSchema {
	/**
	 * The schema item name.
	 *
	 * @var string
	 */
	protected $title = 'product_attribute';

	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'product-attribute';

	/**
	 * Term properties.
	 *
	 * @return array
	 */
	public function get_properties() {
		return [
			'id'           => array(
				'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'         => array(
				'description' => __( 'Attribute name.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'taxonomy'     => array(
				'description' => __( 'The attribute taxonomy name.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'type'         => array(
				'description' => __( 'Attribute type.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'order'        => array(
				'description' => __( 'How terms in this attribute are sorted by default.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'has_archives' => array(
				'description' => __( 'If this attribute has term archive pages.', 'poocommerce' ),
				'type'        => 'boolean',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'count'        => array(
				'description' => __( 'Number of terms in the attribute taxonomy.', 'poocommerce' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		];
	}

	/**
	 * Convert an attribute object into an object suitable for the response.
	 *
	 * @param object $attribute Attribute object.
	 * @return array
	 */
	public function get_item_response( $attribute ) {
		return [
			'id'           => (int) $attribute->id,
			'name'         => $this->prepare_html_response( $attribute->name ),
			'taxonomy'     => $attribute->slug,
			'type'         => $attribute->type,
			'order'        => $attribute->order_by,
			'has_archives' => $attribute->has_archives,
			'count'        => (int) \wp_count_terms( $attribute->slug ),
		];
	}
}
