/**
 * External dependencies
 */
import {
	closeChoosePatternModal,
	getCanvas,
	goToPageEditor,
	insertBlock,
	publishPage,
} from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { ADMIN_STATE_PATH } from '../../playwright.config';
import { expect, tags, test as baseTest } from '../../fixtures/fixtures';
import { fillPageTitle } from '../../utils/editor';
import { getInstalledWordPressVersion } from '../../utils/wordpress';

// some PooCommerce Patterns to use
const wooPatterns = [
	{
		name: 'Hero Product 3 Split',
		button: 'Shop now',
	},
	{
		name: 'Featured Category Cover Image',
		button: 'Shop chairs',
	},
];

const test = baseTest.extend( {
	storageState: ADMIN_STATE_PATH,
	testPageTitlePrefix: 'Woocommerce Patterns',
} );

test.describe(
	'Add PooCommerce Patterns Into Page',
	{
		tag: [ tags.GUTENBERG, tags.SKIP_ON_EXTERNAL_ENV ],
	},
	() => {
		test( 'can insert PooCommerce patterns into page', async ( {
			page,
			testPage,
		} ) => {
			await goToPageEditor( { page } );

			await closeChoosePatternModal( { page } );

			await fillPageTitle( page, testPage.title );

			const wordPressVersion = await getInstalledWordPressVersion();

			for ( let i = 0; i < wooPatterns.length; i++ ) {
				await test.step( `Insert ${ wooPatterns[ i ].name } pattern`, async () => {
					await insertBlock(
						page,
						wooPatterns[ i ].name,
						wordPressVersion
					);

					await expect(
						page.getByLabel( 'Dismiss this notice' ).filter( {
							hasText: `Block pattern "${ wooPatterns[ i ].name }" inserted.`,
						} )
					).toBeVisible();

					const canvas = await getCanvas( page );
					await expect(
						canvas.getByRole( 'textbox' ).filter( {
							hasText: `${ wooPatterns[ i ].button }`,
						} )
					).toBeVisible();
				} );
			}

			await publishPage( page, testPage.title );

			// check again added patterns after publishing
			const canvas = await getCanvas( page );
			for ( let i = 1; i < wooPatterns.length; i++ ) {
				await expect(
					canvas
						.getByRole( 'textbox' )
						.filter( { hasText: `${ wooPatterns[ i ].button }` } )
				).toBeVisible();
			}

			// go to the frontend page to verify patterns
			await page.goto( testPage.slug );
			await expect(
				page.getByRole( 'heading', { name: testPage.title } )
			).toBeVisible();

			// check some elements from added patterns
			for ( let i = 1; i < wooPatterns.length; i++ ) {
				await expect(
					page.getByRole( 'link', {
						name: `${ wooPatterns[ i ].button }`,
					} )
				).toBeVisible();
			}
		} );
	}
);
