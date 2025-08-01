const { test: base, expect, request } = require( '@playwright/test' );
const { setOption } = require( '../../utils/options' );
const { activateTheme, DEFAULT_THEME } = require( '../../utils/themes' );
const { AssemblerPage } = require( './assembler/assembler.page' );
const { tags } = require( '../../fixtures/fixtures' );
const { ADMIN_STATE_PATH } = require( '../../playwright.config' );

const CUSTOMIZE_STORE_URL =
	'wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store';
const TRANSITIONAL_URL = `${ CUSTOMIZE_STORE_URL }%2Ftransitional`;
const INTRO_URL = `${ CUSTOMIZE_STORE_URL }%2Fintro`;

const test = base.extend( {
	pageObject: async ( { page }, use ) => {
		const pageObject = new AssemblerPage( { page } );
		await use( pageObject );
	},
} );

test.describe(
	'Store owner can view the Transitional page',
	{ tag: tags.GUTENBERG },
	() => {
		test.use( { storageState: ADMIN_STATE_PATH } );

		test.beforeAll( async ( { baseURL } ) => {
			// In some environments the tour blocks clicking other elements.
			await setOption(
				request,
				baseURL,
				'poocommerce_customize_store_onboarding_tour_hidden',
				'yes'
			);

			// Need a block enabled theme to test
			await activateTheme( baseURL, 'twentytwentyfour' );
		} );

		test.beforeEach( async ( { baseURL } ) => {
			try {
				await setOption(
					request,
					baseURL,
					'poocommerce_admin_customize_store_completed',
					'no'
				);
			} catch ( error ) {
				console.log( 'Store completed option not updated' );
			}
		} );

		test.afterAll( async ( { baseURL } ) => {
			// Reset theme back to default.
			await activateTheme( baseURL, DEFAULT_THEME );

			// Reset tour to visible.
			await setOption(
				request,
				baseURL,
				'poocommerce_customize_store_onboarding_tour_hidden',
				'no'
			);
		} );

		test(
			'Accessing the transitional page when the CYS flow is not completed should redirect to the Intro page',
			{ tag: tags.NOT_E2E },
			async ( { page, baseURL } ) => {
				await page.goto( TRANSITIONAL_URL );

				const locator = page.locator( 'h1:visible' );
				await expect( locator ).not.toHaveText(
					'Your store looks great!'
				);

				await expect( page.url() ).toBe( `${ baseURL }${ INTRO_URL }` );
			}
		);

		test(
			'Clicking on "Finish customizing" in the assembler should go to the transitional page',
			{ tag: tags.NOT_E2E },
			async ( { pageObject, baseURL } ) => {
				await pageObject.setupSite( baseURL );
				await pageObject.waitForLoadingScreenFinish();

				const assembler = await pageObject.getAssembler();
				await assembler
					.getByRole( 'button', { name: 'Finish customizing' } )
					.click();

				await expect(
					assembler.locator( 'text=Your store looks great!' )
				).toBeVisible();
				await expect(
					assembler.locator( 'text=Go to Products' )
				).toBeVisible();
				await expect(
					assembler.locator( 'text=Go to the Editor' )
				).toBeVisible();
				await expect(
					assembler.locator( 'text=Back to home' )
				).toBeVisible();
			}
		);

		test(
			'Clicking on "View store" should go to the store home page',
			{ tag: tags.NOT_E2E },
			async ( { pageObject, baseURL, page } ) => {
				await setOption(
					request,
					baseURL,
					'poocommerce_admin_customize_store_completed',
					'yes'
				);

				await page.goto( TRANSITIONAL_URL );
				const assembler = await pageObject.getAssembler();

				await assembler
					.getByRole( 'link', { name: 'View store' } )
					.click();

				await expect( page ).toHaveURL( './' );
			}
		);
	}
);
