/**
 * External dependencies
 */
import {
	getCanvas,
	goToPageEditor,
	insertBlockByShortcut,
	publishPage,
	WC_API_PATH,
	WP_API_PATH,
} from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { tags, test, expect } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';
import { fillPageTitle } from '../../utils/editor';

const pageTitle = 'Product Showcase';
const singleProductPrice1 = '5.00';
const singleProductPrice2 = '10.00';
const singleProductPrice3 = '15.00';

const productTagName1 = 'product tag 1';
const productTagName2 = 'product tag 2';
const productTagName3 = 'product tag 3';

const productAttributeName = 'color';
const productAttributeTerm = 'red';

const simpleProductName = 'Single Product With Tags';

let product1Id,
	product2Id,
	product3Id,
	productTag1Id,
	productTag2Id,
	productTag3Id,
	attributeId;

test.describe(
	'Browse product tags and attributes from the product page',
	{ tag: [ tags.PAYMENTS, tags.SERVICES ] },
	() => {
		test.use( { storageState: ADMIN_STATE_PATH } );

		test.beforeAll( async ( { restApi } ) => {
			// add product tags
			await restApi
				.post( `${ WC_API_PATH }/products/tags`, {
					name: productTagName1,
				} )
				.then( ( response ) => {
					productTag1Id = response.data.id;
				} );
			await restApi
				.post( `${ WC_API_PATH }/products/tags`, {
					name: productTagName2,
				} )
				.then( ( response ) => {
					productTag2Id = response.data.id;
				} );
			await restApi
				.post( `${ WC_API_PATH }/products/tags`, {
					name: productTagName3,
				} )
				.then( ( response ) => {
					productTag3Id = response.data.id;
				} );

			// add product attribute
			await restApi
				.post( `${ WC_API_PATH }/products/attributes`, {
					name: productAttributeName,
					has_archives: true,
				} )
				.then( ( response ) => {
					attributeId = response.data.id;
				} );

			// add product attribute term
			await restApi.post(
				`${ WC_API_PATH }/products/attributes/${ attributeId }/terms`,
				{
					name: productAttributeTerm,
				}
			);

			// add products
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: simpleProductName + ' 1',
					type: 'simple',
					regular_price: singleProductPrice1,
					tags: [
						{ id: productTag1Id },
						{
							id: productTag2Id,
						},
						{
							id: productTag3Id,
						},
					],
					attributes: [
						{
							id: attributeId,
							visible: true,
							options: [ productAttributeTerm ],
						},
					],
				} )
				.then( ( response ) => {
					product1Id = response.data.id;
				} );
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: simpleProductName + ' 2',
					type: 'simple',
					regular_price: singleProductPrice2,
					tags: [
						{ id: productTag1Id },
						{
							id: productTag2Id,
						},
					],
					attributes: [
						{
							id: attributeId,
							visible: true,
							options: [ productAttributeTerm ],
						},
					],
				} )
				.then( ( response ) => {
					product2Id = response.data.id;
				} );
			await restApi
				.post( `${ WC_API_PATH }/products`, {
					name: simpleProductName + ' 3',
					type: 'simple',
					regular_price: singleProductPrice3,
					tags: [ { id: productTag1Id } ],
					attributes: [
						{
							id: attributeId,
							visible: true,
							options: [ productAttributeTerm ],
						},
					],
				} )
				.then( ( response ) => {
					product3Id = response.data.id;
				} );
		} );

		test.afterAll( async ( { restApi } ) => {
			await restApi.post( `${ WC_API_PATH }/products/batch`, {
				delete: [ product1Id, product2Id, product3Id ],
			} );
			await restApi.post( `${ WC_API_PATH }/products/tags/batch`, {
				delete: [ productTag1Id, productTag2Id, productTag3Id ],
			} );
			await restApi.post( `${ WC_API_PATH }/products/attributes/batch`, {
				delete: [ attributeId ],
			} );

			const pages = await restApi.get( `${ WP_API_PATH }/pages` );

			for ( const page of pages.data ) {
				if ( page.title.rendered === pageTitle ) {
					await restApi.delete(
						`${ WP_API_PATH }/pages/${ page.id }`,
						{
							data: {
								force: true,
							},
						}
					);
				}
			}
		} );

		test( 'should see shop catalog with all its products', async ( {
			page,
		} ) => {
			await page.goto( 'shop/' );
			await expect(
				page.getByRole( 'heading', { name: 'Shop' } )
			).toBeVisible();
			await expect(
				page.locator( '.poocommerce-ordering' )
			).toBeVisible();

			const addToCart = page.getByRole( 'add_to_cart_button' );
			for ( let i = 0; i < addToCart.count(); ++i )
				await expect( addToCart.nth( i ) ).toBeVisible();

			const productPrice = page.getByRole( 'poocommerce-Price-amount' );
			for ( let i = 0; i < productPrice.count(); ++i )
				await expect( productPrice.nth( i ) ).toBeVisible();

			const productTitle = page.getByRole(
				'poocommerce-loop-product__title'
			);
			for ( let i = 0; i < productTitle.count(); ++i )
				await expect( productTitle.nth( i ) ).toBeVisible();

			const productImage = page.getByRole( 'wp-post-image' );
			for ( let i = 0; i < productImage.count(); ++i )
				await expect( productImage.nth( i ) ).toBeVisible();
		} );

		test( 'should see and sort tags page with all the products', async ( {
			page,
		} ) => {
			await page.goto( 'shop/?orderby=date' );
			await page.locator( `text=${ simpleProductName } 1` ).click();
			await page.getByRole( 'link', { name: productTagName1 } ).click();
			await expect(
				page.getByRole( 'heading', { name: productTagName1 } )
			).toBeVisible();
			await expect(
				page.getByText(
					new RegExp( `Products tagged .*${ productTagName1 }.*` )
				)
			).toBeVisible();
			await expect(
				page.getByText( 'Showing all 3 results' )
			).toBeVisible();
		} );

		test( 'should see and sort attributes page with all its products', async ( {
			page,
		} ) => {
			// the api setting for enabling attribute term page doesn't apply for some reason
			// workaround for the change to take effect is to just update via the settings ui.
			await page.goto(
				'wp-admin/admin.php?page=wc-settings&tab=products&section=advanced'
			);

			const attributeLookupCheckbox = page.locator(
				'#poocommerce_attribute_lookup_enabled'
			);
			await expect( attributeLookupCheckbox ).toBeVisible();

			// eslint-disable-next-line playwright/no-conditional-in-test
			if ( ! ( await attributeLookupCheckbox.isChecked() ) ) {
				await attributeLookupCheckbox.click();
				await page.locator( 'text=Save changes' ).click();
				await expect(
					page
						.locator( '#message' )
						.getByText( 'Your settings have been saved' )
				).toBeVisible();
			}

			await expect( attributeLookupCheckbox ).toBeChecked();

			const slug = simpleProductName.replace( / /gi, '-' ).toLowerCase();
			await page.goto( `product/${ slug }` );
			await page
				.locator(
					'.poocommerce-product-attributes-item__value > p > a',
					{
						hasText: productAttributeTerm,
					}
				)
				.click();
			await expect(
				page.getByRole( 'heading', { name: productAttributeTerm } )
			).toBeVisible();
			await expect(
				page.locator( '.poocommerce-breadcrumb' )
			).toContainText(
				` / Product ${ productAttributeName } / ${ productAttributeTerm }`
			);
			await expect(
				page.getByText( 'Showing all 3 results' )
			).toBeVisible();
		} );

		test( 'can see products showcase', async ( { page } ) => {
			// create as a merchant a new page with Product Collection block
			await goToPageEditor( { page } );
			await fillPageTitle( page, pageTitle );
			await insertBlockByShortcut( page, 'Product Collection' );
			const canvas = await getCanvas( page );

			// Product Collection requires choosing some collection.
			await canvas
				.locator(
					'[data-type="poocommerce/product-collection"] .components-placeholder'
				)
				.getByRole( 'button', {
					name: 'create your own',
				} )
				.click();

			await publishPage( page, pageTitle );

			// go to created page with products showcase
			await page.goto( 'product-showcase' );
			await expect(
				page.getByRole( 'heading', { name: pageTitle } )
			).toBeVisible();
			expect(
				await page
					.getByRole( 'button', { name: 'Add to cart' } )
					.count()
			).toBeGreaterThan( 0 );

			const productPrice = page.locator( '.poocommerce-Price-amount' );
			for ( let i = 0; i < productPrice.count(); ++i )
				await expect( productPrice.nth( i ) ).toBeVisible();

			const productTitle = page.locator(
				'.poocommerce-loop-product__title'
			);
			for ( let i = 0; i < productTitle.count(); ++i )
				await expect( productTitle.nth( i ) ).toBeVisible();

			const productImage = page.locator( '.wp-post-image' );
			for ( let i = 0; i < productImage.count(); ++i )
				await expect( productImage.nth( i ) ).toBeVisible();
		} );
	}
);
