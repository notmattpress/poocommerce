<?php
/**
 * Test for the discounts class.
 * @package PooCommerce\Tests\Discounts
 */

use Automattic\PooCommerce\Enums\ProductTaxStatus;

 /**
  * WC_Tests_Discounts.
  */
class WC_Tests_Discounts extends WC_Unit_Test_Case {

	/**
	 * @var WC_Product[] Array of products to clean up.
	 */
	protected $products;

	/**
	 * @var WC_Coupon[] Array of coupons to clean up.
	 */
	protected $coupons;

	/**
	 * @var WC_Order[] Array of orders to clean up.
	 */
	protected $orders;

	/**
	 * @var array An array containing all the test data from the last Data Provider test.
	 */
	protected $last_test_data;

	/**
	 * Helper function to hold a reference to created coupon objects so they
	 * can be cleaned up properly at the end of each test.
	 *
	 * @param WC_Coupon $coupon The coupon object to store.
	 */
	protected function store_coupon( $coupon ) {
		$this->coupons[ $coupon->get_code() ] = $coupon;
	}

	/**
	 * Helper function to hold a reference to created product objects so they
	 * can be cleaned up properly at the end of each test.
	 *
	 * @param WC_Product $product The product object to store.
	 */
	protected function store_product( $product ) {
		$this->products[] = $product;
	}

	/**
	 * Helper function to hold a reference to created order objects so they
	 * can be cleaned up properly at the end of each test.
	 *
	 * @param WC_Order $order The order object to store.
	 */
	protected function store_order( $order ) {
		$this->orders[] = $order;
	}

	/**
	 * Setup tests.
	 */
	public function setUp(): void {
		parent::setUp();

		$this->products       = array();
		$this->coupons        = array();
		$this->orders         = array();
		$this->last_test_data = null;
	}

	/**
	 * Clean up after each test. DB changes are reverted in parent::tearDown().
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();
		WC()->cart->remove_coupons();

		parent::tearDown();
	}

	/**
	 * Test get and set items.
	 */
	public function test_get_set_items_from_cart() {
		// Create dummy product - price will be 10.
		$product = WC_Helper_Product::create_simple_product();
		$this->store_product( $product );

		// Add product to the cart.
		WC()->cart->add_to_cart( $product->get_id(), 1 );

		// Add product to a dummy order.
		$order = new WC_Order();
		$order->add_product( $product, 1 );
		$order->calculate_totals();
		$order->save();
		$this->store_order( $order );

		// Test setting items to the cart.
		$discounts = new WC_Discounts();
		$discounts->set_items_from_cart( WC()->cart );
		$this->assertEquals( 1, count( $discounts->get_items() ) );

		// Test setting items to an order.
		$discounts = new WC_Discounts();
		$discounts->set_items_from_cart( WC()->cart );
		$this->assertEquals( 1, count( $discounts->get_items() ) );

		// Empty array of items.
		$discounts = new WC_Discounts();
		$discounts->set_items_from_cart( array() );
		$this->assertEquals( array(), $discounts->get_items() );

		// Invalid items.
		$discounts = new WC_Discounts();
		$discounts->set_items_from_cart( false );
		$this->assertEquals( array(), $discounts->get_items() );
	}

