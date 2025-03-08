/**
 * Internal dependencies
 */
const { merchant } = require( '@poocommerce/e2e-utils' );

/**
 * External dependencies
 */
const { it, describe, beforeAll } = require( '@jest/globals' );

const runInitiateWccomConnectionTest = () => {
	describe( 'Merchant > Initiate WCCOM Connection', () => {
		beforeAll( async () => {
			await merchant.login();
		} );

		it.skip( 'can initiate WCCOM connection', async () => {
			await merchant.openExtensions();

			// Click on a tab to choose PooCommerce Subscriptions extension
			await Promise.all( [
				expect( page ).toClick( 'a.nav-tab', {
					text: 'PooCommerce.com Subscriptions',
				} ),
				page.waitForNavigation( { waitUntil: 'networkidle0' } ),
			] );

			// Click on Connect button to initiate a WCCOM connection
			await Promise.all( [
				expect( page ).toClick( '.button-helper-connect' ),
				page.waitForNavigation( { waitUntil: 'networkidle0' } ),
			] );

			// Verify that you see a login page for connecting WCCOM account
			await expect( page ).toMatchElement( 'div.login' );
			await expect( page ).toMatchElement( 'input#usernameOrEmail' );
			await expect( page ).toMatchElement( 'button.button', {
				text: 'Continue',
			} );
		} );
	} );
};

// eslint-disable-next-line jest/no-export
module.exports = runInitiateWccomConnectionTest;
