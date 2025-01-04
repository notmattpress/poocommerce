/**
 * External dependencies
 */
import { test, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */

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
		title: 'Sidebar',
		dataTestId: 'poocommerce_sidebar',
		content: 'Hook: poocommerce_sidebar',
		amount: 1,
	},
	{
		title: 'Before Single Product',
		dataTestId: 'poocommerce_before_single_product',
		content: 'Hook: poocommerce_before_single_product',
		amount: 1,
	},
	{
		title: 'Before Single Product Summary',
		dataTestId: 'poocommerce_before_single_product_summary',
		content: 'Hook: poocommerce_before_single_product_summary',
		amount: 1,
	},
	{
		title: 'Before Add To Cart Button',
		dataTestId: 'poocommerce_before_add_to_cart_button',
		content: 'Hook: poocommerce_before_add_to_cart_button',
		amount: 1,
	},
	{
		title: 'Single Product Summary',
		dataTestId: 'poocommerce_single_product_summary',
		content: 'Hook: poocommerce_single_product_summary',
		amount: 1,
	},
	{
		title: 'Product Meta Start',
		dataTestId: 'poocommerce_product_meta_start',
		content: 'Hook: poocommerce_product_meta_start',
		amount: 1,
	},
	{
		title: 'Product Meta End',
		dataTestId: 'poocommerce_product_meta_end',
		content: 'Hook: poocommerce_product_meta_end',
		amount: 1,
	},
	{
		title: 'Share',
		dataTestId: 'poocommerce_share',
		content: 'Hook: poocommerce_share',
		amount: 1,
	},
	{
		title: 'After Single Product Summary',
		dataTestId: 'poocommerce_after_single_product_summary',
		content: 'Hook: poocommerce_after_single_product_summary',
		amount: 1,
	},
	{
		title: 'After Single Product',
		dataTestId: 'poocommerce_after_single_product',
		content: 'Hook: poocommerce_after_single_product',
		amount: 1,
	},
];

test.describe( 'Compatibility Layer in Single Product template', () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.activatePlugin(
			'poocommerce-blocks-test-single-product-template-compatibility-layer'
		);
	} );

	for ( const scenario of singleOccurrenceScenarios ) {
		test( `${ scenario.title } is attached to the page`, async ( {
			page,
		} ) => {
			await page.goto( '/product/hoodie/' );
			const hooks = page.getByTestId( scenario.dataTestId );

			await expect( hooks ).toHaveCount( scenario.amount );
			await expect( hooks ).toHaveText( scenario.content );
		} );
	}
} );
