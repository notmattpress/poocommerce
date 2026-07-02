/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import Block from '../block';

const mockPlaceOrderButton = jest.fn( ( { label, CustomButtonComponent } ) => {
	if ( CustomButtonComponent ) {
		return <CustomButtonComponent />;
	}
	return <button>{ label }</button>;
} );

jest.mock( '@poocommerce/base-components/cart-checkout', () => ( {
	PlaceOrderButton: ( props ) => mockPlaceOrderButton( props ),
} ) );

const mockUseCheckoutSubmit = jest.fn();
jest.mock( '@poocommerce/base-context/hooks', () => ( {
	useCheckoutSubmit: () => mockUseCheckoutSubmit(),
} ) );

const mockUseSelect = jest.fn();
jest.mock( '@wordpress/data', () => ( {
	useSelect: () => mockUseSelect(),
} ) );

jest.mock( '@poocommerce/block-data', () => ( {
	paymentStore: 'wc/store/payment',
} ) );

jest.mock( '@poocommerce/settings', () => ( {
	getSetting: jest.fn( () => '' ),
} ) );

jest.mock( '@poocommerce/base-context', () => ( {
	noticeContexts: {
		CHECKOUT_ACTIONS: 'wc/checkout/checkout-actions',
	},
} ) );

jest.mock( '@poocommerce/blocks-components', () => ( {
	StoreNoticesContainer: () => null,
} ) );

jest.mock( '@poocommerce/blocks-checkout', () => ( {
	applyCheckoutFilter: ( { defaultValue } ) => defaultValue,
} ) );

jest.mock( '@poocommerce/block-settings', () => ( {
	CART_URL: '/cart',
} ) );

jest.mock( '../../checkout-order-summary-block/slotfills', () => ( {
	CheckoutOrderSummarySlot: () => null,
} ) );

jest.mock( '../../checkout-actions-block/constants', () => ( {
	defaultPlaceOrderButtonLabel: 'Place Order',
} ) );

const defaultProps = {
	cartPageId: 1,
	showReturnToCart: false,
	placeOrderButtonLabel: 'Place Order',
	priceSeparator: '·',
	returnToCartButtonLabel: 'Return to Cart',
};

const CustomPlaceOrderButton = () => <button>Custom Button</button>;

describe( 'Checkout Actions Block', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockPlaceOrderButton.mockClear();
	} );

	it( 'does not pass CustomButtonComponent to PlaceOrderButton when a saved token is active', () => {
		mockUseCheckoutSubmit.mockReturnValue( {
			paymentMethodButtonLabel: '',
			paymentMethodPlaceOrderButton: CustomPlaceOrderButton,
		} );
		mockUseSelect.mockReturnValue( 'saved-token-123' );

		render( <Block { ...defaultProps } /> );

		expect( mockPlaceOrderButton ).toHaveBeenCalledWith(
			expect.objectContaining( {
				CustomButtonComponent: undefined,
			} )
		);
		expect( screen.queryByText( 'Place Order' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Custom Button' ) ).not.toBeInTheDocument();
	} );

	it( 'passes CustomButtonComponent to PlaceOrderButton when no saved token is active', () => {
		mockUseCheckoutSubmit.mockReturnValue( {
			paymentMethodButtonLabel: '',
			paymentMethodPlaceOrderButton: CustomPlaceOrderButton,
		} );
		mockUseSelect.mockReturnValue( null );

		render( <Block { ...defaultProps } /> );

		expect( mockPlaceOrderButton ).toHaveBeenCalledWith(
			expect.objectContaining( {
				CustomButtonComponent: CustomPlaceOrderButton,
			} )
		);
		expect( screen.queryByText( 'Place Order' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Custom Button' ) ).toBeInTheDocument();
	} );

	it( 'passes undefined CustomButtonComponent when payment method does not provide one', () => {
		mockUseCheckoutSubmit.mockReturnValue( {
			paymentMethodButtonLabel: '',
			paymentMethodPlaceOrderButton: undefined,
		} );
		mockUseSelect.mockReturnValue( null );

		render( <Block { ...defaultProps } /> );

		expect( mockPlaceOrderButton ).toHaveBeenCalledWith(
			expect.objectContaining( {
				CustomButtonComponent: undefined,
			} )
		);
		expect( screen.queryByText( 'Place Order' ) ).toBeInTheDocument();
	} );

	it( 'uses payment method button label when provided', () => {
		mockUseCheckoutSubmit.mockReturnValue( {
			paymentMethodButtonLabel: 'Pay with Card',
			paymentMethodPlaceOrderButton: undefined,
		} );
		mockUseSelect.mockReturnValue( null );

		render( <Block { ...defaultProps } /> );

		expect( mockPlaceOrderButton ).toHaveBeenCalledWith(
			expect.objectContaining( {
				label: 'Pay with Card',
			} )
		);
		expect( screen.queryByText( 'Pay with Card' ) ).toBeInTheDocument();
	} );
} );
