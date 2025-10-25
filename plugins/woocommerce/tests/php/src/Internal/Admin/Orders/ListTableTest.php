<?php
declare( strict_types = 1);

namespace Automattic\PooCommerce\Tests\Internal\Admin\Orders;

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Internal\Admin\Orders\ListTable;
use Automattic\PooCommerce\RestApi\UnitTests\HPOSToggleTrait;

/**
 * Tests related to order list table in admin.
 */
class ListTableTest extends \WC_Unit_Test_Case {
	use HPOSToggleTrait;

	/**
	 * @var ListTable
	 */
	private $sut;

	/**
	 * Setup - enables HPOS.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->setup_cot();
		$this->toggle_cot_authoritative( true );
		$this->sut      = new ListTable();
		$set_order_type = function ( $order_type ) {
			$this->order_type = $order_type;
		};
		$set_order_type->call( $this->sut, 'shop_order' );
	}

	/**
	 * Helper method to call protected get_and_maybe_update_months_filter_cache.
	 *
	 * @param ListTable $sut ListTable instance.
	 *
	 * @return array YearMonth Array.
	 */
	public function call_get_months_filter_options( ListTable $sut ) {
		$callable = function () {
			return $this->get_months_filter_options();
		};
		return $callable->call( $sut );
	}

	/**
	 * @testdox The months filter options are filled out for every month between the oldest order and the current month.
	 */
	public function test_get_months_filter_options() {
		$start_date     = new \WC_DateTime( '2020-03-01 00:00:00' );
		$current_date   = new \WC_DateTime();
		$expected_count = $this->get_months_count( $start_date, $current_date );

		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( $start_date );
		$order->save();

		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertCount( $expected_count, $year_months );
		$this->assertEquals( gmdate( 'Y', time() ), $year_months[0]->year );
		$this->assertEquals( gmdate( 'n', time() ), $year_months[0]->month );
		$this->assertEquals( 2020, end( $year_months )->year );
		$this->assertEquals( 3, end( $year_months )->month );
	}

	/**
	 * @testdox The months filter options works as expected when there are no orders.
	 */
	public function test_get_months_filter_options_no_orders() {
		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertCount( 1, $year_months );
		$this->assertEquals( gmdate( 'Y', time() ), $year_months[0]->year );
		$this->assertEquals( gmdate( 'n', time() ), $year_months[0]->month );
	}

	/**
	 * @testdox The available months options don't take into account trashed orders.
	 */
	public function test_get_months_filter_options_skip_trash() {
		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( new \WC_DateTime( '2025-01-02 00:00:00' ) );
		$order->set_status( OrderStatus::TRASH );
		$order->save();

		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( new \WC_DateTime( '2025-02-02 00:00:00' ) );
		$order->save();

		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertEquals( 2025, end( $year_months )->year );
		$this->assertEquals( 2, end( $year_months )->month );
	}

	/**
	 * @testdox The months filter options works as expected with only one month.
	 */
	public function test_get_months_filter_options_single_month() {
		\WC_Helper_Order::create_order();

		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertCount( 1, $year_months );
		$this->assertEquals( gmdate( 'Y', time() ), $year_months[0]->year );
		$this->assertEquals( gmdate( 'n', time() ), $year_months[0]->month );
	}

	/**
	 * @testdox The available months options are based on the site's timezone, rather than UTC/GMT.
	 */
	public function test_get_months_filter_options_timezone_edge() {
		update_option( 'gmt_offset', '-5' );

		$date  = new \WC_DateTime( '2024-12-31 22:00:00', wp_timezone() ); // 2025-01-01 01:00:00 in UTC.
		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( $date );
		$order->save();

		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertEquals( 2024, end( $year_months )->year );
		$this->assertEquals( 12, end( $year_months )->month );

		delete_option( 'gmt_offset' );
	}

	/**
	 * @testdox The months filter options works as expected when all orders have a future date.
	 *
	 * When all orders have a future date, the month options range should go from the current date to
	 * the order date farthest in the future.
	 */
	public function test_get_months_filter_options_only_future_orders() {
		$current_date   = new \WC_DateTime( 'now', new \DateTimeZone( 'UTC' ) );
		$start_date     = new \WC_DateTime( '+ 1 years', new \DateTimeZone( 'UTC' ) );
		$end_date       = new \WC_DateTime( '+ 2 years', new \DateTimeZone( 'UTC' ) );
		$expected_count = $this->get_months_count( $current_date, $end_date );

		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( $start_date );
		$order->save();

		$order = \WC_Helper_Order::create_order();
		$order->set_date_created( $end_date );
		$order->save();

		$year_months = $this->call_get_months_filter_options( $this->sut );

		$this->assertCount( $expected_count, $year_months );
		$this->assertEquals( $end_date->format( 'Y' ), $year_months[0]->year );
		$this->assertEquals( $end_date->format( 'n' ), $year_months[0]->month );
		$this->assertEquals( gmdate( 'Y', time() ), end( $year_months )->year );
		$this->assertEquals( gmdate( 'n', time() ), end( $year_months )->month );
	}

	/**
	 * Get the total number of year-month items there should be between two dates.
	 *
	 * Note that this is different from calculating the elapsed time between the two dates. For this we instead care
	 * about which year-months from the calendar are present.
	 *
	 * @param \DateTime $start The start of the date range.
	 * @param \DateTime $end   The end of the date range.
	 *
	 * @return int
	 */
	private function get_months_count( \DateTime $start, \DateTime $end ): int {
		$start_year  = (int) $start->format( 'Y' );
		$start_month = (int) $start->format( 'n' );
		$end_year    = (int) $end->format( 'Y' );
		$end_month   = (int) $end->format( 'n' );

		$months_from_years = ( $end_year - $start_year ) * 12;
		$start_month_diff  = $start_month - 1;

		return $months_from_years - $start_month_diff + $end_month;
	}

	/**
	 * @testdox When filtering by created_via, only orders with that specific value should be shown.
	 */
	public function test_filtering_by_created_via_shows_only_matching_orders() {
		$order1 = \WC_Helper_Order::create_order();
		$order1->set_created_via( 'rest-api' );
		$order1->save();

		$order2 = \WC_Helper_Order::create_order();
		$order2->set_created_via( 'pos-rest-api' );
		$order2->save();

		$_GET['_created_via'] = 'rest-api';

		$this->sut->prepare_items();

		$get_items = function () {
			return $this->items;
		};

		$filtered_items = $get_items->call( $this->sut );

		$this->assertCount( 1, $filtered_items ); // Only one order should be shown.
		$this->assertEquals( 'rest-api', $filtered_items[0]->get_created_via() );
		$this->assertEquals( $order1->get_id(), $filtered_items[0]->get_id() );
	}

	/**
	 * @testdox When the created_via filter is empty, all orders should be shown.
	 */
	public function test_filtering_by_created_via_shows_all_orders_when_no_filter() {
		$order1 = \WC_Helper_Order::create_order();
		$order1->set_created_via( 'rest-api' );
		$order1->save();

		$order2 = \WC_Helper_Order::create_order();
		$order2->set_created_via( 'pos-rest-api' );
		$order2->save();

		unset( $_GET['_created_via'] );

		$this->sut->prepare_items();

		$get_items = function () {
			return $this->items;
		};

		$filtered_items = $get_items->call( $this->sut );

		$this->assertCount( 2, $filtered_items ); // Both orders should be shown.
	}
}
