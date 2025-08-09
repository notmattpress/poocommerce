/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEditorContext, noticeContexts } from '@poocommerce/base-context';
import { Title, StoreNoticesContainer } from '@poocommerce/blocks-components';
import { CURRENT_USER_IS_ADMIN } from '@poocommerce/settings';
import { checkoutStore, paymentStore } from '@poocommerce/block-data';
import { useSelect } from '@wordpress/data';
import { Skeleton } from '@poocommerce/base-components/skeleton';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import ExpressPaymentMethods from '../express-payment-methods';
import './style.scss';
import { getExpressPaymentMethodsState } from './express-payment-methods-helpers';

const CheckoutExpressPayment = () => {
	const {
		isCalculating,
		isProcessing,
		isAfterProcessing,
		isBeforeProcessing,
		isComplete,
		hasError,
		availableExpressPaymentMethods = {},
		expressPaymentMethodsInitialized,
		isExpressPaymentMethodActive,
		registeredExpressPaymentMethods = {},
	} = useSelect( ( select ) => {
		const checkout = select( checkoutStore );
		const payment = select( paymentStore );
		return {
			isCalculating: checkout.isCalculating(),
			isProcessing: checkout.isProcessing(),
			isAfterProcessing: checkout.isAfterProcessing(),
			isBeforeProcessing: checkout.isBeforeProcessing(),
			isComplete: checkout.isComplete(),
			hasError: checkout.hasError(),
			availableExpressPaymentMethods:
				payment.getAvailableExpressPaymentMethods(),
			expressPaymentMethodsInitialized:
				payment.expressPaymentMethodsInitialized(),
			isExpressPaymentMethodActive:
				payment.isExpressPaymentMethodActive(),
			registeredExpressPaymentMethods:
				payment.getRegisteredExpressPaymentMethods(),
		};
	}, [] );
	const { isEditor } = useEditorContext();

	const {
		hasRegisteredExpressPaymentMethods,
		hasRegisteredNotInitializedExpressPaymentMethods,
		hasNoValidRegisteredExpressPaymentMethods,
		availableExpressPaymentsCount,
	} = getExpressPaymentMethodsState( {
		availableExpressPaymentMethods,
		expressPaymentMethodsInitialized,
		registeredExpressPaymentMethods,
	} );

	if (
		! hasRegisteredExpressPaymentMethods ||
		hasNoValidRegisteredExpressPaymentMethods
	) {
		// Make sure errors are shown in the editor and for admins. For example,
		// when a payment method fails to register.
		if ( isEditor || CURRENT_USER_IS_ADMIN ) {
			return (
				<StoreNoticesContainer
					context={ noticeContexts.EXPRESS_PAYMENTS }
				/>
			);
		}
		return null;
	}

	// Set loading state for express payment methods when payment or checkout is in progress.
	const checkoutProcessing =
		isProcessing ||
		isAfterProcessing ||
		isBeforeProcessing ||
		( isComplete && ! hasError );

	return (
		<>
			<div
				className={ clsx(
					'wc-block-components-express-payment',
					'wc-block-components-express-payment--checkout',
					{
						'wc-block-components-express-payment--disabled':
							isExpressPaymentMethodActive || checkoutProcessing,
					}
				) }
				aria-disabled={
					isExpressPaymentMethodActive || checkoutProcessing
				}
				aria-busy={ checkoutProcessing }
				aria-live="polite"
				aria-label={ __(
					'Processing express checkout',
					'poocommerce'
				) }
			>
				<div className="wc-block-components-express-payment__title-container">
					<Title
						className="wc-block-components-express-payment__title"
						headingLevel="2"
					>
						{ hasRegisteredNotInitializedExpressPaymentMethods ? (
							<Skeleton
								width="127px"
								height="18px"
								ariaMessage={ __(
									'Loading express payment area…',
									'poocommerce'
								) }
							/>
						) : (
							__( ' Express Checkout', 'poocommerce' )
						) }
					</Title>
				</div>
				<div className="wc-block-components-express-payment__content">
					<StoreNoticesContainer
						context={ noticeContexts.EXPRESS_PAYMENTS }
					/>
					{ isCalculating ||
					hasRegisteredNotInitializedExpressPaymentMethods ? (
						<ul className="wc-block-components-express-payment__event-buttons">
							{ Array.from( {
								length: availableExpressPaymentsCount,
							} ).map( ( _, index ) => (
								<li key={ index }>
									<Skeleton
										height="48px"
										ariaMessage={ __(
											'Loading express payment method…',
											'poocommerce'
										) }
									/>
								</li>
							) ) }
						</ul>
					) : (
						<ExpressPaymentMethods />
					) }
				</div>
			</div>
			<div className="wc-block-components-express-payment-continue-rule wc-block-components-express-payment-continue-rule--checkout">
				{ __( 'Or continue below', 'poocommerce' ) }
			</div>
		</>
	);
};

export default CheckoutExpressPayment;
