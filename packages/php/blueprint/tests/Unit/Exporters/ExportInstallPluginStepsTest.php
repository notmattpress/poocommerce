<?php

namespace Automattic\PooCommerce\Blueprint\Tests\Unit\Exporters;

use Automattic\PooCommerce\Blueprint\Exporters\ExportInstallPluginSteps;
use Automattic\PooCommerce\Blueprint\Steps\Step;
use Automattic\PooCommerce\Blueprint\Tests\TestCase;

/**
 * Unit tests for ExportInstallPluginSteps class.
 */
class ExportInstallPluginStepsTest extends TestCase {

	/**
	 * The plugins to test.
	 *
	 * @var array<string, array<string, mixed>>
	 */
	protected array $plugins = array(
		'plugina/plugina.php' => array(
			'Title'           => 'plugina',
			'Name'            => 'plugina',
			'RequiresPlugins' => array( 'pluginc' ),
		),
		'pluginb/pluginb.php' => array(
			'Title'           => 'pluginb',
			'Name'            => 'pluginb',
			'RequiresPlugins' => array( 'plugina' ),
		),
		'pluginc/pluginc.php' => array(
			'Title'           => 'pluginc',
			'Name'            => 'pluginc',
			'RequiresPlugins' => array(),
		),
	);

	/**
	 * Get a mock of the ExportInstallPluginSteps class.
	 *
	 * @return Mockery\MockInterface
	 */
	private function get_mock() {
		$mock = Mock( ExportInstallPluginSteps::class )->makePartial();
		$mock->shouldReceive( 'wp_get_plugins' )->andReturn( $this->plugins );
		return $mock;
	}

	/**
	 * When everything is working as expected.
	 *
	 * @return void
	 */
	public function test_export() {
		$mock = $this->get_mock();
		$mock->shouldReceive( 'wp_plugins_api' )->andReturn(
			(object) array(
				'download_link' => 'download_link_url',
			)
		);

		$result = $mock->export();
		$this->assertCount( 3, $result );

		$slugs = array_map( fn( $step ) => $step->prepare_json_array()['pluginData']['slug'], $result );
		$this->assertContains( 'plugina', $slugs );
		$this->assertContains( 'pluginb', $slugs );
		$this->assertContains( 'pluginc', $slugs );
	}

	/**
	 * When a plugin does not have a download link, it should not be included in the export.
	 *
	 * @return void
	 */
	public function test_export_does_not_include_plugins_with_unknown_download_link() {
		$mock = $this->get_mock();

		// Return an empty object for the plugina.
		$mock->shouldReceive( 'wp_plugins_api' )->withArgs(
			function ( $method, $args ) {
				if ( 'plugin_information' === $method && 'plugina' === $args['slug'] ) {
					return true;
				}
				return false;
			}
		)->andReturn( (object) array() );

		$mock->shouldReceive( 'wp_plugins_api' )
			->andReturn(
				(object) array(
					'download_link' => 'download_link_url',
				)
			);

		$result = $mock->export();
		$this->assertCount( 2, $result );
	}
	/**
	 * Dependencies must be installed first before installing the plugins that
	 * require them. Make sure we return the dependencies first.
	 */
	public function test_it_should_return_dependencies_first() {
		$instance = new ExportInstallPluginSteps();
		$plugins  = $instance->sort_plugins_by_dep( $this->plugins );

		$this->assertEquals(
			array(
				'pluginc/pluginc.php' => array(
					'Title'           => 'pluginc',
					'Name'            => 'pluginc',
					'RequiresPlugins' => array(),
				),
				'plugina/plugina.php' => array(
					'Title'           => 'plugina',
					'Name'            => 'plugina',
					'RequiresPlugins' => array( 'pluginc' ),
				),
				'pluginb/pluginb.php' => array(
					'Title'           => 'pluginb',
					'Name'            => 'pluginb',
					'RequiresPlugins' => array( 'plugina' ),
				),
			),
			$plugins
		);
	}
}
