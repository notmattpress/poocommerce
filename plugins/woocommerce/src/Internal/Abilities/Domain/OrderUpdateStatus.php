<?php
/**
 * Order update status ability definition file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities\Domain;

use Automattic\PooCommerce\Abilities\AbilityDefinition;
use Automattic\PooCommerce\Internal\Abilities\Domain\Traits\OrderAbilityTrait;
use Automattic\PooCommerce\Utilities\OrderUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the PooCommerce order update status ability.
 */
class OrderUpdateStatus extends AbstractDomainAbility implements AbilityDefinition {

	use OrderAbilityTrait;

	/**
	 * Get the ability name.
	 *
	 * @return string
	 *
	 * @since 10.9.0
	 */
	public static function get_name(): string {
		return 'poocommerce/order-update-status';
	}

	/**
	 * Get the ability registration arguments.
	 *
	 * @return array
	 *
	 * @since 10.9.0
	 */
	public static function get_registration_args(): array {
		return array(
			'label'               => __( 'Update order status', 'poocommerce' ),
			'description'         => __(
				'Update an order status.',
				'poocommerce'
			),
			'category'            => 'poocommerce',
			'input_schema'        => self::get_input_schema(),
			'output_schema'       => self::get_entity_output_schema( 'order', self::get_order_output_schema() ),
			'execute_callback'    => array( __CLASS__, 'execute' ),
			'permission_callback' => array( __CLASS__, 'can_edit_order' ),
			'meta'                => array(
				'show_in_rest' => true,
				'mcp'          => array(
					'public' => true,
					'type'   => 'tool',
				),
				'annotations'  => array(
					'readonly'    => false,
					'idempotent'  => false,
					'destructive' => true,
				),
			),
		);
	}

	/**
	 * Update an order status.
	 *
	 * @param array $input Ability input.
	 * @return array|\WP_Error
	 *
	 * @since 10.9.0
	 */
	public static function execute( array $input ) {
		$order = self::get_order_from_input( $input );

		if ( is_wp_error( $order ) ) {
			return $order;
		}

		if ( empty( $input['status'] ) ) {
			return new \WP_Error(
				'poocommerce_order_status_required',
				__( 'Order status is required.', 'poocommerce' ),
				array( 'status' => 400 )
			);
		}

		$status = OrderUtil::remove_status_prefix( sanitize_key( $input['status'] ) );

		if ( ! in_array( $status, self::get_allowed_order_status_slugs(), true ) ) {
			return new \WP_Error(
				'poocommerce_order_status_invalid',
				__( 'Order status is invalid.', 'poocommerce' ),
				array( 'status' => 400 )
			);
		}

		if ( $status === $order->get_status() ) {
			return new \WP_Error(
				'poocommerce_order_status_unchanged',
				__(
					'Order already has this status. Use the poocommerce/order-add-note ability to add a note without changing status.',
					'poocommerce'
				),
				array( 'status' => 400 )
			);
		}

		$updated = $order->update_status(
			$status,
			isset( $input['note'] ) ? wp_kses_post( $input['note'] ) : '',
			true
		);

		if ( ! $updated ) {
			return new \WP_Error(
				'poocommerce_order_status_update_failed',
				__( 'Failed to update order status.', 'poocommerce' ),
				array( 'status' => 500 )
			);
		}

		return array(
			'order' => self::format_order_for_response( $order, false ),
		);
	}

	/**
	 * Get the ability input schema.
	 *
	 * @return array
	 */
	private static function get_input_schema(): array {
		return array(
			'type'                 => 'object',
			'properties'           => array(
				'id'     => array(
					'type'    => 'integer',
					'minimum' => 1,
				),
				'status' => array(
					'type'        => 'string',
					'description' => __( 'Order status slug without the wc- prefix.', 'poocommerce' ),
					'enum'        => self::get_allowed_order_status_slugs(),
				),
				'note'   => array(
					'type'        => 'string',
					'description' => __( 'Optional status change note. Safe HTML is allowed. Use the poocommerce/order-add-note ability for notes without a status change.', 'poocommerce' ),
				),
			),
			'required'             => array( 'id', 'status' ),
			'additionalProperties' => false,
		);
	}
}
