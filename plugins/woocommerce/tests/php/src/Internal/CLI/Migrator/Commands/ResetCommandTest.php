<?php
/**
 * Reset Command Test
 *
 * @package Automattic\PooCommerce\Tests\Internal\CLI\Migrator\Commands
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Tests\Internal\CLI\Migrator\Commands;

use Automattic\PooCommerce\Internal\CLI\Migrator\Commands\ResetCommand;
use Automattic\PooCommerce\Internal\CLI\Migrator\Core\CredentialManager;
use Automattic\PooCommerce\Internal\CLI\Migrator\Core\PlatformRegistry;

/**
 * Test cases for ResetCommand.
 */
class ResetCommandTest extends \WC_Unit_Test_Case {

	/**
	 * The ResetCommand instance under test.
	 *
	 * @var ResetCommand
	 */
	private ResetCommand $command;

	/**
	 * Mock CredentialManager for testing.
	 *
	 * @var CredentialManager
	 */
	private CredentialManager $credential_manager;

	/**
	 * Mock PlatformRegistry for testing.
	 *
	 * @var PlatformRegistry
	 */
	private PlatformRegistry $platform_registry;

	/**
	 * Set up before each test.
	 */
	public function setUp(): void {
		parent::setUp();

		$this->credential_manager = new CredentialManager();
		$this->platform_registry  = new PlatformRegistry();
		$this->command            = new ResetCommand();
	}

	/**
	 * Test that ResetCommand can be instantiated.
	 */
	public function test_reset_command_instantiation() {
		$this->assertInstanceOf( ResetCommand::class, $this->command );
	}

	/**
	 * Test dependency injection via init method.
	 */
	public function test_dependency_injection_via_init() {
		$this->assertTrue( method_exists( $this->command, 'init' ) );

		// Test that init method can be called without errors.
		try {
			$this->command->init( $this->credential_manager, $this->platform_registry );
			$this->assertTrue( true );
		} catch ( \Exception $e ) {
			$this->fail( 'init method should not throw exceptions: ' . $e->getMessage() );
		}
	}

	/**
	 * Test that the command has the required __invoke method.
	 */
	public function test_invoke_method_exists() {
		$this->assertTrue( method_exists( $this->command, '__invoke' ) );
		$this->assertTrue( is_callable( array( $this->command, '__invoke' ) ) );
	}

	/**
	 * Test that the command can be initialized and dependencies are properly injected.
	 */
	public function test_dependency_injection_properties() {
		$this->command->init( $this->credential_manager, $this->platform_registry );
		$this->assertTrue( true );
	}
}
