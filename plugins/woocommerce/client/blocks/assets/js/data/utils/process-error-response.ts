/**
 * External dependencies
 */
import { createNotice, DEFAULT_ERROR_MESSAGE } from '@poocommerce/base-utils';
import { decodeEntities } from '@wordpress/html-entities';
import {
	objectHasProp,
	ApiErrorResponse,
	isApiErrorResponse,
	ApiErrorResponseData,
	isObject,
	isString,
} from '@poocommerce/types';
import { noticeContexts } from '@poocommerce/base-context/event-emit/utils';

type ApiParamError = {
	param: string;
	id: string;
	code: string;
	message: string;
	data?: ApiErrorResponseData;
};

/**
 * Flattens error details which are returned from the API when multiple params are not valid.
 *
 * - Codes will be prefixed with the param. For example, `invalid_email` becomes `billing_address_invalid_email`.
 * - Additional error messages will be flattened alongside the main error message.
 * - Supports 1 level of nesting.
 * - Decodes HTML entities in error messages.
 */
export const getErrorDetails = (
	response: ApiErrorResponse
): ApiParamError[] => {
	const errorDetails = objectHasProp( response.data, 'details' )
		? Object.entries( response.data.details )
		: null;

	if ( ! errorDetails ) {
		return [];
	}

	return errorDetails.reduce(
		(
			acc,
			[
				param,
				{
					code,
					message,
					additional_errors: additionalErrors = [],
					data,
				},
			]
		) => {
			return [
				...acc,
				{
					param,
					id: `${ param }_${ code }`,
					code,
					message: decodeEntities( message ),
					data,
				},
				...( Array.isArray( additionalErrors )
					? additionalErrors.flatMap( ( additionalError ) => {
							if (
								! objectHasProp( additionalError, 'code' ) ||
								! objectHasProp( additionalError, 'message' )
							) {
								return [];
							}
							const errorObject = [
								{
									param,
									id: `${ param }_${ additionalError.code }`,
									code: additionalError.code,
									message: decodeEntities(
										additionalError.message
									),
									data: additionalError.data,
								},
							];
							if ( typeof additionalError.data !== 'undefined' ) {
								return [
									...errorObject,
									...getErrorDetails( additionalError ),
								];
							}
							return errorObject;
					  } )
					: [] ),
			];
		},
		[] as ApiParamError[]
	);
};

/**
 * Gets appropriate error context from error code.
 */
const getErrorContextFromCode = ( code: string ): string => {
	switch ( code ) {
		case 'poocommerce_rest_missing_email_address':
		case 'poocommerce_rest_invalid_email_address':
			return noticeContexts.CONTACT_INFORMATION;
		default:
			return noticeContexts.CART;
	}
};

/**
 * Gets appropriate error context from error param name. Also checks the error code to check if it's an email error
 * (Email is part of the billing address).
 */
const getErrorContextFromParam = (
	param: string,
	code: string
): string | undefined => {
	switch ( param ) {
		case 'invalid_email':
			return noticeContexts.CONTACT_INFORMATION;
		case 'billing_address':
			if ( code === 'invalid_email' ) {
				return noticeContexts.CONTACT_INFORMATION;
			}
			return noticeContexts.BILLING_ADDRESS;
		case 'shipping_address':
			return noticeContexts.SHIPPING_ADDRESS;
		default:
			return undefined;
	}
};

/**
 * Gets appropriate error context from additional field location.
 */
const getErrorContextFromAdditionalFieldLocation = (
	location: string
): string | undefined => {
	switch ( location ) {
		case 'contact':
			return noticeContexts.CONTACT_INFORMATION;
		case 'order':
			return noticeContexts.ORDER_INFORMATION;
		default:
			return undefined;
	}
};

/**
 * Gets a set of options to generate a notice for an invalid param error.
 */
const getNoticeOptionsForParamError = (
	{ code, id, param, data }: ApiParamError,
	context?: string
) => {
	let additionalFieldContext: string | undefined = '';
	let additionalFieldId: string | undefined = '';
	// Check if this error response comes from an additional field.
	if (
		isObject( data ) &&
		objectHasProp( data, 'key' ) &&
		objectHasProp( data, 'location' ) &&
		isString( data.location )
	) {
		additionalFieldContext = getErrorContextFromAdditionalFieldLocation(
			data.location
		);
	}

	// If the error response comes from an additional field we need to use the key as the ID so we can remove it later.
	// It's also needed to ensure additional fields don't replace each other when there are multiple.
	if ( objectHasProp( data, 'key' ) && isString( data.key ) ) {
		additionalFieldId = `${ data.key }__${ id }`;
	}

	return {
		id: additionalFieldId || id,
		context:
			context ||
			additionalFieldContext ||
			getErrorContextFromParam( param, code ) ||
			getErrorContextFromCode( code ),
	};
};

/**
 * For each invalid param in an error response, create an error notice.
 */
const createErrorNoticesForInvalidParams = (
	response: ApiErrorResponse,
	context: string | undefined
) => {
	const errorDetails = getErrorDetails( response );

	errorDetails.forEach( ( error ) => {
		createNotice(
			'error',
			error.message,
			getNoticeOptionsForParamError( error, context )
		);
	} );
};

/**
 * Get the notice options for an error response with param errors.
 */
export const getInvalidParamNoticeContext = (
	errorResponse: ApiErrorResponse,
	context?: string | undefined
) => {
	const errorDetails = getErrorDetails( errorResponse );

	return errorDetails.map( ( error ) => {
		return getNoticeOptionsForParamError( error, context );
	} );
};

/**
 * Get the notice options for an error notice.
 */
export const getNoticeContextFromErrorResponse = (
	errorResponse: ApiErrorResponse,
	context?: string | undefined
) => {
	if ( errorResponse.code === 'rest_invalid_param' ) {
		return getInvalidParamNoticeContext( errorResponse, context );
	}

	return [
		{
			id: errorResponse.code,
			context:
				context ||
				errorResponse?.data?.context ||
				getErrorContextFromCode( errorResponse.code ),
		},
	];
};

/**
 * Takes an API response object and creates error notices to display to the customer.
 *
 * This is where we can handle specific error codes and display notices in specific contexts.
 */
export const processErrorResponse = (
	response: ApiErrorResponse | null,
	context?: string | undefined
) => {
	if ( ! isApiErrorResponse( response ) ) {
		return;
	}

	if ( response.code === 'rest_invalid_param' ) {
		return createErrorNoticesForInvalidParams( response, context );
	}

	let errorMessage =
		decodeEntities( response.message ) || DEFAULT_ERROR_MESSAGE;

	// Replace the generic invalid JSON message with something more user friendly.
	if ( response.code === 'invalid_json' ) {
		errorMessage = DEFAULT_ERROR_MESSAGE;
	}

	createNotice( 'error', errorMessage, {
		id: response.code,
		context:
			context ||
			response?.data?.context ||
			getErrorContextFromCode( response.code ),
	} );
};
