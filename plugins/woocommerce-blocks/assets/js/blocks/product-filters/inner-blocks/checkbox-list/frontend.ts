/**
 * External dependencies
 */
import { getContext, store } from '@poocommerce/interactivity';

type CheckboxListContext = {
	showAll: boolean;
};

store( 'poocommerce/product-filter-checkbox-list', {
	actions: {
		showAllItems: () => {
			const context = getContext< CheckboxListContext >();
			context.showAll = true;
		},
	},
} );
