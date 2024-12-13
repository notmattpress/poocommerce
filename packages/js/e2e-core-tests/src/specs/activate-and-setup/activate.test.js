/**
 * Internal dependencies
 */
const { merchant } = require( '@poocommerce/e2e-utils' );

/**
 * External dependencies
 */
const { it, describe, beforeAll } = require( '@jest/globals' );
import deprecated from '@wordpress/deprecated';

const runActivationTest = () => {
	describe( 'Store owner can login and make sure PooCommerce is activated', () => {
		beforeAll( async () => {
			await merchant.login();
		} );

		it( 'can make sure PooCommerce is activated. If not, activate it', async () => {
			deprecated( 'runActivationTest', {
				alternative:
					'@poocommerce/admin-e2e-tests `testAdminBasicSetup()`',
			} );

			const slug = 'poocommerce';
			await merchant.openPlugins();
			const disableLink = await page.$(
				`tr[data-slug="${ slug }"] .deactivate a`
			);
			if ( disableLink ) {
				return;
			}
			await page.click( `tr[data-slug="${ slug }"] .activate a` );
			await page.waitForSelector(
				`tr[data-slug="${ slug }"] .deactivate a`
			);
		} );
	} );
};

// eslint-disable-next-line jest/no-export
module.exports = runActivationTest;
