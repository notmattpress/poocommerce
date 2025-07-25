/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { test as baseTest, expect } from '../../fixtures/fixtures';
import { logIn } from '../../utils/login';
import { ADMIN_STATE_PATH } from '../../playwright.config';

const now = Date.now();
const users = [
	{
		username: `customer.${ now }`,
		email: `customer.${ now }@example.com`,
		first_name: `Customer`,
		last_name: `the ${ now }th`,
		role: 'Customer',
	},
];

const test = baseTest.extend( {
	storageState: ADMIN_STATE_PATH,
	user: async ( { restApi }, use ) => {
		const user = {};
		await use( user );
		console.log( `Deleting user ${ user.id }` );
		await restApi.delete( `${ WC_API_PATH }/customers/${ user.id }`, {
			force: true,
		} );
	},
} );

for ( const userData of users ) {
	test( `can create a new ${ userData.role }`, async ( { page, user } ) => {
		test.skip(
			process.env.IS_MULTISITE,
			'Test not working on a multisite setup, see https://github.com/poocommerce/poocommerce/issues/55082'
		);
		await page.goto( `wp-admin/user-new.php` );

		await test.step( 'create a new user', async () => {
			// Wait for the password to be generated otherwise it will steal the focus from other fields
			await expect( page.locator( '#pass1' ) ).not.toHaveValue( '' );

			user.password = await page.locator( '#pass1' ).inputValue();

			await page.getByLabel( 'Username' ).fill( userData.username );
			await page.getByLabel( 'Email (required)' ).fill( userData.email );
			await page.getByLabel( 'First Name' ).fill( userData.first_name );
			await page.getByLabel( 'Last Name' ).fill( userData.last_name );
			await page.getByText( 'Send the new user an email' ).check();
			await page.getByLabel( 'Role' ).selectOption( userData.role );
			// WP 6.8 changed the button text from "Add New User" to "Add User"
			await page
				.getByRole( 'button', { name: /Add User|Add New User/ } )
				.click();

			await expect( page ).toHaveTitle( /Users/ );

			// We need the newly created user id to delete it during cleanup
			user.id = new URLSearchParams( new URL( page.url() ).search ).get(
				'id'
			);
		} );

		await test.step( 'verify the new user is displayed in users list', async () => {
			await page.goto( `wp-admin/users.php?s=${ userData.username }` );

			// Check customer data is displayed in the list
			await expect(
				page.locator( '[data-colname="Username"]' )
			).toContainText( userData.username );
			await expect(
				page.locator( '[data-colname="Email"]' )
			).toContainText( userData.email );
			await expect(
				page.locator( '[data-colname="Role"]' )
			).toContainText( userData.role, { ignoreCase: true } );
		} );

		await test.step( 'verify you can access the new user edit page', async () => {
			await page
				.getByRole( 'link', {
					name: userData.username,
					exact: true,
				} )
				.click();

			await expect( page ).toHaveTitle( /Edit User/ );
		} );

		await test.step( 'verify the new user can login', async () => {
			await page.context().clearCookies();
			await page.goto( 'wp-login.php' );
			await expect(
				page.getByLabel( 'Username or Email Address' )
			).toBeVisible();

			await logIn( page, userData.username, user.password, false );

			const expectedTitle =
				// eslint-disable-next-line playwright/no-conditional-in-test
				userData.role === 'Shop manager' ? /Dashboard/ : /My Account/i;
			await expect( page ).toHaveTitle( expectedTitle );
		} );
	} );
}
