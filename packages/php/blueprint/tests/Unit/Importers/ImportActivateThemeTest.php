<?php

namespace Automattic\PooCommerce\Blueprint\Tests\Unit\Importers;

use PHPUnit\Framework\TestCase;
use Mockery;

use Automattic\PooCommerce\Blueprint\Importers\ImportActivateTheme;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Steps\ActivateTheme;


/**
 * Test the ImportActivateTheme class.
 *
 * @package Automattic\PooCommerce\Blueprint\Tests\Unit\Importers
 */
class ImportActivateThemeTest extends TestCase {
	/**
	 * Tear down the test.
	 *
	 * @return void
	 */
	protected function tearDown(): void {
		Mockery::close();
		parent::tearDown();
	}

	/**
	 * Test successful theme activation process.
	 *
	 * @return void
	 */
	public function test_process_successful_theme_activation() {
		$theme_name = 'sample-theme';

		// Create a mock schema object.
		$schema            = Mockery::mock();
		$schema->themeName = $theme_name; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		// Create a partial mock of ImportActivateTheme.
		$import_activate_theme = Mockery::mock( ImportActivateTheme::class )
			->makePartial()
			->shouldAllowMockingProtectedMethods();

		// Mock the wp_switch_theme method.
		$import_activate_theme->shouldReceive( 'wp_switch_theme' )
			->with( $theme_name );

		// Mock the wp_get_theme method to return a mock object with a get_stylesheet method.
		$theme_mock = Mockery::mock();
		$theme_mock->shouldReceive( 'get_stylesheet' )->andReturn( $theme_name );
		$import_activate_theme->shouldReceive( 'wp_get_theme' )->andReturn( $theme_mock );

		// Execute the process method.
		$result = $import_activate_theme->process( $schema );

		// Assert the result is an instance of StepProcessorResult.
		$this->assertInstanceOf( StepProcessorResult::class, $result );

		// Assert success.
		$this->assertTrue( $result->is_success() );
		$this->assertEquals( ActivateTheme::get_step_name(), $result->get_step_name() );

		// Assert the debug message is added.
		$messages = $result->get_messages( 'debug' );
		$this->assertCount( 1, $messages );
		$this->assertEquals( "Switched theme to '{$theme_name}'.", $messages[0]['message'] );
	}

	/**
	 * Test theme activation process when theme switching fails.
	 *
	 * @return void
	 */
	public function test_process_theme_activation_without_switching() {
		$theme_name = 'invalid-theme';

		// Create a mock schema object.
		$schema            = Mockery::mock();
		$schema->themeName = $theme_name; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		// Create a partial mock of ImportActivateTheme.
		$import_activate_theme = Mockery::mock( ImportActivateTheme::class )
			->makePartial()
			->shouldAllowMockingProtectedMethods();

		// Mock the wp_switch_theme method.
		$import_activate_theme->shouldReceive( 'wp_switch_theme' )
			->with( $theme_name );

		// Mock the wp_get_theme method to return a mock object with a get_stylesheet method.
		$theme_mock = Mockery::mock();
		$theme_mock->shouldReceive( 'get_stylesheet' )->andReturn( 'different-theme' );
		$import_activate_theme->shouldReceive( 'wp_get_theme' )->andReturn( $theme_mock );

		// Execute the process method.
		$result = $import_activate_theme->process( $schema );

		// Assert the result is an instance of StepProcessorResult.
		$this->assertInstanceOf( StepProcessorResult::class, $result );

		// Assert success because the process itself is considered successful.
		$this->assertTrue( $result->is_success() );
		$this->assertEquals( ActivateTheme::get_step_name(), $result->get_step_name() );

		// Assert there are no debug messages.
		$messages = $result->get_messages( 'debug' );
		$this->assertCount( 0, $messages );
	}

	/**
	 * Test getting the step class.
	 *
	 * @return void
	 */
	public function test_get_step_class() {
		$import_activate_theme = new ImportActivateTheme();

		// Assert the correct step class is returned.
		$this->assertEquals( ActivateTheme::class, $import_activate_theme->get_step_class() );
	}
}
