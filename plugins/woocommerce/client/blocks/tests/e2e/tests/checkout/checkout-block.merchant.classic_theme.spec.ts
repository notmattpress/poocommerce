/**
 * External dependencies
 */
import { test, expect, CLASSIC_THEME_SLUG } from '@poocommerce/e2e-utils';

test.describe( 'Merchant → Checkout', () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( CLASSIC_THEME_SLUG );
	} );

	test.describe( 'in widget editor', () => {
		test( "can't be inserted in a widget area", async ( {
			admin,
			editor,
		} ) => {
			await admin.visitWidgetEditor();
			await editor.openGlobalBlockInserter();
			await editor.page
				.getByRole( 'searchbox', { name: 'Search' } )
				.fill( 'poocommerce/checkout' );
			const checkoutButton = editor.page.getByRole( 'option', {
				name: 'Checkout',
				exact: true,
			} );
			await expect( checkoutButton ).toBeHidden();
		} );
	} );
} );
