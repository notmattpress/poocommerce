/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { ACTION_TYPES } from './action-types';
import {
	PaymentsProvider,
	OfflinePaymentMethodProvider,
	OrderMap,
	SuggestedPaymentsExtension,
	SuggestedPaymentsExtensionCategory,
	EnableGatewayResponse,
} from './types';
import { WC_ADMIN_NAMESPACE } from '../constants';

export function getPaymentProvidersRequest(): {
	type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_REQUEST;
} {
	return {
		type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_REQUEST,
	};
}

export function getPaymentProvidersSuccess(
	providers: PaymentsProvider[],
	offlinePaymentGateways: OfflinePaymentMethodProvider[],
	suggestions: SuggestedPaymentsExtension[],
	suggestionCategories: SuggestedPaymentsExtensionCategory[]
): {
	type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_SUCCESS;
	providers: PaymentsProvider[];
	offlinePaymentGateways: OfflinePaymentMethodProvider[];
	suggestions: SuggestedPaymentsExtension[];
	suggestionCategories: SuggestedPaymentsExtensionCategory[];
} {
	return {
		type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_SUCCESS,
		providers,
		offlinePaymentGateways,
		suggestions,
		suggestionCategories,
	};
}

export function getPaymentProvidersError( error: unknown ): {
	type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_ERROR;
	error: unknown;
} {
	return {
		type: ACTION_TYPES.GET_PAYMENT_PROVIDERS_ERROR,
		error,
	};
}

/**
 * Toggle the enabled state of a payment gateway.
 * This function makes an AJAX request to the server to toggle the gateway's enabled state.
 *
 * See `WC_AJAX::toggle_gateway_enabled()` for the response structure.
 *
 * @param {string} gatewayId          The ID of the payment gateway to toggle.
 * @param {string} ajaxUrl            The URL to send the AJAX request to, typically the admin-ajax.php endpoint.
 * @param {string} gatewayToggleNonce The nonce for security, used to verify the request.
 *
 * @return {Generator<void, EnableGatewayResponse, unknown>} Server response with the updated gateway state.
 */
export function* togglePaymentGateway(
	gatewayId: string,
	ajaxUrl: string,
	gatewayToggleNonce: string
) {
	try {
		// Use apiFetch for the AJAX request
		const result: EnableGatewayResponse = yield apiFetch( {
			url: ajaxUrl,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'poocommerce_toggle_gateway_enabled',
				security: gatewayToggleNonce,
				gateway_id: gatewayId,
			} ),
		} );

		return result;
	} catch ( error ) {
		throw error;
	}
}

export function* attachPaymentExtensionSuggestion( url: string ) {
	try {
		// Use apiFetch for the AJAX request
		const result: { success: boolean } = yield apiFetch( {
			url,
			method: 'POST',
		} );

		return result;
	} catch ( error ) {
		throw error;
	}
}

export function* hidePaymentExtensionSuggestion( url: string ) {
	try {
		// Use apiFetch for the AJAX request
		const result: { success: boolean } = yield apiFetch( {
			url,
			method: 'POST',
		} );

		return result;
	} catch ( error ) {
		throw error;
	}
}

export function updateProviderOrdering( orderMap: OrderMap ): {
	type: ACTION_TYPES.UPDATE_PROVIDER_ORDERING;
} {
	try {
		apiFetch( {
			path: WC_ADMIN_NAMESPACE + '/settings/payments/providers/order',
			method: 'POST',
			data: {
				order_map: orderMap,
			},
		} );
	} catch ( error ) {
		throw error;
	}

	return {
		type: ACTION_TYPES.UPDATE_PROVIDER_ORDERING,
	};
}

export function setIsWooPayEligible( isEligible: boolean ): {
	type: ACTION_TYPES.SET_IS_ELIGIBLE;
	isEligible: boolean;
} {
	return {
		type: ACTION_TYPES.SET_IS_ELIGIBLE,
		isEligible,
	};
}

export type Actions =
	| ReturnType< typeof getPaymentProvidersRequest >
	| ReturnType< typeof getPaymentProvidersSuccess >
	| ReturnType< typeof getPaymentProvidersError >
	| ReturnType< typeof togglePaymentGateway >
	| ReturnType< typeof attachPaymentExtensionSuggestion >
	| ReturnType< typeof hidePaymentExtensionSuggestion >
	| ReturnType< typeof updateProviderOrdering >
	| ReturnType< typeof setIsWooPayEligible >;
