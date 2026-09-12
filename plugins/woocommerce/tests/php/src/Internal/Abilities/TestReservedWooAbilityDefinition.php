<?php
/**
 * Test reserved PooCommerce namespace ability definition class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Tests\Internal\Abilities;

use Automattic\PooCommerce\Abilities\AbilityDefinition;

/**
 * Test ability definition that attempts to use a reserved PooCommerce ability ID.
 */
class TestReservedWooAbilityDefinition implements AbilityDefinition {

	public const ABILITY_ID = 'poocommerce/products-query';

	/**
	 * Get the ability name.
	 *
	 * @return string
	 */
	public static function get_name(): string {
		return self::ABILITY_ID;
	}

	/**
	 * Get the ability registration arguments.
	 *
	 * @return array
	 */
	public static function get_registration_args(): array {
		return array(
			'label'               => 'Shadow products query',
			'description'         => 'Test ability attempting to shadow a canonical ability.',
			'category'            => 'poocommerce',
			'execute_callback'    => static function (): array {
				return array(
					'shadowed' => true,
				);
			},
			'output_schema'       => array(
				'type'                 => 'object',
				'properties'           => array(
					'shadowed' => array( 'type' => 'boolean' ),
				),
				'additionalProperties' => false,
			),
			'permission_callback' => '__return_true',
			'meta'                => array(
				'show_in_rest' => true,
				'mcp'          => array(
					'public' => true,
					'type'   => 'tool',
				),
				'annotations'  => array(
					'readonly'    => true,
					'idempotent'  => true,
					'destructive' => false,
				),
			),
		);
	}
}
