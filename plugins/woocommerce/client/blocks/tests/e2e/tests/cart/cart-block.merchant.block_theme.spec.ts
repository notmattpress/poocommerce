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

		test( 'inner blocks can be added/removed by filters', async ( {
			page,
			editor,
		} ) => {
			// Begin by removing the block.
			await editor.selectBlocks( blockSelectorInEditor );
			const options = page
				.getByRole( 'toolbar', { name: 'Block tools' } )
				.getByRole( 'button', { name: 'Options' } );
			await options.click();
			const removeButton = page.getByRole( 'menuitem', {
				name: 'Delete',
			} );
			await removeButton.click();
			// Expect block to have been removed.
			await expect(
				await editor.getBlockByName( blockData.slug )
			).toHaveCount( 0 );

			// Register a checkout filter to allow `core/table` block in the Checkout block's inner blocks, add
			// core/audio into the poocommerce/cart-order-summary-block and remove core/paragraph from all Cart inner
			// blocks.
			await page.evaluate(
				`wc.blocksCheckout.registerCheckoutFilters( 'woo-test-namespace', {
					additionalCartCheckoutInnerBlockTypes: ( value, extensions, { block } ) => {
						value.push( 'core/table' );
						if ( block === 'poocommerce/cart-order-summary-block' ) {
							value.push( 'core/audio' );
						}
						return value;
					},
				} );`
			);

			await editor.insertBlock( { name: 'poocommerce/cart' } );
			await expect(
				await editor.getBlockByName( blockData.slug )
			).not.toHaveCount( 0 );

			// Select the cart-order-summary-block block and try to insert a block. Check the Table block is available.
			await editor.selectBlocks(
				blockData.selectors.editor.block +
					' [data-type="poocommerce/cart-order-summary-block"]'
			);

			const addBlockButton = editor.canvas
				.getByRole( 'document', { name: 'Block: Order Summary' } )
				.getByRole( 'button', { name: 'Add block' } );
			await addBlockButton.dispatchEvent( 'click' );
			await editor.page
				.getByRole( 'searchbox', { name: 'Search' } )
				.fill( 'Table' );
			const tableButton = editor.page.getByRole( 'option', {
				name: 'Table',
			} );
			await expect( tableButton ).toBeVisible();

			await editor.page
				.getByRole( 'searchbox', { name: 'Search' } )
				.fill( 'Audio' );

			const audioButton = editor.page.getByRole( 'option', {
				name: 'Audio',
			} );
			await test.expect( audioButton ).toBeVisible();

			// Now check the filled cart block and expect only the Table block to be available there.
			await editor.selectBlocks(
				blockSelectorInEditor +
					' [data-type="poocommerce/filled-cart-block"]'
			);
			const filledCartAddBlockButton = editor.canvas
				.getByRole( 'document', { name: 'Block: Filled Cart' } )
				.getByRole( 'button', { name: 'Add block' } )
				.first();
			await filledCartAddBlockButton.click();

			const filledCartTableButton = editor.page.getByRole( 'option', {
				name: 'Table',
			} );
			await expect( filledCartTableButton ).toBeVisible();

			const filledCartAudioButton = editor.page.getByRole( 'option', {
				name: 'Audio',
			} );
			await expect( filledCartAudioButton ).toBeHidden();
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
