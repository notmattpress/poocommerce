<?php
/**
 * Unit tests for the WC_Tracker class.
 *
 * @package PooCommerce\Tests\WC_Tracker.
 */

declare(strict_types=1);

use Automattic\PooCommerce\Enums\OrderInternalStatus;
use Automattic\PooCommerce\Internal\Features\FeaturesController;
use Automattic\PooCommerce\Utilities\PluginUtil;

// phpcs:disable Squiz.Classes.ClassFileName.NoMatch, Squiz.Classes.ValidClassName.NotCamelCaps -- Backward compatibility.
// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound -- Ignoring test doubles.

/**
 * Mock Address Provider for testing.
 */
class WC_Tracker_Test_MockAddressProvider extends WC_Address_Provider {
	/**
	 * Constructor.
	 *
	 * @param string $id   Provider ID.
	 * @param string $name Provider name.
	 */
	public function __construct( $id = 'mock-address-provider', $name = 'Mock Address Provider' ) {
		$this->id   = $id;
		$this->name = $name;
	}
}

/**
 * Class WC_Tracker_Test
 */
class WC_Tracker_Test extends \WC_Unit_Test_Case {
	// phpcs:enable

	/**
	 * Test the tracking of wc_admin being disabled via filter.
	 */
	public function test_wc_admin_disabled_get_tracking_data() {
		$posted_data = null;

		// Test the case for poocommerce_admin_disabled filter returning true.
		add_filter(
			'poocommerce_admin_disabled',
			// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
			function ( $default_value ) {
				return true;
			}
		);

		add_filter(
			'pre_http_request',
			// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
			function ( $pre, $args, $url ) use ( &$posted_data ) {
				$posted_data = $args;
				return true;
			},
			3,
			10
		);
		WC_Tracker::send_tracking_data( true );
		$tracking_data = json_decode( $posted_data['body'], true );

		// Test the default case of no filter for set for poocommerce_admin_disabled.
		$this->assertArrayHasKey( 'wc_admin_disabled', $tracking_data );
		$this->assertEquals( 'yes', $tracking_data['wc_admin_disabled'] );
	}

	/**
	 * Test the tracking of wc_admin being not disabled via filter.
	 */
	public function test_wc_admin_not_disabled_get_tracking_data() {
		$posted_data = null;
		// Bypass time delay so we can invoke send_tracking_data again.
		update_option( 'poocommerce_tracker_last_send', strtotime( '-2 weeks' ) );

		add_filter(
			'pre_http_request',
			// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
			function ( $pre, $args, $url ) use ( &$posted_data ) {
				$posted_data = $args;
				return true;
			},
			3,
			10
		);
		WC_Tracker::send_tracking_data( true );
		$tracking_data = json_decode( $posted_data['body'], true );

		// Test the default case of no filter for set for poocommerce_admin_disabled.
		$this->assertArrayHasKey( 'wc_admin_disabled', $tracking_data );
		$this->assertEquals( 'no', $tracking_data['wc_admin_disabled'] );
	}

