/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import ShippingRecommendations from '../experimental-shipping-recommendations';

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useSelect: jest.fn(),
} ) );
jest.mock( '../../settings-recommendations/dismissable-list', () => ( {
	DismissableList: ( ( { children } ) => children ) as React.FC,
	DismissableListHeading: ( ( { children } ) => children ) as React.FC,
} ) );
jest.mock( '@poocommerce/admin-layout', () => {
	const mockContext = {
		layoutPath: [ 'home' ],
		layoutString: 'home',
		extendLayout: () => {},
		isDescendantOf: () => false,
	};
	return {
		...jest.requireActual( '@poocommerce/admin-layout' ),
		useLayoutContext: jest.fn().mockReturnValue( mockContext ),
		useExtendLayout: jest.fn().mockReturnValue( mockContext ),
	};
} );
jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );
jest.mock( '~/utils/features', () => ( {
	isFeatureEnabled: jest.fn(),
} ) );

const defaultSelectReturn = {
	getActivePlugins: () => [],
	getInstalledPlugins: () => [],
	getSettings: () => ( {
		general: {
			poocommerce_default_country: 'US',
		},
	} ),
	getProfileItems: () => ( {} ),
	hasFinishedResolution: jest.fn(),
	getOption: jest.fn(),
};

describe( 'ShippingRecommendations', () => {
	beforeEach( () => {
		( useSelect as jest.Mock ).mockImplementation( ( fn ) =>
			fn( () => ( { ...defaultSelectReturn } ) )
		);
	} );

	it( `should not render if the following plugins are active: poocommerce-shipping`, () => {
		( useSelect as jest.Mock ).mockImplementation( ( fn ) =>
			fn( () => ( {
				...defaultSelectReturn,
				getActivePlugins: () => 'poocommerce-shipping',
			} ) )
		);

		render( <ShippingRecommendations /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).not.toBeInTheDocument();
	} );

	it( 'should not render when store location is not US', () => {
		( useSelect as jest.Mock ).mockImplementation( ( fn ) =>
			fn( () => ( {
				...defaultSelectReturn,
				getSettings: () => ( {
					general: {
						poocommerce_default_country: 'JP',
					},
				} ),
			} ) )
		);
		render( <ShippingRecommendations /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).not.toBeInTheDocument();
	} );

	it( 'should not render when store sells digital products only', () => {
		( useSelect as jest.Mock ).mockImplementation( ( fn ) =>
			fn( () => ( {
				...defaultSelectReturn,
				getProfileItems: () => ( {
					product_types: [ 'downloads' ],
				} ),
			} ) )
		);
		render( <ShippingRecommendations /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).not.toBeInTheDocument();
	} );

	it( 'should render WC Shipping when not installed', () => {
		render( <ShippingRecommendations /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();
	} );

	it( 'should trigger event settings_shipping_recommendation_visit_marketplace_click when clicking the PooCommerce Marketplace link', () => {
		render( <ShippingRecommendations /> );

		fireEvent.click( screen.getByText( 'the PooCommerce Marketplace' ) );

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_shipping_recommendation_visit_marketplace_click',
			{}
		);
	} );

	it( 'should navigate to the marketplace when clicking the PooCommerce Marketplace link', async () => {
		const { isFeatureEnabled } = jest.requireMock( '~/utils/features' );
		( isFeatureEnabled as jest.Mock ).mockReturnValue( true );

		const mockLocation = {
			href: 'test',
		} as Location;

		mockLocation.href = 'test';
		Object.defineProperty( global.window, 'location', {
			value: mockLocation,
		} );

		render( <ShippingRecommendations /> );

		fireEvent.click( screen.getByText( 'the PooCommerce Marketplace' ) );

		expect( mockLocation.href ).toContain(
			'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=shipping'
		);
	} );
} );
