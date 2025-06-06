/**
 * External dependencies
 */
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { useEffect } from '@wordpress/element';
import { dispatchEvent } from '@poocommerce/base-utils';

/**
 * Internal dependencies
 */
import './style.scss';

const FrontendBlock = ( {
	children,
	className,
}: {
	children: JSX.Element;
	className: string;
} ): JSX.Element | null => {
	const { cartItems, cartIsLoading } = useStoreCart();
	useEffect( () => {
		if ( cartItems.length !== 0 || cartIsLoading ) {
			return;
		}
		dispatchEvent( 'wc-blocks_render_blocks_frontend', {
			element: document.body.querySelector(
				'.wp-block-poocommerce-cart'
			),
		} );
	}, [ cartIsLoading, cartItems ] );
	if ( ! cartIsLoading && cartItems.length === 0 ) {
		return <div className={ className }>{ children }</div>;
	}
	return null;
};

export default FrontendBlock;
