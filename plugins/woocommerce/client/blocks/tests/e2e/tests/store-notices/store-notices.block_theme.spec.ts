/**
 * External dependencies
 */
import { expect, test } from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */

const blockData = {
	name: 'Store Notices',
	slug: 'poocommerce/store-notices',
};

test.describe( `${ blockData.slug } Block`, () => {
	test( 'should be visible on the Product Catalog template', async ( {
		editor,
		admin,
	} ) => {
		await admin.visitSiteEditor( {
			postId: 'poocommerce/poocommerce//archive-product',
			postType: 'wp_template',
			canvas: 'edit',
		} );
		const block = await editor.getBlockByName( blockData.slug );
		await expect( block ).toBeVisible();
		await expect( block ).toHaveText(
			'Notices added by PooCommerce or extensions will show up here.'
		);
	} );
} );
