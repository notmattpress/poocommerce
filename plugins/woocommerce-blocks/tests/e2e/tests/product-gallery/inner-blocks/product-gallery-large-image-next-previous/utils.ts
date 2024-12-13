/**
 * External dependencies
 */
import { Admin, Editor } from '@poocommerce/e2e-utils';

export const addBlock = async ( admin: Admin, editor: Editor ) => {
	await admin.visitSiteEditor( {
		postId: `poocommerce/poocommerce//single-product`,
		postType: 'wp_template',
		canvas: 'edit',
	} );

	await editor.insertBlock( {
		name: 'poocommerce/product-gallery',
	} );
};
