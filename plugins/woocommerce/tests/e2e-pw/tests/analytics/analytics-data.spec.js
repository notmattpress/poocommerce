/**
 * External dependencies
 */
import {
	WC_ADMIN_API_PATH,
	WC_API_PATH,
} from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { expect, tags, test as baseTest } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';

const test = baseTest.extend( {
	storageState: ADMIN_STATE_PATH,

	page: async ( { page, restApi }, use ) => {
		// Disable the task list reminder bar, it can interfere with the quick actions
		await restApi.post( `${ WC_ADMIN_API_PATH }/options`, {
			poocommerce_task_list_reminder_bar_hidden: 'yes',
		} );

		// Disable the orders report date tour
		await restApi.post( `${ WC_ADMIN_API_PATH }/options`, {
			poocommerce_orders_report_date_tour_shown: 'yes',
		} );

		// Disable the revenue report date tour
		await restApi.post( `${ WC_ADMIN_API_PATH }/options`, {
			poocommerce_revenue_report_date_tour_shown: 'yes',
		} );

		await use( page );
	},
} );

let categoryIds, productIds, orderIds, setupPage;

test.beforeAll( async ( { browser, restApi } ) => {
	// create a couple of product categories
	await restApi
		.post( `${ WC_API_PATH }/products/categories/batch`, {
			create: [ { name: 'Easy' }, { name: 'Complicated' } ],
		} )
		.then( ( response ) => {
			categoryIds = response.data.create.map(
				( category ) => category.id
			);
		} );

	// create a number of products to be used in orders
	const productsArray = [];
	const ordersArray = [];
	const variationIds = [];

	// 3 simple products
	for ( let i = 1; i < 4; i++ ) {
		productsArray.push( {
			name: `Product ${ i }`,
			type: 'simple',
			regular_price: `${ i }0.99`,
			categories: [ { id: categoryIds[ 0 ] } ],
		} );
	}
	// one variable product
	productsArray.push( {
		name: 'Variable Product',
		type: 'variable',
		categories: [ { id: categoryIds[ 1 ] } ],
		attributes: [
			{
				name: 'Colour',
				options: [ 'Red', 'Blue', 'Orange', 'Green' ],
				visible: true,
				variation: true,
			},
		],
	} );
	const variations = [
		{
			regular_price: '5.00',
			attributes: [
				{
					name: 'Colour',
					option: 'Red',
				},
			],
		},
		{
			regular_price: '6.00',
			attributes: [
				{
					name: 'Colour',
					option: 'Blue',
				},
			],
		},
		{
			regular_price: '7.00',
			attributes: [
				{
					name: 'Colour',
					option: 'Orange',
				},
			],
		},
		{
			regular_price: '8.00',
			attributes: [
				{
					name: 'Colour',
					option: 'Green',
				},
			],
		},
	];
	await restApi
		.post( `${ WC_API_PATH }/products/batch`, {
			create: productsArray,
		} )
		.then( ( response ) => {
			productIds = response.data.create.map( ( item ) => item.id );
		} );
	// set up the variations on the variable product
	for ( const key in variations ) {
		await restApi
			.post(
				`${ WC_API_PATH }/products/${
					productIds[ productIds.length - 1 ]
				}/variations`,
				variations[ key ]
			)
			.then( ( response ) => {
				variationIds.push( response.data.id );
			} );
	}

	// set up 10 orders
	for ( let i = 0; i < 10; i++ ) {
		ordersArray.push( {
			status: 'completed',
			line_items: [
				{
					product_id: productIds[ 0 ],
					quantity: 5,
				},
				{
					product_id: productIds[ 1 ],
					quantity: 2,
				},
				{
					product_id: productIds[ 3 ],
					variation_id: variationIds[ 1 ],
					quantity: 3,
				},
				{
					product_id: productIds[ 3 ],
					variation_id: variationIds[ 3 ],
					quantity: 1,
				},
			],
		} );
	}
	// create the orders
	await restApi
		.post( `${ WC_API_PATH }/orders/batch`, {
			create: ordersArray,
		} )
		.then( ( response ) => {
			orderIds = response.data.create.map( ( order ) => order.id );
		} );

	// Reset Analytics Settings to their default values.
	// Reset 'Excluded statuses' to default values.
	await restApi
		.post(
			'wc-analytics/settings/wc_admin/poocommerce_excluded_report_order_statuses',
			{
				value: [ 'pending', 'cancelled', 'failed' ],
			}
		)
		.then( ( response ) => {
			expect( response.data.value ).toEqual( [
				'pending',
				'cancelled',
				'failed',
			] );
		} )
		.catch( ( error ) => {
			throw new Error(
				`Error occurred while resetting 'Excluded statuses' to defaults.\n${ JSON.stringify(
					error,
					null,
					2
				) }`
			);
		} );

	// Reset 'Actionable statuses' to default values.
	await restApi
		.post(
			'wc-analytics/settings/wc_admin/poocommerce_actionable_order_statuses',
			{
				value: [ 'processing', 'on-hold' ],
			}
		)
		.then( ( response ) => {
			expect( response.data.value ).toEqual( [
				'processing',
				'on-hold',
			] );
		} )
		.catch( ( error ) => {
			throw new Error(
				`Error occurred while resetting 'Actionable statuses' to defaults.\n${ JSON.stringify(
					error,
					null,
					2
				) }`
			);
		} );

	// Reset 'Default date range' to default values.
	await restApi
		.post(
			'wc-analytics/settings/wc_admin/poocommerce_default_date_range',
			{
				value: 'period=month&compare=previous_year',
			}
		)
		.then( ( response ) => {
			// '&' is encoded as '&amp;' in the response.
			expect( response.data.value ).toEqual(
				'period=month&amp;compare=previous_year'
			);
		} )
		.catch( ( error ) => {
			throw new Error(
				`Error occurred while resetting 'Default date range' to defaults.\n${ JSON.stringify(
					error,
					null,
					2
				) }`
			);
		} );

	// process the Action Scheduler tasks
	setupPage = await browser.newPage();
	// eslint-disable-next-line playwright/no-wait-for-timeout
	await setupPage.waitForTimeout( 5000 );
	await setupPage.goto( '?process-waiting-actions' );
	await setupPage.close();
} );

