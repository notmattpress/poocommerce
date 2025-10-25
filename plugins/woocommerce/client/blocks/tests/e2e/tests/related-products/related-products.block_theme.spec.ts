/**
 * External dependencies
 */
import {
	test,
	expect,
	BlockData,
	BLOCK_THEME_SLUG,
} from '@poocommerce/e2e-utils';

// Block is soft-deprecated, meaning that it's hidden from the inserter.
const blockData: BlockData = {
	name: 'Related Products',
	slug: 'poocommerce/related-products',
	mainClass: '.wc-block-related-products',
	selectors: {
		frontend: {},
		editor: {},
	},
};

test.describe( `${ blockData.name } Block`, () => {
	test( "can't be added in the Post Editor", async ( { admin, editor } ) => {
		await admin.createNewPost();

		try {
			await editor.insertBlock( { name: blockData.slug } );
		} catch ( _error ) {
			// noop
		}

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeHidden();
	} );

	test( "can't be added in the Product Catalog Template", async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `${ BLOCK_THEME_SLUG }//archive-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.setContent( '' );

		try {
			await editor.insertBlock( { name: blockData.slug } );
		} catch ( _error ) {
			// noop
		}

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeHidden();
	} );

	test( "can't be added in the Single Product Template", async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `${ BLOCK_THEME_SLUG }//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		await editor.setContent( '' );

		// Inserting Related Products by name
		// (but it's a Product Collection variation).
		await editor.insertBlockUsingGlobalInserter( blockData.name );

		// Verifying by slug - it's expected it's NOT poocommerce/related-products.
		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeHidden();
	} );
} );
