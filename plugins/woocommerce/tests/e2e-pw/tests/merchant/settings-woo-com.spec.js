const { test, expect } = require( '@playwright/test' );
const { tags } = require( '../../fixtures/fixtures' );
const wcApi = require( '@poocommerce/poocommerce-rest-api' ).default;

test.describe(
	'PooCommerce woo.com Settings',
	{
		tag: [ tags.SERVICES, tags.SKIP_ON_PRESSABLE, tags.SKIP_ON_WPCOM ],
	},
	() => {
		test.use( { storageState: process.env.ADMINSTATE } );

		test.beforeAll( async ( { baseURL } ) => {
			// make sure the analytics connection is disabled
			const api = new wcApi( {
				url: baseURL,
				consumerKey: process.env.CONSUMER_KEY,
				consumerSecret: process.env.CONSUMER_SECRET,
				version: 'wc/v3',
			} );
			await api.put( 'settings/advanced/poocommerce_analytics_enabled', {
				value: 'no',
			} );
			await api.put(
				'settings/advanced/poocommerce_show_marketplace_suggestions',
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
