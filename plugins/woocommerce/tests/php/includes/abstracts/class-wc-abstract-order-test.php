<?php
/**
 * Class WC_Abstract_Order file.
 *
 * @package PooCommerce\Tests\Abstracts
 */

use Automattic\PooCommerce\Internal\CostOfGoodsSold\CogsAwareUnitTestSuiteTrait;
use Automattic\PooCommerce\Testing\Tools\CodeHacking\Hacks\FunctionsMockerHack;
use Automattic\PooCommerce\Enums\OrderStatus;

// phpcs:disable Squiz.Classes.ClassFileName.NoMatch, Squiz.Classes.ValidClassName.NotCamelCaps -- Backward compatibility.
/**
 * Class WC_Abstract_Order.
 */
class WC_Abstract_Order_Test extends WC_Unit_Test_Case {

	use CogsAwareUnitTestSuiteTrait;

	/**
	 * Test when rounding is different when doing per line and in subtotal.
	 */
	public function test_order_calculate_26582() {
		update_option( 'poocommerce_prices_include_tax', 'yes' );
		update_option( 'poocommerce_calc_taxes', 'yes' );
		$tax_rate = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '15.0000',
			'tax_rate_name'     => 'tax',
			'tax_rate_priority' => '1',
			'tax_rate_order'    => '1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate );

		$product1 = WC_Helper_Product::create_simple_product();
		$product1->set_regular_price( 99.48 );
		$product1->save();

		$product2 = WC_Helper_Product::create_simple_product();
		$product2->set_regular_price( 108.68 );
		$product2->save();

		$order = new WC_Order();
		$order->add_product( $product1, 6 );
		$order->add_product( $product2, 6 );
		$order->save();

		$this->order_calculate_rounding_line( $order );
		$this->order_calculate_rounding_subtotal( $order );
	}

	/**
	 * Helper method to test rounding per line for `test_order_calculate_26582`.
	 *
	 * @param WC_Order $order Order object.
	 */
	private function order_calculate_rounding_line( $order ) {
		update_option( 'poocommerce_tax_round_at_subtotal', 'no' );

		$order->calculate_totals( true );

		$this->assertEquals( 1086.06, $order->get_subtotal() );
		$this->assertEquals( 162.90, $order->get_total_tax() );
		$this->assertEquals( 1248.96, $order->get_total() );
	}

	/**
	 * Helper method to test rounding at subtotal for `test_order_calculate_26582`.
	 *
	 * @param WC_Order $order Order object.
	 */
	private function order_calculate_rounding_subtotal( $order ) {
		update_option( 'poocommerce_tax_round_at_subtotal', 'yes' );

		$order->calculate_totals( true );

		$this->assertEquals( 1086.05, $order->get_subtotal() );
		$this->assertEquals( 162.91, $order->get_total_tax() );
		$this->assertEquals( 1248.96, $order->get_total() );
	}

	/**
	 * Test that coupon taxes are not affected by logged in admin user.
	 */
	public function test_apply_coupon_for_correct_location_taxes() {
		update_option( 'poocommerce_tax_round_at_subtotal', 'yes' );
		update_option( 'poocommerce_prices_include_tax', 'yes' );
		update_option( 'poocommerce_tax_based_on', 'billing' );
		update_option( 'poocommerce_calc_taxes', 'yes' );

		$password = wp_generate_password( 8, false, false );
		$admin_id = wp_insert_user(
			array(
				'user_login' => "test_admin$password",
				'user_pass'  => $password,
				'user_email' => "admin$password@example.com",
				'role'       => 'administrator',
			)
		);

		update_user_meta( $admin_id, 'billing_country', 'MV' ); // Different than customer's address and base location.
		wp_set_current_user( $admin_id );
		WC()->customer = null;
		WC()->initialize_cart();

		update_option( 'poocommerce_default_country', 'IN:AP' );

		$tax_rate = array(
			'tax_rate_country' => 'IN',
			'tax_rate_state'   => '',
			'tax_rate'         => '25.0000',
			'tax_rate_name'    => 'tax',
			'tax_rate_order'   => '1',
			'tax_rate_class'   => '',
		);
		WC_Tax::_insert_tax_rate( $tax_rate );

		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( 100 );
		$product->save();

		$order = wc_create_order();
		$order->set_billing_country( 'IN' );
		$order->add_product( $product, 1 );
		$order->save();
		$order->calculate_totals();

		$this->assertEquals( 100, $order->get_total() );
		$this->assertEquals( 80, $order->get_subtotal() );
		$this->assertEquals( 20, $order->get_total_tax() );

		$coupon = new WC_Coupon();
		$coupon->set_code( '10off' );
		$coupon->set_discount_type( 'percent' );
		$coupon->set_amount( 10 );
		$coupon->save();

		$order->apply_coupon( '10off' );

		$this->assertEquals( 8, $order->get_discount_total() );
		$this->assertEquals( 90, $order->get_total() );
		$this->assertEquals( 18, $order->get_total_tax() );
		$this->assertEquals( 2, $order->get_discount_tax() );
	}

