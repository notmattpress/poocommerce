<?php

use PHPUnit\Framework\TestCase;
use Automattic\PooCommerce\Blueprint\Steps\DeletePlugin;

/**
 * Unit tests for DeletePlugin class.
 */
class DeletePluginTest extends TestCase {
	/**
	 * Test the constructor and JSON preparation.
	 */
	public function testConstructorAndPrepareJsonArray() {
		$plugin_name   = 'sample-plugin/sample-plugin.php';
		$delete_plugin = new DeletePlugin( $plugin_name );

		$expected_array = array(
			'step'       => 'deletePlugin',
			'pluginName' => $plugin_name,
		);

		$this->assertEquals( $expected_array, $delete_plugin->prepare_json_array() );
	}

	/**
	 * Test the static get_step_name method.
	 */
	public function testGetStepName() {
		$this->assertEquals( 'deletePlugin', DeletePlugin::get_step_name() );
	}

	/**
	 * Test the static get_schema method.
	 */
	public function testGetSchema() {
		$expected_schema = array(
			'type'       => 'object',
			'properties' => array(
				'step'       => array(
					'type' => 'string',
					'enum' => array( 'deletePlugin' ),
				),
				'pluginName' => array(
					'type' => 'string',
				),
			),
			'required'   => array( 'step', 'pluginName' ),
		);

		$this->assertEquals( $expected_schema, DeletePlugin::get_schema() );
	}
}
