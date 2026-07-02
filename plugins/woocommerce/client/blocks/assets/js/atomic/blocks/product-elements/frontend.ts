/**
 * External dependencies
 */
import { getElement, store, getContext } from '@wordpress/interactivity';
import '@poocommerce/stores/poocommerce/products';
import type { ProductsStore } from '@poocommerce/stores/poocommerce/products';
import type { ProductResponseItem } from '@poocommerce/types';
import { sanitizeHTML } from '@poocommerce/sanitize';

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

const { state: productsState } = store< ProductsStore >(
	'poocommerce/products',
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
	'small',
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

type Context = {
	productElementKey: keyof ProductResponseItem;
};

store(
	'poocommerce/product-elements',
	{
		callbacks: {
			updateValue: () => {
				const element = getElement();
				const product = productsState.productInContext;

				if ( ! element.ref || ! product ) {
					return;
				}

				const { productElementKey } = getContext< Context >();

				const productElementHtml = product[ productElementKey ];

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
