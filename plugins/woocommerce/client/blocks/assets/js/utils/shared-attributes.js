/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';

export const sharedAttributeBlockTypes = [
	'poocommerce/product-best-sellers',
	'poocommerce/product-category',
	'poocommerce/product-new',
	'poocommerce/product-on-sale',
	'poocommerce/product-top-rated',
];

export default {
	/**
	 * Number of columns.
	 */
	columns: {
		type: 'number',
		default: getSetting( 'defaultColumns', 3 ),
	},

	/**
	 * Number of rows.
	 */
	rows: {
		type: 'number',
		default: getSetting( 'defaultRows', 3 ),
	},

	/**
	 * How to align cart buttons.
	 */
	alignButtons: {
		type: 'boolean',
		default: false,
	},

	/**
	 * Product category, used to display only products in the given categories.
	 */
	categories: {
		type: 'array',
		default: [],
	},

	/**
	 * Product category operator, used to restrict to products in all or any selected categories.
	 */
	catOperator: {
		type: 'string',
		default: 'any',
	},

	/**
	 * Content visibility setting
	 */
	contentVisibility: {
		type: 'object',
		default: {
			image: true,
			title: true,
			price: true,
			rating: true,
			button: true,
		},
	},

	/**
	 * Are we previewing?
	 */
	isPreview: {
		type: 'boolean',
		default: false,
	},

	/**
	 * Whether to display in stock, out of stock or backorder products.
	 */
	stockStatus: {
		type: 'array',
		default: Object.keys( getSetting( 'stockStatusOptions', [] ) ),
	},
};
