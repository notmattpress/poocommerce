<?php
/**
 * Test template functions.
 *
 * @package PooCommerce\Tests\Templates
 * @since   3.4.0
 */

use Automattic\PooCommerce\Enums\ProductStockStatus;

/**
 * WC_Tests_Template_Functions class.
 */
class WC_Tests_Template_Functions extends WC_Unit_Test_Case {

	/**
	 * Test wc_get_product_class().
	 *
	 * @covers ::wc_product_class()
	 * @covers ::wc_product_post_class()
	 * @covers ::wc_get_product_taxonomy_class()
	 * @since 3.4.0
	 */
	public function test_wc_get_product_class() {
		$category = wp_insert_term( 'Some Category', 'product_cat' );

		$product = new WC_Product_Simple();
		$product->set_virtual( true );
		$product->set_regular_price( '10' );
		$product->set_sale_price( '5' );
		$product->set_category_ids( array( $category['term_id'] ) );
		$product->save();

		$product  = wc_get_product( $product ); // Reload so status is current.
		$expected = array(
			'foo',
			'product',
			'type-product',
			'post-' . $product->get_id(),
			'status-publish',
			'first',
			ProductStockStatus::IN_STOCK,
			'product_cat-some-category',
			'sale',
			'virtual',
			'purchasable',
			'product-type-simple',
		);
		$actual   = array_values( wc_get_product_class( 'foo', $product ) );

		$this->assertEquals( $expected, $actual, print_r( $actual, true ) );

		// All taxonomies.
		add_filter( 'poocommerce_get_product_class_include_taxonomies', '__return_true' );
		$expected = array(
			'foo',
			'product',
			'type-product',
			'post-' . $product->get_id(),
			'status-publish',
			ProductStockStatus::IN_STOCK,
			'product_cat-some-category',
			'sale',
			'virtual',
			'purchasable',
			'product-type-simple',
		);
		$actual   = array_values( wc_get_product_class( 'foo', $product ) );

		$this->assertEquals( $expected, $actual, print_r( $actual, true ) );
		add_filter( 'poocommerce_get_product_class_include_taxonomies', '__return_false' );

		$product->delete( true );
		wp_delete_term( $category['term_id'], 'product_cat' );
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_options_no_attributes.
	 */
	public function test_wc_dropdown_variation_attribute_options_no_attributes() {
		$this->expectOutputString( '<select id="" class="" name="attribute_" data-attribute_name="attribute_" data-show_option_none="yes"><option value="">Choose an option</option></select>' );

		wc_dropdown_variation_attribute_options();
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_options_should_return_attributes_list.
	 */
	public function test_wc_dropdown_variation_attribute_options_should_return_attributes_list() {
		$product = WC_Helper_Product::create_variation_product();

		$this->expectOutputString( '<select id="pa_size" class="" name="attribute_pa_size" data-attribute_name="attribute_pa_size" data-show_option_none="yes"><option value="">Choose an option</option><option value="huge" >huge</option><option value="large" >large</option><option value="small" >small</option></select>' );

		wc_dropdown_variation_attribute_options(
			array(
				'product'   => $product,
				'attribute' => 'pa_size',
			)
		);
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_options_should_return_attributes_list_and_selected_element.
	 */
	public function test_wc_dropdown_variation_attribute_options_should_return_attributes_list_and_selected_element() {
		$product                       = WC_Helper_Product::create_variation_product();
		$_REQUEST['attribute_pa_size'] = 'large';

		$this->expectOutputString( '<select id="pa_size" class="" name="attribute_pa_size" data-attribute_name="attribute_pa_size" data-show_option_none="yes"><option value="">Choose an option</option><option value="huge" >huge</option><option value="large"  selected=\'selected\'>large</option><option value="small" >small</option></select>' );

		wc_dropdown_variation_attribute_options(
			array(
				'product'   => $product,
				'attribute' => 'pa_size',
			)
		);

		unset( $_REQUEST['attribute_pa_size'] );
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_options_displays_aria_label_when_defined.
	 */
	public function test_wc_dropdown_variation_attribute_options_displays_aria_label_when_defined() {
		$product = WC_Helper_Product::create_variation_product();

		$this->expectOutputString( '<select id="pa_size" class="" name="attribute_pa_size" aria-label="Size for product" data-attribute_name="attribute_pa_size" data-show_option_none="yes"><option value="">Choose an option</option><option value="huge" >huge</option><option value="large" >large</option><option value="small" >small</option></select>' );

		wc_dropdown_variation_attribute_options(
			array(
				'product'    => $product,
				'attribute'  => 'pa_size',
				'aria-label' => 'Size for product',
			)
		);
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_options_escapes_aria_label_attribute.
	 */
	public function test_wc_dropdown_variation_attribute_options_escapes_aria_label_attribute() {
		$product = WC_Helper_Product::create_variation_product();

		$this->expectOutputString( '<select id="pa_size" class="" name="attribute_pa_size" aria-label="&quot; onload=&quot;alert(&#039;XSS&#039;)&quot;" data-attribute_name="attribute_pa_size" data-show_option_none="yes"><option value="">Choose an option</option><option value="huge" >huge</option><option value="large" >large</option><option value="small" >small</option></select>' );

		wc_dropdown_variation_attribute_options(
			array(
				'product'    => $product,
				'attribute'  => 'pa_size',
				'aria-label' => '" onload="alert(\'XSS\')"',
			)
		);
	}

	/**
	 * Test: test_wc_dropdown_variation_attribute_does_not_include_attribute_with_falsey_values.
	 *
	 * @dataProvider data_wc_dropdown_variation_attribute_does_not_include_attribute_with_falsey_values
	 *
	 * @param mixed $attribute_value The falsey attribute value to test.
	 */
	public function test_wc_dropdown_variation_attribute_does_not_include_attribute_with_falsey_values( $attribute_value ) {
		$product = WC_Helper_Product::create_variation_product();

		$this->expectOutputString( '<select id="pa_size" class="" name="attribute_pa_size" data-attribute_name="attribute_pa_size" data-show_option_none="yes"><option value="">Choose an option</option><option value="huge" >huge</option><option value="large" >large</option><option value="small" >small</option></select>' );

		wc_dropdown_variation_attribute_options(
			array(
				'product'    => $product,
				'attribute'  => 'pa_size',
				'aria-label' => $attribute_value,
			)
		);
	}

	/**
	 * Data provider for test_wc_dropdown_variation_attribute_does_not_include_attribute_with_falsey_values.
	 *
	 * @return array[] Data provider
	 */
	public function data_wc_dropdown_variation_attribute_does_not_include_attribute_with_falsey_values() {
		return array(
			'false'        => array( false ),
			'null'         => array( null ),
			'0 (int)'      => array( 0 ),
			'0 (string)'   => array( '0' ),
			'0.0 (float)'  => array( 0.0 ),
			'empty string' => array( '' ),
			'empty array'  => array( array() ),
		);
	}

	/**
	 * Test wc_query_string_form_fields.
	 *
	 * @return void
	 */
	public function test_wc_query_string_form_fields() {
		$actual_html   = wc_query_string_form_fields( '?test=1', array(), '', true );
		$expected_html = '<input type="hidden" name="test" value="1" />';
		$this->assertEquals( $expected_html, $actual_html );

		$actual_html   = wc_query_string_form_fields( '?test=1&test2=something', array(), '', true );
		$expected_html = '<input type="hidden" name="test" value="1" /><input type="hidden" name="test2" value="something" />';
		$this->assertEquals( $expected_html, $actual_html );

		$actual_html   = wc_query_string_form_fields( '?test.something=something.else', array(), '', true );
		$expected_html = '<input type="hidden" name="test.something" value="something.else" />';
		$this->assertEquals( $expected_html, $actual_html );

		$actual_html   = wc_query_string_form_fields( '?test+something=something+else', array(), '', true );
		$expected_html = '<input type="hidden" name="test+something" value="something+else" />';
		$this->assertEquals( $expected_html, $actual_html );

		$actual_html   = wc_query_string_form_fields( '?test%20something=something%20else', array(), '', true );
		$expected_html = '<input type="hidden" name="test_something" value="something else" />';
		$this->assertEquals( $expected_html, $actual_html );
	}

	/**
	 * Test test_wc_get_pay_buttons().
	 */
	public function test_wc_get_pay_buttons() {
		// Test default.
		ob_start();
		wc_get_pay_buttons();
		$actual_html = ob_get_clean();

		$this->assertEquals( '', $actual_html );

		// Include a payment gateway that supports "pay button".
		add_filter(
			'poocommerce_payment_gateways',
			function ( $gateways ) {
				$gateways[] = 'WC_Mock_Payment_Gateway';

				return $gateways;
			}
		);
		WC()->payment_gateways()->init();

		// Test pay buttons HTML.
		ob_start();
		wc_get_pay_buttons();
		$actual_html = ob_get_clean();

		$gateway       = new WC_Mock_Payment_Gateway();
		$expected_html = sprintf(
			'<div class="poocommerce-pay-buttons"><div class="poocommerce-pay-button__%1$s %1$s" id="%1$s"></div></div>',
			$gateway->get_pay_button_id()
		);

		$this->assertEquals( $expected_html, $actual_html );
	}

	public function test_hidden_field() {
		$actual_html   = poocommerce_form_field(
			'test',
			array(
				'type'              => 'hidden',
				'id'                => 'test_field',
				'input_class'       => array( 'test-field' ),
				'custom_attributes' => array( 'data-total' => '10' ),
				'return'            => true,
			),
			'test value'
		);
		$expected_html = '<p class="form-row " id="test_field_field" data-priority=""><span class="poocommerce-input-wrapper"><input type="hidden" class="input-hidden test-field" name="test" id="test_field" value="test value" data-total="10" /></span></p>';

		$this->assertEquals( $expected_html, $actual_html );
	}

	/**
	 * Test: test_radio_not_required_field.
	 */
	public function test_radio_not_required_field() {
		$actual_html = poocommerce_form_field(
			'test',
			array(
				'type'     => 'radio',
				'id'       => 'test',
				'required' => false,
				'options'  => array(
					'1' => 'Option 1',
					'2' => 'Option 2',
				),
				'return'   => true,
			),
			'1'
		);

		$this->assertStringNotContainsString( 'aria-required', $actual_html );
	}

	/**
	 * Test: test_radio_required_field.
	 */
	public function test_radio_required_field() {
		$actual_html   = poocommerce_form_field(
			'test',
			array(
				'type'     => 'radio',
				'id'       => 'test_radio',
				'required' => true,
				'options'  => array(
					'1' => 'Option 1',
					'2' => 'Option 2',
				),
				'return'   => true,
			),
			'1'
		);
		$expected_html = '<p class="form-row validate-required" id="test_radio_field" data-priority=""><span class="poocommerce-input-wrapper"><input type="radio" class="input-radio " value="1" name="test" aria-required="true" id="test_radio_1" checked=\'checked\' /><label for="test_radio_1" class="radio required_field">Option 1&nbsp;<span class="required" aria-hidden="true">*</span></label><input type="radio" class="input-radio " value="2" name="test" aria-required="true" id="test_radio_2" /><label for="test_radio_2" class="radio required_field">Option 2&nbsp;<span class="required" aria-hidden="true">*</span></label></span></p>';

		$this->assertEquals( $expected_html, $actual_html );
	}

	/**
	 * Test: test_checkbox_not_required_field.
	 */
	public function test_checkbox_not_required_field() {
		$actual_html = poocommerce_form_field(
			'test',
			array(
				'type'     => 'checkbox',
				'required' => false,
				'label'    => 'Checkbox',
				'return'   => true,
			),
			'1'
		);

		$this->assertStringNotContainsString( 'aria-required', $actual_html );
	}

	/**
	 * Test: test_checkbox_required_field.
	 */
	public function test_checkbox_required_field() {
		$actual_html   = poocommerce_form_field(
			'test',
			array(
				'type'     => 'checkbox',
				'required' => true,
				'label'    => 'Checkbox',
				'return'   => true,
			),
			'1'
		);
		$expected_html = '<p class="form-row validate-required" id="test_field" data-priority=""><span class="poocommerce-input-wrapper"><label class="checkbox " ><input type="checkbox" name="test" id="test" value="1" class="input-checkbox "  checked=\'checked\' aria-required="true" /> Checkbox&nbsp;<span class="required" aria-hidden="true">*</span></label></span></p>';

		$this->assertEquals( $expected_html, $actual_html );
	}

	/**
	 * Test wc_add_aria_label_to_pagination_numbers with basic pagination links
	 */
	public function test_wc_add_aria_label_to_pagination_numbers_basic() {
		$input_html = '<span class="page-numbers current">1</span> <a class="page-numbers" href="#">2</a>';
		$args       = array( 'current' => 1 );

		$output = wc_add_aria_label_to_pagination_numbers( $input_html, $args );

		$this->assertStringContainsString( 'aria-label="Page 1"', $output );
		$this->assertStringContainsString( 'aria-label="Page 2"', $output );
	}

	/**
	 * Test wc_add_aria_label_to_pagination_numbers with prev/next navigation
	 */
	public function test_wc_add_aria_label_to_pagination_numbers_with_navigation() {
		$input_html = '<a class="prev page-numbers" href="#">Previous</a> ' .
					'<span class="page-numbers current">2</span> ' .
					'<a class="next page-numbers" href="#">Next</a>';
		$args       = array( 'current' => 2 );

		$output = wc_add_aria_label_to_pagination_numbers( $input_html, $args );

		$this->assertStringNotContainsString( 'aria-label="Page Previous"', $output );
		$this->assertStringNotContainsString( 'aria-label="Page Next"', $output );
		$this->assertStringContainsString( 'aria-label="Page 2"', $output );
	}

	/**
	 * Test wc_add_aria_label_to_pagination_numbers with non-standard elements
	 */
	public function test_wc_add_aria_label_to_pagination_numbers_with_non_standard_elements() {
		$input_html = '<div class="page-numbers">1</div> ' .
					'<span class="page-numbers current">2</span> ' .
					'<p class="page-numbers">3</p>';
		$args       = array( 'current' => 2 );

		$output = wc_add_aria_label_to_pagination_numbers( $input_html, $args );

		$this->assertStringNotContainsString( '<div class="page-numbers" aria-label="Page 1">', $output );
		$this->assertStringContainsString( 'aria-label="Page 2"', $output );
		$this->assertStringNotContainsString( '<p class="page-numbers" aria-label="Page 3">', $output );
	}

	/**
	 * Test wc_add_aria_label_to_pagination_numbers with malformed arguments
	 */
	public function test_wc_add_aria_label_to_pagination_numbers_malformed_args() {
		$input_html     = '<span class="page-numbers current">1</span> <a class="page-numbers" href="#">2</a>';
		$malformed_args = array( 'current' => 'a' );

		$output = wc_add_aria_label_to_pagination_numbers( $input_html, $malformed_args );

		// When args['current'] is not a valid number, the function should gracefully handle it
		// by defaulting to page 0 and still add appropriate aria-labels to maintain accessibility.
		$this->assertStringContainsString( 'aria-label="Page 0"', $output );
		$this->assertStringContainsString( 'aria-label="Page 0"', $output );
	}
}
