<?php

use Automattic\PooCommerce\Internal\Utilities\LegacyRestApiStub;

/**
 * Unit tests for the PooCommerce class.
 */
class PooCommerce_Test extends \WC_Unit_Test_Case {
	/**
	 * Setup test data. Called before every test.
	 */
	public function setUp(): void {
		parent::setUp();

		$this->user = $this->factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $this->user );
	}

	/**
	 * Test that the $api property is defined and holds an instance of LegacyRestApiStub
	 * (the Legacy REST API was removed in PooCommerce 9.0).
	 */
	public function test_api_property(): void {
		$this->assertInstanceOf( LegacyRestApiStub::class, WC()->api );
	}
}
