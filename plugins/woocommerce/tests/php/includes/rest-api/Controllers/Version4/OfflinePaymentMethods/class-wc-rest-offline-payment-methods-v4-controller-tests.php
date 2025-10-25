<?php
/**
 * Offline Payment Methods V4 Controller tests.
 *
 * @package PooCommerce\Tests\API
 */

declare( strict_types=1 );

use Automattic\PooCommerce\Internal\RestApi\Routes\V4\Settings\OfflinePaymentMethods\Controller as OfflinePaymentMethodsController;
use Automattic\PooCommerce\Internal\Admin\Settings\Payments;
use Automattic\PooCommerce\Internal\Admin\Settings\PaymentsProviders;

/**
 * Offline Payment Methods V4 Controller tests class.
 */
class WC_REST_Offline_Payment_Methods_V4_Controller_Tests extends WC_REST_Unit_Test_Case {

	/**
	 * Test endpoint.
	 *
	 * @var OfflinePaymentMethodsController
	 */
	protected $endpoint;

	/**
	 * Test user ID.
	 *
	 * @var int
	 */
	protected $user;

	/**
	 * Payments instance.
	 *
	 * @var Payments
	 */
	protected $payments;

	/**
	 * Feature enabler callback.
	 *
	 * @var callable
	 */
	private static $feature_enabler;

	/**
	 * Enable the REST API v4 feature.
	 */
	public function enable_rest_api_v4_feature() {
		if ( ! self::$feature_enabler ) {
			self::$feature_enabler = function ( $features ) {
				if ( ! in_array( 'rest-api-v4', $features, true ) ) {
					$features[] = 'rest-api-v4';
				}
				return $features;
			};
		}
		add_filter( 'poocommerce_admin_features', self::$feature_enabler );
	}

	/**
	 * Disable the REST API v4 feature.
	 */
	public function disable_rest_api_v4_feature() {
		if ( self::$feature_enabler ) {
			remove_filter( 'poocommerce_admin_features', self::$feature_enabler );
		}
	}

	/**
	 * Setup our test server, endpoints, and user info.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->enable_rest_api_v4_feature();

		// Mock the Payments service to avoid promotional content interference.
		$this->payments = $this->getMockBuilder( Payments::class )->getMock();
		$this->payments->method( 'get_country' )->willReturn( 'US' );
		$this->payments->method( 'get_payment_providers' )->willReturn( $this->get_mock_payment_providers() );

		$schema = new Automattic\PooCommerce\Internal\RestApi\Routes\V4\Settings\OfflinePaymentMethods\Schema\OfflinePaymentMethodSchema();

		$this->endpoint = new OfflinePaymentMethodsController();
		$this->endpoint->init( $this->payments, $schema );

		// Manually register ONLY our controller's routes to avoid triggering global REST API init.
		$this->endpoint->register_routes();

		$this->user = $this->factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $this->user );
	}

	/**
	 * Get mock payment providers data.
	 *
	 * @return array
	 */
	private function get_mock_payment_providers(): array {
		return array(
			array(
				'id'          => 'bacs',
				'_order'      => 10,
				'_type'       => PaymentsProviders::TYPE_OFFLINE_PM,
				'title'       => 'Direct bank transfer',
				'description' => 'Make your payment directly into our bank account.',
				'supports'    => array( 'products' ),
				'plugin'      => array(
					'_type'  => 'core',
					'slug'   => 'poocommerce',
					'file'   => 'poocommerce/poocommerce.php',
					'status' => 'active',
				),
				'image'       => '',
				'icon'        => '',
				'links'       => array(),
				'state'       => array(
					'enabled'           => true,
					'account_connected' => false,
					'needs_setup'       => false,
					'test_mode'         => false,
					'dev_mode'          => false,
				),
				'management'  => array(
					'_links' => array(
						'settings' => array(
							'href' => 'admin.php?page=wc-settings&tab=checkout&section=bacs',
						),
					),
				),
				'onboarding'  => array(
					'type'   => 'none',
					'state'  => array(),
					'_links' => array(),
				),
			),
			array(
				'id'          => 'cheque',
				'_order'      => 20,
				'_type'       => PaymentsProviders::TYPE_OFFLINE_PM,
				'title'       => 'Check payments',
				'description' => 'Please send a check to Store Name.',
				'supports'    => array( 'products' ),
				'plugin'      => array(
					'_type'  => 'core',
					'slug'   => 'poocommerce',
					'file'   => 'poocommerce/poocommerce.php',
					'status' => 'active',
				),
				'image'       => '',
				'icon'        => '',
				'links'       => array(),
				'state'       => array(
					'enabled'           => false,
					'account_connected' => false,
					'needs_setup'       => false,
					'test_mode'         => false,
					'dev_mode'          => false,
				),
				'management'  => array(
					'_links' => array(
						'settings' => array(
							'href' => 'admin.php?page=wc-settings&tab=checkout&section=cheque',
						),
					),
				),
				'onboarding'  => array(
					'type'   => 'none',
					'state'  => array(),
					'_links' => array(),
				),
			),
		);
	}