	/**
	 * @testDox Test the features compatibility data for plugin tracking data.
	 */
	public function test_get_tracking_data_plugin_feature_compatibility() {
		$legacy_mocks = array(
			'get_plugins' => function () {
				return array(
					'plugin1' => array(
						'Name' => 'Plugin 1',
					),
					'plugin2' => array(
						'Name' => 'Plugin 2',
					),
					'plugin3' => array(
						'Name' => 'Plugin 3',
					),
				);
			},
		);
		$this->register_legacy_proxy_function_mocks( $legacy_mocks );

		update_option( 'active_plugins', array( 'plugin1', 'plugin2' ) );

		$pluginutil_mock = $this->createMock( PluginUtil::class );
		$pluginutil_mock->method( 'is_poocommerce_aware_plugin' )
			->willReturnCallback( fn ( $plugin ) => 'plugin1' === $plugin ? false : true );

		$featurescontroller_mock = $this->createMock( FeaturesController::class );
		$featurescontroller_mock
			->method( 'get_compatible_features_for_plugin' )
			->willReturnCallback(
				function ( $plugin_name ) {
					switch ( $plugin_name ) {
						case 'plugin1':
							return array();
						case 'plugin2':
							return array(
								'compatible'   => array( 'feature1' ),
								'incompatible' => array( 'feature2' ),
								'uncertain'    => array( 'feature3' ),
							);
						case 'plugin3':
							return array(
								'compatible'   => array( 'feature2' ),
								'incompatible' => array(),
								'uncertain'    => array(
									'feature1',
									'feature3',
								),
							);
					}
				}
			);

		$container = wc_get_container();
		$container->get( PluginUtil::class ); // Ensure that the class is loaded.
		$container->replace( PluginUtil::class, $pluginutil_mock );
		$container->replace( FeaturesController::class, $featurescontroller_mock );

		$tracking_data = WC_Tracker::get_tracking_data();

		$this->assertEquals(
			array(),
			$tracking_data['active_plugins']['plugin1']['feature_compatibility']
		);
		$this->assertEquals(
			array(
				'compatible'   => array( 'feature1' ),
				'incompatible' => array( 'feature2' ),
				'uncertain'    => array( 'feature3' ),
			),
			$tracking_data['active_plugins']['plugin2']['feature_compatibility']
		);
		$this->assertEquals(
			array(
				'compatible' => array( 'feature2' ),
				'uncertain'  => array( 'feature1', 'feature3' ),
			),
			$tracking_data['inactive_plugins']['plugin3']['feature_compatibility']
		);

		$this->reset_container_replacements();
		$container->reset_all_resolved();
	}

	/**
	 * @testDox Test orders tracking data.
	 */
	public function test_get_tracking_data_orders() {
		$dummy_product          = WC_Helper_Product::create_simple_product();
		$status_entries         = array( OrderInternalStatus::PROCESSING, OrderInternalStatus::COMPLETED, OrderInternalStatus::REFUNDED, OrderInternalStatus::PENDING );
		$created_via_entries    = array( 'api', 'checkout', 'admin' );
		$payment_method_entries = array( WC_Gateway_Paypal::ID, 'stripe', WC_Gateway_COD::ID );

		$order_count = count( $status_entries ) * count( $created_via_entries ) * count( $payment_method_entries );

		foreach ( $status_entries as $status_entry ) {
			foreach ( $created_via_entries as $created_via_entry ) {
				foreach ( $payment_method_entries as $payment_method_entry ) {
					$order = wc_create_order(
						array(
							'status'         => $status_entry,
							'created_via'    => $created_via_entry,
							'payment_method' => $payment_method_entry,
						)
					);
					$order->add_product( $dummy_product );
					$order->save();
					$order->calculate_totals();
				}
			}
		}

		$order_data = WC_Tracker::get_tracking_data()['orders'];

		foreach ( $status_entries as $status_entry ) {
			$this->assertEquals( $order_count / count( $status_entries ), $order_data[ $status_entry ] );
		}

		// Gross revenue is for wc-completed and wc-refunded status, so we calculate expected revenue per status, multiply by 2, and then multiply by 10 to account for the 10 USD per status.
		$this->assertEquals( ( $order_count / count( $status_entries ) ) * 2 * 10, $order_data['gross'] );

		// Gross revenue is for wc-pending status, so we calculate expected revenue per status, multiply by 1, and then multiply by 10 to account for the 10 USD per status.
		$this->assertEquals( ( $order_count / count( $status_entries ) ) * 1 * 10, $order_data['processing_gross'] );

		// Order count per gateway is calculated for three status (completed, processing and refunded) so we multiply order count by 3 and then divide by the number of status entries.
		$this->assertEquals( ( $order_count * 3 / count( $status_entries ) ), $order_data['gateway__USD_count'] );

		// Order revenue per gateway is calculated for three status (completed, processing and refunded) so we multiply order count by 3, then by 10 to account for 10 USD per order and then divide by the number of status entries.
		$this->assertEquals( ( $order_count * 3 * 10 / count( $status_entries ) ), $order_data['gateway__USD_total'] );

		foreach ( $created_via_entries as $created_via_entry ) {
			$this->assertEquals( ( $order_count / count( $created_via_entries ) ), $order_data['created_via'][ $created_via_entry ] );
		}
	}

