<?php

use PHPUnit\Framework\TestCase;
use Automattic\PooCommerce\Blueprint\Steps\SetSiteOptions;

/**
 * Unit tests for SetSiteOptions class.
 */
class SetSiteOptionsTest extends TestCase {
	/**
	 * Test the constructor and JSON preparation.
	 */
	public function testConstructorAndPrepareJsonArray() {
		$options = array(
			'site_name' => 'My PooCommerce Site',
			'timezone'  => 'UTC',
		);

		$set_site_options = new SetSiteOptions( $options );

		$expected_array = array(
			'step'    => 'setSiteOptions',
			'options' => (object) $options,
		);

		$this->assertEquals( $expected_array, $set_site_options->prepare_json_array() );
	}

	/**
	 * Test the static get_step_name method.
	 */
	public function testGetStepName() {
		$this->assertEquals( 'setSiteOptions', SetSiteOptions::get_step_name() );
	}

	/**
	 * Test the static get_schema method.
	 */
	public function testGetSchema() {
		$expected_schema = array(
			'type'       => 'object',
			'properties' => array(
				'step' => array(
					'type' => 'string',
					'enum' => array( 'setSiteOptions' ),
				),
			),
			'required'   => array( 'step' ),
		);

		$this->assertEquals( $expected_schema, SetSiteOptions::get_schema() );
	}
}
