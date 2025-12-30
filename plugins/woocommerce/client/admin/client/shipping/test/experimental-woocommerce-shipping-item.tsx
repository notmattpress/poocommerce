/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import PooCommerceShippingItem from '../experimental-poocommerce-shipping-item';
jest.mock( '@poocommerce/tracks', () => ( {
	...jest.requireActual( '@poocommerce/tracks' ),
	recordEvent: jest.fn(),
} ) );

jest.mock( '@poocommerce/admin-layout', () => {
	const mockContext = {
		layoutPath: [ 'root' ],
		layoutString: 'root',
		extendLayout: () => {},
		isDescendantOf: () => false,
	};
	return {
		...jest.requireActual( '@poocommerce/admin-layout' ),
		useLayoutContext: jest.fn().mockReturnValue( mockContext ),
		useExtendLayout: jest.fn().mockReturnValue( mockContext ),
	};
} );

describe( 'PooCommerceShippingItem', () => {
	it( 'should render WC Shipping item with CTA = "Get started" when WC Shipping is not installed', () => {
		render( <PooCommerceShippingItem isPluginInstalled={ false } /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Get started' } )
		).toBeInTheDocument();
	} );

	it( 'should render WC Shipping item with CTA = "Activate" when WC Shipping is installed', () => {
		render( <PooCommerceShippingItem isPluginInstalled={ true } /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Activate' } )
		).toBeInTheDocument();
	} );

	it( 'should record track when clicking setup button', () => {
		render( <PooCommerceShippingItem isPluginInstalled={ false } /> );

		screen.queryByRole( 'button', { name: 'Get started' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith( 'tasklist_click', {
			context: 'root/wc-settings',
			task_name: 'shipping-recommendation',
		} );
	} );
} );
