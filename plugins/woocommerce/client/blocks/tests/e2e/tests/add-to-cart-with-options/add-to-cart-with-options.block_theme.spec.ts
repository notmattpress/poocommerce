/**
 * External dependencies
 */
import { test as base, expect } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import AddToCartWithOptionsPage from './add-to-cart-with-options.page';

const test = base.extend< { pageObject: AddToCartWithOptionsPage } >( {
	pageObject: async ( { page, admin, editor, requestUtils }, use ) => {
		const pageObject = new AddToCartWithOptionsPage( {
			page,
			admin,
			editor,
			requestUtils,
		} );
		await use( pageObject );
	},
} );

test.describe( 'Add to Cart with Options Block', () => {
	test( 'allows modifying the template parts', async ( {
		page,
		pageObject,
		editor,
		admin,
	} ) => {
		await pageObject.setFeatureFlags();

		await admin.visitSiteEditor( {
			postId: 'poocommerce/poocommerce//single-product',
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.insertBlock( { name: pageObject.BLOCK_SLUG } );

		await pageObject.insertParagraphInTemplatePart(
			'This is a test paragraph added to the Add to Cart with Options template part.'
		);

		await editor.saveSiteEditorEntities();

		await page.goto( '/product/cap' );

		await expect(
			page.getByText(
				'This is a test paragraph added to the Add to Cart with Options template part.'
			)
		).toBeVisible();
	} );

	test( 'allows switching to 3rd-party product types', async ( {
		pageObject,
		editor,
		admin,
		requestUtils,
	} ) => {
		await requestUtils.activatePlugin(
			'poocommerce-blocks-test-custom-product-type'
		);

		await pageObject.setFeatureFlags();

		await admin.visitSiteEditor( {
			postId: 'poocommerce/poocommerce//single-product',
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.insertBlock( { name: pageObject.BLOCK_SLUG } );

		await pageObject.switchProductType( 'Custom Product Type' );

		const block = editor.canvas.getByLabel(
			`Block: ${ pageObject.BLOCK_NAME }`
		);
		const skeleton = block.locator( '.wc-block-components-skeleton' );
		await expect( skeleton ).toBeVisible();
	} );

	test( 'allows adding simple products to cart', async ( {
		page,
		pageObject,
		editor,
		admin,
	} ) => {
		await pageObject.setFeatureFlags();

		await admin.visitSiteEditor( {
			postId: 'poocommerce/poocommerce//single-product',
			postType: 'wp_template',
			canvas: 'edit',
		} );

		const addToCartFormBlock = await editor.getBlockByName(
			'poocommerce/add-to-cart-form'
		);
		await editor.selectBlocks( addToCartFormBlock );

		await page
			.getByRole( 'button', { name: 'Upgrade to the blockified' } )
			.click();

		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );

		await page.goto( '/beanie' );

		const increaseQuantityButton = page.getByLabel(
			'Increase quantity of Beanie'
		);
		await increaseQuantityButton.click();
		await increaseQuantityButton.click();

		const addToCartButton = page.getByLabel( 'Add to cart: “Beanie”' );

		await addToCartButton.click();

		await expect( addToCartButton ).toHaveText( '3 in cart' );

		await addToCartButton.click();

		await expect( addToCartButton ).toHaveText( '6 in cart' );
	} );
} );
