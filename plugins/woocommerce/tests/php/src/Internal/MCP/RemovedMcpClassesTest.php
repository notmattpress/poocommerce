<?php

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Internal\MCP;

use Automattic\PooCommerce\Internal\MCP\MCPAdapterProvider;
use Automattic\PooCommerce\Internal\MCP\Transport\PooCommerceRestTransport;
use WC_Unit_Test_Case;
use WP_Error;
use WP_REST_Request;

/**
 * Tests for the polyfills left in place of the removed PooCommerce MCP endpoint classes.
 */
class RemovedMcpClassesTest extends WC_Unit_Test_Case {

	/**
	 * @testdox Should report incorrect usage and return a safe default when a removed method is called.
	 *
	 * @dataProvider removed_method_provider
	 *
	 * @param string   $method   The removed method, as reported to _doing_it_wrong().
	 * @param callable $callback Calls the removed method and returns its result.
	 * @param mixed    $expected The expected safe default.
	 */
	public function test_removed_methods_report_incorrect_usage( string $method, callable $callback, $expected ): void {
		$this->setExpectedIncorrectUsage( $method );

		$this->assertSame( $expected, $callback() );
	}

	/**
	 * Data provider for removed methods.
	 *
	 * @return array<string, array{string, callable, mixed}>
	 */
	public function removed_method_provider(): array {
		return array(
			'MCPAdapterProvider::is_mcp_request' => array(
				MCPAdapterProvider::class . '::is_mcp_request',
				static fn() => MCPAdapterProvider::is_mcp_request(),
				false,
			),
			'PooCommerceRestTransport::get_current_user_permissions' => array(
				PooCommerceRestTransport::class . '::get_current_user_permissions',
				static fn() => PooCommerceRestTransport::get_current_user_permissions(),
				null,
			),
		);
	}

	/**
	 * @testdox Should keep MCPAdapterProvider instance methods callable without initializing anything.
	 */
	public function test_provider_instance_methods_do_nothing(): void {
		$this->setExpectedIncorrectUsage( MCPAdapterProvider::class . '::__construct' );
		$this->setExpectedIncorrectUsage( MCPAdapterProvider::class . '::maybe_initialize' );
		$this->setExpectedIncorrectUsage( MCPAdapterProvider::class . '::initialize_mcp_server' );
		$this->setExpectedIncorrectUsage( MCPAdapterProvider::class . '::is_initialized' );

		$provider = new MCPAdapterProvider();
		$provider->maybe_initialize();
		$provider->initialize_mcp_server( new \stdClass() );

		$this->assertFalse( $provider->is_initialized() );
		$this->assertSame( 'poocommerce', MCPAdapterProvider::MCP_NAMESPACE );
		$this->assertSame( 'mcp', MCPAdapterProvider::MCP_ROUTE );
	}

	/**
	 * @testdox Should keep PooCommerceRestTransport instance methods callable while denying access.
	 */
	public function test_transport_instance_methods_deny_access(): void {
		$this->setExpectedIncorrectUsage( PooCommerceRestTransport::class . '::__construct' );
		$this->setExpectedIncorrectUsage( PooCommerceRestTransport::class . '::check_permission' );
		$this->setExpectedIncorrectUsage( PooCommerceRestTransport::class . '::validate_request' );
		$this->setExpectedIncorrectUsage( PooCommerceRestTransport::class . '::check_ability_permission' );

		$transport = new PooCommerceRestTransport( null );
		$request   = new WP_REST_Request( 'POST', '/poocommerce/mcp' );

		$this->assertInstanceOf( WP_Error::class, $transport->check_permission( $request ) );
		$this->assertInstanceOf( WP_Error::class, $transport->validate_request( $request ) );
		$this->assertTrue( $transport->check_ability_permission( true, 'GET', new \stdClass() ), 'The permission value should pass through unchanged' );
	}
}
