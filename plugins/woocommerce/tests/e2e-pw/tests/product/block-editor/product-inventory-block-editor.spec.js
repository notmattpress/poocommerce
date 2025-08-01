/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { test as baseTest } from '../../../fixtures/block-editor-fixtures';
import { expect, tags } from '../../../fixtures/fixtures';

const test = baseTest.extend( {
	product: async ( { restApi }, use ) => {
		let product;

		await restApi
			.post( `${ WC_API_PATH }/products`, {
				name: `Product ${ Date.now() }`,
				type: 'simple',
				regular_price: '12.99',
				stock_status: 'instock',
			} )
			.then( ( response ) => {
				product = response.data;
			} );

		await use( product );

		// Cleanup
		await restApi.delete( `${ WC_API_PATH }/products/${ product.id }`, {
			force: true,
		} );
	},
	page: async ( { page, product }, use ) => {
		await test.step( 'go to product editor, inventory tab', async () => {
			// This wait for response is only to avoid flakiness when filling SKU field
			const waitResponse = page.waitForResponse(
				( response ) =>
					response
						.url()
						.includes(
							'wp-json/wc-admin/options?options=poocommerce_dimension_unit'
						) && response.status() === 200
			);
			await page.goto(
				`wp-admin/post.php?post=${ product.id }&action=edit`
			);
			await page.getByRole( 'tab', { name: 'Inventory' } ).click();
			await waitResponse;
		} );

		await use( page );
	},
} );

test(
	'can update sku',
	{ tag: tags.GUTENBERG },
	async ( { page, product } ) => {
		const sku = `SKU_${ Date.now() }`;

		await test.step( 'update the sku value', async () => {
			await page.locator( '[name="poocommerce-product-sku"]' ).click();
			await page
				.locator( '[name="poocommerce-product-sku"]' )
				.fill( sku );
		} );

		await test.step( 'update the product', async () => {
			await page.getByRole( 'button', { name: 'Update' } ).click();
			// Verify product was updated
			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product updated' );
		} );

		await test.step( 'verify the change in product editor', async () => {
			await expect(
				page.locator( '[name="poocommerce-product-sku"]' )
			).toHaveValue( sku );
		} );

		await test.step( 'verify the changes in the store frontend', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await expect( page.getByText( `SKU: ${ sku }` ) ).toBeVisible();
		} );
	}
);

test(
	'can update stock status',
	{ tag: tags.GUTENBERG },
	async ( { page, product } ) => {
		await test.step( 'update the sku value', async () => {
			await page.getByLabel( 'Out of stock' ).check();
		} );

		await test.step( 'update the product', async () => {
			await page.getByRole( 'button', { name: 'Update' } ).click();
			// Verify product was updated
			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product updated' );
		} );

		await test.step( 'verify the change in product editor', async () => {
			await expect( page.getByLabel( 'Out of stock' ) ).toBeChecked();
		} );

		await test.step( 'verify the changes in the store frontend', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await expect( page.getByText( 'Out of stock' ) ).toBeVisible();
		} );
	}
);

test(
	'can track stock quantity',
	{ tag: tags.GUTENBERG },
	async ( { page, product } ) => {
		await test.step( 'enable track stock quantity', async () => {
			await page.getByLabel( 'Track inventory' ).check();
			// await closeTourModal( { page, timeout: 2000 } );
			await page.getByRole( 'button', { name: 'Advanced' } ).click();
			await page.getByLabel( "Don't allow purchases" ).check();
		} );

		const quantity = '2';

		await test.step( 'update available quantity', async () => {
			await page.locator( '[name="stock_quantity"]' ).clear();
			await page.locator( '[name="stock_quantity"]' ).fill( quantity );
			await expect(
				page.locator( '[name="stock_quantity"]' )
			).toHaveValue( quantity );
		} );

		await test.step( 'update the product', async () => {
			await page.getByRole( 'button', { name: 'Update' } ).click();
			// Verify product was updated
			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product updated' );
		} );

		await test.step( 'verify the change in product editor', async () => {
			await expect(
				page.locator( '[name="stock_quantity"]' )
			).toHaveValue( quantity );
		} );

		await test.step( 'verify the changes in the store frontend', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await expect(
				page.getByText( `${ quantity } in stock` )
			).toBeVisible();
		} );

		await test.step( 'return to product editor', async () => {
			await page.goto(
				`wp-admin/post.php?post=${ product.id }&action=edit`
			);
			await page.getByRole( 'tab', { name: 'Inventory' } ).click();
		} );

		await test.step( 'update available quantity', async () => {
			await page.locator( '[name="stock_quantity"]' ).fill( '0' );
		} );

		await test.step( 'update the product', async () => {
			await page.getByRole( 'button', { name: 'Update' } ).click();
			// Verify product was updated
			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product updated' );
		} );

		await test.step( 'verify the change in product editor', async () => {
			await expect(
				page.locator( '[name="stock_quantity"]' )
			).toHaveValue( '0' );
		} );

		await test.step( 'verify the changes in the store frontend', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await expect( page.getByText( 'Out of stock' ) ).toBeVisible();
		} );
	}
);

test(
	'can limit purchases',
	{ tag: tags.GUTENBERG },
	async ( { page, product } ) => {
		await test.step( 'ensure limit purchases is disabled', async () => {
			// await closeTourModal( { page, timeout: 2000 } );
			await page.getByRole( 'button', { name: 'Advanced' } ).click();
			await expect(
				page.getByLabel( 'Limit purchases to 1 item per order' )
			).not.toBeChecked();
		} );

		await test.step( 'add 2 items to cart', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await page.getByLabel( 'Product quantity' ).fill( '2' );
			await page.locator( 'button[name="add-to-cart"]' ).click();
			await expect(
				page.getByText(
					new RegExp(
						`2 × ["|“]${ product.name }["|”] have been added to your cart.`
					)
				)
			).toBeVisible();
		} );

		await test.step( 'return to product editor', async () => {
			await page.goto(
				`wp-admin/post.php?post=${ product.id }&action=edit`
			);
			await page.getByRole( 'tab', { name: 'Inventory' } ).click();
		} );

		await test.step( 'enable limit purchases', async () => {
			await page.getByRole( 'button', { name: 'Advanced' } ).click();
			await page
				.getByLabel( 'Limit purchases to 1 item per order' )
				.check();
		} );

		await test.step( 'update the product', async () => {
			await page.getByRole( 'button', { name: 'Update' } ).click();
			// Verify product was updated
			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product updated' );
		} );

		await test.step( 'verify you cannot order more than 1 item', async () => {
			// Verify image in store frontend
			await page.goto( product.permalink );

			await page.locator( 'button[name="add-to-cart"]' ).click();
			await page.locator( 'button[name="add-to-cart"]' ).click();

			await expect(
				page.getByText(
					new RegExp(
						`You cannot add another .${ product.name }. to your cart`
					)
				)
			).toBeVisible();
		} );
	}
);
