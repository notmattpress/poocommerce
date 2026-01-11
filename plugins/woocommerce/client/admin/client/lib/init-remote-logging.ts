/**
 * External dependencies
 */
import { init } from '@poocommerce/remote-logging';

export const initRemoteLogging = () => {
	init( {
		errorRateLimitMs: 60000, // 1 minute
	} );
};
