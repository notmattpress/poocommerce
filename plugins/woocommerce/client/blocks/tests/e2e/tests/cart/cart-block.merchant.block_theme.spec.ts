/**
 * External dependencies
 */
import { test, expect, BlockData } from '@poocommerce/e2e-utils';

const blockData: BlockData = {
	name: 'Cart',
	slug: 'poocommerce/cart',
	mainClass: '.wp-block-poocommerce-cart',
	selectors: {
		editor: {
			block: '.wp-block-poocommerce-cart',
			insertButton: "//button//span[text()='Cart']",
		},
		frontend: {
			block: '.wp-block-poocommerce-cart',
		},
	},
};

test.describe( 'Merchant → Cart', () => {
	// `as string` is safe here because we know the variable is a string, it is defined above.
	const blockSelectorInEditor = blockData.selectors.editor.block as string;

	test.describe( 'in page editor', () => {
		test.beforeEach( async ( { admin } ) => {
			await admin.visitSiteEditor( {
				postId: 'poocommerce/poocommerce//page-cart',
				postType: 'wp_template',
				canvas: 'edit',
			} );
		} );

		test( 'renders without crashing and can only be inserted once', async ( {
			page,
			editor,
		} ) => {
			const blockPresence = await editor.getBlockByName( blockData.slug );
			await expect( blockPresence ).toBeVisible();

			await editor.openGlobalBlockInserter();
			await page.getByPlaceholder( 'Search' ).fill( blockData.slug );
			const cartBlockButton = page.getByRole( 'option', {
				name: blockData.name,
				exact: true,
			} );
			await expect( cartBlockButton ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );

		test( 'shows empty cart when changing the view', async ( {
			page,
			editor,
		} ) => {
			await editor.selectBlocks( blockSelectorInEditor );
			await editor.page
				.getByRole( 'button', { name: 'Switch view' } )
				.click();
			const emptyCartButton = page.getByRole( 'menuitem', {
				name: 'Empty Cart',
			} );

			// Focus the empty cart button and wait for the tooltip to disappear.
			await emptyCartButton.focus();
			await emptyCartButton.dispatchEvent( 'click' );

			const filledCartBlock = await editor.getBlockByName(
				'poocommerce/filled-cart-block'
			);
			const emptyCartBlock = await editor.getBlockByName(
				'poocommerce/empty-cart-block'
			);
			await expect( filledCartBlock ).toBeHidden();
			await expect( emptyCartBlock ).toBeVisible();
			await editor.selectBlocks( blockSelectorInEditor );
			await page.getByRole( 'button', { name: 'Switch view' } ).click();

			const filledCartButton = page.getByRole( 'menuitem', {
				name: 'Filled Cart',
			} );

			await filledCartButton.click();
			await expect(
				editor.canvas.locator(
					blockData.selectors.editor.block +
						' [data-type="poocommerce/filled-cart-block"]'
				)
			).toBeVisible();
			await expect(
				editor.canvas.locator(
					blockData.selectors.editor.block +
						' [data-type="poocommerce/empty-cart-block"]'
				)
			).toBeHidden();
		} );
	} );
} );
