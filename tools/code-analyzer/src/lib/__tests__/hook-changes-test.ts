/**
 * External dependencies
 */
import fs from 'fs';

/**
 * Internal dependencies
 */
import { scanForHookChanges } from '../hook-changes';

describe( 'scanForHookChanges', () => {
	it( 'should return a Map with multiple entries in patches with multiple hook changes for the same file.', async () => {
		// load the text file as a string variable
		const content = fs.readFileSync(
			__dirname + '/fixtures/diff.txt',
			'utf8'
		);

		// We don't need a repo path for this test, its just for generating github links
		const result = await scanForHookChanges( content, '6.8.0', __dirname );

		// Expect 2 entries in /plugins/poocommerce/includes/abstracts/abstract-wc-order.php
		expect(
			result.get(
				'/plugins/poocommerce/includes/abstracts/abstract-wc-order.php'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/includes/abstracts/abstract-wc-order.php'
			)?.name
		).toBe( 'poocommerce_apply_base_tax_for_local_pickup' );

		expect(
			result.get(
				'/plugins/poocommerce/includes/abstracts/abstract-wc-order.php#2'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/includes/abstracts/abstract-wc-order.php#2'
			)?.name
		).toBe( 'poocommerce_local_pickup_methods' );

		// Expect 2 entries in /plugins/poocommerce/includes/emails/class-wc-email.php
		expect(
			result.get(
				'/plugins/poocommerce/includes/emails/class-wc-email.php'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/includes/emails/class-wc-email.php'
			)?.name
		).toBe( 'poocommerce_allow_switching_email_locale' );

		expect(
			result.get(
				'/plugins/poocommerce/includes/emails/class-wc-email.php#2'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/includes/emails/class-wc-email.php#2'
			)?.name
		).toBe( 'poocommerce_allow_restoring_email_locale' );

		// Expect 1 entry in /plugins/poocommerce/includes/export/abstract-wc-csv-batch-exporter.php
		expect(
			result.get(
				'/plugins/poocommerce/includes/export/abstract-wc-csv-batch-exporter.php'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/includes/export/abstract-wc-csv-batch-exporter.php'
			)?.name
		).toBe( 'poocommerce_csv_exporter_fopen_mode' );

		// Expect 1 entry in /plugins/poocommerce/src/Internal/DataStores/Orders/OrdersTableDataStore.php
		expect(
			result.get(
				'/plugins/poocommerce/src/Internal/DataStores/Orders/OrdersTableDataStore.php'
			)
		).toBeDefined();
		expect(
			result.get(
				'/plugins/poocommerce/src/Internal/DataStores/Orders/OrdersTableDataStore.php'
			)?.name
		).toBe( 'poocommerce_orders_table_datastore_extra_db_rows_for_order' );

		expect( result.size ).toBe( 6 );
	} );
} );