test.afterAll( async ( { restApi } ) => {
	// delete the categories
	await restApi.post( `${ WC_API_PATH }/products/categories/batch`, {
		delete: categoryIds,
	} );
	// delete the products
	await restApi.post( `${ WC_API_PATH }/products/batch`, {
		delete: productIds,
	} );
	// delete the orders
	await restApi.post( `${ WC_API_PATH }/orders/batch`, { delete: orderIds } );
} );

test(
	'confirms correct summary numbers on overview page',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Foverview'
		);

		await expect(
			page.getByRole( 'menuitem', {
				name: 'Total sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Products sold 110 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Variations Sold 40 No change from Previous year:',
			} )
		).toBeVisible();
	}
);

test(
	'downloads revenue report as CSV',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Frevenue'
		);

		// the revenue report can either download immediately, or get mailed.
		try {
			await page.getByRole( 'button', { name: 'Download' } ).click();
			await expect( page.locator( '.components-snackbar' ) ).toBeVisible(
				{
					timeout: 10000,
				}
			); // fail fast if the snackbar doesn't display
			await expect( page.locator( '.components-snackbar' ) ).toHaveText(
				'Your Revenue Report will be emailed to you.'
			);
		} catch ( e ) {
			const downloadPromise = page.waitForEvent( 'download' );
			await page.getByRole( 'button', { name: 'Download' } ).click();
			const download = await downloadPromise;
			// eslint-disable-next-line jest/no-try-expect
			await expect( download.suggestedFilename() ).toContain(
				'revenue.csv'
			);
		}
	}
);

test(
	'use date filter on overview page',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Foverview'
		);

		// assert that current month is shown and that values are for that
		await expect( page.getByText( 'Month to date' ).first() ).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Total sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Products sold 110 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Variations Sold 40 No change from Previous year:',
			} )
		).toBeVisible();

		// click the date filter and change to Last month (should be no sales/orders)
		await page.getByRole( 'button', { name: 'Month to date' } ).click();
		await page.getByText( 'Last month' ).click();
		await page.getByRole( 'button', { name: 'Update' } ).click();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Total sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 0 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Products sold 0 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Variations Sold 0 No change from Previous year:',
			} )
		).toBeVisible();
	}
);

