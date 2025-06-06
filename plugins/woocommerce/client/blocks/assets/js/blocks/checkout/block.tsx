/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import {
	useStoreCart,
	useShowShippingTotalWarning,
} from '@poocommerce/base-context/hooks';
import { CheckoutProvider, noticeContexts } from '@poocommerce/base-context';
import BlockErrorBoundary from '@poocommerce/base-components/block-error-boundary';
import { SidebarLayout } from '@poocommerce/base-components/sidebar-layout';
import { CURRENT_USER_IS_ADMIN, getSetting } from '@poocommerce/settings';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { SlotFillProvider } from '@poocommerce/blocks-checkout';
import withScrollToTop from '@poocommerce/base-hocs/with-scroll-to-top';
import { useDispatch, useSelect } from '@wordpress/data';
import { checkoutStore, validationStore } from '@poocommerce/block-data';

/**
 * Internal dependencies
 */
import './styles/style.scss';
import EmptyCart from './empty-cart';
import CheckoutOrderError from './checkout-order-error';
import { LOGIN_TO_CHECKOUT_URL, isLoginRequired, reloadPage } from './utils';
import type { Attributes } from './types';
import { CheckoutBlockContext } from './context';

const MustLoginPrompt = () => {
	return (
		<div className="wc-block-must-login-prompt">
			{ __( 'You must be logged in to checkout.', 'poocommerce' ) }{ ' ' }
			<a href={ LOGIN_TO_CHECKOUT_URL }>
				{ __( 'Click here to log in.', 'poocommerce' ) }
			</a>
		</div>
	);
};

const Checkout = ( {
	attributes,
	children,
}: {
	attributes: Attributes;
	children: React.ReactChildren;
} ): JSX.Element => {
	const { hasOrder, customerId } = useSelect( ( select ) => {
		const store = select( checkoutStore );
		return {
			hasOrder: store.hasOrder(),
			customerId: store.getCustomerId(),
		};
	} );
	const { cartItems, cartIsLoading } = useStoreCart();

	const { showFormStepNumbers } = attributes;

	if ( ! cartIsLoading && cartItems.length === 0 ) {
		return <EmptyCart />;
	}

	if ( ! hasOrder ) {
		return <CheckoutOrderError />;
	}

	/**
	 * If checkout requires an account (guest checkout is turned off), render
	 * a notice and prevent access to the checkout, unless we explicitly allow
	 * account creation during the checkout flow.
	 */
	if (
		isLoginRequired( customerId ) &&
		! getSetting( 'checkoutAllowsSignup', false )
	) {
		return <MustLoginPrompt />;
	}

	return (
		<CheckoutBlockContext.Provider value={ { showFormStepNumbers } }>
			{ children }
		</CheckoutBlockContext.Provider>
	);
};

const ScrollOnError = ( {
	scrollToTop,
}: {
	scrollToTop: ( props: Record< string, unknown > ) => void;
} ): null => {
	const { hasError: checkoutHasError, isIdle: checkoutIsIdle } = useSelect(
		( select ) => {
			const store = select( checkoutStore );
			return {
				isIdle: store.isIdle(),
				hasError: store.hasError(),
			};
		},
		[]
	);
	const { hasValidationErrors } = useSelect( ( select ) => {
		const store = select( validationStore );
		return {
			hasValidationErrors: store.hasValidationErrors(),
		};
	} );
	const { showAllValidationErrors } = useDispatch( validationStore );

	const hasErrorsToDisplay =
		checkoutIsIdle && checkoutHasError && hasValidationErrors;

	useEffect( () => {
		let scrollToTopTimeout: number;
		if ( hasErrorsToDisplay ) {
			showAllValidationErrors();
			// Scroll after a short timeout to allow a re-render. This will allow focusableSelector to match updated components.
			scrollToTopTimeout = window.setTimeout( () => {
				scrollToTop( {
					focusableSelector:
						'input:invalid, .has-error input, .has-error select',
				} );
			}, 50 );
		}
		return () => {
			clearTimeout( scrollToTopTimeout );
		};
	}, [ hasErrorsToDisplay, scrollToTop, showAllValidationErrors ] );

	return null;
};

const Block = ( {
	attributes,
	children,
	scrollToTop,
}: {
	attributes: Attributes;
	children: React.ReactChildren;
	scrollToTop: ( props: Record< string, unknown > ) => void;
} ): JSX.Element => {
	useShowShippingTotalWarning();
	return (
		<BlockErrorBoundary
			header={ __(
				'Something went wrong. Please contact us for assistance.',
				'poocommerce'
			) }
			text={ createInterpolateElement(
				__(
					'The checkout has encountered an unexpected error. <button>Try reloading the page</button>. If the error persists, please get in touch with us so we can assist.',
					'poocommerce'
				),
				{
					button: (
						<button
							className="wc-block-link-button"
							onClick={ reloadPage }
						/>
					),
				}
			) }
			showErrorMessage={ CURRENT_USER_IS_ADMIN }
		>
			<StoreNoticesContainer
				context={ [ noticeContexts.CHECKOUT, noticeContexts.CART ] }
			/>
			{ /* SlotFillProvider need to be defined before CheckoutProvider so fills have the SlotFill context ready when they mount. */ }
			<SlotFillProvider>
				<CheckoutProvider>
					<SidebarLayout
						className={ clsx( 'wc-block-checkout', {
							'has-dark-controls': attributes.hasDarkControls,
						} ) }
					>
						<Checkout attributes={ attributes }>
							{ children }
						</Checkout>
						<ScrollOnError scrollToTop={ scrollToTop } />
					</SidebarLayout>
				</CheckoutProvider>
			</SlotFillProvider>
		</BlockErrorBoundary>
	);
};

export default withScrollToTop( Block );
