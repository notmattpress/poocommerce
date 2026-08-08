/**
 * External dependencies
 */
import { render } from '@testing-library/react';
import { addFilter, removeAllFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { HelpPanel, SETUP_TASK_HELP_ITEMS_FILTER } from '../panels/help';

describe( 'Activity Panels', () => {
	describe( 'Help', () => {
		it( 'only shows links for suggested payment gateways', () => {
			const fixtures = [
				{
					id: 'poocommerce_payments',
					text: 'WooPayments',
				},
				{
					id: 'stripe',
					text: 'Stripe',
				},
				{
					id: 'kco',
					text: 'Klarna',
				},
				{
					id: 'klarna_payments',
					text: 'Klarna',
				},
				{
					id: 'ppcp-gateway',
					text: 'PayPal Checkout',
				},
				{
					id: 'square_credit_card',
					text: 'Square',
				},
				{
					id: 'payfast',
					text: 'Payfast',
				},
				{
					id: 'eway',
					text: 'Eway',
				},
			];

			const noSuggestions = render(
				<HelpPanel
					paymentGatewaySuggestions={ () => [] }
					taskName="payments"
				/>
			);

			fixtures.forEach( ( method ) => {
				expect(
					noSuggestions.queryAllByText( ( text ) =>
						text.includes( method.text )
					)
				).toHaveLength( 0 );
			} );

			fixtures.forEach( ( method ) => {
				const { queryAllByText } = render(
					<HelpPanel
						paymentGatewaySuggestions={ { [ method.id ]: true } }
						taskName="payments"
					/>
				);

				expect(
					queryAllByText( ( text ) => text.includes( method.text ) )
						.length
				).toBeGreaterThanOrEqual( 1 );
			} );
		} );

		describe( 'only shows links for PooCommerce Tax (powered by WCS&T) when supported', () => {
			it( 'displays if no conflicting conditions are present', () => {
				const supportedCountry = render(
					<HelpPanel
						countryCode="US"
						taskLists={ [
							{
								id: 'setup',
								tasks: [
									{
										id: 'tax',
										additionalData: {
											poocommerceTaxCountries: [ 'US' ],
											taxJarActivated: false,
										},
									},
								],
							},
						] }
						taskName="tax"
					/>
				);

				expect(
					supportedCountry.getByText( /PooCommerce Tax/ )
				).toBeDefined();
			} );

			it( 'does not display if the TaxJar plugin is active', () => {
				const taxjarPluginEnabled = render(
					<HelpPanel
						countryCode="US"
						taskLists={ [
							{
								id: 'setup',
								tasks: [
									{
										id: 'tax',
										additionalData: {
											poocommerceTaxCountries: [ 'US' ],
											taxJarActivated: true,
										},
									},
								],
							},
						] }
						taskName="tax"
					/>
				);

				expect(
					taxjarPluginEnabled.queryByText( /PooCommerce Tax/ )
				).toBeNull();
			} );

			it( 'does not display if in an unsupported country', () => {
				const unSupportedCountry = render(
					<HelpPanel
						countryCode="NZ"
						taskLists={ [
							{
								id: 'setup',
								tasks: [
									{
										id: 'tax',
										additionalData: {
											poocommerceTaxCountries: [ 'US' ],
											taxJarActivated: false,
										},
									},
								],
							},
						] }
						taskName="tax"
					/>
				);

				expect(
					unSupportedCountry.queryByText( /PooCommerce Tax/ )
				).toBeNull();
			} );

			it( 'does not display if the PooCommerce Tax plugin is active', () => {
				const poocommerceTaxActivated = render(
					<HelpPanel
						countryCode="US"
						taskLists={ [
							{
								id: 'setup',
								tasks: [
									{
										id: 'tax',
										additionalData: {
											poocommerceTaxCountries: [ 'US' ],
											taxJarActivated: false,
											poocommerceTaxActivated: true,
										},
									},
								],
							},
						] }
						taskName="tax"
					/>
				);

				expect(
					poocommerceTaxActivated.queryByText( /PooCommerce Tax/ )
				).toBeNull();
			} );

			it( 'does not display if the PooCommerce Shipping plugin is active', () => {
				const poocommerceShippingActivated = render(
					<HelpPanel
						countryCode="US"
						taskLists={ [
							{
								id: 'setup',
								tasks: [
									{
										id: 'tax',
										additionalData: {
											poocommerceTaxCountries: [ 'US' ],
											taxJarActivated: false,
											poocommerceTaxActivated: false,
											poocommerceShippingActivated: true,
										},
									},
								],
							},
						] }
						taskName="tax"
					/>
				);

				expect(
					poocommerceShippingActivated.queryByText(
						/PooCommerce Tax/
					)
				).toBeNull();
			} );
		} );

		describe( 'only shows links for PooCommerce Shipping (powered by WCS&T) when supported', () => {
			it( 'displays if no conflicting conditions are present', () => {
				const supportedCountry = render(
					<HelpPanel
						activePlugins={ [] }
						countryCode="US"
						taskName="shipping"
					/>
				);

				expect(
					supportedCountry.getByText( /PooCommerce Shipping/ )
				).toBeDefined();
			} );

			it( 'does not display if the PooCommerce Shipping & Tax plugin is active', () => {
				const wcsActive = render(
					<HelpPanel
						activePlugins={ [ 'poocommerce-services' ] }
						countryCode="US"
						taskName="shipping"
					/>
				);

				expect(
					wcsActive.queryByText( /PooCommerce Shipping/ )
				).toBeNull();
			} );

			it( 'does not display if the PooCommerce Shipping plugin is active', () => {
				const wcsActive = render(
					<HelpPanel
						activePlugins={ [ 'poocommerce-shipping' ] }
						countryCode="US"
						taskName="shipping"
					/>
				);

				expect(
					wcsActive.queryByText( /PooCommerce Shipping/ )
				).toBeNull();
			} );

			it( 'does not display if the PooCommerce Tax plugin is active', () => {
				const wcsActive = render(
					<HelpPanel
						activePlugins={ [ 'poocommerce-tax' ] }
						countryCode="US"
						taskName="shipping"
					/>
				);

				expect(
					wcsActive.queryByText( /PooCommerce Shipping/ )
				).toBeNull();
			} );

			it( 'does not display if in an unsupported country', () => {
				const unSupportedCountry = render(
					<HelpPanel
						activePlugins={ [] }
						countryCode="UK"
						taskName="shipping"
					/>
				);

				expect(
					unSupportedCountry.queryByText( /PooCommerce Shipping/ )
				).toBeNull();
			} );
		} );

		it( 'only shows links for home screen when supported', () => {
			const homescreen = render(
				<HelpPanel
					activePlugins={ [ 'poocommerce-services' ] }
					taskName=""
				/>
			);

			const homescreenLinkTitles = [
				'Get Support',
				'Home Screen',
				'Inbox',
				'Stats Overview',
				'Store Management',
				'Store Setup Checklist',
			];

			homescreenLinkTitles.forEach( ( title ) => {
				expect( homescreen.getByText( title ) ).toBeDefined();
			} );
		} );

		describe( 'Filters', () => {
			const testNamespace = 'wc/admin/tests';

			afterEach( () => {
				removeAllFilters( SETUP_TASK_HELP_ITEMS_FILTER, testNamespace );
			} );

			it( 'defaults to generic link with non-arrays', () => {
				// Return a non-array.
				addFilter(
					SETUP_TASK_HELP_ITEMS_FILTER,
					testNamespace,
					() => ( {} )
				);

				const nonArray = render( <HelpPanel taskName="appearance" /> );

				// Verify non-arrays default to generic docs link.
				expect(
					nonArray.getByText( 'PooCommerce Docs' )
				).toBeDefined();
			} );

			it( 'defaults to generic link with empty arrays', () => {
				// Return an empty array.
				addFilter(
					SETUP_TASK_HELP_ITEMS_FILTER,
					testNamespace,
					() => []
				);

				const emptyArray = render(
					<HelpPanel taskName="appearance" />
				);

				// Verify empty arrays default to generic docs link.
				expect(
					emptyArray.getByText( 'PooCommerce Docs' )
				).toBeDefined();
			} );

			it( 'defaults to generic link with malformed arrays', () => {
				// Return an malformed array.
				addFilter( SETUP_TASK_HELP_ITEMS_FILTER, testNamespace, () => [
					{
						title: 'missing a link!',
					},
				] );

				const badArray = render( <HelpPanel taskName="appearance" /> );

				// Verify malformed arrays default to generic docs link.
				expect(
					badArray.getByText( 'PooCommerce Docs' )
				).toBeDefined();
			} );

			it( 'allows help items to be replaced', () => {
				// Replace all help items.
				addFilter( SETUP_TASK_HELP_ITEMS_FILTER, testNamespace, () => [
					{
						title: 'There can only be one',
						link: 'https://www.google.com/search?q=highlander',
					},
				] );

				const replacedArray = render(
					<HelpPanel taskName="appearance" />
				);

				// Verify filtered array.
				expect(
					replacedArray.queryByText( 'PooCommerce Docs' )
				).toBeNull();
				expect(
					replacedArray.getByText( 'There can only be one' )
				).toBeDefined();
			} );
		} );
	} );
} );
