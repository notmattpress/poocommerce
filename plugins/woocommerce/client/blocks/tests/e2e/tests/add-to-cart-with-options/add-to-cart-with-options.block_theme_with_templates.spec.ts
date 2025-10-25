/**
 * External dependencies
 */
import {
	test as base,
	expect,
	BLOCK_THEME_WITH_TEMPLATES_SLUG,
} from '@poocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import AddToCartWithOptionsPage from './add-to-cart-with-options.page';

const test = base.extend< { pageObject: AddToCartWithOptionsPage } >( {
	pageObject: async ( { page, admin, editor }, use ) => {
		const pageObject = new AddToCartWithOptionsPage( {
			page,
			admin,
			editor,
		} );
		await use( pageObject );
	},
} );

test.describe( `Add to Cart + Options Block (block theme with templates)`, () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( BLOCK_THEME_WITH_TEMPLATES_SLUG );
	} );

	test( 'allows modifying the template parts', async ( {
		page,
		pageObject,
		editor,
		admin,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `${ BLOCK_THEME_WITH_TEMPLATES_SLUG }//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.insertBlock( { name: pageObject.BLOCK_SLUG } );

		await pageObject.switchProductType( 'External/Affiliate product' );

		await pageObject.insertParagraphInTemplatePart(
			'This is a test paragraph added to the Add to Cart + Options template part.'
		);

		await editor.saveSiteEditorEntities();

		await page.goto( '/product/wordpress-pennant/' );

		await expect(
			page.getByText(
				'This is a test paragraph added to the Add to Cart + Options template part.'
			)
		).toBeVisible();

		await expect(
			page.getByText(
				'External Product Add to Cart + Options template loaded from theme'
			)
		).toBeVisible();
	} );
} );
