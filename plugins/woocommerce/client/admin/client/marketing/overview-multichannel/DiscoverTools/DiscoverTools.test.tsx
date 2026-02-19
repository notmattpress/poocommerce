/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { useRecommendedPluginsWithoutChannels } from './useRecommendedPluginsWithoutChannels';
import { DiscoverTools } from './DiscoverTools';

jest.mock( '@poocommerce/components', () => {
	const originalModule = jest.requireActual( '@poocommerce/components' );

	return {
		__esModule: true,
		...originalModule,
		Spinner: () => <div data-testid="spinner">Spinner</div>,
	};
} );

jest.mock( './useRecommendedPluginsWithoutChannels', () => ( {
	useRecommendedPluginsWithoutChannels: jest.fn(),
} ) );

jest.mock( '~/marketing/hooks', () => ( {
	useInstalledPluginsWithoutChannels: jest.fn( () => ( {} ) ),
} ) );

describe( 'DiscoverTools component', () => {
	it( 'should render a Spinner when loading is in progress', () => {
		( useRecommendedPluginsWithoutChannels as jest.Mock ).mockReturnValue( {
			isInitializing: true,
			isLoading: true,
			data: [],
		} );
		render( <DiscoverTools /> );

		expect( screen.getByTestId( 'spinner' ) ).toBeInTheDocument();
	} );

	it( 'should render message and link when loading is finish and there are no plugins', () => {
		( useRecommendedPluginsWithoutChannels as jest.Mock ).mockReturnValue( {
			isInitializing: false,
			isLoading: false,
			data: [],
		} );
		render( <DiscoverTools /> );

		expect(
			screen.getByText(
				'Continue to reach the right audiences and promote your products in ways that matter to them with our range of marketing solutions.'
			)
		).toBeInTheDocument();
		expect(
			screen.getByText( 'Explore more marketing extensions' )
		).toBeInTheDocument();
	} );

	describe( 'With plugins loaded', () => {
		it( 'should render `direct_install: true` plugins with "Install extension" button', () => {
			(
				useRecommendedPluginsWithoutChannels as jest.Mock
			 ).mockReturnValue( {
				isInitializing: false,
				isLoading: false,
				data: [
					{
						title: 'Google for PooCommerce',
						description:
							'Get in front of shoppers and drive traffic so you can grow your business with Smart Shopping Campaigns and free listings.',
						url: 'https://poocommerce.com/products/google-listings-and-ads/?utm_source=marketingtab&utm_medium=product&utm_campaign=wcaddons',
						direct_install: true,
						icon: 'https://poocommerce.com/wp-content/plugins/wccom-plugins/marketing-tab-rest-api/icons/google.svg',
						product: 'google-listings-and-ads',
						plugin: 'google-listings-and-ads/google-listings-and-ads.php',
						categories: [ 'marketing' ],
						subcategories: [
							{
								slug: 'sales-channels',
								name: 'Sales channels',
							},
						],
						tags: [
							{
								slug: 'built-by-poocommerce',
								name: 'Built by PooCommerce',
							},
						],
					},
				],
			} );
			render( <DiscoverTools /> );

			// Assert that we have the "Sales channels" tab, the plugin name, the "Built by PooCommerce" pill, and the "Install extension" button.
			expect( screen.getByText( 'Sales channels' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Google for PooCommerce' )
			).toBeInTheDocument();
			expect(
				screen.getByText( 'Built by PooCommerce' )
			).toBeInTheDocument();
			expect(
				screen.getByText( 'Install extension' )
			).toBeInTheDocument();
		} );

		it( 'should render `direct_install: false` plugins with "View details" button', () => {
			(
				useRecommendedPluginsWithoutChannels as jest.Mock
			 ).mockReturnValue( {
				isInitializing: false,
				isLoading: false,
				data: [
					{
						title: 'PooCommerce Zapier',
						description:
							'Integrate your PooCommerce store with 5000+ cloud apps and services today. Trusted by 11,000+ users.',
						url: 'https://poocommerce.com/products/poocommerce-zapier/?utm_source=marketingtab&utm_medium=product&utm_campaign=wcaddons',
						direct_install: false,
						icon: 'https://poocommerce.com/wp-content/plugins/wccom-plugins/marketing-tab-rest-api/icons/zapier.png',
						product: 'poocommerce-zapier',
						plugin: 'poocommerce-zapier/poocommerce-zapier.php',
						categories: [ 'marketing' ],
						subcategories: [
							{
								slug: 'crm',
								name: 'CRM',
							},
						],
						tags: [],
					},
				],
			} );
			render( <DiscoverTools /> );

			// Assert that we have the CRM tab, plugin name, and "View details" button.
			expect( screen.getByText( 'CRM' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'PooCommerce Zapier' )
			).toBeInTheDocument();
			expect( screen.getByText( 'View details' ) ).toBeInTheDocument();
		} );
	} );
} );
