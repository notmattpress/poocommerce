<?php
/**
 * Coupon create ability definition file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities\Domain;

use Automattic\PooCommerce\Abilities\ActionableAbility;
use Automattic\PooCommerce\Internal\Abilities\Domain\Traits\DomainAbilityHelpers;
use Automattic\PooCommerce\Internal\Abilities\Domain\Traits\CouponAbilityTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the PooCommerce coupon create ability.
 */
class CouponCreate extends ActionableAbility {

	use CouponAbilityTrait;
	use DomainAbilityHelpers;

	/** Ability name. */
	public const ABILITY_NAME = 'poocommerce/coupon-create';

	/**
	 * Get the ability registration arguments.
	 *
	 * @return array
	 *
	 * @since 11.4.0
	 */
	public static function get_registration_args(): array {
		return array(
			'label'               => __( 'Create coupon', 'poocommerce' ),
			'description'         => __(
				'Create a coupon. Defaults to a published fixed cart discount. Requires publication permission even for drafts, matching PooCommerce REST.',
				'poocommerce'
			),
			'category'            => 'poocommerce',
			'input_schema'        => self::build_input_schema(),
			'output_schema'       => self::get_entity_output_schema( 'coupon', self::get_coupon_output_schema() ),
			'permission_callback' => array( __CLASS__, 'can_create_coupon' ),
			'meta'                => array(
				'show_in_rest' => true,
				'mcp'          => array(
					'public' => true,
					'type'   => 'tool',
				),
				'annotations'  => array(
					'readonly'    => false,
					'idempotent'  => false,
					'destructive' => false,
				),
			),
		);
	}

	/**
	 * Resource being changed.
	 *
	 * @return string
	 */
	public function get_resource(): string {
		return 'coupon';
	}

	/**
	 * Load the coupon without saving.
	 *
	 * @param array $input Ability input.
	 * @return \WC_Coupon|\WP_Error
	 */
	protected function load( array $input ) {
		return new \WC_Coupon();
	}

	/**
	 * Change coupon fields in memory.
	 *
	 * @param \WC_Coupon $subject Coupon.
	 * @param array      $input Ability input.
	 * @return null|\WP_Error
	 */
	protected function change( $subject, array $input ) {
		$subject->set_status( $input['status'] ?? 'publish' );
		$result = self::set_coupon_props_from_input( $subject, $input );
		return is_wp_error( $result ) ? $result : null;
	}

	/**
	 * Return saved coupon fields.
	 *
	 * @param \WC_Coupon $subject Coupon.
	 * @return array
	 */
	protected function prepare_response( $subject ): array {
		return array( 'coupon' => self::format_coupon_for_response( new \WC_Coupon( $subject ) ) );
	}

	/**
	 * Check coupon create access.
	 *
	 * @return bool
	 *
	 * @since 11.4.0
	 */
	public static function can_create_coupon(): bool {
		return (bool) wc_rest_check_post_permissions( 'shop_coupon', 'create' );
	}

	/**
	 * Get the ability input schema.
	 *
	 * @return array
	 */
	private static function build_input_schema(): array {
		$properties                   = self::get_coupon_writable_properties_schema();
		$properties['status']['enum'] = array_values( array_diff( $properties['status']['enum'], array( 'future' ) ) );

		return array(
			'type'                 => 'object',
			'properties'           => $properties,
			'required'             => array( 'code' ),
			'additionalProperties' => false,
		);
	}
}
