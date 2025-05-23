<?php
/**
 * Class WC_Tests_Order file.
 *
 * @package PooCommerce\Tests\Order
 */

use Automattic\PooCommerce\Internal\CostOfGoodsSold\CogsAwareUnitTestSuiteTrait;

/**
 * Class WC_Tests_Order.
 */
class WC_Tests_Orders extends WC_Unit_Test_Case {
	use CogsAwareUnitTestSuiteTrait;

	/**
	 * Test for total when round at subtotal is enabled.
	 *
	 * @link https://github.com/poocommerce/poocommerce/issues/24695
	 */
	public function test_order_calculate_total_rounding_24695() {
		update_option( 'poocommerce_prices_include_tax', 'yes' );
		update_option( 'poocommerce_calc_taxes', 'yes' );
		update_option( 'poocommerce_tax_round_at_subtotal', 'yes' );

		$tax_rate = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '7.0000',
			'tax_rate_name'     => 'CGST',
			'tax_rate_priority' => '1',
			'tax_rate_compound' => '0',
			'tax_rate_shipping' => '0',
			'tax_rate_order'    => '1',
			'tax_rate_class'    => 'tax_1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate );

		$product1 = WC_Helper_Product::create_simple_product();
		$product1->set_regular_price( 2 );
		$product1->save();

		$product2 = WC_Helper_Product::create_simple_product();
		$product2->set_regular_price( 2.5 );
		$product2->save();

		$order = new WC_Order();
		$order->add_product( $product1, 1 );
		$order->add_product( $product2, 4 );
		$order->save();

		$order->calculate_totals( true );

		$this->assertEquals( 12, $order->get_total() );
		$this->assertEquals( 0.79, $order->get_total_tax() );
	}

	/**
	 * Test shipping is added and rounded correctly when added to total.
	 *
	 * @throws WC_Data_Exception When lines cannot be added to order.
	 */
	public function test_order_rounding_with_shipping_25748() {
		update_option( 'poocommerce_prices_include_tax', 'no' );
		update_option( 'poocommerce_calc_taxes', 'yes' );
		update_option( 'poocommerce_tax_round_at_subtotal', 'yes' );

		$tax_rate = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '21.0000',
			'tax_rate_name'     => 'CGST',
			'tax_rate_priority' => '1',
			'tax_rate_compound' => '0',
			'tax_rate_shipping' => '1',
			'tax_rate_order'    => '1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate );

		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( 23.85 );
		$product->save();

		$shipping_rate = new WC_Shipping_Rate( 'flat_rate_shipping', 'Flat rate shipping', '9.5', array(), 'flat_rate' );
		$shipping_item = new WC_Order_Item_Shipping();
		$shipping_item->set_props(
			array(
				'method_title' => $shipping_rate->label,
				'method_id'    => $shipping_rate->id,
				'total'        => wc_format_decimal( $shipping_rate->cost ),
				'taxes'        => $shipping_rate->taxes,
			)
		);

		foreach ( $shipping_rate->get_meta_data() as $key => $value ) {
			$shipping_item->add_meta_data( $key, $value, true );
		}

		$order = new WC_Order();
		$order->add_product( $product, 1 );
		$order->add_item( $shipping_item );

		$order->calculate_totals( true );

		$this->assertEquals( 7, $order->get_total_tax() );
		$this->assertEquals( 40.35, $order->get_total() );
	}

	/**
	 * Testing rounding when lines are copied over to order.
	 *
	 * @throws Exception When lines cannot be added to order.
	 */
	public function test_order_rounding_addition_25641() {
		update_option( 'poocommerce_prices_include_tax', 'no' );
		update_option( 'poocommerce_calc_taxes', 'yes' );
		update_option( 'poocommerce_tax_round_at_subtotal', 'yes' );

		$tax_rate1 = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '7.0000',
			'tax_rate_name'     => 'CGST',
			'tax_rate_priority' => '1',
			'tax_rate_compound' => '0',
			'tax_rate_shipping' => '1',
			'tax_rate_order'    => '1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate1 );

		$tax_rate2 = array(
			'tax_rate_country'  => '',
			'tax_rate_state'    => '',
			'tax_rate'          => '2.2500',
			'tax_rate_name'     => 'SGST',
			'tax_rate_priority' => '2',
			'tax_rate_compound' => '0',
			'tax_rate_shipping' => '1',
			'tax_rate_order'    => '1',
		);
		WC_Tax::_insert_tax_rate( $tax_rate2 );

		$product = WC_Helper_Product::create_simple_product();
		$product->set_regular_price( 22.99 );
		$product->save();

		WC_Helper_Shipping::create_simple_flat_rate();

		WC()->cart->empty_cart();
		WC()->customer->set_is_vat_exempt( false );

		WC()->cart->add_to_cart( $product->get_id(), 1 );
		WC()->session->set( 'chosen_shipping_method', array( 'flat_rate' ) );
		WC()->cart->calculate_totals();

		$checkout = WC_Checkout::instance();
		$order    = new WC_Order();
		$checkout->set_data_from_cart( $order );
		$this->assertEquals( 3.05, $order->get_total_tax() );
		$this->assertEquals( 36.04, $order->get_total() );
	}

	/**
	 * @testdox Refunds of products with Cost of Goods Sold have the proper cost value, and calculate_totals in the order substracts it from the order cost.
	 */
	public function test_calculate_cogs_for_orders_with_refunds() {
		$this->enable_cogs_feature();

		$product1 = WC_Helper_Product::create_simple_product();
		$product1->set_regular_price( 100 );
		$product1->set_cogs_value( 10 );
		$product1->save();

		$product2 = WC_Helper_Product::create_simple_product();
		$product2->set_regular_price( 150 );
		$product2->set_cogs_value( 15 );
		$product2->save();

		$order = new WC_Order();
		$order->add_product( $product1, 10 );
		$order->add_product( $product2, 10 );
		$order->calculate_totals();
		$order->save();

		$this->assertEquals( 250, $order->get_cogs_total_value() );

		$order_items = array_values( $order->get_items( 'line_item' ) );

		$refund = wc_create_refund(
			array(
				'order_id'   => $order->get_id(),
				'amount'     => 65,
				'reason'     => 'testing',
				'line_items' => array(
					$order_items[0]->get_id() =>
						array(
							'qty'          => 2,
							'refund_total' => 20,
						),
					$order_items[1]->get_id() =>
						array(
							'qty'          => 3,
							'refund_total' => 45,
						),
				),
			)
		);
		$refund->save();

		$this->assertEquals( -65, $refund->get_cogs_total_value() );

		$order->calculate_totals();
		$this->assertEquals( 250 - 65, $order->get_cogs_total_value() );
	}
}
