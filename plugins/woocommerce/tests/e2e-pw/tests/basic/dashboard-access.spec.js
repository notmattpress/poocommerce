/**
 * Internal dependencies
 */
const { test, expect } = require( '@playwright/test' );
const { CUSTOMER_STATE_PATH } = require( '../../playwright.config' );

test.describe( 'Customer-role users are blocked from accessing the WP Dashboard.', () => {
	test.use( { storageState: CUSTOMER_STATE_PATH } );

	const dashboardScreens = {
		'WP Admin home': 'wp-admin',
		'WP Admin profile page': 'wp-admin/profile.php',
		'WP Admin using ajax query param': 'wp-admin?wc-ajax=1',
	};

	for ( const [ description, path ] of Object.entries( dashboardScreens ) ) {
		test( `Customer is redirected from ${ description } back to the My Account page.`, async ( {
			page,
		} ) => {
			await page.goto( path );
			expect( page.url() ).toContain( '/my-account/' );
		} );
	}
} );
