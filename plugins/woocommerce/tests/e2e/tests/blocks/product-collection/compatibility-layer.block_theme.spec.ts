/**
 * External dependencies
 */
import { test as base, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import ProductCollectionPage from './product-collection.page';

const test = base.extend< { pageObject: ProductCollectionPage } >( {
	pageObject: async ( { page, admin, editor }, use ) => {
		const pageObject = new ProductCollectionPage( {
			page,
			admin,
			editor,
		} );
		await use( pageObject );
	},
} );

test.describe( 'Product Collection: Compatibility Layer', () => {
	test.beforeEach( async ( { pageObject, requestUtils } ) => {
		await requestUtils.activatePlugin(
			'poocommerce-blocks-test-product-collection-compatibility-layer'
		);
		await pageObject.goToProductCatalogFrontend();
	} );

	test( 'renders global compatibility hooks around the inherited collection and loop', async ( {
		page,
		pageObject,
	} ) => {
		const globalHooks = [
			'poocommerce_before_main_content',
			'poocommerce_before_shop_loop',
			'poocommerce_after_shop_loop',
			'poocommerce_after_main_content',
		];

		for ( const hookName of globalHooks ) {
			const hook = pageObject.locateByTestId( hookName );
			await expect( hook ).toHaveCount( 1 );
			await expect( hook ).toHaveText( `Hook: ${ hookName }` );
		}

		await expect(
			page.locator( '.wp-block-poocommerce-product-collection' )
		).toHaveCount( 1 );
		await expect( pageObject.productTemplate ).toHaveCount( 1 );
		await expect( pageObject.products.first() ).toBeVisible();

		const structureSelector = [
			'[data-testid="poocommerce_before_main_content"]',
			'.wp-block-poocommerce-product-collection',
			'[data-testid="poocommerce_before_shop_loop"]',
			'.wc-block-product-template',
			'[data-testid="poocommerce_after_shop_loop"]',
			'[data-testid="poocommerce_after_main_content"]',
		].join( ', ' );
		const structure = await page
			.locator( structureSelector )
			.evaluateAll( ( nodes ) =>
				nodes.map( ( node ) => {
					const testId = node.getAttribute( 'data-testid' );
					if ( testId ) {
						return testId;
					}

					return node.classList.contains(
						'wp-block-poocommerce-product-collection'
					)
						? 'product-collection'
						: 'product-template';
				} )
			);

		expect( structure ).toEqual( [
			'poocommerce_before_main_content',
			'product-collection',
			'poocommerce_before_shop_loop',
			'product-template',
			'poocommerce_after_shop_loop',
			'poocommerce_after_main_content',
		] );
	} );

	test( 'renders compatibility hooks in order for every product', async ( {
		pageObject,
	} ) => {
		await expect( pageObject.products.first() ).toBeVisible();
		const productCount = await pageObject.products.count();
		expect( productCount ).toBeGreaterThan( 0 );

		const itemHooks = [
			'poocommerce_before_shop_loop_item',
			'poocommerce_before_shop_loop_item_title',
			'poocommerce_shop_loop_item_title',
			'poocommerce_after_shop_loop_item_title',
			'poocommerce_after_shop_loop_item',
		];

		for ( const hookName of itemHooks ) {
			const hooks = pageObject.locateByTestId( hookName );
			await expect( hooks ).toHaveCount( productCount );
			await expect( hooks ).toHaveText(
				Array( productCount ).fill( `Hook: ${ hookName }` )
			);
		}

		const productSequences = await pageObject.products.evaluateAll(
			( products ) =>
				products.map( ( product ) =>
					Array.from(
						product.querySelectorAll(
							'[data-testid="poocommerce_before_shop_loop_item"], [data-testid="poocommerce_before_shop_loop_item_title"], .wp-block-post-title, [data-testid="poocommerce_shop_loop_item_title"], [data-testid="poocommerce_after_shop_loop_item_title"], [data-testid="poocommerce_after_shop_loop_item"]'
						)
					).map(
						( node ) =>
							node.getAttribute( 'data-testid' ) ??
							'product-title'
					)
				)
		);
		const expectedSequence = [
			'poocommerce_before_shop_loop_item',
			'poocommerce_before_shop_loop_item_title',
			'product-title',
			'poocommerce_shop_loop_item_title',
			'poocommerce_after_shop_loop_item_title',
			'poocommerce_after_shop_loop_item',
		];

		expect( productSequences ).toEqual(
			Array.from( { length: productCount }, () => expectedSequence )
		);
	} );
} );
