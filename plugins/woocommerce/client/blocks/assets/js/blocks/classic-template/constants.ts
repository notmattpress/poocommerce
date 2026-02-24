/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TemplateDetails } from './types';

export const BLOCK_SLUG = 'poocommerce/legacy-template';
export const TYPES = {
	singleProduct: 'single-product',
	productCatalog: 'product-catalog',
	productTaxonomy: 'product-taxonomy',
	productSearchResults: 'product-search-results',
	orderConfirmation: 'order-confirmation',
	checkoutHeader: 'checkout-header',
};
export const PLACEHOLDERS = {
	singleProduct: 'single-product',
	archiveProduct: 'archive-product',
	orderConfirmation: 'fallback',
	checkoutHeader: 'checkout-header',
};

export const TEMPLATES: TemplateDetails = {
	'single-product': {
		type: TYPES.singleProduct,
		title: __( 'Product (Classic)', 'poocommerce' ),
		description: __( 'Displays the PHP product page.', 'poocommerce' ),
		placeholder: PLACEHOLDERS.singleProduct,
	},
	'archive-product': {
		type: TYPES.productCatalog,
		title: __( 'Product Grid (Classic)', 'poocommerce' ),
		description: __(
			'Displays the PHP product grid page. ',
			'poocommerce'
		),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	'taxonomy-product_cat': {
		type: TYPES.productTaxonomy,
		title: __( 'Product Category (Classic)', 'poocommerce' ),
		description: __(
			'Displays the PHP product category page.',
			'poocommerce'
		),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	'taxonomy-product_tag': {
		type: TYPES.productTaxonomy,
		title: __( 'Product Tag (Classic)', 'poocommerce' ),
		description: __( 'Displays the PHP product tag page.', 'poocommerce' ),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	'taxonomy-product_attribute': {
		type: TYPES.productTaxonomy,
		title: __( 'Product Attribute (Classic)', 'poocommerce' ),
		description: __(
			'Displays the PHP product attribute page.',
			'poocommerce'
		),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	// Since that it is a fallback value, it has to be the last one.
	'taxonomy-product': {
		type: TYPES.productTaxonomy,
		title: __( "Product's Custom Taxonomy (Classic)", 'poocommerce' ),
		description: __(
			"Displays the PHP product's custom taxonomy page.",
			'poocommerce'
		),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	'product-search-results': {
		type: TYPES.productSearchResults,
		title: __( 'Product Search Results (Classic)', 'poocommerce' ),
		description: __(
			'Displays the PHP product search results.',
			'poocommerce'
		),
		placeholder: PLACEHOLDERS.archiveProduct,
	},
	'checkout-header': {
		type: TYPES.checkoutHeader,
		title: __( 'Checkout Header', 'poocommerce' ),
		placeholder: 'checkout-header',
	},
	'order-confirmation': {
		type: TYPES.orderConfirmation,
		title: __( 'Order Confirmation Block', 'poocommerce' ),
		placeholder: PLACEHOLDERS.orderConfirmation,
	},
};
