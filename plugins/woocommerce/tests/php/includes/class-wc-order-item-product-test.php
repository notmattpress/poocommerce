<?php
/**
 * Unit tests for the WC_Order_Item_Product class functionalities.
 *
 * @package PooCommerce\Tests
 */

declare( strict_types=1 );

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Internal\CostOfGoodsSold\CogsAwareUnitTestSuiteTrait;

/**
 * WC_Order_Item_Product unit tests.
 */
class WC_Order_Item_Product_Test extends WC_Unit_Test_Case {
	use CogsAwareUnitTestSuiteTrait;

	/**
	 * The product used for the tests.
	 *
	 * @var WC_Product_Simple
	 */
	private WC_Product_Simple $product;

	/**
	 * The order item used for the tests.
	 *
	 * @var WC_Order_Item_Product
	 */
	private WC_Order_Item_Product $item;

	/**
	 * The order used for the tests.
	 *
	 * @var WC_Order
	 */
	private WC_Order $order;

	/**
	 * Runs before each test.
	 */
	public function setUp(): void {
		parent::setUp();

		$this->product = WC_Helper_Product::create_simple_product();
		$this->order   = WC_Helper_Order::create_order();

		$this->item = new WC_Order_Item_Product();
		$this->item->set_product( $this->product );
		$this->item->set_quantity( 1 );
		$this->item->set_order_id( $this->order->get_id() );
		$this->item->save();

		$this->order->add_item( $this->item );
		$this->order->save();
	}

	/**
	 * Runs after each test.
	 */
	public function tearDown(): void {
		parent::tearDown();
		$this->disable_cogs_feature();
	}

	/**
	 * Test that backorder meta is excluded from formatted meta data
	 * for completed orders.
	 */
	public function test_get_formatted_meta_data_excludes_backorder_on_completed() {
		// 1. Set backorders allowed for the product.
		$this->product->set_manage_stock( true );
		$this->product->set_stock_quantity( 0 );
		$this->product->set_backorders( 'notify' ); // Allow backorders with notification.
		$this->product->save();

		// 2. Add backorder meta.
		$backorder_meta_key = 'Backordered';
		$this->item->add_meta_data( $backorder_meta_key, 1, true ); // Value typically is the backordered quantity.
		$this->item->save();

		// 3. Assert: Check meta exists before completion.
		$item_id                = $this->item->get_id();
		$order_item             = $this->order->get_item( $item_id ); // Re-fetch item from order.
		$formatted_meta_before  = $order_item->get_formatted_meta_data();
		$found_backorder_before = false;
		foreach ( $formatted_meta_before as $meta ) {
			if ( $meta->key === $backorder_meta_key ) {
				$found_backorder_before = true;
				break;
			}
		}
		$this->assertTrue( $found_backorder_before, 'Backorder meta should exist before order completion.' );

		// 4. Complete the order.
		$this->order->update_status( OrderStatus::COMPLETED );
		$this->order->save();

		// 5. Assert: Check meta is excluded after completion.
		$order_item_after_complete = $this->order->get_item( $item_id ); // Re-fetch item again after status change.
		$formatted_meta_after      = $order_item_after_complete->get_formatted_meta_data();
		$found_backorder_after     = false;
		foreach ( $formatted_meta_after as $meta ) {
			if ( $meta->key === $backorder_meta_key ) {
				$found_backorder_after = true;
				break;
			}
		}
		$this->assertFalse( $found_backorder_after, 'Backorder meta should be excluded after order completion.' );

		// Clean up.
		WC_Helper_Product::delete_product( $this->product->get_id() );
		WC_Helper_Order::delete_order( $this->order->get_id() );
	}

	/**
	 * @testdox 'doing it wrong' is thrown, if the Cost of Goods Sold feature is disabled.
	 */
	public function test_get_refund_html_with_cogs_disabled() {
		$this->expect_doing_it_wrong_cogs_disabled( 'WC_Order_Item::get_cogs_refund_value_html' );

		$this->item->get_cogs_refund_value_html( -12.34 );
	}

	/**
	 * @testdox Test get_cogs_refund_value_html with implicit WC_Price and order arguments.
	 *
	 * @param bool $negative_refund_argument True to pass a negative refund amount, false to pass a positive amount.
	 *
	 * @testWith [true]
	 *           [false]
	 */
	public function test_get_refund_html_with_implicit_arguments( bool $negative_refund_argument ) {
		$this->enable_cogs_feature();

		$refund_amount = 12.34;
		$actual        = $this->item->get_cogs_refund_value_html( $negative_refund_argument ? -12.34 : 12.34 );
		$expected      = sprintf( '<small class="refunded">%s</small>', wc_price( -12.34, array( 'currency' => $this->order->get_currency() ) ) );
		$this->assertEquals( $expected, $actual );
	}

	/**
	 * @testdox Test get_cogs_refund_value_html with explicit WC_Price and order arguments.
	 */
	public function test_get_refund_html_with_explicit_arguments() {
		$this->enable_cogs_feature();

		$wc_price_args = array( 'currency' => '!' );
		$actual        = $this->item->get_cogs_refund_value_html( -12.34, $wc_price_args, $this->order );
		$expected      = sprintf( '<small class="refunded">%s</small>', wc_price( -12.34, array( 'currency' => '!' ) ) );
		$this->assertEquals( $expected, $actual );
	}

	/**
	 * @testdox Test the poocommerce_order_item_cogs_refunded_html filter invoked by get_cogs_refund_value_html.
	 */
	public function test_get_refund_html_with_filter() {
		$this->enable_cogs_feature();

		$refunded_cost = -12.34;
		add_filter(
			'poocommerce_order_item_cogs_refunded_html',
			function ( $html, $refunded_cost, $item, $order ) {
				return sprintf( 'cost: %s, item: %s, order: %s', $refunded_cost, $item->get_id(), $order->get_id() );
			},
			10,
			4
		);

		$actual = $this->item->get_cogs_refund_value_html( $refunded_cost, );
		remove_all_filters( 'poocommerce_order_item_cogs_refunded_html' );
		$expected = sprintf( 'cost: %s, item: %s, order: %s', $refunded_cost, $this->item->get_id(), $this->order->get_id() );
		$this->assertEquals( $expected, $actual );
	}
}
