<?php
/**
 * Unit tests for the WC_Cart_Test class.
 *
 * @package PooCommerce\Tests\Cart.
 */
use Automattic\PooCommerce\Tests\Blocks\Helpers\FixtureData;

/**
 * Class WC_Cart_Test
 */
class WC_Cart_Test extends \WC_Unit_Test_Case {
	/**
	 * Called before every test.
	 */
	public function setUp(): void {
		parent::setUp();
		$fixtures = new FixtureData();
		$fixtures->shipping_add_flat_rate();
	}

	/**
	 * tearDown.
	 */
	public function tearDown(): void {
		parent::tearDown();

		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );
		WC()->session->set( 'wc_notices', null );
	}

	/**
	 * @testdox should throw a notice to the cart if an "any" attribute is empty.
	 */
	public function test_add_variation_to_the_cart_with_empty_attributes() {
		WC()->cart->empty_cart();
		WC()->session->set( 'wc_notices', null );

		$product    = WC_Helper_Product::create_variation_product();
		$variations = $product->get_available_variations();

		// Get a variation with small pa_size and any pa_colour and pa_number.
		$variation = $variations[0];

		// Add variation using parent id.
		WC()->cart->add_to_cart(
			$variation['variation_id'],
			1,
			0,
			array(
				'attribute_pa_colour' => '',
				'attribute_pa_number' => '',
			)
		);
		$notices = WC()->session->get( 'wc_notices', array() );

		// Check for cart contents.
		$this->assertCount( 0, WC()->cart->get_cart_contents() );
		$this->assertEquals( 0, WC()->cart->get_cart_contents_count() );

		// Check that the notices contain an error message about invalid colour and number.
		$this->assertArrayHasKey( 'error', $notices );
		$this->assertCount( 1, $notices['error'] );
		$this->assertEquals( 'colour and number are required fields', $notices['error'][0]['notice'] );

		// Reset cart.
		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );
		$product->delete( true );
	}

	/**
	 * @testdox should throw a notice to the cart if using variation_id
	 * that doesn't belong to specified variable product.
	 */
	public function test_add_variation_to_the_cart_invalid_variation_id() {
		WC()->cart->empty_cart();
		WC()->session->set( 'wc_notices', null );

		$variable_product = WC_Helper_Product::create_variation_product();
		$single_product   = WC_Helper_Product::create_simple_product();

		// Add variation using parent id.
		WC()->cart->add_to_cart(
			$variable_product->get_id(),
			1,
			$single_product->get_id()
		);
		$notices = WC()->session->get( 'wc_notices', array() );

		// Check for cart contents.
		$this->assertCount( 0, WC()->cart->get_cart_contents() );
		$this->assertEquals( 0, WC()->cart->get_cart_contents_count() );

		// Check that the notices contain an error message about invalid colour and number.
		$this->assertArrayHasKey( 'error', $notices );
		$this->assertCount( 1, $notices['error'] );
		$expected = sprintf( sprintf( 'The selected product isn\'t a variation of %2$s, please choose product options by visiting <a href="%1$s" title="%2$s">%2$s</a>.', esc_url( $variable_product->get_permalink() ), esc_html( $variable_product->get_name() ) ) );
		$this->assertEquals( $expected, $notices['error'][0]['notice'] );

		// Reset cart.
		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );
		$variable_product->delete( true );
	}

	/**
	 * @testdox should throw a notice to the cart if using an invalid product_id.
	 */
	public function test_add_variation_to_the_cart_invalid_product() {
		WC()->cart->empty_cart();
		WC()->session->set( 'wc_notices', null );

		$single_product = WC_Helper_Product::create_simple_product();

		// Add variation using parent id.
		WC()->cart->add_to_cart(
			-1,
			1,
			$single_product->get_id()
		);
		$notices = WC()->session->get( 'wc_notices', array() );

		// Check for cart contents.
		$this->assertCount( 0, WC()->cart->get_cart_contents() );
		$this->assertEquals( 0, WC()->cart->get_cart_contents_count() );

		$this->assertArrayHasKey( 'error', $notices );
		$this->assertCount( 1, $notices['error'] );
		$expected = sprintf( 'The selected product is invalid.' );
		$this->assertEquals( $expected, $notices['error'][0]['notice'] );

		// Reset cart.
		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );
	}

	/**
	 * @testdox variable product should not be added to the cart if variation_id=0.
	 */
	public function test_add_variation_to_the_cart_zero_variation_id() {
		WC()->cart->empty_cart();
		WC()->session->set( 'wc_notices', null );

		$variable_product = WC_Helper_Product::create_variation_product();

		// Add variable and variation_id=0.
		WC()->cart->add_to_cart(
			$variable_product->get_id(),
			1,
			0
		);
		$notices = WC()->session->get( 'wc_notices', array() );

		// Check for cart contents.
		$this->assertCount( 0, WC()->cart->get_cart_contents() );
		$this->assertEquals( 0, WC()->cart->get_cart_contents_count() );

		// Check that the notices contain an error message about the product option is not selected.
		$this->assertArrayHasKey( 'error', $notices );
		$this->assertCount( 1, $notices['error'] );
		$expected = sprintf( sprintf( 'Please choose product options by visiting <a href="%1$s" title="%2$s">%2$s</a>.', esc_url( $variable_product->get_permalink() ), esc_html( $variable_product->get_name() ) ) );
		$this->assertEquals( $expected, $notices['error'][0]['notice'] );

		// Reset cart.
		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );
		$variable_product->delete( true );
	}

	/**
	 * Test cloning cart holds no references in session
	 */
	public function test_cloning_cart_session() {
		$product = WC_Helper_Product::create_simple_product();

		// Initialize $cart1 and $cart2 as empty carts.
		$cart1 = WC()->cart;
		$cart1->empty_cart();
		$cart2 = clone $cart1;

		// Create a cart in session.
		$cart1->add_to_cart( $product->get_id(), 1 );
		$cart1->set_session();

		// Empty the cart without clearing the session.
		$cart1->set_cart_contents( array() );

		// Both carts are empty at that point.
		$this->assertTrue( $cart2->is_empty() );
		$this->assertTrue( $cart1->is_empty() );

		$cart2->get_cart_from_session();

		// We retrieved $cart2 from the previously set session so it should not be empty.
		$this->assertFalse( $cart2->is_empty() );

		// We didn't touch $cart1 so it should still be empty.
		$this->assertTrue( $cart1->is_empty() );
	}

	/**
	 * Test show shipping.
	 */
	public function test_show_shipping() {
		// Test with an empty cart.
		$this->assertFalse( WC()->cart->show_shipping() );

		// Add a product to the cart.
		$product = WC_Helper_Product::create_simple_product();
		WC()->cart->add_to_cart( $product->get_id(), 1 );

		// Test with "poocommerce_ship_to_countries" disabled.
		$default_ship_to_countries = get_option( 'poocommerce_ship_to_countries', '' );
		update_option( 'poocommerce_ship_to_countries', 'disabled' );
		$this->assertFalse( WC()->cart->show_shipping() );

		// Test with default "poocommerce_ship_to_countries" and "poocommerce_shipping_cost_requires_address".
		update_option( 'poocommerce_ship_to_countries', $default_ship_to_countries );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Test with "poocommerce_shipping_cost_requires_address" enabled.
		$default_shipping_cost_requires_address = get_option( 'poocommerce_shipping_cost_requires_address', 'no' );
		update_option( 'poocommerce_shipping_cost_requires_address', 'yes' );
		$this->assertFalse( WC()->cart->show_shipping() );

		// Set address for shipping calculation required for "poocommerce_shipping_cost_requires_address".
		WC()->cart->get_customer()->set_shipping_country( 'US' );
		WC()->cart->get_customer()->set_shipping_state( 'NY' );
		WC()->cart->get_customer()->set_shipping_city( 'New York' );
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Remove postcode while it is still required, validate shipping is hidden again.
		WC()->cart->get_customer()->set_shipping_postcode( '' );
		$this->assertFalse( WC()->cart->show_shipping() );

		/**
		 * Make shipping fields postcode optional.
		 * @param array $fields Shipping fields.
		 *
		 * @return array
		 */
		function make_shipping_fields_postcode_optional( $fields ) {
			$fields['shipping_postcode']['required'] = 0;
			return $fields;
		}
		add_filter(
			'poocommerce_shipping_fields',
			'make_shipping_fields_postcode_optional'
		);
		$this->assertTrue( WC()->cart->show_shipping() );
		// Check shipping still shows when postcode is optional and set.
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		$this->assertTrue( WC()->cart->show_shipping() );

		remove_all_filters( 'poocommerce_shipping_fields' );
		$this->assertTrue( WC()->cart->show_shipping() );
		WC()->cart->get_customer()->set_shipping_postcode( '' );
		$this->assertFalse( WC()->cart->show_shipping() );

		/**
		 * Make locale postcode optional.
		 * @param array $locales Locales.
		 *
		 * @return array
		 */
		function make_locale_postcode_optional( $locales ) {
			foreach ( $locales as $country => $locale ) {
				$locales[ $country ]['postcode']['required'] = false;
				$locales[ $country ]['postcode']['hidden']   = true;
			}
			return $locales;
		}
		add_filter( 'poocommerce_get_country_locale', 'make_locale_postcode_optional' );

		// Reset locales so they are regenerated with the new postcode optional.
		WC()->countries->locale = null;
		$this->assertTrue( WC()->cart->show_shipping() );
		// Check shipping still shows when postcode is optional and set.
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Check that both fields and locale filter work when both are in use together.
		add_filter(
			'poocommerce_shipping_fields',
			'make_shipping_fields_postcode_optional'
		);
		WC()->cart->get_customer()->set_shipping_postcode( '' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Check shipping still shows when postcode is optional and set.
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Reset.
		remove_all_filters( 'poocommerce_shipping_fields' );
		remove_all_filters( 'poocommerce_get_country_locale' );

		/**
		 * Remove unwanted fields from checkout page.
		 *
		 * @param array $fields of checkout fields.
		 *
		 * @return mixed
		 */
		function remove_unwanted_fields_from_checkout_page( $fields ) {
			unset( $fields['shipping']['shipping_company'] );
			unset( $fields['shipping']['shipping_city'] );
			unset( $fields['shipping']['shipping_postcode'] );
			unset( $fields['shipping']['shipping_address_2'] );
			return $fields;
		}
		add_filter( 'poocommerce_checkout_fields', 'remove_unwanted_fields_from_checkout_page' );

		WC()->cart->get_customer()->set_shipping_postcode( '' );
		WC()->cart->get_customer()->set_shipping_city( '' );
		$this->assertTrue( WC()->cart->show_shipping() );
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		WC()->cart->get_customer()->set_shipping_city( 'San Francisco' );
		$this->assertTrue( WC()->cart->show_shipping() );

		remove_filter( 'poocommerce_checkout_fields', 'remove_unwanted_fields_from_checkout_page' );

		update_option( 'poocommerce_shipping_cost_requires_address', $default_shipping_cost_requires_address );
		$product->delete( true );
		WC()->cart->get_customer()->set_shipping_country( 'GB' );
		WC()->cart->get_customer()->set_shipping_state( '' );
		WC()->cart->get_customer()->set_shipping_city( '' );
		WC()->cart->get_customer()->set_shipping_postcode( '' );
	}

	/**
	 * Test show_shipping for countries with various state/postcode requirement.
	 */
	public function test_show_shipping_for_countries_different_shipping_requirements() {
		$default_shipping_cost_requires_address = get_option( 'poocommerce_shipping_cost_requires_address', 'no' );
		update_option( 'poocommerce_shipping_cost_requires_address', 'yes' );

		WC()->cart->empty_cart();
		$this->assertFalse( WC()->cart->show_shipping() );

		$product = WC_Helper_Product::create_simple_product();
		WC()->cart->add_to_cart( $product->get_id(), 1 );

		// Country that does not require state.
		WC()->cart->get_customer()->set_shipping_country( 'LB' );
		WC()->cart->get_customer()->set_shipping_state( '' );
		WC()->cart->get_customer()->set_shipping_city( 'Test' );
		WC()->cart->get_customer()->set_shipping_postcode( '12345' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Country that does not require postcode.
		WC()->cart->get_customer()->set_shipping_country( 'NG' );
		WC()->cart->get_customer()->set_shipping_state( 'AB' );
		WC()->cart->get_customer()->set_shipping_city( 'Test' );
		WC()->cart->get_customer()->set_shipping_postcode( '' );
		$this->assertTrue( WC()->cart->show_shipping() );

		// Reset.
		update_option( 'poocommerce_shipping_cost_requires_address', $default_shipping_cost_requires_address );
		$product->delete( true );
		WC()->cart->get_customer()->set_shipping_country( 'GB' );
		WC()->cart->get_customer()->set_shipping_state( '' );
		WC()->cart->get_customer()->set_shipping_city( 'Test' );
		WC()->cart->get_customer()->set_shipping_postcode( '' );
	}

	/**
	 * Test adding a variable product without selecting variations.
	 *
	 * @see WC_Form_Handler::add_to_cart_action()
	 */
	public function test_form_handler_add_to_cart_action_with_parent_variable_product() {
		$this->tearDown();

		$product                 = WC_Helper_Product::create_variation_product();
		$product_id              = $product->get_id();
		$url                     = get_permalink( $product_id );
		$_REQUEST['add-to-cart'] = $product_id;

		WC_Form_Handler::add_to_cart_action();

		$notices = WC()->session->get( 'wc_notices', array() );

		$this->assertArrayHasKey( 'error', $notices );
		$this->assertCount( 1, $notices['error'] );
		$this->assertMatchesRegularExpression( '/Please choose product options by visiting/', $notices['error'][0]['notice'] );
	}
}
