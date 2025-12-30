/**
 * External dependencies
 */
import { getContext, store } from '@wordpress/interactivity';

type CheckboxListContext = {
	showAll: boolean;
};

store( 'poocommerce/product-filters', {
	actions: {
		showAllListItems: () => {
			const context = getContext< CheckboxListContext >();
			context.showAll = true;
		},
	},
} );
