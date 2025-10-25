/**
 * External dependencies
 */
import { test, expect, BLOCK_THEME_SLUG } from '@poocommerce/e2e-utils';

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

const simpleProductAddToCartWithOptionsBlockHooks: Scenario[] = [
	{
		title: 'Before Add To Cart Form',
		dataTestId: 'poocommerce_before_add_to_cart_form',
		content: 'Hook: poocommerce_before_add_to_cart_form',
		amount: 1,
	},
	{
		title: 'After Add To Cart Form',
		dataTestId: 'poocommerce_after_add_to_cart_form',
		content: 'Hook: poocommerce_after_add_to_cart_form',
		amount: 1,
	},
	{
		title: 'Before Add To Cart Quantity',
		dataTestId: 'poocommerce_before_add_to_cart_quantity',
		content: 'Hook: poocommerce_before_add_to_cart_quantity',
		amount: 1,
	},
	{
		title: 'After Add To Cart Quantity',
		dataTestId: 'poocommerce_after_add_to_cart_quantity',
		content: 'Hook: poocommerce_after_add_to_cart_quantity',
		amount: 1,
	},
	{
		title: 'Before Add To Cart Button',
		dataTestId: 'poocommerce_before_add_to_cart_button',
		content: 'Hook: poocommerce_before_add_to_cart_button',
		amount: 1,
	},
	{
		title: 'After Add To Cart Button',
		dataTestId: 'poocommerce_after_add_to_cart_button',
		content: 'Hook: poocommerce_after_add_to_cart_button',
		amount: 1,
	},
];
const variableProductAddToCartWithOptionsBlockHooks: Scenario[] = [
	{
		title: 'Before Add To Cart Form',
		dataTestId: 'poocommerce_before_add_to_cart_form',
		content: 'Hook: poocommerce_before_add_to_cart_form',
		amount: 1,
	},
	{
		title: 'After Add To Cart Form',
		dataTestId: 'poocommerce_after_add_to_cart_form',
		content: 'Hook: poocommerce_after_add_to_cart_form',
		amount: 1,
	},
	{
		title: 'Before Variations Form',
		dataTestId: 'poocommerce_before_variations_form',
		content: 'Hook: poocommerce_before_variations_form',
		amount: 1,
	},
	{
		title: 'After Variations Form',
		dataTestId: 'poocommerce_after_variations_form',
		content: 'Hook: poocommerce_after_variations_form',
		amount: 1,
	},
];

test.describe( 'Compatibility Layer in Single Product template', () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.activatePlugin(
			'poocommerce-blocks-test-single-product-template-compatibility-layer'
		);
	} );

	test( 'hooks are attached to the page', async ( { page } ) => {
		await page.goto( '/product/hoodie/' );

		for ( const scenario of singleOccurrenceScenarios ) {
			const hooks = page.getByTestId( scenario.dataTestId );

			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to appear ${ scenario.amount } time(s)`
			).toHaveCount( scenario.amount );
			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to have text "${ scenario.content }"`
			).toHaveText( scenario.content );
		}
	} );

	test( 'hooks are attached to the page when using the Add to Cart + Options block', async ( {
		page,
		admin,
		editor,
	} ) => {
		/* Switch to the blockified Add to Cart + Options block to be able to test all hooks */
		await admin.visitSiteEditor( {
			postId: `${ BLOCK_THEME_SLUG }//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		const addToCartFormBlock = await editor.getBlockByName(
			'poocommerce/add-to-cart-form'
		);
		await editor.selectBlocks( addToCartFormBlock );

		await page
			.getByRole( 'button', {
				name: 'Upgrade to the Add to Cart + Options block',
			} )
			.click();

		await expect(
			editor.canvas.getByLabel( 'Block: Product Quantity (Beta)' )
		).toBeVisible();
		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );

		await page.goto( '/product/cap/' );

		for ( const scenario of simpleProductAddToCartWithOptionsBlockHooks ) {
			const hooks = page.getByTestId( scenario.dataTestId );

			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to appear ${ scenario.amount } time(s) in simple product page`
			).toHaveCount( scenario.amount );
			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to have text "${ scenario.content }" in simple product page`
			).toHaveText( scenario.content );
		}

		await page.goto( '/product/hoodie/' );

		for ( const scenario of variableProductAddToCartWithOptionsBlockHooks ) {
			const hooks = page.getByTestId( scenario.dataTestId );

			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to appear ${ scenario.amount } time(s) in variable product page`
			).toHaveCount( scenario.amount );
			await expect(
				hooks,
				`Expected ${ scenario.dataTestId } hook to have text "${ scenario.content }" in variable product page`
			).toHaveText( scenario.content );
		}
	} );
} );
