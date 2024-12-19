/**
 * External dependencies
 */
import { test, expect, BlockData } from '@poocommerce/e2e-utils';

const blockData: BlockData = {
	name: 'Mini-Cart',
	slug: 'poocommerce/mini-cart',
	mainClass: '.wc-block-minicart',
	selectors: {
		editor: {
			block: '.wp-block-poocommerce-mini-cart',
			insertButton: "//button//span[text()='Mini-Cart']",
		},
		frontend: {},
	},
};

test.describe( 'Merchant → Mini Cart', () => {
	test.describe( 'in FSE editor', () => {
		test( 'can be inserted in FSE area', async ( { editor, admin } ) => {
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//single-product`,
				postType: 'wp_template',
				canvas: 'edit',
			} );

			await editor.setContent( '' );

			await editor.insertBlock( { name: blockData.slug } );
			await expect(
				editor.canvas.getByLabel( 'Block: Mini-Cart' )
			).toBeVisible();
		} );

		test( 'can only be inserted once', async ( { editor, admin } ) => {
			await admin.visitSiteEditor( {
				postId: `poocommerce/poocommerce//single-product`,
				postType: 'wp_template',
				canvas: 'edit',
			} );
			await editor.openGlobalBlockInserter();

			await editor.page
				.getByLabel( 'Search for blocks and patterns' )
				.fill( blockData.slug );

			const miniCartButton = editor.page.getByRole( 'option', {
				name: blockData.name,
			} );

			await expect( miniCartButton ).toBeVisible();
			await expect( miniCartButton ).toBeDisabled();
		} );
	} );
} );
