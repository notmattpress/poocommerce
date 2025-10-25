/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import {
	ENTREPRENEUR_FLOW_QUERY_PARAM_VALUE,
	isEntrepreneurFlow,
} from '../entrepreneur-flow';
import { isWooExpress } from '~/utils/is-woo-express';

export const trackEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => {
	if ( isWooExpress() && isEntrepreneurFlow() ) {
		recordEvent( eventName, {
			...properties,
			ref: ENTREPRENEUR_FLOW_QUERY_PARAM_VALUE,
		} );
		return;
	}

	recordEvent( eventName, properties );
};
