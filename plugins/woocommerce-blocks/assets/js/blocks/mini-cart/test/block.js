/**
 * External dependencies
 */
import {
	act,
	render,
	screen,
	queryByText,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { previewCart } from '@poocommerce/resource-previews';
import { dispatch } from '@wordpress/data';
import { CART_STORE_KEY as storeKey } from '@poocommerce/block-data';
import { SlotFillProvider } from '@poocommerce/blocks-checkout';
import { default as fetchMock } from 'jest-fetch-mock';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import Block from '../block';
import { defaultCartState } from '../../../data/cart/default-state';

const MiniCartBlock = ( props ) => (
	<SlotFillProvider>
		<Block
			contents='<div data-block-name="poocommerce/mini-cart-contents" class="wp-block-poocommerce-mini-cart-contents"><div data-block-name="poocommerce/filled-mini-cart-contents-block" class="wp-block-poocommerce-filled-mini-cart-contents-block"><div data-block-name="poocommerce/mini-cart-title-block" class="wp-block-poocommerce-mini-cart-title-block"><div data-block-name="poocommerce/mini-cart-title-label-block" class="wp-block-poocommerce-mini-cart-title-label-block"></div>
			<div data-block-name="poocommerce/mini-cart-title-items-counter-block" class="wp-block-poocommerce-mini-cart-title-items-counter-block"></div></div>
			<div data-block-name="poocommerce/mini-cart-items-block" class="wp-block-poocommerce-mini-cart-items-block"><div data-block-name="poocommerce/mini-cart-products-table-block" class="wp-block-poocommerce-mini-cart-products-table-block"></div></div>
			<div data-block-name="poocommerce/mini-cart-footer-block" class="wp-block-poocommerce-mini-cart-footer-block"><div data-block-name="poocommerce/mini-cart-cart-button-block" class="wp-block-poocommerce-mini-cart-cart-button-block"></div>
			<div data-block-name="poocommerce/mini-cart-checkout-button-block" class="wp-block-poocommerce-mini-cart-checkout-button-block"></div></div></div>
			<div data-block-name="poocommerce/empty-mini-cart-contents-block" class="wp-block-poocommerce-empty-mini-cart-contents-block">
			<p class="has-text-align-center"><strong>Your cart is currently empty!</strong></p>
			<div data-block-name="poocommerce/mini-cart-shopping-button-block" class="wp-block-poocommerce-mini-cart-shopping-button-block"></div></div></div>'
			{ ...props }
		/>
	</SlotFillProvider>
);

const mockEmptyCart = () => {
	fetchMock.mockResponse( ( req ) => {
		if ( req.url.match( /wc\/store\/v1\/cart/ ) ) {
			return Promise.resolve(
				JSON.stringify( defaultCartState.cartData )
			);
		}
		return Promise.resolve( '' );
	} );
};

const mockFullCart = () => {
	fetchMock.mockResponse( ( req ) => {
		if ( req.url.match( /wc\/store\/v1\/cart/ ) ) {
			return Promise.resolve( JSON.stringify( previewCart ) );
		}
		return Promise.resolve( '' );
	} );
};

describe( 'Testing Mini-Cart', () => {
	beforeEach( () => {
		act( () => {
			mockFullCart();
			// need to clear the store resolution state between tests.
			dispatch( storeKey ).invalidateResolutionForStore();
			dispatch( storeKey ).receiveCart( defaultCartState.cartData );
		} );
	} );

	afterEach( () => {
		fetchMock.resetMocks();
	} );

	it( 'shows Mini-Cart count badge when there are items in the cart', async () => {
		render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		await waitFor( () =>
			expect( screen.getByText( '3' ) ).toBeInTheDocument()
		);
	} );

	it( "doesn't show Mini-Cart count badge when cart is empty", async () => {
		mockEmptyCart();
		render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );
		const badgeWith0Count = screen.queryByText( '0' );

		expect( badgeWith0Count ).toBeNull();
	} );

	it( 'opens Mini-Cart drawer when clicking on button', async () => {
		const user = userEvent.setup();
		render( <MiniCartBlock /> );

		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );
		await act( async () => {
			await user.click( screen.getByLabelText( /items/i ) );
		} );

		await waitFor( () =>
			expect( screen.getByText( /your cart/i ) ).toBeInTheDocument()
		);

		// The opening of the drawer uses deprecated ReactDOM.render.
		expect( console ).toHaveErroredWith(
			`Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot%s`,
			// The stack trace
			expect.any( String )
		);
	} );

	it( 'closes the drawer when clicking on the close button', async () => {
		const user = userEvent.setup();
		render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		// Open drawer.
		await act( async () => {
			await user.click( screen.getByLabelText( /items/i ) );
		} );

		// Close drawer.
		let closeButton = null;

		await waitFor( () => {
			closeButton = screen.getByLabelText( /close/i );
		} );

		if ( closeButton ) {
			await act( async () => {
				await user.click( closeButton );
			} );
		}

		await waitFor( () => {
			expect(
				screen.queryByText( /your cart/i )
			).not.toBeInTheDocument();
		} );

		// The opening of the drawer uses deprecated ReactDOM.render.
		expect( console ).toHaveErroredWith(
			`Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot%s`,
			// The stack trace
			expect.any( String )
		);
	} );

	it( 'renders empty cart if there are no items in the cart', async () => {
		const user = userEvent.setup();
		mockEmptyCart();
		render( <MiniCartBlock /> );

		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		await act( async () => {
			await user.click( screen.getByLabelText( /items/i ) );
		} );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );

		// The opening of the drawer uses deprecated ReactDOM.render.
		expect( console ).toHaveErroredWith(
			`Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot%s`,
			// The stack trace
			expect.any( String )
		);
	} );

	it( 'updates contents when removed from cart event is triggered', async () => {
		render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		mockEmptyCart();
		// eslint-disable-next-line no-undef
		const removedFromCartEvent = new Event( 'wc-blocks_removed_from_cart' );
		act( () => {
			document.body.dispatchEvent( removedFromCartEvent );
		} );

		await waitForElementToBeRemoved( () =>
			screen.queryByLabelText( /3 items in cart/i )
		);
		await waitFor( () =>
			expect(
				screen.getByLabelText( /0 items in cart/i )
			).toBeInTheDocument()
		);
	} );

	it( 'updates contents when added to cart event is triggered', async () => {
		mockEmptyCart();
		render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		mockFullCart();
		// eslint-disable-next-line no-undef
		const addedToCartEvent = new Event( 'wc-blocks_added_to_cart' );
		act( () => {
			document.body.dispatchEvent( addedToCartEvent );
		} );

		await waitForElementToBeRemoved( () =>
			screen.queryByLabelText( /0 items in cart/i )
		);
		await waitFor( () =>
			expect(
				screen.getByLabelText( /3 items in cart/i )
			).toBeInTheDocument()
		);
	} );

	it( 'renders cart price if "Hide Cart Price" setting is not enabled', async () => {
		mockEmptyCart();
		render( <MiniCartBlock hasHiddenPrice={ false } /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		await waitFor( () =>
			expect( screen.getByText( '$0.00' ) ).toBeInTheDocument()
		);
	} );

	it( 'does not render cart price if "Hide Cart Price" setting is enabled', async () => {
		mockEmptyCart();
		const { container } = render( <MiniCartBlock /> );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		await waitFor( () =>
			expect( queryByText( container, '$0.00' ) ).not.toBeInTheDocument()
		);
	} );
} );
