/**
 * External dependencies
 */
import { OrderFormValues } from '@poocommerce/settings';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import { ACTION_TYPES as types } from './action-types';

// Thunks are functions that can be dispatched, similar to actions creators.
export * from './thunks';

/**
 * Set the checkout status to `idle`
 */
export const __internalSetIdle = () => ( {
	type: types.SET_IDLE,
} );

/**
 * Set the checkout status to `before_processing`
 */
export const __internalSetBeforeProcessing = () => ( {
	type: types.SET_BEFORE_PROCESSING,
} );

/**
 * Set the checkout status to `processing`
 */
export const __internalSetProcessing = () => ( {
	type: types.SET_PROCESSING,
} );

/**
 * Set the checkout status to `after_processing`
 */
export const __internalSetAfterProcessing = () => ( {
	type: types.SET_AFTER_PROCESSING,
} );

/**
 * Set the checkout status to `complete`
 */
export const __internalSetComplete = (
	data: Record< string, unknown > = {}
) => ( {
	type: types.SET_COMPLETE,
	data,
} );

/**
 * Set the url to redirect to after checkout completes`
 *
 * @param redirectUrl the url to redirect to
 */
export const __internalSetRedirectUrl = ( redirectUrl: string ) => ( {
	type: types.SET_REDIRECT_URL,
	redirectUrl,
} );

/**
 * Set whether the checkout has an error
 *
 * @param hasError Whether the checkout has an error
 */
export const __internalSetHasError = ( hasError = true ) => ( {
	type: types.SET_HAS_ERROR,
	hasError,
} );

/**
 * Signals the start of a singular calculation process for totals, taxes,
 * shipping, etc. Increases the `calculatingCount` which tracks ongoing
 * calculations. A `calculatingCount` of 0 means nothing is being updated.
 */
export const __internalStartCalculation = () => ( {
	type: types.INCREMENT_CALCULATING,
} );

/**
 * Signals the completion of a singular calculation process for totals, taxes,
 * shipping, etc. Increases the `calculatingCount` which tracks ongoing
 * calculations. A `calculatingCount` of 0 means nothing is being updated.
 */
export const __internalFinishCalculation = () => ( {
	type: types.DECREMENT_CALCULATING,
} );

/**
 * @deprecated Use disableCheckoutFor thunk instead
 */
export const __internalIncrementCalculating = () => {
	deprecated( '__internalIncrementCalculating', {
		alternative: 'disableCheckoutFor',
		plugin: 'PooCommerce',
		version: '9.9.0',
	} );
	return {
		type: types.INCREMENT_CALCULATING,
	};
};

/**
 * @deprecated Use disableCheckoutFor thunk instead
 */
export const __internalDecrementCalculating = () => {
	deprecated( '__internalDecrementCalculating', {
		alternative: 'disableCheckoutFor',
		plugin: 'PooCommerce',
		version: '9.9.0',
	} );
	return {
		type: types.DECREMENT_CALCULATING,
	};
};

/**
 * Set the customer id
 *
 * @param customerId ID of the customer who is checking out.
 */
export const __internalSetCustomerId = ( customerId: number ) => ( {
	type: types.SET_CUSTOMER_ID,
	customerId,
} );

/**
 * Set the customer password
 *
 * @param customerPassword Account password for the customer when creating accounts
 */
export const __internalSetCustomerPassword = ( customerPassword: string ) => ( {
	type: types.SET_CUSTOMER_PASSWORD,
	customerPassword,
} );

/**
 * Whether to use the shipping address as the billing address
 *
 * @param useShippingAsBilling True if shipping address should be the same as billing, false otherwise
 */
export const __internalSetUseShippingAsBilling = (
	useShippingAsBilling: boolean
) => ( {
	type: types.SET_USE_SHIPPING_AS_BILLING,
	useShippingAsBilling,
} );

/**
 * Set whether the billing address is being edited
 *
 * @param isEditing True if the billing address is being edited, false otherwise
 */
export const setEditingBillingAddress = ( isEditing: boolean ) => {
	return {
		type: types.SET_EDITING_BILLING_ADDRESS,
		isEditing,
	};
};

/**
 * Set whether the shipping address is being edited
 *
 * @param isEditing True if the shipping address is being edited, false otherwise
 */
export const setEditingShippingAddress = ( isEditing: boolean ) => {
	return {
		type: types.SET_EDITING_SHIPPING_ADDRESS,
		isEditing,
	};
};

/**
 * Whether an account should be created for the user while checking out
 *
 * @param shouldCreateAccount True if an account should be created, false otherwise
 */
export const __internalSetShouldCreateAccount = (
	shouldCreateAccount: boolean
) => ( {
	type: types.SET_SHOULD_CREATE_ACCOUNT,
	shouldCreateAccount,
} );

/**
 * Sets shipping address locally, as opposed to updateCustomerData which sends it to the server.
 */
export const setAdditionalFields = ( additionalFields: OrderFormValues ) =>
	( { type: types.SET_ADDITIONAL_FIELDS, additionalFields } as const );

/**
 * Set the notes for the order
 *
 * @param orderNotes String that represents a note for the order
 */
export const __internalSetOrderNotes = ( orderNotes: string ) => ( {
	type: types.SET_ORDER_NOTES,
	orderNotes,
} );

export const setPrefersCollection = ( prefersCollection: boolean ) => ( {
	type: types.SET_PREFERS_COLLECTION,
	prefersCollection,
} );

/**
 * Registers additional data under an extension namespace.
 */
export const setExtensionData = (
	// The namespace for the extension. Defaults to 'default'. Must be unique to prevent conflicts.
	namespace: string,
	// Data to register under the namespace.
	extensionData: Record< string, unknown >,
	// If true, all data under the current extension namespace is replaced. If false, data is appended.
	replace = false
) => ( {
	type: types.SET_EXTENSION_DATA,
	extensionData,
	namespace,
	replace,
} );

/**
 * @deprecated Use setExtensionData instead
 */
export const __internalSetExtensionData = (
	...args: Parameters< typeof setExtensionData >
) => {
	deprecated( '__internalSetExtensionData', {
		alternative: 'setExtensionData',
		plugin: 'PooCommerce',
		version: '9.9.0',
	} );
	return setExtensionData( ...args );
};
