/**
 * External dependencies
 */
import { getElement, store, getContext } from '@wordpress/interactivity';
import '@poocommerce/stores/poocommerce/product-data';
import type { ProductDataStore } from '@poocommerce/stores/poocommerce/product-data';
import type { Store as PooCommerce } from '@poocommerce/stores/poocommerce/cart';
import { sanitize } from 'dompurify'; // eslint-disable-line import/named

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

const { state: wooState } = store< PooCommerce >(
	'poocommerce',
	{},
	{ lock: universalLock }
);

const { state: productDataState } = store< ProductDataStore >(
	'poocommerce/product-data',
	{},
	{ lock: universalLock }
);

const ALLOWED_TAGS = [
	'a',
	'b',
	'em',
	'i',
	'strong',
	'p',
	'br',
	'span',
	'bdi',
	'del',
	'ins',
];
const ALLOWED_ATTR = [
	'class',
	'target',
	'href',
	'rel',
	'name',
	'download',
	'aria-hidden',
];

export type Context = {
	productElementKey: 'price_html' | 'availability';
};

const productElementStore = store(
	'poocommerce/product-elements',
	{
		callbacks: {
			updateValue: () => {
				const element = getElement();

				if ( ! element.ref || ! productDataState?.productId ) {
					return;
				}

				const { productElementKey } = getContext< Context >();

				const productElementHtml =
					wooState?.products?.[ productDataState?.productId ]
						?.variations?.[ productDataState?.variationId || 0 ]?.[
						productElementKey
					] ||
					wooState?.products?.[ productDataState?.productId ]?.[
						productElementKey
					];

				if ( typeof productElementHtml === 'string' ) {
					element.ref.innerHTML = sanitize( productElementHtml, {
						ALLOWED_TAGS,
						ALLOWED_ATTR,
					} );
				}
			},
		},
	},
	{ lock: true }
);

export type ProductElementStore = typeof productElementStore;