	/**
	 * @testdox 'add_product' passes the order supplied in '$args' to 'wc_get_price_excluding_tax', and uses the obtained price as total and subtotal for the line item.
	 */
	public function test_add_product_passes_order_to_wc_get_price_excluding_tax() {
		$product_passed_to_get_price = false;
		$args_passed_to_get_price    = false;

		FunctionsMockerHack::add_function_mocks(
			array(
				'wc_get_price_excluding_tax' => function ( $product, $args = array() ) use ( &$product_passed_to_get_price, &$args_passed_to_get_price ) {
						$product_passed_to_get_price = $product;
						$args_passed_to_get_price    = $args;

						return 1234;
				},
			)
		);

		//phpcs:disable Squiz.Commenting
		$order_item = new class() extends WC_Order_Item_Product {
			public $passed_props;

			public function set_props( $args, $context = 'set' ) {
				$this->passed_props = $args;
			}
		};
		//phpcs:enable Squiz.Commenting

		$this->register_legacy_proxy_class_mocks(
			array( 'WC_Order_Item_Product' => $order_item )
		);

		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( 100 );
		$product->save();

		$order = wc_create_order();

		$order->add_product( $product, 1, array( 'order' => $order ) );

		$this->assertSame( $product, $product_passed_to_get_price );
		$this->assertSame( $order, $args_passed_to_get_price['order'] );
		$this->assertEquals( 1234, $order_item->passed_props['total'] );
		$this->assertEquals( 1234, $order_item->passed_props['subtotal'] );
	}

