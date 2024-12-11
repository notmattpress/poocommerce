/**
 * External dependencies
 */
import { ObserverResponse } from '@poocommerce/base-context';
import { isObject, objectHasProp } from '@poocommerce/types';

/**
 * Whether the passed object is an ObserverResponse.
 */
export const isObserverResponse = (
	response: unknown
): response is ObserverResponse => {
	return isObject( response ) && objectHasProp( response, 'type' );
};
