/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { tags, expect, test } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';

test.use( { storageState: ADMIN_STATE_PATH } );

test.describe.serial(
	'PooCommerce Orders > Refund an order',
	{ tag: [ tags.PAYMENTS, tags.HPOS ] },
	() => {
		let productId, orderId, currencySymbol;

		test.beforeAll( async ( { restApi } ) => {
			// create a simple product
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: 'Simple Refund Product',
					type: 'simple',
					regular_price: '9.99',
				} )
				.then( ( response ) => {
					productId = response.data.id;
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
					status: 'completed',
				} )
				.then( ( response ) => {
					orderId = response.data.id;
				} );
		} );

		test.afterAll( async ( { restApi } ) => {
			await restApi.delete( `${ WC_API_PATH }/products/${ productId }`, {
				force: true,
			} );
			await restApi.delete( `${ WC_API_PATH }/orders/${ orderId }`, {
				force: true,
			} );
		} );

		test( 'can issue a refund by quantity', async ( { page } ) => {
			await page.goto(
				`wp-admin/admin.php?page=wc-orders&action=edit&id=${ orderId }`
			);

			// get currency symbol
			currencySymbol = await page
				.locator( '.poocommerce-Price-currencySymbol' )
				.first()
				.textContent();

			await page.locator( 'button.refund-items' ).click();

			// Verify the refund section shows
			await expect(
				page.locator( 'div.wc-order-refund-items' )
			).toBeVisible();
			await expect(
				page.locator( '#restock_refunded_items' )
			).toBeChecked();

			// Initiate a refund
			await page.locator( '.refund_order_item_qty' ).fill( '1' );
			await page.locator( '#refund_reason' ).fill( 'No longer wanted' );

			// Confirm values
			await expect( page.locator( '.refund_line_total' ) ).toHaveValue(
				'9.99'
			);
			await expect( page.locator( '#refund_amount' ) ).toHaveValue(
				'9.99'
			);
			await expect( page.locator( '.do-manual-refund' ) ).toContainText(
				`Refund ${ currencySymbol }9.99 manually`
			);

			// Do the refund
			page.on( 'dialog', ( dialog ) => dialog.accept() );
			await page.locator( '.do-manual-refund' ).click();

			// Verify the product line item shows the refunded quantity and amount
			await expect(
				page.locator( 'small.refunded >> nth=0' )
			).toContainText( '-1' );
			await expect(
				page.locator( 'small.refunded >> nth=1' )
			).toContainText( `${ currencySymbol }9.99` );

			// Verify the refund shows in the list with the amount
			await expect( page.locator( 'p.description' ) ).toContainText(
				'No longer wanted'
			);
			await expect(
				page.locator( 'td.refunded-total >> nth=1' )
			).toContainText( `-${ currencySymbol }9.99` );

			// Verify system note was added
			await expect(
				page.locator( '.system-note >> nth=0' )
			).toContainText(
				'Order status changed from Completed to Refunded.'
			);
		} );

		// this test relies on the previous test, so should refactor
		test( 'can delete an issued refund', async ( { page } ) => {
			await page.goto(
				`wp-admin/admin.php?page=wc-orders&action=edit&id=${ orderId }`
			);

			page.on( 'dialog', ( dialog ) => dialog.accept() );
			await page.getByRole( 'row', { name: /Refund #\d+/ } ).hover();
			await page.locator( '.delete_refund' ).click();

			// Verify the refunded row item is no longer showing
			await expect( page.locator( 'tr.refund' ) ).toHaveCount( 0 );

			// Verify the product line item doesn't show the refunded quantity and amount
			await expect( page.locator( 'small.refunded' ) ).toHaveCount( 0 );

			// Verify the refund no longer shows in the list
			await expect( page.locator( 'td.refunded-total' ) ).toHaveCount(
				0
			);
		} );
	}
);

test.describe(
	'PooCommerce Orders > Refund and restock an order item',
	{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
	() => {
		let productWithStockId, productWithNoStockId, orderId;

		test.beforeAll( async ( { restApi } ) => {
			// create a simple product with managed stock
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: 'Product with stock',
					type: 'simple',
					regular_price: '9.99',
					manage_stock: true,
					stock_quantity: 10,
				} )
				.then( ( response ) => {
					productWithStockId = response.data.id;
				} );
			// create a simple product with NO managed stock
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: 'Product with NO stock',
					type: 'simple',
					regular_price: '5.99',
				} )
				.then( ( response ) => {
					productWithNoStockId = response.data.id;
				} );
			// create order
			await restApi
				.post( `${ WC_API_PATH }/orders`, {
					line_items: [
						{
							product_id: productWithNoStockId,
							quantity: 1,
						},
						{
							product_id: productWithStockId,
							quantity: 2,
						},
					],
					status: 'completed',
				} )
				.then( ( response ) => {
					orderId = response.data.id;
				} );
		} );

		test.afterAll( async ( { restApi } ) => {
			await restApi.delete(
				`${ WC_API_PATH }/products/${ productWithStockId }`,
				{
					force: true,
				}
			);
			await restApi.delete(
				`${ WC_API_PATH }/products/${ productWithNoStockId }`,
				{
					force: true,
				}
			);
			await restApi.delete( `${ WC_API_PATH }/orders/${ orderId }`, {
				force: true,
			} );
		} );

		test( 'can update order after refunding item without automatic stock adjustment', async ( {
			page,
		} ) => {
			await page.goto(
				`wp-admin/admin.php?page=wc-orders&action=edit&id=${ orderId }`
			);

			// Verify stock reduction system note was added
			await expect(
				page.locator( '.system-note >> nth=1' )
			).toContainText(
				/Stock levels reduced: Product with stock \(10→8\)/
			);

			// Click the Refund button
			await page.locator( 'button.refund-items' ).click();

			// Verify the refund section shows
			await expect(
				page.locator( 'div.wc-order-refund-items' )
			).toBeVisible();
			await expect(
				page.locator( '#restock_refunded_items' )
			).toBeChecked();

			// Initiate a refund
			await page.locator( '.refund_order_item_qty >> nth=1' ).fill( '2' );
			await page.locator( '#refund_reason' ).fill( 'No longer wanted' );
			page.on( 'dialog', ( dialog ) => dialog.accept() );
			await page.locator( '.do-manual-refund' ).click();

			// Verify restock system note was added
			await expect(
				page.locator( '.system-note >> nth=0' )
			).toContainText( /Item #\d+ stock increased from 8 to 10./ );
		} );
	}
);
