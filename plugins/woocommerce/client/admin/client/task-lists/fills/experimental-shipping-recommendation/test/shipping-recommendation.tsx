/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskType } from '@poocommerce/data';
import userEvent from '@testing-library/user-event';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { ShippingRecommendation as _ShippingRecommendation } from '../shipping-recommendation';
import { ShippingRecommendationProps, TaskProps } from '../types';
import { redirectToWCSSettings } from '../utils';

jest.mock( '../../tax/utils', () => ( {
	hasCompleteAddress: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( '../utils', () => ( {
	redirectToWCSSettings: jest.fn(),
} ) );

jest.mock( '@poocommerce/components', () => {
	const originalModule = jest.requireActual( '@poocommerce/components' );

	return {
		__esModule: true,
		...originalModule,
		Plugins: jest.fn().mockReturnValue( <div>MockedPlugins</div> ),
		Spinner: jest.fn().mockReturnValue( null ),
	};
} );

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useDispatch: jest.fn().mockImplementation( () => {
		return {
			createNotice: jest.fn(),
			installAndActivatePlugins: jest.fn(),
		};
	} ),
	useSelect: jest.fn().mockImplementation( ( fn ) =>
		fn( () => ( {
			getActivePlugins: jest.fn().mockReturnValue( [] ),
			getInstalledPlugins: jest.fn().mockReturnValue( [] ),
			isPluginsRequesting: jest.fn().mockReturnValue( false ),
			getSettings: () => ( {
				general: {
					poocommerce_default_country: 'US',
				},
			} ),
			getCountries: () => [],
			getLocales: () => [],
			getLocale: () => 'en',
			hasFinishedResolution: () => true,
			getOption: ( key: string ) => {
				return {
					wcshipping_options: {
						tos_accepted: true,
					},
					poocommerce_setup_jetpack_opted_in: 1,
				}[ key ];
			},
		} ) )
	),
} ) );

jest.mock( '@poocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

const taskProps: TaskProps = {
	onComplete: () => {},
	query: {},
	task: {
		id: 'shipping-recommendation',
	} as TaskType,
};

const ShippingRecommendation = ( props: ShippingRecommendationProps ) => {
	return <_ShippingRecommendation { ...taskProps } { ...props } />;
};

describe( 'ShippingRecommendation', () => {
	test( 'should show plugins step when poocommerce-shipping is not installed and activated', () => {
		const { getByText } = render(
			<ShippingRecommendation
				isJetpackConnected={ false }
				isResolving={ false }
				activePlugins={ [ 'foo' ] }
			/>
		);
		expect( getByText( 'MockedPlugins' ) ).toBeInTheDocument();
	} );

	test( 'should show connect step when PooCommerce Shipping is activated but not yet connected', () => {
		const { getByRole } = render(
			<ShippingRecommendation
				isJetpackConnected={ false }
				isResolving={ false }
				activePlugins={ [ 'poocommerce-shipping' ] }
			/>
		);
		expect(
			getByRole( 'button', { name: 'Connect' } )
		).toBeInTheDocument();
	} );

	test( 'should show "complete task" button when PooCommerce Shipping is activated and Jetpack is connected', () => {
		const { getByRole } = render(
			<ShippingRecommendation
				isJetpackConnected={ true }
				isResolving={ false }
				activePlugins={ [ 'poocommerce-shipping' ] }
			/>
		);
		expect(
			getByRole( 'button', { name: 'Complete task' } )
		).toBeInTheDocument();
	} );

	test( 'should automatically be redirected when all steps are completed', () => {
		render(
			<ShippingRecommendation
				isJetpackConnected={ true }
				isResolving={ false }
				activePlugins={ [ 'poocommerce-shipping' ] }
			/>
		);

		expect( redirectToWCSSettings ).toHaveBeenCalled();
	} );

	test( 'should allow location step to be manually navigated', async () => {
		const { getByText } = render(
			<ShippingRecommendation
				isJetpackConnected={ true }
				isResolving={ false }
				activePlugins={ [] }
			/>
		);

		await userEvent.click( getByText( 'Set store location' ) );
		expect( getByText( 'Address' ) ).toBeInTheDocument();
	} );

	test( 'should trigger event tasklist_shipping_recommendation_visit_marketplace_click when clicking the Official PooCommerce Marketplace link', () => {
		render( <ShippingRecommendation /> );

		fireEvent.click(
			screen.getByText( 'Official PooCommerce Marketplace' )
		);

		expect( recordEvent ).toHaveBeenCalledWith(
			'tasklist_shipping_recommendation_visit_marketplace_click',
			{}
		);
	} );

	test( 'should navigate to the marketplace when clicking the Official PooCommerce Marketplace link', async () => {
		const mockLocation = {
			href: 'test',
		} as Location;

		mockLocation.href = 'test';
		Object.defineProperty( global.window, 'location', {
			value: mockLocation,
		} );

		render( <ShippingRecommendation /> );

		fireEvent.click(
			screen.getByText( 'Official PooCommerce Marketplace' )
		);

		expect( mockLocation.href ).toContain(
			'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=shipping'
		);
	} );
} );
