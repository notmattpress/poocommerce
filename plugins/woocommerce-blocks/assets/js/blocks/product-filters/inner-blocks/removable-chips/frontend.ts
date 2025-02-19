/**
 * External dependencies
 */
import { store } from '@poocommerce/interactivity';

/**
 * Internal dependencies
 */
import { ProductFilterActiveStore } from '../active-filters/frontend';

store( 'poocommerce/product-filter-removable-chips', {
	state: {
		get items() {
			const productFilterActiveStore = store< ProductFilterActiveStore >(
				'poocommerce/product-filter-active'
			);

			return productFilterActiveStore.state.items.map( ( item ) => ( {
				...item,
				label: item.label.replace( /\s*\(\d+\)$/, '' ),
			} ) );
		},
	},
} );