	/**
	 * @testDox Test order snapshot data.
	 */
	public function test_get_tracking_data_order_snapshot() {
		$dummy_product = WC_Helper_Product::create_simple_product();
		$year          = gmdate( 'Y' );
		$first_20      = array();
		$last_20       = array();

		// Populate order dates.
		for ( $i = 1; $i <= 20; $i++ ) {
			$first_20[] = sprintf( '%d-02-%02d 12:00:00', $year - 2, $i );
			$last_20[]  = sprintf( '%d-02-%02d 12:00:00', $year + 2, $i );
		}

		// Create set of orders.
		foreach ( array_merge( $first_20, $last_20 ) as $order_date ) {
			$order = wc_create_order(
				array(
					'status' => OrderInternalStatus::COMPLETED,
				)
			);
			$order->add_product( $dummy_product );
			$order->set_date_created( $order_date );
			$order->save();
			$order->calculate_totals();
		}

		$order_snapshot = WC_Tracker::get_tracking_data()['order_snapshot'];

		$this->assertCount( 20, $order_snapshot['first_20_orders'] );
		$this->assertCount( 20, $order_snapshot['last_20_orders'] );

		// Check order rank for first 20 orders.
		$counter = 1;
		foreach ( $order_snapshot['first_20_orders'] as $order_details ) {
			$this->assertEquals( $order_details['order_rank'], $counter++ );
			$this->assertEquals( $order_details['currency'], 'USD' );
			$this->assertEquals( floatval( $order_details['total_amount'] ), 10.0 );
			$this->assertEquals( $order_details['recorded_sales'], 'yes' );
			$this->assertEquals( $order_details['poocommerce_version'], WOOCOMMERCE_VERSION );
		}

		// Check order rank for last 20 orders.
		$counter = 40;
		foreach ( $order_snapshot['last_20_orders'] as $order_details ) {
			$this->assertEquals( $order_details['order_rank'], $counter-- );
			$this->assertEquals( $order_details['currency'], 'USD' );
			$this->assertEquals( floatval( $order_details['total_amount'] ), 10.00 );
			$this->assertEquals( $order_details['recorded_sales'], 'yes' );
			$this->assertEquals( $order_details['poocommerce_version'], WOOCOMMERCE_VERSION );
		}
	}

	/**
	 * @testDox Test enabled features tracking data.
	 */
	public function test_get_tracking_data_enabled_features() {
		$tracking_data = WC_Tracker::get_tracking_data();

		$this->assertIsArray( $tracking_data['enabled_features'] );
	}

	/**
	 * @testDox Test store_id is included in tracking data.
	 */
	public function test_get_tracking_data_store_id() {
		update_option( \WC_Install::STORE_ID_OPTION, '12345' );
		$tracking_data = WC_Tracker::get_tracking_data();
		$this->assertArrayHasKey( 'store_id', $tracking_data );
		$this->assertEquals( '12345', $tracking_data['store_id'] );
		delete_option( \WC_Install::STORE_ID_OPTION );
	}

	/**
	 * @testDox Test poocommerce_install_admin_timestamp is included in tracking data.
	 */
	public function test_get_tracking_data_admin_install_timestamp() {
		$time = time();
		update_option( 'poocommerce_admin_install_timestamp', $time );
		$tracking_data = WC_Tracker::get_tracking_data();
		$this->assertArrayHasKey( 'admin_install_timestamp', $tracking_data['settings'] );
		$this->assertEquals( $tracking_data['settings']['admin_install_timestamp'], $time );
		delete_option( 'poocommerce_admin_install_timestamp' );
	}

	/**
	 * @testDox Test tracking data records snapshot generation time.
	 */
	public function test_get_tracking_data_snapshot_generation_time() {
		$this->assertGreaterThan( 0, WC_Tracker::get_tracking_data()['snapshot_generation_time'] );
	}

