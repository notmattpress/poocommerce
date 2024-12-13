<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Tests\Admin\Features\ShippingPartnerSuggestions;

use Automattic\PooCommerce\Admin\Features\PaymentGatewaySuggestions\EvaluateSuggestion;
use Automattic\PooCommerce\Admin\Features\ShippingPartnerSuggestions\DefaultShippingPartners;
use WC_Unit_Test_Case;

/**
 * DefaultShippingPartners test.
 *
 * @class DefaultShippingPartnersTest
 */
class DefaultShippingPartnersTest extends WC_Unit_Test_Case {

	/**
	 * Set things up before each test case.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		update_option( 'poocommerce_default_country', 'US:CA' );

		/*
		 * Required for the BaseLocationCountryRuleProcessor
		 * to not return false for "US:CA" country-state combo.
		 */
		update_option( 'poocommerce_store_address', 'foo' );

		update_option( 'active_plugins', array( 'foo/foo.php' ) );

		EvaluateSuggestion::reset_memo();
	}

	/**
	 * Tests if in a default situation there are no errors.
	 *
	 * @return void
	 */
	public function test_it_evaluates_with_no_errors() {
		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		$this->assertCount( 0, $results['errors'] );
	}

	/**
	 * Tests if WCS&T is present by default.
	 *
	 * @return void
	 */
	public function test_wcservices_is_present() {
		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		$this->assertCount( 0, $results['errors'] );
		$this->assertCount( 1, $results['suggestions'] );
		$this->assertEquals( 'poocommerce-services', $results['suggestions'][0]->id );
	}

	/**
	 * Asserts WCS&T is not recommended in unsupported countries.
	 *
	 * @return void
	 */
	public function test_wcservices_is_absent_if_in_an_unsupported_country() {
		update_option( 'poocommerce_default_country', 'FOO' );

		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		$this->assertCount( 0, $results['errors'] );
		$this->assertCount( 0, $results['suggestions'] );
	}

	/**
	 * Asserts no extensions are recommended if PooCommerce Shipping is active.
	 *
	 * @return void
	 */
	public function test_no_extensions_are_recommended_if_poocommerce_shipping_is_active() {
		// Arrange.
		// Make sure the plugin passes as active.
		$shipping_plugin_file = 'poocommerce-shipping/poocommerce-shipping.php';
		// To pass the validation, we need to the plugin file to exist.
		$shipping_plugin_file_path = WP_PLUGIN_DIR . '/' . $shipping_plugin_file;
		self::touch( $shipping_plugin_file_path );
		update_option( 'active_plugins', array( $shipping_plugin_file ) );

		// Act.
		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		// Assert.
		$this->assertCount( 0, $results['errors'] );
		$this->assertCount( 0, $results['suggestions'] );

		// Clean up.
		self::rmdir( dirname( $shipping_plugin_file_path ) );
		self::delete_folders( dirname( $shipping_plugin_file_path ) );
	}

	/**
	 * Asserts no extensions are recommended if PooCommerce Tax is active.
	 *
	 * @return void
	 */
	public function test_no_extensions_are_recommended_if_poocommerce_tax_is_active() {
		// Arrange.
		// Make sure the plugin passes as active.
		$tax_plugin_file = 'poocommerce-tax/poocommerce-tax.php';
		// To pass the validation, we need to the plugin file to exist.
		$tax_plugin_file_path = WP_PLUGIN_DIR . '/' . $tax_plugin_file;
		self::touch( $tax_plugin_file_path );
		update_option( 'active_plugins', array( $tax_plugin_file ) );

		// Act.
		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		// Assert.
		$this->assertCount( 0, $results['errors'] );
		$this->assertCount( 0, $results['suggestions'] );

		// Clean up.
		self::rmdir( dirname( $tax_plugin_file_path ) );
		self::delete_folders( dirname( $tax_plugin_file_path ) );
	}

	/**
	 * Asserts no extensions are recommended if both PooCommerce Shipping and PooCommerce Tax are active.
	 *
	 * @return void
	 */
	public function test_no_extensions_are_recommended_if_both_poocommerce_shipping_and_poocommerce_tax_are_active() {
		// Arrange.
		// Make sure the plugin passes as active.
		$shipping_plugin_file = 'poocommerce-shipping/poocommerce-shipping.php';
		// To pass the validation, we need to the plugin file to exist.
		$shipping_plugin_file_path = WP_PLUGIN_DIR . '/' . $shipping_plugin_file;
		self::touch( $shipping_plugin_file_path );

		// Make sure the plugin passes as active.
		$tax_plugin_file = 'poocommerce-tax/poocommerce-tax.php';
		// To pass the validation, we need to the plugin file to exist.
		$tax_plugin_file_path = WP_PLUGIN_DIR . '/' . $tax_plugin_file;
		self::touch( $tax_plugin_file_path );

		update_option( 'active_plugins', array( $shipping_plugin_file, $tax_plugin_file ) );

		// Act.
		$specs   = DefaultShippingPartners::get_all();
		$results = EvaluateSuggestion::evaluate_specs( $specs );

		// Assert.
		$this->assertCount( 0, $results['errors'] );
		$this->assertCount( 0, $results['suggestions'] );

		// Clean up.
		self::rmdir( dirname( $shipping_plugin_file_path ) );
		self::delete_folders( dirname( $shipping_plugin_file_path ) );
		self::rmdir( dirname( $tax_plugin_file_path ) );
		self::delete_folders( dirname( $tax_plugin_file_path ) );
	}
}
