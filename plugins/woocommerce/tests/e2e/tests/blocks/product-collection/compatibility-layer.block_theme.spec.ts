/**
 * External dependencies
 */
import { test as base, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import ProductCollectionPage from './product-collection.page';

type Scenario = {
	title: string;
	dataTestId: string;
	content: string;
	amount: number;
};

const singleOccurrenceScenarios: Scenario[] = [
	{
		title: 'Before Main Content',
		dataTestId: 'poocommerce_before_main_content',
		content: 'Hook: poocommerce_before_main_content',
		amount: 1,
	},
	{
		title: 'After Main Content',
		dataTestId: 'poocommerce_after_main_content',
		content: 'Hook: poocommerce_after_main_content',
		amount: 1,
	},
	{
		title: 'Before Shop Loop',
		dataTestId: 'poocommerce_before_shop_loop',
		content: 'Hook: poocommerce_before_shop_loop',
		amount: 1,
	},
	{
		title: 'After Shop Loop',
		dataTestId: 'poocommerce_after_shop_loop',
		content: 'Hook: poocommerce_after_shop_loop',
		amount: 1,
	},
];

const multipleOccurrenceScenarios: Scenario[] = [
	{
		title: 'Before Shop Loop Item Title',
		dataTestId: 'poocommerce_before_shop_loop_item_title',
		content: 'Hook: poocommerce_before_shop_loop_item_title',
		amount: 16,
	},
	{
		title: 'Shop Loop Item Title',
		dataTestId: 'poocommerce_shop_loop_item_title',
		content: 'Hook: poocommerce_shop_loop_item_title',
		amount: 16,
	},
	{
		title: 'After Shop Loop Item Title',
		dataTestId: 'poocommerce_after_shop_loop_item_title',
		content: 'Hook: poocommerce_after_shop_loop_item_title',
		amount: 16,
	},
	{
		title: 'Before Shop Loop Item',
		dataTestId: 'poocommerce_before_shop_loop_item',
		content: 'Hook: poocommerce_before_shop_loop_item',
		amount: 16,
	},
	{
		title: 'After Shop Loop Item',
		dataTestId: 'poocommerce_after_shop_loop_item',
		content: 'Hook: poocommerce_after_shop_loop_item',
		amount: 16,
	},
];

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

	for ( const scenario of singleOccurrenceScenarios ) {
		test( `${ scenario.title } is attached to the page`, async ( {
			pageObject,
		} ) => {
			const hooks = pageObject.locateByTestId( scenario.dataTestId );

			await expect( hooks ).toHaveCount( scenario.amount );
			await expect( hooks ).toHaveText( scenario.content );
		} );
	}

	for ( const scenario of multipleOccurrenceScenarios ) {
		test( `${ scenario.title } is attached to the page`, async ( {
			pageObject,
		} ) => {
			const hooks = pageObject.locateByTestId( scenario.dataTestId );

			await expect( hooks ).toHaveCount( scenario.amount );
			await expect( hooks.first() ).toHaveText( scenario.content );
		} );
	}
} );
