/**
 * External dependencies
 */

import {
	createContext,
	useContext,
	useReducer,
	useRef,
	useMemo,
	useEffect,
	useCallback,
} from '@wordpress/element';
import { usePrevious } from '@poocommerce/base-hooks';
import deprecated from '@wordpress/deprecated';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	checkoutStore,
	paymentStore,
	validationStore,
} from '@poocommerce/block-data';
import { store as noticesStore } from '@wordpress/notices';
import type { WPNotice } from '@wordpress/notices/build-types/store/selectors';
import { checkoutEvents } from '@poocommerce/blocks-checkout-events';
import {
	ExpressPaymentMethods,
	PlainExpressPaymentMethods,
} from '@poocommerce/types';
import {
	getExpressPaymentMethods,
	getPaymentMethods,
} from '@poocommerce/blocks-registry';

/**
 * Internal dependencies
 */
import { reducer as emitReducer } from './event-emit';
import { emitterCallback, noticeContexts } from '../../../event-emit';
import { useStoreEvents } from '../../../hooks/use-store-events';

import { useEditorContext } from '../../editor-context';
import { EventListenerRegistrationFunction } from '../../../../../events/event-emitter';

type CheckoutEventsContextType = {
	// Submits the checkout and begins processing.
	onSubmit: () => void;
	// Deprecated in favour of onCheckoutSuccess.
	onCheckoutAfterProcessingWithSuccess: ReturnType< typeof emitterCallback >;
	// Deprecated in favour of onCheckoutFail.
	onCheckoutAfterProcessingWithError: ReturnType< typeof emitterCallback >;
	// Deprecated in favour of onCheckoutValidationBeforeProcessing.
	onCheckoutBeforeProcessing: ReturnType< typeof emitterCallback >;
	// Deprecated in favour of onCheckoutValidation.
	onCheckoutValidationBeforeProcessing: ReturnType< typeof emitterCallback >;
	// Used to register a callback that will fire if the api call to /checkout is successful
	onCheckoutSuccess: EventListenerRegistrationFunction;
	// Used to register a callback that will fire if the api call to /checkout fails
	onCheckoutFail: EventListenerRegistrationFunction;
	// Used to register a callback that will fire when the checkout performs validation on the form
	onCheckoutValidation: EventListenerRegistrationFunction;
};

const CheckoutEventsContext = createContext< CheckoutEventsContextType >( {
	onSubmit: () => void null,
	onCheckoutAfterProcessingWithSuccess: () => () => void null, // deprecated for onCheckoutSuccess
	onCheckoutAfterProcessingWithError: () => () => void null, // deprecated for onCheckoutFail
	onCheckoutBeforeProcessing: () => () => void null, // deprecated for onCheckoutValidationBeforeProcessing
	onCheckoutValidationBeforeProcessing: () => () => void null, // deprecated for onCheckoutValidation
	onCheckoutSuccess: () => () => void null,
	onCheckoutFail: () => () => void null,
	onCheckoutValidation: () => () => void null,
} );

export const useCheckoutEventsContext = () => {
	return useContext( CheckoutEventsContext );
};

/**
 * Checkout Events provider
 * Emit Checkout events and provide access to Checkout event handlers
 *
 * @param {Object} props             Incoming props for the provider.
 * @param {Object} props.children    The children being wrapped.
 * @param {string} props.redirectUrl Initialize what the checkout will redirect to after successful submit.
 */