	/**
	 * @testDox Test poocommerce_allow_tracking related data is included in tracking snapshot.
	 */
	public function test_tracking_data_poocommerce_allow_tracking() {
		$current_poocommerce_allow_tracking = get_option( 'poocommerce_allow_tracking', 'no' );

		// Clear everything.
		update_option( 'poocommerce_allow_tracking', 'no' );
		delete_option( 'poocommerce_allow_tracking_last_modified' );
		delete_option( 'poocommerce_allow_tracking_first_optin' );

		$tracking_data = WC_Tracker::get_tracking_data();
		$this->assertArrayHasKey( 'poocommerce_allow_tracking', $tracking_data );
		$this->assertArrayHasKey( 'poocommerce_allow_tracking_last_modified', $tracking_data );
		$this->assertArrayHasKey( 'poocommerce_allow_tracking_first_optin', $tracking_data );

		$this->assertEquals( $tracking_data['poocommerce_allow_tracking'], 'no' );
		$this->assertEquals( $tracking_data['poocommerce_allow_tracking_last_modified'], 'unknown' );
		$this->assertEquals( $tracking_data['poocommerce_allow_tracking_first_optin'], 'unknown' );

		$time_one = time();
		update_option( 'poocommerce_allow_tracking', 'yes' );
		$tracking_data = WC_Tracker::get_tracking_data();
		$this->assertEquals( $tracking_data['poocommerce_allow_tracking'], 'yes' );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_last_modified'] >= $time_one );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_first_optin'] >= $time_one );

		sleep( 1 ); // be sure $time_two is at least one second after $time_one.
		$time_two = time();
		update_option( 'poocommerce_allow_tracking', 'no' );
		$tracking_data = WC_Tracker::get_tracking_data();

		$this->assertEquals( $tracking_data['poocommerce_allow_tracking'], 'no' );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_last_modified'] >= $time_two );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_first_optin'] >= $time_one && $tracking_data['poocommerce_allow_tracking_first_optin'] < $time_two );

		sleep( 1 ); // be sure $time_three is at least one second after $time_two.
		$time_three = time();
		update_option( 'poocommerce_allow_tracking', 'yes' );
		$tracking_data = WC_Tracker::get_tracking_data();
		$this->assertEquals( $tracking_data['poocommerce_allow_tracking'], 'yes' );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_last_modified'] >= $time_three );
		$this->assertTrue( $tracking_data['poocommerce_allow_tracking_first_optin'] >= $time_one && $tracking_data['poocommerce_allow_tracking_first_optin'] < $time_two );

		// Restore everything as it was.
		update_option( 'poocommerce_allow_tracking', $current_poocommerce_allow_tracking );
		delete_option( 'poocommerce_allow_tracking_last_modified' );
		delete_option( 'poocommerce_allow_tracking_first_optin' );
	}

	/**
	 * @testDox Test address autocomplete tracking data.
	 */
	public function test_get_address_autocomplete_info() {
		// Test when address autocomplete is disabled (default).
		update_option( 'poocommerce_address_autocomplete_enabled', 'no' );
		$data = WC_Tracker::get_address_autocomplete_info();
		$this->assertEquals( 'no', $data['enabled'] );
		$this->assertIsArray( $data['providers'] );
		$this->assertEmpty( $data['providers'] );
		$this->assertEquals( '', $data['preferred_provider'] );

		// Test when address autocomplete is enabled but no providers registered.
		update_option( 'poocommerce_address_autocomplete_enabled', 'yes' );
		$data = WC_Tracker::get_address_autocomplete_info();
		// Should be disabled if no providers are available.
		$this->assertEquals( 'no', $data['enabled'] );
		$this->assertEmpty( $data['providers'] );
		$this->assertEquals( '', $data['preferred_provider'] );

		// Test with a single registered provider and preferred provider set.
		$this->register_mock_address_provider();
		update_option( 'poocommerce_address_autocomplete_provider', 'mock-address-provider' );

		update_option( 'poocommerce_address_autocomplete_enabled', 'yes' );
		$data = WC_Tracker::get_address_autocomplete_info();
		$this->assertEquals( 'yes', $data['enabled'] );
		$this->assertIsArray( $data['providers'] );
		$this->assertCount( 1, $data['providers'] );
		$this->assertContains( 'mock-address-provider', $data['providers'] );
		// Should return the preferred provider we set.
		$this->assertEquals( 'mock-address-provider', $data['preferred_provider'] );

		// Clean up before testing multiple providers.
		remove_all_filters( 'poocommerce_address_providers' );

		// Test with multiple registered providers and different preferred provider.
		$this->register_multiple_mock_address_providers();
		update_option( 'poocommerce_address_autocomplete_provider', 'mock-address-provider-two' );

		$data = WC_Tracker::get_address_autocomplete_info();
		$this->assertEquals( 'yes', $data['enabled'] );
		$this->assertIsArray( $data['providers'] );
		$this->assertCount( 2, $data['providers'] );
		$this->assertContains( 'mock-address-provider', $data['providers'] );
		$this->assertContains( 'mock-address-provider-two', $data['providers'] );
		// Should return the second provider as preferred.
		$this->assertEquals( 'mock-address-provider-two', $data['preferred_provider'] );

		// Test with invalid preferred provider (not in the list).
		update_option( 'poocommerce_address_autocomplete_provider', 'non-existent-provider' );
		$data = WC_Tracker::get_address_autocomplete_info();
		// Should fall back to the first provider when the preferred provider doesn't exist.
		$this->assertEquals( 'mock-address-provider', $data['preferred_provider'] );

		// Test with multiple registered providers but feature disabled.
		$this->register_multiple_mock_address_providers();
		update_option( 'poocommerce_address_autocomplete_enabled', 'no' );
		update_option( 'poocommerce_address_autocomplete_provider', 'mock-address-provider-two' );

		$data = WC_Tracker::get_address_autocomplete_info();
		$this->assertEquals( 'no', $data['enabled'] );
		$this->assertIsArray( $data['providers'] );
		$this->assertCount( 2, $data['providers'] );
		$this->assertContains( 'mock-address-provider', $data['providers'] );
		$this->assertContains( 'mock-address-provider-two', $data['providers'] );
		// Should return the second provider as preferred.
		$this->assertEquals( '', $data['preferred_provider'] );

		// Test with invalid preferred provider (not in the list) when feature is disabled.
		update_option( 'poocommerce_address_autocomplete_provider', 'non-existent-provider' );
		$data = WC_Tracker::get_address_autocomplete_info();
		// Should not fall back to the first provider when the preferred provider doesn't exist.
		$this->assertEquals( '', $data['preferred_provider'] );

		// Clean up.
		delete_option( 'poocommerce_address_autocomplete_enabled' );
		delete_option( 'poocommerce_address_autocomplete_provider' );
		remove_all_filters( 'poocommerce_address_providers' );
		// Re-init address providers to ensure class is clean for other tests.
		wc_get_container()->get( \Automattic\PooCommerce\Internal\AddressProvider\AddressProviderController::class )->init();
	}

	/**
	 * Helper method to register a mock address provider.
	 */
	private function register_mock_address_provider() {
		// Register the provider instance.
		add_filter(
			'poocommerce_address_providers',
			function ( $providers ) {
				$providers[] = new WC_Tracker_Test_MockAddressProvider();
				return $providers;
			}
		);
	}

	/**
	 * Helper method to register multiple mock address providers.
	 */
	private function register_multiple_mock_address_providers() {
		// Register multiple provider instances with different IDs.
		add_filter(
			'poocommerce_address_providers',
			function ( $providers ) {
				$providers[] = new WC_Tracker_Test_MockAddressProvider( 'mock-address-provider', 'Mock Address Provider' );
				$providers[] = new WC_Tracker_Test_MockAddressProvider( 'mock-address-provider-two', 'Mock Address Provider Two' );
				return $providers;
			}
		);
	}
}