	/**
	 * Test set items from cart/order and sorting them by price.
	 */
	public function test_set_items_and_sort_by_price() {
		// Create dummy product - price will be 10.
		$product_1 = WC_Helper_Product::create_simple_product();
		$this->store_product( $product_1 );

		// Create a more expensive product.
		$product_2 = WC_Helper_Product::create_simple_product( true, array( 'regular_price' => 20 ) );
		$this->store_product( $product_2 );

		// Add products to the cart.
		WC()->cart->add_to_cart( $product_1->get_id(), 1 );
		WC()->cart->add_to_cart( $product_2->get_id(), 1 );

		$discounts = new WC_Discounts();

		// 'sort_by_price' is called when setting items from the cart.
		$discounts->set_items_from_cart( WC()->cart );
		$items = $discounts->get_items();
		$this->assertEquals( 2, count( $items ) );

		// Get sorted items.
		$first_item  = array_values( $items )[0];
		$second_item = array_values( $items )[1];

		// Ensure that the most expensive product is sorted first.
		$this->assertEquals( $first_item->product->get_id(), $product_2->get_id() );
		$this->assertEquals( $second_item->product->get_id(), $product_1->get_id() );

		WC()->cart->empty_cart();

		// Add products to the cart.
		// This time add the cheaper product 5 times to the cart, so that
		// the subtotal of product 1 > product 2.
		WC()->cart->add_to_cart( $product_1->get_id(), 5 );
		WC()->cart->add_to_cart( $product_2->get_id(), 1 );

		// 'sort_by_price' is called when setting items from the cart.
		$discounts->set_items_from_cart( WC()->cart );
		$items = $discounts->get_items();
		$this->assertEquals( 2, count( $items ) );

		// Get sorted items.
		$first_item  = array_values( $items )[0];
		$second_item = array_values( $items )[1];

		// Ensure that the most expensive product is still sorted first.
		$this->assertEquals( $first_item->product->get_id(), $product_2->get_id() );
		$this->assertEquals( $second_item->product->get_id(), $product_1->get_id() );

		// Add products to a dummy order.
		$order = new WC_Order();
		$order->add_product( $product_1, 1 );
		$order->add_product( $product_2, 1 );
		$order->calculate_totals();
		$order->save();
		$this->store_order( $order );

		// 'sort_by_price' is called when setting items from the order.
		$discounts->set_items_from_order( $order );

		$items = $discounts->get_items();
		$this->assertEquals( 2, count( $items ) );

		// Get sorted items.
		$first_item  = array_values( $items )[0];
		$second_item = array_values( $items )[1];

		// Ensure that the most expensive product is sorted first.
		$this->assertEquals( $first_item->product->get_id(), $product_2->get_id() );
		$this->assertEquals( $second_item->product->get_id(), $product_1->get_id() );

		// Add products to a dummy order.
		$order = new WC_Order();
		$order->add_product( $product_1, 5 );
		$order->add_product( $product_2, 1 );
		$order->calculate_totals();
		$order->save();
		$this->store_order( $order );

		// 'sort_by_price' is called when setting items from the order.
		$discounts->set_items_from_order( $order );

		$items = $discounts->get_items();
		$this->assertEquals( 2, count( $items ) );

		// Get sorted items.
		$first_item  = array_values( $items )[0];
		$second_item = array_values( $items )[1];

		// Ensure that the most expensive product is still sorted first.
		$this->assertEquals( $first_item->product->get_id(), $product_2->get_id() );
		$this->assertEquals( $second_item->product->get_id(), $product_1->get_id() );
	}

	/**
	 * Test applying a coupon (make sure it changes prices).
	 */
	public function test_apply_coupon() {
		$discounts = new WC_Discounts();

		// Create dummy content.
		$product = WC_Helper_Product::create_simple_product();
		$product->set_tax_status( ProductTaxStatus::TAXABLE );
		$product->save();
		$this->store_product( $product );
		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product->get_id(), 1 );
		$coupon = WC_Helper_Coupon::create_coupon( 'test' );
		$coupon->set_amount( 10 );
		$this->store_coupon( $coupon );

		// Apply a percent discount.
		$coupon->set_discount_type( 'percent' );
		$discounts->set_items_from_cart( WC()->cart );
		$discounts->apply_coupon( $coupon );
		$this->assertEquals( 9, $discounts->get_discounted_price( current( $discounts->get_items() ) ), print_r( $discounts->get_discounts(), true ) );

		// Apply a fixed cart coupon.
		$coupon->set_discount_type( 'fixed_cart' );
		$discounts->set_items_from_cart( WC()->cart );
		$discounts->apply_coupon( $coupon );
		$this->assertEquals( 0, $discounts->get_discounted_price( current( $discounts->get_items() ) ), print_r( $discounts->get_discounts(), true ) );

