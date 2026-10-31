<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Internal\Abilities;

use Automattic\PooCommerce\Internal\Abilities\AbilitiesRestBridge;
use Automattic\PooCommerce\Internal\Abilities\REST\RestAbility;
use Automattic\PooCommerce\Internal\Abilities\REST\RestAbilityFactory;
use WC_Unit_Test_Case;

/**
 * Tests for the polyfills left in place of the removed REST-derived abilities.
 */
class RemovedRestAbilitiesTest extends WC_Unit_Test_Case {

	/**
	 * @testdox Should report incorrect usage without registering abilities when a removed method is called.
	 *
	 * @dataProvider removed_method_provider
	 *
	 * @param string   $method   The removed method, as reported to _doing_it_wrong().
	 * @param callable $callback Calls the removed method.
	 */
	public function test_removed_methods_report_incorrect_usage( string $method, callable $callback ): void {
		$this->setExpectedIncorrectUsage( $method );
		$abilities_before = function_exists( 'wp_get_abilities' ) ? array_keys( wp_get_abilities() ) : array();

		$callback();

		$abilities_after = function_exists( 'wp_get_abilities' ) ? array_keys( wp_get_abilities() ) : array();
		$this->assertSame( $abilities_before, $abilities_after, 'Removed methods should not register abilities' );
	}

	/**
	 * Data provider for removed methods.
	 *
	 * @return array<string, array{string, callable}>
	 */
	public function removed_method_provider(): array {
		return array(
			'RestAbilityFactory::register_controller_abilities' => array(
				RestAbilityFactory::class . '::register_controller_abilities',
				static function () {
					RestAbilityFactory::register_controller_abilities(
						array(
							'controller' => \WC_REST_Products_Controller::class,
							'route'      => '/wc/v3/products',
							'abilities'  => array(),
						)
					);
				},
			),
			'AbilitiesRestBridge::init'               => array(
				AbilitiesRestBridge::class . '::init',
				static function () {
					AbilitiesRestBridge::init();
				},
			),
			'AbilitiesRestBridge::register_abilities' => array(
				AbilitiesRestBridge::class . '::register_abilities',
				static function () {
					AbilitiesRestBridge::register_abilities();
				},
			),
		);
	}

	/**
	 * @testdox Should keep RestAbility usable while reporting incorrect usage.
	 */
	public function test_rest_ability_still_constructs(): void {
		$this->setExpectedIncorrectUsage( RestAbility::class );

		$ability = new RestAbility(
			'poocommerce-test/removed-rest-ability',
			array(
				'label'               => 'Test',
				'description'         => 'Test',
				'category'            => 'poocommerce',
				'execute_callback'    => '__return_true',
				'permission_callback' => '__return_true',
			)
		);

		$this->assertSame( 'poocommerce-test/removed-rest-ability', $ability->get_name() );
	}

	/**
	 * @testdox Should keep the removed exposure metadata key constant.
	 */
	public function test_metadata_key_constant_is_kept(): void {
		$this->assertSame( 'expose_in_deprecated_poocommerce_mcp', RestAbilityFactory::EXPOSE_IN_DEPRECATED_MCP_META_KEY );
	}
}
