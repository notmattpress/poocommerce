/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { tags, test, expect } from '../../fixtures/fixtures.js';
import { ADMIN_STATE_PATH } from '../../playwright.config.js';

test.describe(
	'PooCommerce woo.com Settings',
	{
		tag: [ tags.SERVICES, tags.SKIP_ON_WPCOM ],
	},
	() => {
		test.use( { storageState: ADMIN_STATE_PATH } );

		test.beforeAll( async ( { restApi } ) => {
			await restApi.put(
				`${ WC_API_PATH }/settings/advanced/poocommerce_allow_tracking`,
				{
					value: 'no',
				}
			);
			await restApi.put(
				`${ WC_API_PATH }/settings/advanced/poocommerce_show_marketplace_suggestions`,
				{
					value: 'no',
				}
			);
		} );

		test( 'can enable analytics tracking', async ( { page } ) => {
			await page.goto(
				'wp-admin/admin.php?page=wc-settings&tab=advanced&section=poocommerce_com'
			);

			// enable analytics tracking
			await page
				.getByLabel( 'Allow usage of PooCommerce to be tracked' )
				.check();
			await page.getByRole( 'button', { name: 'Save changes' } ).click();

			// confirm setting saved
			await expect( page.locator( 'div.updated.inline' ) ).toContainText(
				'Your settings have been saved.'
			);
			await expect(
				page.getByLabel( 'Allow usage of PooCommerce to be tracked' )
			).toBeChecked();
		} );

		test( 'can enable marketplace suggestions', async ( { page } ) => {
			await page.goto(
				'wp-admin/admin.php?page=wc-settings&tab=advanced&section=poocommerce_com'
			);

			// enable marketplace suggestions
			await page
				.getByLabel( 'Display suggestions within PooCommerce' )
				.check();
			await page.getByRole( 'button', { name: 'Save changes' } ).click();

			// confirm setting saved
			await expect( page.locator( 'div.updated.inline' ) ).toContainText(
				'Your settings have been saved.'
			);
			await expect(
				page.getByLabel( 'Display suggestions within PooCommerce' )
			).toBeChecked();
		} );
	}
);