		// Apply a fixed product coupon.
		$coupon->set_discount_type( 'fixed_product' );
		$discounts->set_items_from_cart( WC()->cart );
		$discounts->apply_coupon( $coupon );
		$this->assertEquals( 0, $discounts->get_discounted_price( current( $discounts->get_items() ) ), print_r( $discounts->get_discounts(), true ) );
	}

	/**
	 * Test various discount calculations are working correctly and producing expected results.
	 *
	 * @dataProvider calculations_test_provider
	 *
	 * @param array $test_data All of the settings to use for testing.
	 */
	public function test_calculations( $test_data ) {
		$this->last_test_data = $test_data;
		$discounts            = new WC_Discounts();
		$products             = array();

		if ( isset( $test_data['tax_rate'] ) ) {
			WC_Tax::_insert_tax_rate( $test_data['tax_rate'] );
		}

		if ( isset( $test_data['wc_options'] ) ) {
			foreach ( $test_data['wc_options'] as $_option_name => $_option_value ) {
				update_option( $_option_name, $_option_value['set'] );
			}
		}

		foreach ( $test_data['cart'] as $key => $item ) {
			$products[ $key ] = WC_Helper_Product::create_simple_product();
			$products[ $key ]->set_regular_price( $item['price'] );
			$products[ $key ]->set_tax_status( ProductTaxStatus::TAXABLE );
			$products[ $key ]->save();
			$this->store_product( $products[ $key ] );
			WC()->cart->add_to_cart( $products[ $key ]->get_id(), $item['qty'] );
		}

		$discounts->set_items_from_cart( WC()->cart );

		foreach ( $test_data['coupons'] as $coupon_props ) {
			$coupon = WC_Helper_Coupon::create_coupon( $coupon_props['code'] );
			$coupon->set_props( $coupon_props );
			$discounts->apply_coupon( $coupon );
			$this->store_coupon( $coupon );
		}

		$all_discounts = $discounts->get_discounts();

		$discount_total = 0;
		foreach ( $all_discounts as $code_name => $discounts_by_coupon ) {
			$discount_total += array_sum( $discounts_by_coupon );
		}

		$this->assertEquals( $test_data['expected_total_discount'], $discount_total, 'Failed (' . print_r( $test_data, true ) . ' - ' . print_r( $discounts->get_discounts(), true ) . ')' );
	}

	/**
	 * This is a dataProvider for test_calculations().
	 *
	 * @return array An array of discount tests to be run.
	 */
	public function calculations_test_provider() {
		return array(
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'wc_options'              => array(
						'poocommerce_calc_taxes' => array(
							'set'    => 'yes',
							'revert' => 'no',
						),
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 2,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
						array(
							'price' => 10,
							'qty'   => 3,
						),
						array(
							'price' => 10,
							'qty'   => 2,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
						array(
							'price' => 10,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 1,
							'qty'   => 1,
						),
						array(
							'price' => 1,
							'qty'   => 1,
						),
						array(
							'price' => 1,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_cart',
							'amount'        => '1',
						),
					),
					'expected_total_discount' => 1,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
					),
					'expected_total_discount' => 1,
				),
			),
			array(
				array(
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
						array(
							'price' => 10,
							'qty'   => 2,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
					),
					'expected_total_discount' => 1,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. No limits. Not discounting sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
						array(
							'price' => 5,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'percent',
							'amount'        => '10',
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 7.5,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. One coupon has limit up to one item. Not discounting sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
						array(
							'price' => 5,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 6,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. No limits. Discounting sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'wc_options'              => array(
						'poocommerce_calc_discounts_sequentially' => array(
							'set'    => 'yes',
							'revert' => 'no',
						),
					),
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 2,
						),
						array(
							'price' => 5,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'percent',
							'amount'        => '10',
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 7,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. No limits. Discounting sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'wc_options'              => array(
						'poocommerce_calc_discounts_sequentially' => array(
							'set'    => 'yes',
							'revert' => 'no',
						),
					),
					'cart'                    => array(
						array(
							'price' => 1.80,
							'qty'   => 10,
						),
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'percent',
							'amount'        => '10',
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 16.75,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. One coupon has limit up to 5 item. Discounting non-sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 3,
						),
						array(
							'price' => 5,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '30',
							'limit_usage_to_x_items' => 5,
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 21,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. One coupon has limit up to 5 item. Discounting sequentially.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'wc_options'              => array(
						'poocommerce_calc_discounts_sequentially' => array(
							'set'    => 'yes',
							'revert' => 'no',
						),
					),
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 3,
						),
						array(
							'price' => 5,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '30',
							'limit_usage_to_x_items' => 5,
						),
					),
					'expected_total_discount' => 18.60,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons. One coupon has limit up to 5 item. Discounting sequentially. Multiple zero-dollar items.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'wc_options'              => array(
						'poocommerce_calc_discounts_sequentially' => array(
							'set'    => 'yes',
							'revert' => 'no',
						),
					),
					'cart'                    => array(
						array(
							'price' => 1.80,
							'qty'   => 3,
						),
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 0,
							'qty'   => 1,
						),
						array(
							'price' => 0,
							'qty'   => 1,
						),
						array(
							'price' => 0,
							'qty'   => 1,
						),
						array(
							'price' => 0,
							'qty'   => 1,
						),
						array(
							'price' => 0,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'percent',
							'amount'                 => '30',
							'limit_usage_to_x_items' => 5,
						),
						array(
							'code'          => 'test1',
							'discount_type' => 'percent',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 20.35,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_product',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 30,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item. Coupon greater than item cost.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_product',
							'amount'        => '20',
						),
					),
					'expected_total_discount' => 41.85,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item. Limit to one item.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
					),
					'expected_total_discount' => 10,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item. Limit to one item. Price greater than product.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '15',
							'limit_usage_to_x_items' => 1,
						),
					),
					'expected_total_discount' => 13.95,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item. Limit to same number of items as product. Price same as product.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '13.95',
							'limit_usage_to_x_items' => 3,
						),
					),
					'expected_total_discount' => 41.85,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. No limit.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_product',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 39,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. Limit to same number of items as first product.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 3,
						),
					),
					'expected_total_discount' => 30,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. Limit to number greater than first product but less than total quantities.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 5,
						),
					),
					'expected_total_discount' => 33.60,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. Limit to number greater than first product but less than total quantities. Amount less than price of either product.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '1',
							'limit_usage_to_x_items' => 5,
						),
					),
					'expected_total_discount' => 5,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. Limit to number greater than both product quantities combined. Amount less than price of either product.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '1',
							'limit_usage_to_x_items' => 10,
						),
					),
					'expected_total_discount' => 8,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on two items. Limit to two items. Testing the products are sorted according to legacy method where first one to apply is the one with greatest price * quantity.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 1.80,
							'qty'   => 5,
						),
						array(
							'price' => 13.95,
							'qty'   => 3,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'test',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 2,
						),
					),
					'expected_total_discount' => 20,
				),
			),
			array(
				array(
					'desc'                    => 'Test single fixed product coupon on one item to illustrate type conversion precision bug.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 8.95,
							'qty'   => 1,
						),
					),
					'coupons'                 => array(
						array(
							'code'          => 'test',
							'discount_type' => 'fixed_product',
							'amount'        => '10',
						),
					),
					'expected_total_discount' => 8.95,
				),
			),
			array(
				array(
					'desc'                    => 'Test multiple coupons with limits of 1.',
					'tax_rate'                => array(
						'tax_rate_country'  => '',
						'tax_rate_state'    => '',
						'tax_rate'          => '20.0000',
						'tax_rate_name'     => 'VAT',
						'tax_rate_priority' => '1',
						'tax_rate_compound' => '0',
						'tax_rate_shipping' => '1',
						'tax_rate_order'    => '1',
						'tax_rate_class'    => '',
					),
					'prices_include_tax'      => false,
					'cart'                    => array(
						array(
							'price' => 10,
							'qty'   => 4,
						),
					),
					'coupons'                 => array(
						array(
							'code'                   => 'one',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
						array(
							'code'                   => 'two',
							'discount_type'          => 'fixed_product',
							'amount'                 => '10',
							'limit_usage_to_x_items' => 1,
						),
						array(
							'code'                   => 'three',
							'discount_type'          => 'percent',
							'amount'                 => '100',
							'limit_usage_to_x_items' => 1,
						),
					),
					'expected_total_discount' => 30,
				),
			),
		);
	}

	/**
	 * test_free_shipping_coupon_no_products.
	 */
	public function test_free_shipping_coupon_no_products() {
		$discounts = new WC_Discounts();
		$coupon    = WC_Helper_Coupon::create_coupon( 'freeshipping' );
		$coupon->set_props(
			array(
				'discount_type' => 'percent',
				'amount'        => '',
				'free_shipping' => 'yes',
			)
		);

		$discounts->apply_coupon( $coupon );

		$all_discounts = $discounts->get_discounts();
		$this->assertEquals( 0, count( $all_discounts['freeshipping'] ), 'Free shipping coupon should not have any discounts.' );
	}

	/**
	 * filter_poocommerce_coupon_get_discount_amount.
	 *
	 * @param float $discount Discount amount.
	 */
	public function filter_poocommerce_coupon_get_discount_amount( $discount ) {
		return $discount / 2;
	}

	/**
	 * test_coupon_discount_amount_filter.
	 */
	public function test_coupon_discount_amount_filter() {
		$discounts = new WC_Discounts();

		add_filter( 'poocommerce_coupon_get_discount_amount', array( $this, 'filter_poocommerce_coupon_get_discount_amount' ) );

		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( 100 );
		$product->set_tax_status( ProductTaxStatus::TAXABLE );
		$product->save();
		WC()->cart->add_to_cart( $product->get_id(), 1 );

		$product2 = WC_Helper_Product::create_simple_product();
		$product2->set_regular_price( 100 );
		$product2->set_tax_status( ProductTaxStatus::TAXABLE );
		$product2->save();
		WC()->cart->add_to_cart( $product2->get_id(), 1 );

		$coupon = WC_Helper_Coupon::create_coupon( 'test' );
		$coupon->set_props(
			array(
				'code'          => 'test',
				'discount_type' => 'percent',
				'amount'        => '20',
			)
		);

		$discounts->set_items_from_cart( WC()->cart );
		$discounts->apply_coupon( $coupon );

		$all_discounts = $discounts->get_discounts();

		$discount_total = 0;
		foreach ( $all_discounts as $code_name => $discounts_by_coupon ) {
			$discount_total += array_sum( $discounts_by_coupon );
		}

		$this->assertEquals( 20, $discount_total );

		remove_filter( 'poocommerce_coupon_get_discount_amount', array( $this, 'filter_poocommerce_coupon_get_discount_amount' ) );
	}

	/**
	 * Test the percent coupon logic with and without sale items.
	 *
	 * @since 3.4.6
	 */
	public function test_is_coupon_valid_percent_sale_items() {
		$product_no_sale = new WC_Product_Simple();
		$product_no_sale->set_regular_price( 20 );
		$product_no_sale->save();

		$product_sale = new WC_Product_Simple();
		$product_sale->set_regular_price( 20 );
		$product_sale->set_sale_price( 10 );
		$product_sale->save();

		$coupon_percent = new WC_Coupon();
		$coupon_percent->set_props(
			array(
				'amount'             => 10,
				'discount_type'      => 'percent',
				'exclude_sale_items' => false,
			)
		);
		$coupon_percent->save();

		$coupon_percent_no_sale = new WC_Coupon();
		$coupon_percent_no_sale->set_props(
			array(
				'amount'             => 10,
				'discount_type'      => 'percent',
				'exclude_sale_items' => true,
			)
		);
		$coupon_percent_no_sale->save();

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product_no_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );

		// Percent coupons should be valid when no sale items are in the cart.
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_percent ) );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_percent_no_sale ) );

		// Percent coupons should be valid when sale items are in the cart.
		WC()->cart->add_to_cart( $product_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_percent ) );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_percent_no_sale ) );

		// Sale-allowed coupons should apply discount to both cart items.
		$discounts->apply_coupon( $coupon_percent );
		$coupon_discounts = array_sum( $discounts->get_discounts_by_coupon() );
		$this->assertEquals( 3.0, $coupon_discounts ); // 10% off $20 + 10% off $10.

		// No-sale coupons should only apply discount to non-sale items.
		$discounts = new WC_Discounts( WC()->cart );
		$discounts->apply_coupon( $coupon_percent_no_sale );
		$coupon_discounts = array_sum( $discounts->get_discounts_by_coupon() );
		$this->assertEquals( 2.0, $coupon_discounts ); // 10% off $20.
	}

	/**
	 * Test the fixed cart coupon logic with and without sale items.
	 *
	 * @since 3.4.6
	 */
	public function test_is_coupon_valid_fixed_cart_sale_items() {
		$product_no_sale = new WC_Product_Simple();
		$product_no_sale->set_regular_price( 20 );
		$product_no_sale->save();

		$product_sale = new WC_Product_Simple();
		$product_sale->set_regular_price( 20 );
		$product_sale->set_sale_price( 10 );
		$product_sale->save();

		$coupon_cart = new WC_Coupon();
		$coupon_cart->set_props(
			array(
				'amount'             => 5,
				'discount_type'      => 'fixed_cart',
				'exclude_sale_items' => false,
			)
		);
		$coupon_cart->save();

		$coupon_cart_no_sale = new WC_Coupon();
		$coupon_cart_no_sale->set_props(
			array(
				'amount'             => 5,
				'discount_type'      => 'fixed_cart',
				'exclude_sale_items' => true,
			)
		);
		$coupon_cart_no_sale->save();

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product_no_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );

		// Fixed cart coupons should be valid when no sale items are in the cart.
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_cart ) );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_cart_no_sale ) );

		// No-sale fixed cart coupons should not be valid when sale items are in the cart.
		WC()->cart->add_to_cart( $product_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_cart ) );
		$this->assertTrue( is_wp_error( $discounts->is_coupon_valid( $coupon_cart_no_sale ) ) );

		// Sale-allowed coupons should apply discount to total cart.
		$discounts->apply_coupon( $coupon_cart );
		$coupon_discounts = array_sum( $discounts->get_discounts_by_coupon() );
		$this->assertEquals( 5.0, $coupon_discounts ); // $5 fixed cart discount.
	}

	/**
	 * Test the per product coupon logic with and without sale items.
	 */
	public function test_is_coupon_valid_fixed_product_sale_items() {
		$product_no_sale = new WC_Product_Simple();
		$product_no_sale->set_regular_price( 20 );
		$product_no_sale->save();

		$product_sale = new WC_Product_Simple();
		$product_sale->set_regular_price( 20 );
		$product_sale->set_sale_price( 10 );
		$product_sale->save();

		$coupon_product = new WC_Coupon();
		$coupon_product->set_props(
			array(
				'amount'             => 5,
				'discount_type'      => 'fixed_product',
				'exclude_sale_items' => false,
			)
		);
		$coupon_product->save();

		$coupon_product_no_sale = new WC_Coupon();
		$coupon_product_no_sale->set_props(
			array(
				'amount'             => 5,
				'discount_type'      => 'fixed_product',
				'exclude_sale_items' => true,
			)
		);
		$coupon_product_no_sale->save();

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product_no_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );

		// Per product coupons should be valid when no sale items are in the cart.
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_product ) );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_product_no_sale ) );

		// Per product coupons should be valid when sale items are in the cart.
		WC()->cart->add_to_cart( $product_sale->get_id(), 1 );
		$discounts = new WC_Discounts( WC()->cart );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_product ) );
		$this->assertTrue( $discounts->is_coupon_valid( $coupon_product_no_sale ) );

		// Sale-allowed coupons should apply discount to each item.
		$discounts->apply_coupon( $coupon_product );
		$coupon_discounts = array_sum( $discounts->get_discounts_by_coupon() );
		$this->assertEquals( 10.0, $coupon_discounts ); // $5 discount for 2 products.

		// No-sale coupons should only apply discount to non-sale items.
		$discounts = new WC_Discounts( WC()->cart );
		$discounts->apply_coupon( $coupon_product_no_sale );
		$coupon_discounts = array_sum( $discounts->get_discounts_by_coupon() );
		$this->assertEquals( 5.0, $coupon_discounts ); // $5 discount for 1 product.
	}

	/**
	 * Test that fixed cart discount coupons maintain their total amount when quantities change in admin orders.
	 *
	 * @link https://github.com/poocommerce/poocommerce/issues/XXXXX
	 */
	public function test_fixed_cart_discount_quantity_change_admin_order() {
		$price = 20;
		// Create a product with a price of $20.
		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( $price );
		$product->save();

		// Create a fixed cart discount coupon of $10.
		$coupon = WC_Helper_Coupon::create_coupon();
		$coupon->set_discount_type( 'fixed_cart' );
		$coupon->set_amount( 10 );
		$coupon->save();

		// Create an order with our specific product and 1 item quantity.
		$order = new WC_Order();
		$order->set_status( 'processing' );
		$order->save();
		$order_item_id = $order->add_product( $product, 1 );

		// Apply the coupon to the order.
		$order->apply_coupon( $coupon->get_code() );
		$order->calculate_totals();

		// Verify initial discount amount is $10.
		$coupons     = $order->get_items( 'coupon' );
		$coupon_item = reset( $coupons );
		$this->assertEquals( 10.0, $coupon_item->get_discount(), 'Initial discount should be $10' );

		// Verify order total is $10 (original $20 - $10 discount).
		$this->assertEquals( 10.0, $order->get_total(), 'Order total should be $10 after $10 discount' );

		// Now change the quantity to 2 and save the order items.
		$items = array(
			'order_item_id'  => array( $order_item_id ),
			'order_item_qty' => array( $order_item_id => 2 ),
			'line_total'     => array( $order_item_id => 2 * $price ),
			'line_subtotal'  => array( $order_item_id => 2 * $price ),
		);

		// Save the order items - this should trigger the coupon recalculation.
		wc_save_order_items( $order->get_id(), $items );

		// Reload the order to get updated data.
		$order = wc_get_order( $order->get_id() );

		// Verify the discount is still $10 (fixed cart discount should not increase with quantity).
		$coupons     = $order->get_items( 'coupon' );
		$coupon_item = reset( $coupons );
		$this->assertEquals( 10.0, $coupon_item->get_discount(), 'Discount should remain $10 after quantity change' );

		// Verify order total is $30 (original $40 - $10 discount).
		$this->assertEquals( 30.0, $order->get_total(), 'Order total should be $30 after quantity change' );
	}
}