	/**
	 * Test get coupon usage count across statuses.
	 */
	public function test_apply_coupon_across_status() {
		$coupon_code = 'coupon_test_count_across_status';
		$coupon      = WC_Helper_Coupon::create_coupon( $coupon_code );
		$this->assertEquals( 0, $coupon->get_usage_count() );

		$order = WC_Helper_Order::create_order();
		$order->set_status( OrderStatus::PENDING );
		$order->save();
		$order->apply_coupon( $coupon_code );
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code ) )->get_usage_count() );

		// Change order status to anything other than cancelled should not change coupon count.
		$order->set_status( OrderStatus::PROCESSING );
		$order->save();
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code ) )->get_usage_count() );

		// Cancelling order should reduce coupon count.
		$order->set_status( OrderStatus::CANCELLED );
		$order->save();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code ) )->get_usage_count() );

		// Failed order should reduce coupon count.
		$order->set_status( OrderStatus::FAILED );
		$order->save();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code ) )->get_usage_count() );

		// Trashed order should reduce coupon count.
		$order->delete();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code ) )->get_usage_count() );
	}

	/**
	 * Test get multiple coupon usage count across statuses.
	 */
	public function test_apply_coupon_multiple_across_status() {
		$coupon_code_1 = 'coupon_test_count_across_status_1';
		$coupon_code_2 = 'coupon_test_count_across_status_2';
		$coupon_code_3 = 'coupon_test_count_across_status_3';
		WC_Helper_Coupon::create_coupon( $coupon_code_1 );
		WC_Helper_Coupon::create_coupon( $coupon_code_2 );
		WC_Helper_Coupon::create_coupon( $coupon_code_3 );

		$order = WC_Helper_Order::create_order();
		$order->set_status( OrderStatus::PENDING );
		$order->save();
		$order->apply_coupon( $coupon_code_1 );
		$order->apply_coupon( $coupon_code_2 );
		$order->apply_coupon( $coupon_code_3 );

		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_1 ) )->get_usage_count() );
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_2 ) )->get_usage_count() );
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_3 ) )->get_usage_count() );

		// Change order status to anything other than cancelled should not change coupon count.
		$order->set_status( OrderStatus::PROCESSING );
		$order->save();
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_1 ) )->get_usage_count() );
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_2 ) )->get_usage_count() );
		$this->assertEquals( 1, ( new WC_Coupon( $coupon_code_3 ) )->get_usage_count() );

		// Cancelling order should reduce coupon count.
		$order->set_status( OrderStatus::CANCELLED );
		$order->save();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_1 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_2 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_3 ) )->get_usage_count() );

		// Failed order should reduce coupon count.
		$order->set_status( OrderStatus::FAILED );
		$order->save();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_1 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_2 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_3 ) )->get_usage_count() );

		// Trashed order should reduce coupon count.
		$order->delete();
		$order->save();
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_1 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_2 ) )->get_usage_count() );
		$this->assertEquals( 0, ( new WC_Coupon( $coupon_code_3 ) )->get_usage_count() );
	}

	/**
	 * Test apply_coupon() stores coupon meta data.
	 * See: https://github.com/poocommerce/poocommerce/issues/28166.
	 */
	public function test_apply_coupon_stores_meta_data() {
		$coupon_code = 'coupon_test_meta_data';
		$coupon      = WC_Helper_Coupon::create_coupon( $coupon_code );
		$order       = WC_Helper_Order::create_order();
		$order->set_status( OrderStatus::PROCESSING );
		$order->save();
		$order->apply_coupon( $coupon_code );

		$coupon_items = $order->get_items( 'coupon' );
		$this->assertCount( 1, $coupon_items );

		$coupon_info = ( current( $coupon_items ) )->get_meta( 'coupon_info' );
		$this->assertNotEmpty( $coupon_info, 'WC_Order_Item_Coupon missing `coupon_info` meta.' );
		$coupon_info = json_decode( $coupon_info, true );
		$this->assertEquals( $coupon->get_id(), $coupon_info[0] );
		$this->assertEquals( $coupon_code, $coupon_info[1] );
	}

	/**
	 * Test for get_discount_to_display which must return a value
	 * with and without tax whatever the setting of the options.
	 *
	 * Issue :https://github.com/poocommerce/poocommerce/issues/36794
	 */
	public function test_get_discount_to_display() {
		update_option( 'poocommerce_calc_taxes', 'yes' );
		update_option( 'poocommerce_prices_include_tax', 'no' );
		update_option( 'poocommerce_currency', 'USD' );
		update_option( 'poocommerce_tax_display_cart', 'incl' );

		// Set dummy data.
		$tax_rate = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '20.0000',
			'tax_rate_name'     => 'tax',
			'tax_rate_priority' => '1',
			'tax_rate_order'    => '1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate );

		$coupon  = WC_Helper_Coupon::create_coupon();
		$product = WC_Helper_Product::create_simple_product( true, array( 'price' => 10 ) );

		$order = new WC_Order();
		$order->add_product( $product );
		$order->apply_coupon( $coupon );
		$order->calculate_totals();
		$order->save();

		$this->assertEquals( wc_price( 1, array( 'currency' => 'USD' ) ), $order->get_discount_to_display( 'excl' ) );
		$this->assertEquals( wc_price( 1.20, array( 'currency' => 'USD' ) ), $order->get_discount_to_display( 'incl' ) );
	}

	/**
	 * @testDox Cache does not interfere if wc_get_order returns a different class than WC_Order.
	 */
	public function test_cache_does_not_interferes_with_order_object() {
		add_action(
			'poocommerce_new_order',
			function ( $order_id ) {
				// this makes the cache store a specific order class instance, but it's quickly replaced by a generic one
				// as we're in the middle of a save and this gets executed before the logic in WC_Abstract_Order.
				$order = wc_get_order( $order_id );
			}
		);
		$order = new WC_Order();
		$order->save();

		$order = wc_get_order( $order->get_id() );
		$this->assertInstanceOf( Automattic\PooCommerce\Admin\Overrides\Order::class, $order );
	}

	/**
	 * @testDox When a taxonomy with a default term is set on the order, it's inserted when a new order is created.
	 */
	public function test_default_term_for_custom_taxonomy() {
		$custom_taxonomy = register_taxonomy(
			'custom_taxonomy',
			'shop_order',
			array(
				'default_term' => 'new_term',
			),
		);

		// Set user who has access to create term.
		$current_user_id = get_current_user_id();
		$user            = new WP_User( wp_create_user( 'test', '' ) );
		$user->set_role( 'administrator' );
		wp_set_current_user( $user->ID );

		$order = wc_create_order();

		wp_set_current_user( $current_user_id );
		$order_terms = wp_list_pluck( wp_get_object_terms( $order->get_id(), $custom_taxonomy->name ), 'name' );
		$this->assertContains( 'new_term', $order_terms );
	}

	/**
	 * @testDox Test that order items are not mixed when order_id is zero.
	 */
	public function test_order_items_shouldnot_mix_with_zero_id() {
		$order1 = new WC_Order();
		$order2 = new WC_Order();

		$product1_for_order1 = WC_Helper_Product::create_simple_product();
		$product2_for_order1 = WC_Helper_Product::create_simple_product();
		$product_for_order2  = WC_Helper_Product::create_simple_product();

		$item1_1 = new WC_Order_Item_Product();
		$item1_1->set_product( $product1_for_order1 );
		$item1_1->set_quantity( 1 );
		$item1_1->save();

		$item1_2 = new WC_Order_Item_Product();
		$item1_2->set_product( $product2_for_order1 );
		$item1_2->set_quantity( 1 );
		$item1_2->save();

		$item2 = new WC_Order_Item_Product();
		$item2->set_product( $product_for_order2 );
		$item2->set_quantity( 1 );
		$item2->save();

		$order1->add_item( $item1_1 );
		$order2->add_item( $item2 );
		$order1->add_item( $item1_2 );

		$this->assertCount( 1, $order2->get_items( 'line_item' ) );
		$this->assertCount( 2, $order1->get_items( 'line_item' ) );

		$order1_items = array_keys( $order1->get_items( 'line_item' ) );

		$this->assertContains( $item1_1->get_id(), $order1_items );
		$this->assertContains( $item1_1->get_id(), $order1_items );

		$this->assertEquals( $item2->get_id(), array_keys( $order2->get_items( 'line_item' ) )[0] );
	}

	/**
	 * @testdox Abstract order classes don't manage Cost of Goods Sold by default.
	 */
	public function test_abstract_orders_dont_have_cogs_by_default() {
		$order = new class() extends WC_Abstract_Order {
		};

		$this->assertFalse( $order->has_cogs() );
	}

	/**
	 * @testdox The regular order class manages a Cost of Goods Sold value.
	 */
	public function test_orders_have_cogs() {
		$order = new WC_Order();

		$this->assertTrue( $order->has_cogs() );
	}

	/**
	 * @testdox 'calculate_cogs_total_value' returns zero, and 'doing it wrong' is thrown, if the Cost of Goods Sold feature is disabled.
	 */
	public function test_calculate_total_cogs_simply_returns_false_if_cogs_disabled() {
		$order = new WC_Order();

		$this->expect_doing_it_wrong_cogs_disabled( 'WC_Abstract_Order::calculate_cogs_total_value' );
		$this->assertEquals( 0, $order->calculate_cogs_total_value() );
	}

	/**
	 * @testdox 'calculate_cogs_total_value' returns false if the Cost of Goods Sold feature is enabled but the class doesn't manage it.
	 */
	public function test_calculate_cogs_simply_returns_false_if_cogs_enabled_but_class_has_no_cogs() {
		$this->enable_cogs_feature();

		// phpcs:disable Squiz.Commenting
		$order = new class() extends WC_Order {
			public function has_cogs(): bool {
				return false;
			}
		};
		// phpcs:enable Squiz.Commenting
		$this->add_product_with_cogs_to_order( $order, 12.34, 1 );

		$this->assertEquals( 0, $order->calculate_cogs_total_value() );
	}

	/**
	 * @testdox 'calculate_cogs_total_value' calculates the value from the prices and the quantities of all the items with a Cost of Goods Sold value.
	 */
	public function test_calculate_cogs_uses_product_info_and_sets_the_value() {
		$this->enable_cogs_feature();

		$order = new WC_Order();
		$this->add_product_with_cogs_to_order( $order, 12.34, 2 );
		$this->add_product_with_cogs_to_order( $order, 56.78, 3 );

		$fee = new WC_Order_Item_Fee(); // Example of line item without COGS.
		$order->add_item( $fee );

		$calculated_value = $order->calculate_cogs_total_value();
		$this->assertEquals( 12.34 * 2 + 56.78 * 3, $calculated_value );
		$this->assertEquals( $calculated_value, $order->get_cogs_total_value() );
	}

	/**
	 * @testdox The 'calculate_cogs_total_value_core' method can be overridden in derived classes.
	 */
	public function test_calculate_cogs_core_can_be_overridden() {
		$this->enable_cogs_feature();

		// phpcs:disable Squiz.Commenting
		$order = new class() extends WC_Order {
			protected function calculate_cogs_total_value_core(): float {
				return 999.34;
			}
		};
		// phpcs:enable Squiz.Commenting
		$this->add_product_with_cogs_to_order( $order, 12.34, 2 );

		$calculated_value = $order->calculate_cogs_total_value();
		$this->assertEquals( 999.34, $calculated_value );
		$this->assertEquals( $calculated_value, $order->get_cogs_total_value() );
	}

	/**
	 * @testdox The calculated value for Cost of Goods Sold can be modified using the 'poocommerce_calculated_order_cogs_value' filter.
	 */
	public function test_filter_can_be_used_to_alter_calculated_cogs_value() {
		$filter_received_value = null;
		$filter_received_order = null;

		$this->enable_cogs_feature();

		$order = new WC_Order();
		$this->add_product_with_cogs_to_order( $order, 12.34, 2 );
		$this->add_product_with_cogs_to_order( $order, 56.78, 3 );

		add_filter(
			'poocommerce_calculated_order_cogs_value',
			function ( $value, $order ) use ( &$filter_received_value, &$filter_received_order ) {
				$filter_received_value = $value;
				$filter_received_order = $order;
				return 999.34;
			},
			10,
			2
		);

		$calculate_method_result = $order->calculate_cogs_total_value();

		$this->assertEquals( 12.34 * 2 + 56.78 * 3, $filter_received_value );
		$this->assertEquals( 999.34, $calculate_method_result );
		$this->assertEquals( $calculate_method_result, $order->get_cogs_total_value() );
		$this->assertSame( $order, $filter_received_order );
	}

	/**
	 * Add a product order item with a given Cost of Goods Sold to an exising order.
	 *
	 * @param WC_Order $order The target order.
	 * @param float    $cogs_value The COGS value of the product.
	 * @param int      $quantity The quantity of the order item.
	 */
	private function add_product_with_cogs_to_order( WC_Order $order, float $cogs_value, int $quantity ) {
		$product = WC_Helper_Product::create_simple_product();
		$product->set_cogs_value( $cogs_value );
		$product->save();
		$item = new WC_Order_Item_Product();
		$item->set_product( $product );
		$item->set_quantity( $quantity );
		$item->save();
		$order->add_item( $item );
	}

	/**
	 * @testDox In case order::save() is canceled in WC_Abstract_Order (maybe by a hook throwing an Exception),
	 *          hooks dependent on Wc_Order::$status_transition should not be called
	 */
	public function test_status_transition_hooks_shouldnot_be_called_when_order_save_canceled() {
		$initial_status  = OrderStatus::AUTO_DRAFT;
		$refunded_status = OrderStatus::REFUNDED;

		// add an action that will cancel the save in case the new status is "refunded".
		$callback = static function ( WC_Order $order ) use ( $refunded_status ) {
			$changes = $order->get_changes();
			if ( ! empty( $changes ) && isset( $changes['status'] ) && $changes['status'] === $refunded_status ) {
				throw new \RuntimeException( 'Interrupt order persistence.' );
			}
		};
		add_action( 'poocommerce_before_order_object_save', $callback );

		// Simple action to make sure hook is not triggered.
		$triggered                     = false;
		$should_not_be_called_callback = static function () use ( &$triggered ) {
			$triggered = true;
		};
		add_action( 'poocommerce_order_status_' . $refunded_status, $should_not_be_called_callback );

		$order = new Wc_Order();
		$order->set_status( $initial_status );
		$order->save();

		$order->set_status( $refunded_status );
		$order->save();

		// Make sure status update has not been saved to database
		// and our RuntimeException('Interrupt order persistence.') worked.
		$this->assertSame(
			$order->get_data()['status'],
			$initial_status,
			'Order status in database has been modified but but shouldn\'t have been'
		);
		$this->assertFalse(
			$triggered,
			'"poocommerce_order_status_' . $refunded_status . '" action hook has been triggered but shouldn\'t have been'
		);

		remove_action( 'poocommerce_before_order_object_save', $callback );
		remove_action( 'poocommerce_order_status_' . $refunded_status, $should_not_be_called_callback );
	}

	/**
	 * @testDox In case an error happened while saving an WC_Order_Item,
	 *          hooks dependent on Wc_Order::$status_transition should not be called
	 */
	public function test_status_transition_hooks_shouldnot_be_called_when_order_save_errored_on_item_save() {
		$initial_status          = OrderStatus::AUTO_DRAFT;
		$initial_order_item_name = 'Initial Order Item name';
		$refunded_status         = OrderStatus::REFUNDED;

		// Simple action to make sure hook is not triggered.
		$triggered                     = false;
		$should_not_be_called_callback = static function () use ( &$triggered ) {
			$triggered = true;
		};
		add_action( 'poocommerce_order_status_' . $refunded_status, $should_not_be_called_callback );

		$order_item = new WC_Order_Item_Product();
		$order_item->set_name( $initial_order_item_name );

		$order = new Wc_Order();
		$order->set_status( $initial_status );
		$order->add_item( $order_item );
		$order->save();

		$order_item_id = $order_item->get_id();

		// add an action that will simulate an error while saving WC_Order_Item.
		$callback = static function () {
			throw new \RuntimeException( 'Error while saving WC_Order_Item' );
		};
		add_action( 'poocommerce_before_order_item_object_save', $callback, 10, 0 );

		$order->get_items()[ $order_item_id ]->set_name( 'CHANGED Order Item name' );
		$order->set_status( $refunded_status );
		$order->save();

		// Make sure status update has not been saved to database
		// and our RuntimeException('Error while saving WC_Order_Item') worked.
		$this->assertSame(
			$order->get_items()[ $order_item_id ]->get_data()['name'],
			$initial_order_item_name,
			'Modified order item name has been saved to database but shouldn\'t have been'
		);
		$this->assertFalse(
			$triggered,
			'"poocommerce_order_status_' . $refunded_status . '" action hook has been triggered but shouldn\'t have been'
		);

		remove_action( 'poocommerce_before_order_item_object_save', $callback );
		remove_action( 'poocommerce_order_status_' . $refunded_status, $should_not_be_called_callback );
	}
}
