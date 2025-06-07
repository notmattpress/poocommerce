/* eslint-disable jest/no-export, jest/no-disabled-tests */
/**
 * Internal dependencies
 */
const {
	merchant,
	setCheckbox,
	settingsPageSaveChanges,
	unsetCheckbox,
	verifyCheckboxIsSet,
	verifyCheckboxIsUnset,
} = require( '@poocommerce/e2e-utils' );

const runProductSettingsTest = () => {
	describe( 'PooCommerce Products > Downloadable Products Settings', () => {
		beforeAll( async () => {
			await merchant.login();
		} );

		it( 'can update settings', async () => {
			// Go to downloadable products settings page
			await merchant.openSettings( 'products', 'downloadable' );

			// Make sure the product tab is active
			await expect( page ).toMatchElement( 'a.nav-tab-active', {
				text: 'Products',
			} );
			await expect( page ).toMatchElement(
				'ul.subsubsub > li > a.current',
				{
					text: 'Downloadable products',
				}
			);

			await expect( page ).toSelect(
				'#poocommerce_file_download_method',
				'Redirect only (Insecure)'
			);
			await setCheckbox( '#poocommerce_downloads_require_login' );
			await setCheckbox(
				'#poocommerce_downloads_grant_access_after_payment'
			);
			await setCheckbox(
				'#poocommerce_downloads_redirect_fallback_allowed'
			);
			await unsetCheckbox(
				'#poocommerce_downloads_add_hash_to_filename'
			);
			await settingsPageSaveChanges();

			// Verify that settings have been saved
			await Promise.all( [
				expect( page ).toMatchElement( '#message', {
					text: 'Your settings have been saved.',
				} ),
				expect( page ).toMatchElement(
					'#poocommerce_file_download_method',
					{
						text: 'Redirect only (Insecure)',
					}
				),
				verifyCheckboxIsSet( '#poocommerce_downloads_require_login' ),
				verifyCheckboxIsSet(
					'#poocommerce_downloads_grant_access_after_payment'
				),
				verifyCheckboxIsSet(
					'#poocommerce_downloads_redirect_fallback_allowed'
				),
				verifyCheckboxIsUnset(
					'#poocommerce_downloads_add_hash_to_filename'
				),
			] );

			await page.reload();
			await expect( page ).toSelect(
				'#poocommerce_file_download_method',
				'X-Accel-Redirect/X-Sendfile'
			);
			await unsetCheckbox( '#poocommerce_downloads_require_login' );
			await unsetCheckbox(
				'#poocommerce_downloads_grant_access_after_payment'
			);
			await unsetCheckbox(
				'#poocommerce_downloads_redirect_fallback_allowed'
			);
			await setCheckbox( '#poocommerce_downloads_add_hash_to_filename' );
			await settingsPageSaveChanges();

			// Verify that settings have been saved
			await Promise.all( [
				expect( page ).toMatchElement( '#message', {
					text: 'Your settings have been saved.',
				} ),
				expect( page ).toMatchElement(
					'#poocommerce_file_download_method',
					{
						text: 'X-Accel-Redirect/X-Sendfile',
					}
				),
				verifyCheckboxIsUnset( '#poocommerce_downloads_require_login' ),
				verifyCheckboxIsUnset(
					'#poocommerce_downloads_grant_access_after_payment'
				),
				verifyCheckboxIsUnset(
					'#poocommerce_downloads_redirect_fallback_allowed'
				),
				verifyCheckboxIsSet(
					'#poocommerce_downloads_add_hash_to_filename'
				),
			] );

			await page.reload();
			await expect( page ).toSelect(
				'#poocommerce_file_download_method',
				'Force downloads'
			);
			await settingsPageSaveChanges();

			// Verify that settings have been saved
			await Promise.all( [
				expect( page ).toMatchElement( '#message', {
					text: 'Your settings have been saved.',
				} ),
				expect( page ).toMatchElement(
					'#poocommerce_file_download_method',
					{
						text: 'Force downloads',
					}
				),
			] );
		} );
	} );
};

module.exports = runProductSettingsTest;
