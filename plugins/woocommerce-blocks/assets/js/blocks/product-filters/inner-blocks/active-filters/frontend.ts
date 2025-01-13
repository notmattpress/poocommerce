/**
 * External dependencies
 */
import { store, getContext } from '@poocommerce/interactivity';

/**
 * Internal dependencies
 */
import { ProductFiltersContext } from '../../frontend';

store( 'poocommerce/product-filter-active', {
	actions: {
		clearFilters: () => {
			const productFiltersContext = getContext< ProductFiltersContext >(
				'poocommerce/product-filters'
			);
			productFiltersContext.params = {};
		},
	},
} );
