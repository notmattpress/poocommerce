/**
 * External dependencies
 */
import { getContext, store } from '@poocommerce/interactivity';

/**
 * Internal dependencies
 */

export type ChipsContext = {
	showAll: boolean;
};

store( 'poocommerce/product-filter-chips', {
	actions: {
		showAllItems: () => {
			const context = getContext< ChipsContext >();
			context.showAll = true;
		},
	},
} );
