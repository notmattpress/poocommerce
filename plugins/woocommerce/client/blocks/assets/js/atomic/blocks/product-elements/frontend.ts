/**
 * External dependencies
 */
import {
	getElement,
	store,
	getContext,
	getConfig,
} from '@wordpress/interactivity';
import '@poocommerce/stores/poocommerce/product-data';
import type { ProductDataStore } from '@poocommerce/stores/poocommerce/product-data';
import type {
	ProductData,
	PooCommerceConfig,
} from '@poocommerce/stores/poocommerce/cart';
import { sanitizeHTML } from '@poocommerce/sanitize';

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

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
	productElementKey:
		| 'price_html'
		| 'availability'
		| 'sku'
		| 'weight'
		| 'dimensions';
};

const productElementStore = store(
	'poocommerce/product-elements',
	{
		state: {
			get productData(): ProductData | undefined {
				if ( ! productDataState?.productId ) {
					return undefined;
				}

				const { products } = getConfig(
					'poocommerce'
				) as PooCommerceConfig;

				if ( ! products ) {
					return undefined;
				}

				return (
					products?.[ productDataState.productId ]?.variations?.[
						productDataState?.variationId || 0
					] || products?.[ productDataState.productId ]
				);
			},
		},
		callbacks: {
			updateValue: () => {
				const element = getElement();

				if ( ! element.ref || ! productDataState?.productId ) {
					return;
				}

				const { productElementKey } = getContext< Context >();

				const productElementHtml =
					productElementStore?.state?.productData?.[
						productElementKey
					];

				if ( typeof productElementHtml === 'string' ) {
					element.ref.innerHTML = sanitizeHTML( productElementHtml, {
						tags: ALLOWED_TAGS,
						attr: ALLOWED_ATTR,
					} );
				}
			},
		},
	},
	{ lock: true }
);

export type ProductElementStore = typeof productElementStore;
