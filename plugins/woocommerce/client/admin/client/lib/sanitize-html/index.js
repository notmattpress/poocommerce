/**
 * External dependencies
 */
import { sanitizeHTML } from '@poocommerce/sanitize';

export default ( html ) => {
	return {
		__html: sanitizeHTML( html ),
	};
};