test(
	'set custom date range on revenue report',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Frevenue'
		);

		// assert that current month is shown and that values are for that
		await expect( page.getByText( 'Month to date' ).first() ).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Gross sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Returns $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Coupons $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Taxes $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Shipping $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Total sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();

		// click the date filter and change to custom date range (should be no sales/orders)
		await page.getByRole( 'button', { name: 'Month to date' } ).click();
		await page.getByText( 'Custom', { exact: true } ).click();
		await page
			.getByPlaceholder( 'mm/dd/yyyy' )
			.first()
			.fill( '01/01/2022' );
		await page.getByPlaceholder( 'mm/dd/yyyy' ).last().fill( '01/30/2022' );
		await page.getByRole( 'button', { name: 'Update' } ).click();

		// assert values updated
		await expect(
			page.getByRole( 'button', {
				name: 'Custom (Jan 1 - 30, 2022) vs. Previous year (Jan 1 - 30, 2021)',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Gross sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Returns $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Coupons $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Taxes $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Shipping $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Total sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
	}
);

test(
	'use advanced filters on orders report',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Forders'
		);

		// no filters applied
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average order value $122.93 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average items per order 11 No change from Previous year:',
			} )
		).toBeVisible();

		// apply some filters
		await page.getByRole( 'button', { name: 'All orders' } ).click();
		await page.getByText( 'Advanced filters' ).click();

		await page.getByRole( 'button', { name: 'Add a filter' } ).click();
		await page.getByRole( 'button', { name: 'Order status' } ).click();
		await page
			.getByLabel( 'Select an order status filter match' )
			.selectOption( 'Is' );
		await page
			.getByLabel( 'Select an order status', { exact: true } )
			.selectOption( 'Failed' );
		await page.getByRole( 'link', { name: 'Filter', exact: true } ).click();

		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 0 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average order value $0.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average items per order 0 No change from Previous year:',
			} )
		).toBeVisible();

		await page
			.getByLabel( 'Select an order status', { exact: true } )
			.selectOption( 'Completed' );
		await page.getByRole( 'link', { name: 'Filter', exact: true } ).click();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average order value $122.93 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Average items per order 11 No change from Previous year:',
			} )
		).toBeVisible();
	}
);

test(
	'use filter by single product on products report',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fproducts'
		);

		// no filters applied
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Items sold 110 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $1,229.30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();

		// apply some filters
		await page.getByRole( 'button', { name: 'All products' } ).click();
		await page.getByText( 'Single product' ).click();

		// Search for single product
		await page
			.getByPlaceholder( 'Type to search for a product' )
			.last()
			.fill( 'Variable Product' );

		await page
			.getByRole( 'option', {
				name: 'Variable Product',
				exact: true,
			} )
			.click();

		await expect(
			page.getByRole( 'menuitem', {
				name: 'Items sold 40 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $260.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();

		await page.getByText( 'All variations' ).click();

		// Search for single product
		await expect(
			page.getByRole( 'button', { name: 'Single variation' } )
		).toBeVisible();
		await page.getByRole( 'button', { name: 'Single variation' } ).click();
		await page
			.getByPlaceholder( 'Type to search for a variation' )
			.last()
			.fill( 'Blue' );

		await page
			.getByRole( 'option', { name: 'Variable Product - Blue' } )
			.click();

		await expect(
			page.getByRole( 'menuitem', {
				name: 'Items sold 30 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Net sales $180.00 No change from Previous year:',
			} )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', {
				name: 'Orders 10 No change from Previous year:',
			} )
		).toBeVisible();
	}
);

test(
	'analytics settings',
	{
		tag: [ tags.PAYMENTS, tags.SERVICES ],
	},
	async ( { page } ) => {
		await page.goto(
			'wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fsettings'
		);
		page.on( 'dialog', ( dialog ) => dialog.accept() );

		// change some settings
		await page.getByRole( 'checkbox', { name: 'On hold' } ).first().click();
		await page
			.getByRole( 'checkbox', { name: 'Pending payment' } )
			.last()
			.click();
		await page.getByRole( 'checkbox', { name: 'Failed' } ).last().click();
		await page.getByRole( 'button', { name: 'Month to date' } ).click();
		await page.getByText( 'Week to date' ).click();
		await page.getByRole( 'button', { name: 'Update' } ).click();
		await page.getByRole( 'button', { name: 'Save settings' } ).click();

		await expect(
			page
				.getByText( 'Your settings have been successfully saved.' )
				.first()
		).toBeVisible();
		await page.reload();

		await expect(
			page.getByRole( 'checkbox', { name: 'On hold' } ).first()
		).toBeChecked();
		await expect(
			page.getByRole( 'checkbox', { name: 'Pending payment' } ).last()
		).toBeChecked();
		await expect(
			page.getByRole( 'checkbox', { name: 'Failed' } ).last()
		).toBeChecked();
		await expect(
			page.getByRole( 'button', { name: 'Week to date' } )
		).toBeVisible();

		// reset to default settings
		await page.getByRole( 'button', { name: 'Reset defaults' } ).click();
		await expect(
			page
				.getByText( 'Your settings have been successfully saved.' )
				.first()
		).toBeVisible();
	}
);
