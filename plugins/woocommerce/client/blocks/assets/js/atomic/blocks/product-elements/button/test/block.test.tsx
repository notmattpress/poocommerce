/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import {
	useStoreAddToCart,
	useStoreEvents,
} from '@poocommerce/base-context/hooks';

/**
 * Internal dependencies
 */
import { AddToCartButton } from '../block';
import type { AddToCartButtonAttributes } from '../types';

jest.mock( '@poocommerce/base-context/hooks', () => ( {
	useStoreAddToCart: jest.fn(),
	useStoreEvents: jest.fn(),
} ) );

jest.mock( '@poocommerce/base-hooks', () => ( {} ) );

jest.mock( '@poocommerce/block-settings', () => ( {
	CART_URL: '/cart/',
} ) );

jest.mock( '@poocommerce/shared-hocs', () => ( {
	withProductDataContext: ( component ) => component,
} ) );

const product: AddToCartButtonAttributes[ 'product' ] = {
	id: 1,
	type: 'variable',
	permalink: '/product/example-product/',
	add_to_cart: {
		url: '/product/example-product/',
		description: 'View example product',
		text: 'Select options',
		single_text: 'Add to cart',
	},
	has_options: true,
	is_purchasable: true,
	is_in_stock: true,
	button_text: 'Select options',
};

const renderButton = ( overrides: Partial< AddToCartButtonAttributes > = {} ) =>
	render(
		<AddToCartButton
			className=""
			style={ {} }
			isDescendantOfAddToCartWithOptions={ false }
			product={ product }
			{ ...overrides }
		/>
	);

describe( 'AddToCartButton', () => {
	beforeEach( () => {
		( useStoreAddToCart as jest.Mock ).mockReturnValue( {
			cartQuantity: 0,
			addingToCart: false,
			addToCart: jest.fn(),
		} );
		( useStoreEvents as jest.Mock ).mockReturnValue( {
			dispatchStoreEvent: jest.fn(),
		} );
	} );

	it( 'does not add nofollow to product permalink links', () => {
		renderButton();

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', product.permalink );
		expect( link ).not.toHaveAttribute( 'rel' );
	} );

	it( 'keeps nofollow on cart action links', () => {
		renderButton( {
			collection: 'poocommerce/product-collection/cart-contents',
		} );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/cart/' );
		expect( link ).toHaveAttribute( 'rel', 'nofollow' );
	} );
} );
