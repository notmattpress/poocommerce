<?php
/**
 * Helper code for wc-admin unit tests.
 *
 * @package PooCommerce\Admin\Tests\Framework\Helpers
 */

/**
 * Class WC_Helper_Reports.
 *
 * This helper class should ONLY be used for unit tests!.
 */
class WC_Helper_Reports {

	/**
	 * Delete everything in the lookup tables.
	 */
	public static function reset_stats_dbs() {
		global $wpdb;
		$wpdb->query( 'DELETE FROM ' . \Automattic\PooCommerce\Admin\API\Reports\Orders\Stats\DataStore::get_db_table_name() ); // @codingStandardsIgnoreLine.
		$wpdb->query( 'DELETE FROM ' . \Automattic\PooCommerce\Admin\API\Reports\Products\DataStore::get_db_table_name() ); // @codingStandardsIgnoreLine.
		$wpdb->query( 'DELETE FROM ' . \Automattic\PooCommerce\Admin\API\Reports\Coupons\DataStore::get_db_table_name() ); // @codingStandardsIgnoreLine.
		$wpdb->query( 'DELETE FROM ' . \Automattic\PooCommerce\Admin\API\Reports\Customers\DataStore::get_db_table_name() ); // @codingStandardsIgnoreLine.
		\Automattic\PooCommerce\Internal\Admin\CategoryLookup::instance()->regenerate();
	}
}
