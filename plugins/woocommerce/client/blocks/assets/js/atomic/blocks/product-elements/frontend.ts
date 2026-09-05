/**
 * External dependencies
 */
import { getElement, store, getContext } from '@wordpress/interactivity';
import '@poocommerce/stores/poocommerce/products';
import type { ProductsStore } from '@poocommerce/stores/poocommerce/products';
import type { ProductResponseItem } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import {
	swapPreformattedHtml,
	PRODUCT_ELEMENT_HTML_CONFIG,
} from '../../../base/utils/preformatted-html';

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

const { state: productsState } = store< ProductsStore >(
	'poocommerce/products',
	{},
	{ lock: universalLock }
);

type Context = {
	productElementKey: keyof ProductResponseItem;
};

store(
	'poocommerce/product-elements',
	{
		callbacks: {
			updateValue: () => {
				const product = productsState.productInContext;

				if ( ! product ) {
					return;
				}

				const { productElementKey } = getContext< Context >();

				swapPreformattedHtml(
					getElement().ref,
					product[ productElementKey ],
					PRODUCT_ELEMENT_HTML_CONFIG
				);
			},
		},
	},
	{ lock: true }
);
