/**
 * External dependencies
 */
import { store } from '@wordpress/interactivity';
import type { ProductResponseItem } from '@poocommerce/types';
import '@poocommerce/stores/poocommerce/products';
import type { ProductsStore } from '@poocommerce/stores/poocommerce/products';

/**
 * Product and variation data in the `poocommerce` store, keyed by ID, in
 * Store API format. Read-only: product data is loaded from PHP.
 */
export type ProductDataState = {
	readonly products: Readonly< Record< number, ProductResponseItem > >;
	readonly productVariations: Readonly<
		Record< number, ProductResponseItem >
	>;
};

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

const { state: productsState } = store< ProductsStore >(
	'poocommerce/products',
	{},
	{ lock: universalLock }
);

// Temporary: until every block reads product data from `poocommerce`, these
// getters return the `poocommerce/products` data instead of a copy. The store
// then holds the data itself, and code that reads it doesn't change.
store< { state: ProductDataState } >(
	'poocommerce',
	{
		state: {
			get products() {
				return productsState.products;
			},
			get productVariations() {
				return productsState.productVariations;
			},
		},
	},
	{ lock: universalLock }
);