	/**
	 * Clean up after tests.
	 */
	public function tearDown(): void {
		// Disable feature flag.
		$this->disable_rest_api_v4_feature();

		// Always call parent last.
		parent::tearDown();
	}

	/**
	 * Test route registration.
	 */
	public function test_register_routes() {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/wc/v4/settings/payments/offline-methods', $routes );
		$this->assertCount( 1, $routes['/wc/v4/settings/payments/offline-methods'] );
	}

	/**
	 * Test getting offline payment methods without location parameter.
	 */
	public function test_get_offline_payment_methods_without_location() {
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );

		// Verify the new grouped response structure.
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'description', $data );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );

		$this->assertEquals( 'payments/offline-methods', $data['id'] );
		$this->assertIsArray( $data['values'] );
		$this->assertIsArray( $data['groups'] );
		$this->assertArrayHasKey( 'payment_methods', $data['groups'] );
		$this->assertIsArray( $data['groups']['payment_methods'] );

		// Verify payment methods structure.
		foreach ( $data['groups']['payment_methods'] as $method_id => $method ) {
			$this->assertArrayHasKey( 'id', $method );
			$this->assertArrayHasKey( '_order', $method );
			$this->assertArrayHasKey( 'title', $method );
			$this->assertArrayHasKey( 'description', $method );
			$this->assertArrayHasKey( 'icon', $method );
			$this->assertArrayHasKey( 'state', $method );
			$this->assertArrayHasKey( 'management', $method );
			$this->assertEquals( $method_id, $method['id'] );
		}

		// Verify values structure (boolean enabled states).
		foreach ( $data['values'] as $method_id => $enabled ) {
			$this->assertIsBool( $enabled );
			$this->assertArrayHasKey( $method_id, $data['groups']['payment_methods'] );
		}
	}

	/**
	 * Test getting offline payment methods with location parameter.
	 */
	public function test_get_offline_payment_methods_with_location() {
		$request = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$request->set_param( 'location', 'US' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );

		// Verify the grouped response structure.
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'description', $data );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );
		$this->assertIsArray( $data['values'] );
		$this->assertIsArray( $data['groups'] );
		$this->assertArrayHasKey( 'payment_methods', $data['groups'] );
		$this->assertIsArray( $data['groups']['payment_methods'] );
	}

	/**
	 * Test getting offline payment methods with invalid location parameter.
	 */
	public function test_get_offline_payment_methods_with_invalid_location() {
		$request = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$request->set_param( 'location', 'INVALID' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		// Should still return 200 as the Payments service handles invalid locations gracefully.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'description', $data );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );
	}

	/**
	 * Test permissions for unauthenticated user.
	 */
	public function test_get_offline_payment_methods_without_permission() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test permissions for user without manage_poocommerce capability.
	 */
	public function test_get_offline_payment_methods_with_insufficient_permission() {
		$user = $this->factory->user->create(
			array(
				'role' => 'subscriber',
			)
		);
		wp_set_current_user( $user );

		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * Test the collection schema.
	 */
	public function test_get_collection_schema() {
		$request  = new WP_REST_Request( 'OPTIONS', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertArrayHasKey( 'schema', $data );

		$schema = $data['schema'];
		$this->assertEquals( 'object', $schema['type'] );
		$this->assertArrayHasKey( 'properties', $schema );

		// Verify the schema has all expected top-level properties.
		$properties          = $schema['properties'];
		$expected_properties = array( 'id', 'title', 'description', 'values', 'groups' );

		foreach ( $expected_properties as $property ) {
			$this->assertArrayHasKey( $property, $properties, "Missing property: {$property}" );
		}

		// Verify values schema.
		$this->assertEquals( 'object', $properties['values']['type'] );
		$this->assertEquals( 'boolean', $properties['values']['additionalProperties']['type'] );

		// Verify groups schema.
		$this->assertEquals( 'object', $properties['groups']['type'] );
		$groups_properties = $properties['groups']['properties'];
		$this->assertArrayHasKey( 'payment_methods', $groups_properties );
		$payment_method_properties  = $groups_properties['payment_methods']['additionalProperties']['properties'];
		$expected_method_properties = array( 'id', '_order', 'title', 'description', 'icon', 'state', 'management' );

		foreach ( $expected_method_properties as $property ) {
			$this->assertArrayHasKey( $property, $payment_method_properties, "Missing payment method property: {$property}" );
		}
	}

	/**
	 * Test the collection parameters.
	 */
	public function test_get_collection_params() {
		$request  = new WP_REST_Request( 'OPTIONS', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertArrayHasKey( 'endpoints', $data );
		$this->assertArrayHasKey( 0, $data['endpoints'] );
		$this->assertArrayHasKey( 'args', $data['endpoints'][0] );

		$args = $data['endpoints'][0]['args'];
		$this->assertArrayHasKey( 'location', $args );
		$this->assertEquals( 'string', $args['location']['type'] );
		$this->assertFalse( $args['location']['required'] );
	}

	/**
	 * Test response structure matches schema.
	 */
	public function test_response_structure_matches_schema() {
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );

		// Test top-level structure.
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'description', $data );
		$this->assertArrayHasKey( 'values', $data );
		$this->assertArrayHasKey( 'groups', $data );

		// Test data types.
		$this->assertIsString( $data['id'] );
		$this->assertIsString( $data['title'] );
		$this->assertIsString( $data['description'] );
		$this->assertIsArray( $data['values'] );
		$this->assertIsArray( $data['groups'] );

		// Test values structure (boolean values).
		foreach ( $data['values'] as $method_id => $enabled ) {
			$this->assertIsString( $method_id );
			$this->assertIsBool( $enabled );
		}

		// Test payment methods structure.
		foreach ( $data['groups']['payment_methods'] as $method_id => $method ) {
			$this->assertIsString( $method_id );
			$this->assertIsArray( $method );
			$this->assertArrayHasKey( 'id', $method );
			$this->assertArrayHasKey( '_order', $method );
			$this->assertArrayHasKey( 'title', $method );
			$this->assertArrayHasKey( 'description', $method );
			$this->assertArrayHasKey( 'icon', $method );
			$this->assertArrayHasKey( 'state', $method );
			$this->assertArrayHasKey( 'management', $method );

			$this->assertIsString( $method['id'] );
			$this->assertIsInt( $method['_order'] );
			$this->assertIsString( $method['title'] );
			$this->assertIsArray( $method['state'] );
			$this->assertIsArray( $method['management'] );
		}
	}

	/**
	 * Test that response uses proper preparation methods.
	 */
	public function test_response_uses_proper_preparation() {
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		// Test that response has proper links structure if settings links are present.
		$data = $response->get_data();
		if ( ! empty( $data ) ) {
			$links = $response->get_links();
			$this->assertIsArray( $links );
		}
	}

	/**
	 * Test that payment methods are present and have _order field.
	 */
	public function test_payment_methods_have_order_field() {
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'groups', $data );

		// Test that payment methods have _order field and are sorted.
		$previous_order = -1;
		foreach ( $data['groups']['payment_methods'] as $method ) {
			$this->assertArrayHasKey( '_order', $method );
			$this->assertIsInt( $method['_order'] );
			$this->assertGreaterThan( $previous_order, $method['_order'], 'Payment methods should be sorted by _order field' );
			$previous_order = $method['_order'];
		}
	}

	/**
	 * Test _fields parameter filtering.
	 */
	public function test_fields_parameter_filtering() {
		$request = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$request->set_param( '_fields', 'id,title' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );

		// Should only contain the requested fields.
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );

		// Should NOT contain other fields like description, values, etc.
		$this->assertArrayNotHasKey( 'description', $data );
		$this->assertArrayNotHasKey( 'values', $data );
		$this->assertArrayNotHasKey( 'groups', $data );

		// Test that we have the requested fields and optionally framework fields.
		$allowed_fields = array( 'id', 'title', '_links' );
		foreach ( array_keys( $data ) as $field ) {
			$this->assertContains( $field, $allowed_fields, "Unexpected field: {$field}" );
		}
		// Ensure requested fields are present.
		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
	}

	/**
	 * Test that schema filtering prevents data leakage.
	 */
	public function test_schema_filtering_prevents_data_leakage() {
		$request  = new WP_REST_Request( 'GET', '/wc/v4/settings/payments/offline-methods' );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $data );

		$schema_properties = array_keys( $this->endpoint->get_item_schema()['properties'] );

		// Allow framework-added fields like _links.
		$allowed_framework_fields = array( '_links' );
		$allowed_fields           = array_merge( $schema_properties, $allowed_framework_fields );

		// Test that response only contains fields from schema or allowed framework fields.
		foreach ( array_keys( $data ) as $field ) {
			$this->assertContains( $field, $allowed_fields, "Field '{$field}' not declared in schema or allowed framework fields" );
		}
	}
}
