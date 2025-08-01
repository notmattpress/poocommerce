/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { test } from '../../../fixtures/block-editor-fixtures';
import { helpers } from '../../../utils';
import { tags, expect } from '../../../fixtures/fixtures';
import { clickOnTab } from '../../../utils/simple-products';

const NEW_EDITOR_ADD_PRODUCT_URL =
	'wp-admin/admin.php?page=wc-admin&path=%2Fadd-product';

const isTrackingSupposedToBeEnabled = !! process.env.ENABLE_TRACKING;

const uniqueId = helpers.random();
let categoryId = 0;
const categoryName = `cat_${ uniqueId }`;
const productName = `Product ${ uniqueId }`;
const productData = {
	name: `Linked ${ productName }`,
	summary: 'This is a product summary',
};

const linkedProductsData = [],
	productIds = [];
let productId = 0;

test.describe( 'General tab', { tag: tags.GUTENBERG }, () => {
	test.describe( 'Linked product', () => {
		test.beforeAll( async ( { restApi } ) => {
			await restApi
				.post( `${ WC_API_PATH }/products/categories`, {
					name: categoryName,
				} )
				.then( ( response ) => {
					categoryId = response.data.id;
				} );

			for ( let i = 1; i <= 5; i++ ) {
				const product = {
					name: `Product ${ uniqueId } ${ i }`,
					regular_price: `${ i }0000`,
					sale_price: `${ i }000`,
					type: 'simple',
					categories: [ { id: categoryId } ],
				};
				await restApi
					.post( `${ WC_API_PATH }/products`, product )
					.then( ( response ) => {
						productIds.push( response.data.id );
						linkedProductsData.push( product );
					} );
			}
		} );

		test.afterAll( async ( { restApi } ) => {
			for ( const aProductId of productIds ) {
				await restApi.delete(
					`${ WC_API_PATH }/products/${ aProductId }`,
					{
						force: true,
					}
				);
			}
			await restApi.delete( `${ WC_API_PATH }/products/${ productId }`, {
				force: true,
			} );

			await restApi.delete(
				`${ WC_API_PATH }/products/categories/${ categoryId }`,
				{
					force: true,
				}
			);
		} );

		test.skip(
			isTrackingSupposedToBeEnabled,
			'The block product editor is not being tested'
		);

		test( 'can create a product with linked products', async ( {
			page,
		} ) => {
			await page.goto( NEW_EDITOR_ADD_PRODUCT_URL );
			await clickOnTab( 'General', page );
			await page
				.getByPlaceholder( 'e.g. 12 oz Coffee Mug' )
				.fill( productData.name );
			await page
				.locator(
					'[data-template-block-id="basic-details"] .components-summary-control'
				)
				.last()
				.fill( productData.summary );

			// Include in category
			await clickOnTab( 'Organization', page );
			const waitForCategoriesResponse = page.waitForResponse(
				( response ) =>
					response.url().includes( '/wp-json/wp/v2/product_cat' ) &&
					response.status() === 200
			);
			await page.getByLabel( 'Categories' ).click();
			await waitForCategoriesResponse;
			await page.getByLabel( categoryName ).check();
			await page.getByLabel( `Remove Uncategorized` ).click();
			await expect(
				page.getByLabel( `Remove ${ categoryName }` )
			).toBeVisible();

			const waitForProductsSearchResponse = page.waitForResponse(
				( response ) =>
					response
						.url()
						.includes( '/wp-json/wc/v3/products?search' ) &&
					response.status() === 200
			);
			await clickOnTab( 'Linked products', page );
			await waitForProductsSearchResponse;

			await expect(
				page.getByRole( 'heading', {
					name: 'Cross-sells',
				} )
			).toBeVisible();

			await page
				.locator(
					'.wp-block-poocommerce-product-linked-list-field__form-group-content'
				)
				.first()
				.getByRole( 'combobox' )
				.fill( productName );

			await page.getByText( linkedProductsData[ 0 ].name ).click();

			const chooseProductsResponsePromise = page.waitForResponse(
				( response ) =>
					response
						.url()
						.includes(
							'/wp-json/wc/v3/products/suggested-products'
						) && response.status() === 200
			);

			await page.getByText( 'Choose products for me' ).first().click();
			await chooseProductsResponsePromise;

			await expect(
				page.getByRole( 'row', { name: productName } )
			).toHaveCount( 4 );

			const upsellsRows = page.locator(
				'div.poocommerce-product-list div[role="table"] div[role="rowgroup"] div[role="row"]'
			);

			await expect( upsellsRows ).toHaveCount( 4 );

			await page
				.locator(
					'.wp-block-poocommerce-product-linked-list-field__form-group-content'
				)
				.last()
				.getByRole( 'combobox' )
				.fill( linkedProductsData[ 1 ].name );

			await page
				.getByText( linkedProductsData[ 1 ].name )
				.first()
				.click();

			await page
				.locator( '.poocommerce-product-header__actions' )
				.getByRole( 'button', {
					name: 'Publish',
				} )
				.click();

			await expect(
				page.getByLabel( 'Dismiss this notice' )
			).toContainText( 'Product published' );

			const title = page.locator( '.poocommerce-product-header__title' );

			// Save product ID
			const productIdRegex = /product%2F(\d+)/;
			const url = page.url();
			const productIdMatch = productIdRegex.exec( url );
			productId = productIdMatch ? productIdMatch[ 1 ] : null;

			await expect( productId ).toBeDefined();
			await expect( title ).toHaveText( productData.name );

			await page.goto( `?post_type=product&p=${ productId }` );

			await expect(
				page.getByRole( 'heading', {
					name: productData.name,
					level: 1,
				} )
			).toBeVisible();

			const productsList = page.locator(
				'section.upsells.products ul > li'
			);

			await expect( productsList ).toHaveCount( 4 );
		} );
	} );
} );
