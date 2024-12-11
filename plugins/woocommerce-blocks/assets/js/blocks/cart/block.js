/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { useEffect } from '@wordpress/element';
import LoadingMask from '@poocommerce/base-components/loading-mask';
import { CURRENT_USER_IS_ADMIN } from '@poocommerce/settings';
import BlockErrorBoundary from '@poocommerce/base-components/block-error-boundary';
import { translateJQueryEventToNative } from '@poocommerce/base-utils';
import withScrollToTop from '@poocommerce/base-hocs/with-scroll-to-top';
import {
	CartEventsProvider,
	CartProvider,
	noticeContexts,
} from '@poocommerce/base-context';
import { SlotFillProvider } from '@poocommerce/blocks-checkout';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';

/**
 * Internal dependencies
 */
import { CartBlockContext } from './context';
import './style.scss';

const reloadPage = () => void window.location.reload( true );

const Cart = ( { children, attributes = {} } ) => {
	const { cartIsLoading } = useStoreCart();
	const { hasDarkControls } = attributes;

	return (
		<LoadingMask showSpinner={ true } isLoading={ cartIsLoading }>
			<CartBlockContext.Provider
				value={ {
					hasDarkControls,
				} }
			>
				{ children }
			</CartBlockContext.Provider>
		</LoadingMask>
	);
};

const ScrollOnError = ( { scrollToTop } ) => {
	useEffect( () => {
		// Make it so we can read jQuery events triggered by WC Core elements.
		const removeJQueryAddedToCartEvent = translateJQueryEventToNative(
			'added_to_cart',
			'wc-blocks_added_to_cart'
		);

		document.body.addEventListener(
			'wc-blocks_added_to_cart',
			scrollToTop
		);

		return () => {
			removeJQueryAddedToCartEvent();

			document.body.removeEventListener(
				'wc-blocks_added_to_cart',
				scrollToTop
			);
		};
	}, [ scrollToTop ] );

	return null;
};
const Block = ( { attributes, children, scrollToTop } ) => (
	<BlockErrorBoundary
		header={ __(
			'Something went wrong. Please contact us for assistance.',
			'poocommerce'
		) }
		text={ __(
			'The cart has encountered an unexpected error. If the error persists, please get in touch with us for help.',
			'poocommerce'
		) }
		button={
			<button className="wc-block-button" onClick={ reloadPage }>
				{ __( 'Reload the page', 'poocommerce' ) }
			</button>
		}
		showErrorMessage={ CURRENT_USER_IS_ADMIN }
	>
		<StoreNoticesContainer context={ noticeContexts.CART } />
		<SlotFillProvider>
			<CartProvider>
				<CartEventsProvider>
					<Cart attributes={ attributes }>{ children }</Cart>
					<ScrollOnError scrollToTop={ scrollToTop } />
				</CartEventsProvider>
			</CartProvider>
		</SlotFillProvider>
	</BlockErrorBoundary>
);
export default withScrollToTop( Block );
