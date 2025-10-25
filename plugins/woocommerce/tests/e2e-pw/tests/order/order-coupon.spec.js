/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { tags, expect, test } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';

let productId, couponId, orderId;

const productPrice = '9.99';
const productName = 'Apply Coupon Product';
const couponCode = '5off';
const couponAmount = '5';
const discountedPrice = ( productPrice - couponAmount ).toString();

test.describe(
	'PooCommerce Orders > Apply Coupon',
	{ tag: [ tags.SERVICES, tags.HPOS ] },
	() => {
		test.use( { storageState: ADMIN_STATE_PATH } );

		test.beforeAll( async ( { restApi } ) => {
			// create a simple product
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: productName,
					type: 'simple',
					regular_price: productPrice,
				} )
				.then( ( response ) => {
					productId = response.data.id;
				} );
			// create a $5 off coupon
			await restApi
				.post( `${ WC_API_PATH }/coupons`, {
					code: couponCode,
					discount_type: 'fixed_product',
					amount: couponAmount,
				} )
				.then( ( response ) => {
					couponId = response.data.id;
				} );
			// create order
			await restApi
				.post( `${ WC_API_PATH }/orders`, {
					line_items: [
						{
							product_id: productId,
							quantity: 1,
						},
					],
					coupon_lines: [
						{
							code: couponCode,
						},
					],
				} )
				.then( ( response ) => {
					orderId = response.data.id;
				} );
		} );

		test.afterAll( async ( { restApi } ) => {
			// cleans up product, coupon and order after run
			await restApi.delete( `${ WC_API_PATH }/products/${ productId }`, {
				force: true,
			} );
			await restApi.delete( `${ WC_API_PATH }/coupons/${ couponId }`, {
				force: true,
			} );
			await restApi.delete( `${ WC_API_PATH }/orders/${ orderId }`, {
				force: true,
			} );
		} );

		test( 'can apply a coupon', async ( { page } ) => {
			await page.goto( 'wp-admin/admin.php?page=wc-orders&action=new' );

			// open modal for adding line items
			await page.locator( 'button.add-line-item' ).click();
			await page.locator( 'button.add-order-item' ).click();

			// search for product to add
			await page.locator( 'text=Search for a product…' ).click();
			await page
				.locator( '.select2-search--dropdown' )
				.getByRole( 'combobox' )
				.type( productName );
			await page
				.locator(
					'li.select2-results__option.select2-results__option--highlighted'
				)
				.click();

			await page.locator( 'button#btn-ok' ).click();

			// apply coupon
			page.on( 'dialog', ( dialog ) => dialog.accept( couponCode ) );
			await page.locator( 'button.add-coupon' ).click();

			await expect(
				page
					.locator( '#poocommerce-order-items li' )
					.filter( { hasText: couponCode } )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', { name: 'Coupon(s)' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', { name: `- $${ couponAmount }.00` } )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', {
					name: `$${ discountedPrice }`,
					exact: true,
				} )
			).toBeVisible();
		} );

		test( 'can remove a coupon', async ( { page } ) => {
			await page.goto(
				`wp-admin/admin.php?page=wc-orders&action=edit&id=${ orderId }`
			);
			// assert that there is a coupon on the order
			await expect(
				page
					.locator( '#poocommerce-order-items li' )
					.filter( { hasText: couponCode } )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', { name: 'Coupon(s)' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', {
					name: `- $${ couponAmount }.00`,
				} )
			).toBeVisible();
			await expect(
				page.getByRole( 'cell', {
					name: `$${ discountedPrice }`,
					exact: true,
				} )
			).toBeVisible();
			// remove the coupon
			await page.locator( 'a.remove-coupon' ).dispatchEvent( 'click' ); // have to use dispatchEvent because nothing visible to click on

			// make sure the coupon was removed
			await expect(
				page.locator( '.wc_coupon_list li', {
					hasText: couponCode,
				} )
			).toBeHidden();
			await expect(
				page
					.getByRole( 'cell', { name: `$${ productPrice }` } )
					.nth( 1 )
			).toBeVisible();
		} );
	}
);
