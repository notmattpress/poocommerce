/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import PooCommerceServicesItem from '../experimental-poocommerce-services-item';
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

describe( 'PooCommerceServicesItem', () => {
	it( 'should render WCS item with CTA = "Get started" when WCS is not installed', () => {
		render( <PooCommerceServicesItem isWCSInstalled={ false } /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Get started' } )
		).toBeInTheDocument();
	} );

	it( 'should render WCS item with CTA = "Activate" when WCS is installed', () => {
		render( <PooCommerceServicesItem isWCSInstalled={ true } /> );

		expect(
			screen.queryByText( 'PooCommerce Shipping' )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'button', { name: 'Activate' } )
		).toBeInTheDocument();
	} );

	it( 'should record track when clicking setup button', () => {
		render( <PooCommerceServicesItem isWCSInstalled={ false } /> );

		screen.queryByRole( 'button', { name: 'Get started' } )?.click();
		expect( recordEvent ).toHaveBeenCalledWith( 'tasklist_click', {
			context: 'root/wc-settings',
			task_name: 'shipping-recommendation',
		} );
	} );
} );