export const CheckoutEventsProvider = ( {
	children,
	redirectUrl,
}: {
	children: React.ReactNode;
	redirectUrl: string;
} ): JSX.Element => {
	const paymentMethods = getPaymentMethods();
	const expressPaymentMethods = getExpressPaymentMethods();
	/**
	 * Converts registered express payment methods from registry format to plain format
	 * suitable for storage in data stores.
	 *
	 * @param registeredMethods Express payment methods from the registry
	 * @return Plain express payment methods object
	 */
	const convertToPlainExpressPaymentMethods = (
		registeredMethods: ExpressPaymentMethods
	): PlainExpressPaymentMethods => {
		const plainRegisteredMethods: PlainExpressPaymentMethods = {};

		Object.keys( registeredMethods ).forEach( ( methodName ) => {
			const method = registeredMethods[ methodName ];
			plainRegisteredMethods[ methodName ] = {
				name: method.name,
				title: method.title,
				description: method.description,
				gatewayId: method.gatewayId,
				supportsStyle: method.supports?.style || [],
			};
		} );

		return plainRegisteredMethods;
	};

	// Convert registered express payment methods from registry to plain format
	const registeredMethods = getExpressPaymentMethods();

	const { isEditor } = useEditorContext();

	const {
		__internalUpdateAvailablePaymentMethods,
		__internalSetRegisteredExpressPaymentMethods,
	} = useDispatch( paymentStore );

	// Set the registered express payment methods
	useEffect( () => {
		__internalSetRegisteredExpressPaymentMethods(
			convertToPlainExpressPaymentMethods( registeredMethods )
		);
	}, [ registeredMethods ] );

	// Update the payment method store when paymentMethods or expressPaymentMethods changes.
	// Ensure this happens in the editor even if paymentMethods is empty. This won't happen instantly when the objects
	// are updated, but on the next re-render.
	useEffect( () => {
		if (
			! isEditor &&
			Object.keys( paymentMethods ).length === 0 &&
			Object.keys( expressPaymentMethods ).length === 0
		) {
			return;
		}
		__internalUpdateAvailablePaymentMethods();
	}, [
		isEditor,
		paymentMethods,
		expressPaymentMethods,
		__internalUpdateAvailablePaymentMethods,
	] );

	const {
		__internalSetRedirectUrl,
		__internalEmitValidateEvent,
		__internalEmitAfterProcessingEvents,
		__internalSetBeforeProcessing,
	} = useDispatch( checkoutStore );

	const {
		checkoutRedirectUrl,
		checkoutStatus,
		isCheckoutBeforeProcessing,
		isCheckoutAfterProcessing,
		checkoutHasError,
		checkoutOrderId,
		checkoutOrderNotes,
		checkoutCustomerId,
	} = useSelect( ( select ) => {
		const store = select( checkoutStore );
		return {
			checkoutRedirectUrl: store.getRedirectUrl(),
			checkoutStatus: store.getCheckoutStatus(),
			isCheckoutBeforeProcessing: store.isBeforeProcessing(),
			isCheckoutAfterProcessing: store.isAfterProcessing(),
			checkoutHasError: store.hasError(),
			checkoutOrderId: store.getOrderId(),
			checkoutOrderNotes: store.getOrderNotes(),
			checkoutCustomerId: store.getCustomerId(),
		};
	} );

	if ( redirectUrl && redirectUrl !== checkoutRedirectUrl ) {
		__internalSetRedirectUrl( redirectUrl );
	}

	const { setValidationErrors } = useDispatch( validationStore );
	const { dispatchCheckoutEvent } = useStoreEvents();

	const checkoutContexts = Object.values( noticeContexts ).filter(
		( context ) =>
			context !== noticeContexts.PAYMENTS &&
			context !== noticeContexts.EXPRESS_PAYMENTS
	);

	const checkoutNotices = useSelect(
		( select ) => {
			const { getNotices } = select( noticesStore );
			return checkoutContexts.reduce( ( acc, context ) => {
				return [ ...acc, ...getNotices( context ) ];
			}, [] as WPNotice[] );
		},
		[ checkoutContexts ]
	);

	const { paymentNotices, expressPaymentNotices } = useSelect( ( select ) => {
		const { getNotices } = select( noticesStore );
		return {
			paymentNotices: getNotices( noticeContexts.PAYMENTS ),
			expressPaymentNotices: getNotices(
				noticeContexts.EXPRESS_PAYMENTS
			),
		};
	}, [] );

	const [ observers ] = useReducer( emitReducer, {} );
	const currentObservers = useRef( observers );
	const { onCheckoutValidation, onCheckoutSuccess, onCheckoutFail } =
		checkoutEvents;

	// set observers on ref so it's always current.
	useEffect( () => {
		currentObservers.current = observers;
	}, [ observers ] );

	/**
	 * @deprecated use onCheckoutValidation instead
	 *
	 * To prevent the deprecation message being shown at render time
	 * we need an extra function between useMemo and event emitters
	 * so that the deprecated message gets shown only at invocation time.
	 * (useMemo calls the passed function at render time)
	 * See: https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/4039/commits/a502d1be8828848270993264c64220731b0ae181
	 */
	const onCheckoutBeforeProcessing = useMemo( () => {
		return function ( ...args: Parameters< typeof onCheckoutValidation > ) {
			deprecated( 'onCheckoutBeforeProcessing', {
				alternative: 'onCheckoutValidation',
				plugin: 'PooCommerce Blocks',
			} );
			return onCheckoutValidation( ...args );
		};
	}, [ onCheckoutValidation ] );

	/**
	 * @deprecated use onCheckoutValidation instead
	 */
	const onCheckoutValidationBeforeProcessing = useMemo( () => {
		return function ( ...args: Parameters< typeof onCheckoutValidation > ) {
			deprecated( 'onCheckoutValidationBeforeProcessing', {
				since: '9.7.0',
				alternative: 'onCheckoutValidation',
				plugin: 'PooCommerce Blocks',
				link: 'https://github.com/poocommerce/poocommerce-blocks/pull/8381',
			} );
			return onCheckoutValidation( ...args );
		};
	}, [ onCheckoutValidation ] );

	/**
	 * @deprecated use onCheckoutSuccess instead
	 */
	const onCheckoutAfterProcessingWithSuccess = useMemo( () => {
		return function ( ...args: Parameters< typeof onCheckoutSuccess > ) {
			deprecated( 'onCheckoutAfterProcessingWithSuccess', {
				since: '9.7.0',
				alternative: 'onCheckoutSuccess',
				plugin: 'PooCommerce Blocks',
				link: 'https://github.com/poocommerce/poocommerce-blocks/pull/8381',
			} );
			return onCheckoutSuccess( ...args );
		};
	}, [ onCheckoutSuccess ] );

	/**
	 * @deprecated use onCheckoutFail instead
	 */
	const onCheckoutAfterProcessingWithError = useMemo( () => {
		return function ( ...args: Parameters< typeof onCheckoutFail > ) {
			deprecated( 'onCheckoutAfterProcessingWithError', {
				since: '9.7.0',
				alternative: 'onCheckoutFail',
				plugin: 'PooCommerce Blocks',
				link: 'https://github.com/poocommerce/poocommerce-blocks/pull/8381',
			} );
			return onCheckoutFail( ...args );
		};
	}, [ onCheckoutFail ] );

	// Emit CHECKOUT_VALIDATE event and set the error state based on the response of
	// the registered callbacks
	useEffect( () => {
		if ( isCheckoutBeforeProcessing ) {
			__internalEmitValidateEvent( {
				setValidationErrors,
			} );
		}
	}, [
		isCheckoutBeforeProcessing,
		setValidationErrors,
		__internalEmitValidateEvent,
	] );

	const previousStatus = usePrevious( checkoutStatus );
	const previousHasError = usePrevious( checkoutHasError );

	// Emit CHECKOUT_SUCCESS and CHECKOUT_FAIL events
	// and set checkout errors according to the callback responses
	useEffect( () => {
		if (
			checkoutStatus === previousStatus &&
			checkoutHasError === previousHasError
		) {
			return;
		}

		if ( isCheckoutAfterProcessing ) {
			__internalEmitAfterProcessingEvents( {
				notices: {
					checkoutNotices,
					paymentNotices,
					expressPaymentNotices,
				},
			} );
		}
	}, [
		checkoutStatus,
		checkoutHasError,
		checkoutRedirectUrl,
		checkoutOrderId,
		checkoutCustomerId,
		checkoutOrderNotes,
		isCheckoutAfterProcessing,
		isCheckoutBeforeProcessing,
		previousStatus,
		previousHasError,
		checkoutNotices,
		expressPaymentNotices,
		paymentNotices,
		__internalEmitValidateEvent,
		__internalEmitAfterProcessingEvents,
	] );

	const onSubmit = useCallback( () => {
		dispatchCheckoutEvent( 'submit' );
		__internalSetBeforeProcessing();
	}, [ dispatchCheckoutEvent, __internalSetBeforeProcessing ] );

	const checkoutEventHandlers = {
		onSubmit,
		onCheckoutBeforeProcessing,
		onCheckoutValidationBeforeProcessing,
		onCheckoutAfterProcessingWithSuccess,
		onCheckoutAfterProcessingWithError,
		onCheckoutSuccess,
		onCheckoutFail,
		onCheckoutValidation,
	};
	return (
		<CheckoutEventsContext.Provider value={ checkoutEventHandlers }>
			{ children }
		</CheckoutEventsContext.Provider>
	);
};
