/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';

export default {
	showRateAfterTaxName: {
		type: 'boolean',
		default: getSetting( 'displayCartPricesIncludingTax', false ),
	},
	lock: {
		type: 'object',
		default: {
			remove: true,
			move: false,
		},
	},
};
