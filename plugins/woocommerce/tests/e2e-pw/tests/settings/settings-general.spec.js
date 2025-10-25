/**
 * External dependencies
 */
import { WC_API_PATH } from '@poocommerce/e2e-utils-playwright';

/**
 * Internal dependencies
 */
import { expect, test, tags } from '../../fixtures/fixtures';
import { ADMIN_STATE_PATH } from '../../playwright.config';

test.describe( 'PooCommerce General Settings', { tag: tags.SERVICES }, () => {
	test.use( { storageState: ADMIN_STATE_PATH } );

	test.afterAll( async ( { restApi } ) => {
		await restApi.post( `${ WC_API_PATH }/settings/general/batch`, {
			update: [
				{
					id: 'poocommerce_store_address',
					value: 'addr 1',
				},
				{
					id: 'poocommerce_store_city',
					value: 'San Francisco',
				},
				{
					id: 'poocommerce_default_country',
					value: 'US:CA',
				},
				{
					id: 'poocommerce_store_postcode',
					value: '94107',
				},
				{
					id: 'poocommerce_currency_pos',
					value: 'left',
				},
				{
					id: 'poocommerce_price_thousand_sep',
					value: ',',
				},
				{
					id: 'poocommerce_price_decimal_sep',
					value: '.',
				},
				{
					id: 'poocommerce_price_num_decimals',
					value: '2',
				},
			],
		} );
		await restApi.put(
			`${ WC_API_PATH }/settings/general/poocommerce_allowed_countries`,
			{
				value: 'all',
			}
		);
		await restApi.put(
			`${ WC_API_PATH }/settings/general/poocommerce_currency`,
			{
				value: 'USD',
			}
		);
	} );

	test(
		'Save Changes button is disabled by default and enabled only after changes.',
		{
			tag: [ tags.NON_CRITICAL, tags.NOT_E2E ],
		},
		async ( { page } ) => {
			await page.goto( 'wp-admin/admin.php?page=wc-settings' );

			// make sure the general tab is active
			await expect( page.locator( 'a.nav-tab-active' ) ).toContainText(
				'General'
			);

			// See the Save changes button is disabled.
			await expect(
				page.getByRole( 'button', { name: 'Save changes' } )
			).toBeDisabled();

			// Change the base location
			await page
				.locator( 'select[name="poocommerce_default_country"]' )
				.selectOption( 'US:NC' );

			// See the Save changes button is now enabled.
			await expect( page.locator( 'text=Save changes' ) ).toBeEnabled();
		}
	);

	test( 'can update settings', async ( { page } ) => {
		await page.goto( 'wp-admin/admin.php?page=wc-settings' );

		// make sure the general tab is active
		await expect( page.locator( 'a.nav-tab-active' ) ).toContainText(
			'General'
		);

		// Set selling location to something different so we can save.
		await page
			.locator( '#poocommerce_allowed_countries' )
			.selectOption( 'all_except' );

		// Set the new store address
		await page.locator( '#poocommerce_store_address' ).fill( '5th Avenue' );
		await page.locator( '#poocommerce_store_city' ).fill( 'New York' );
		await page.locator( '#poocommerce_store_postcode' ).fill( '10010' );
		await page
			.locator( 'select[name="poocommerce_currency"]' )
			.selectOption( 'CAD' );

		// Set selling location to all countries first so we can
		// choose California as base location.
		await page
			.locator( '#poocommerce_allowed_countries' )
			.selectOption( 'all' );

		// Set selling location to specific countries first, so we can choose U.S as base location (without state).
		// This will makes specific countries option appears.
		await page
			.locator( '#poocommerce_allowed_countries' )
			.selectOption( 'specific' );
		await page
			.locator(
				'select[data-placeholder="Choose countries / regions…"] >> nth=1'
			)
			.selectOption( 'US' );
		await page
			.locator( 'select[name="poocommerce_default_country"]' )
			.selectOption( 'US:NY' );

		// Set currency position left with space
		await page
			.locator( 'select[name="poocommerce_currency_pos"]' )
			.selectOption( 'left_space' );

		// Set currency options
		await page.locator( '#poocommerce_price_thousand_sep' ).fill( '.' );
		await page.locator( '#poocommerce_price_decimal_sep' ).fill( ',' );
		await page.locator( '#poocommerce_price_num_decimals' ).fill( '1' );

		// Save settings and verify the changes
		await page.getByRole( 'button', { name: 'Save changes' } ).click();
		await expect( page.locator( 'div.updated.inline' ) ).toContainText(
			'Your settings have been saved.'
		);

		await expect(
			page.locator( '#poocommerce_store_address' )
		).toHaveValue( '5th Avenue' );
		await expect( page.locator( '#poocommerce_store_city' ) ).toHaveValue(
			'New York'
		);
		await expect(
			page.locator( '#poocommerce_store_postcode' )
		).toHaveValue( '10010' );
		await expect(
			page.locator( 'select[name="poocommerce_default_country"]' )
		).toHaveValue( 'US:NY' );
		await expect(
			page.locator( 'select[name="poocommerce_currency"]' )
		).toHaveValue( 'CAD' );
		await expect(
			page.locator( '#poocommerce_allowed_countries' )
		).toHaveValue( 'specific' );
		await expect(
			page.locator( '#poocommerce_price_thousand_sep' )
		).toHaveValue( '.' );
		await expect( page.locator( '#poocommerce_currency_pos' ) ).toHaveValue(
			'left_space'
		);
		await expect(
			page.locator( '#poocommerce_price_decimal_sep' )
		).toHaveValue( ',' );
		await expect(
			page.locator( '#poocommerce_price_num_decimals' )
		).toHaveValue( '1' );
	} );
} );
