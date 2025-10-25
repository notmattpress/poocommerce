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
import { expect, test } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';

const hide_task_list = async ( restApi, task_list_name ) => {
	const {
		status,
		data: { isHidden },
	} = await restApi.post(
		`${ WC_ADMIN_API_PATH }/onboarding/tasks/${ task_list_name }/hide`
	);

	expect( status ).toEqual( 200 );

	return isHidden === true;
};

const show_task_list = async ( restApi, task_list_name ) => {
	const {
		status,
		data: { isHidden },
	} = await restApi.post(
		`${ WC_ADMIN_API_PATH }/onboarding/tasks/${ task_list_name }/unhide`
	);

	expect( status ).toEqual( 200 );

	return isHidden === false;
};

test.describe( 'Add Product Task', () => {
	test.use( { storageState: ADMIN_STATE_PATH } );

	test.beforeAll( async ( { restApi } ) => {
		const productIds = [];

		// Set business choice to "I'm just starting my business"
		await restApi.post( `${ WC_ADMIN_API_PATH }/onboarding/profile`, {
			skipped: true,
			business_choice: 'im_just_starting_my_business',
		} );

		// Get all products
		await restApi
			.get( `${ WC_API_PATH }/products`, {
				_fields: 'id',
				per_page: 100,
				status: 'any', // excludes trashed products
			} )
			.then( ( response ) => {
				const ids = response.data.map( ( { id } ) => id );
				productIds.push( ...ids );
			} );

		// Get all products in trash separately.
		await restApi
			.get( `${ WC_API_PATH }/products`, {
				_fields: 'id',
				per_page: 100,
				status: 'trash',
			} )
			.then( ( response ) => {
				const ids = response.data.map( ( { id } ) => id );
				productIds.push( ...ids );
			} );

		// Delete all products
		await restApi.post( `${ WC_API_PATH }/products/batch`, {
			delete: productIds,
		} );
	} );

	test.afterAll( async ( { restApi } ) => {
		await restApi.post( `${ WC_ADMIN_API_PATH }/onboarding/profile`, {
			skipped: false,
		} );
	} );

	test( 'Add product task displays options for different product types', async ( {
		page,
	} ) => {
		// Navigate to the task list
		await page.goto( 'wp-admin/admin.php?page=wc-admin&task=products' );

		// Verify product type options are displayed
		await expect(
			page.getByRole( 'menuitem', { name: 'Physical product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Variable product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Grouped product' } )
		).toBeVisible();
	} );

	test( 'Products page redirects to add product task when no products exist', async ( {
		page,
	} ) => {
		// Navigate to All Products page
		await page.goto( 'wp-admin/edit.php?post_type=product' );

		// Verify redirect to add product task
		await expect( page ).toHaveURL( /.+task=products/ );
		await expect(
			page.getByRole( 'menuitem', { name: 'Physical product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Variable product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Grouped product' } )
		).toBeVisible();
	} );

	test( 'Products page shows products table when products exist', async ( {
		page,
		restApi,
	} ) => {
		// Create a test product
		await restApi.post( `${ WC_API_PATH }/products`, {
			name: 'Test Product',
			type: 'simple',
			regular_price: '10.00',
		} );

		// Navigate to All Products page
		await page.goto( 'wp-admin/edit.php?post_type=product' );

		// Verify products table is visible
		await expect( page.locator( '.wp-list-table' ) ).toBeVisible();
		await expect(
			page.getByRole( 'columnheader', { name: 'Name' } )
		).toHaveCount( 2 );
		await expect(
			page.getByRole( 'columnheader', { name: 'SKU' } )
		).toHaveCount( 2 );
		await expect(
			page.getByRole( 'columnheader', { name: 'Price' } )
		).toHaveCount( 2 );
		await expect(
			page.locator( '.wp-list-table > tbody > tr' )
		).toHaveCount( 1 );

		// Clean up - delete test product
		const products = await restApi.get( `${ WC_API_PATH }/products` );
		for ( const product of products.data ) {
			await restApi.delete( `${ WC_API_PATH }/products/${ product.id }`, {
				force: true,
			} );
		}
	} );

	test( 'Products page redirects to add product task when no products exist and task list is hidden', async ( {
		page,
		restApi,
	} ) => {
		// Hide the task list
		expect( await hide_task_list( restApi, 'setup' ) ).toBe( true );

		// Navigate to All Products page
		await page.goto( 'wp-admin/edit.php?post_type=product' );

		// Verify redirect to add product task
		await expect( page ).toHaveURL( /.+task=products/ );
		await expect(
			page.getByRole( 'menuitem', { name: 'Physical product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Variable product' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'menuitem', { name: 'Grouped product' } )
		).toBeVisible();

		// Reset task list to visible
		expect( await show_task_list( restApi, 'setup' ) ).toBe( true );
	} );
} );
