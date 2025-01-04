/**
 * Purpose of this file:
 * This file defines constants for use in `plugins/poocommerce-blocks/assets/js/blocks-registry/product-collection/register-product-collection.tsx`.
 * By isolating constants here, we avoid loading unnecessary JS file on the frontend (e.g., the /shop page), enhancing site performance.
 *
 * Context: https://github.com/poocommerce/poocommerce/pull/48141#issuecomment-2208770592.
 */

/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';
import { objectOmit } from '@poocommerce/utils';
import type { InnerBlockTemplate } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import blockJson from './block.json';
import {
	ProductCollectionAttributes,
	ProductCollectionQuery,
	LayoutOptions,
	WidthOptions,
} from './types';
import { ImageSizing } from '../../atomic/blocks/product-elements/image/types';

export const PRODUCT_COLLECTION_BLOCK_NAME = blockJson.name;
const PRODUCT_TITLE_NAME = `${ PRODUCT_COLLECTION_BLOCK_NAME }/product-title`;

export const STOCK_STATUS_OPTIONS = getSetting< Record< string, string > >(
	'stockStatusOptions',
	[]
);

const GLOBAL_HIDE_OUT_OF_STOCK = getSetting< boolean >(
	'hideOutOfStockItems',
	false
);

export const getDefaultStockStatuses = () => {
	return GLOBAL_HIDE_OUT_OF_STOCK
		? Object.keys( objectOmit( STOCK_STATUS_OPTIONS, 'outofstock' ) )
		: Object.keys( STOCK_STATUS_OPTIONS );
};

export const DEFAULT_QUERY: ProductCollectionQuery = {
	perPage: 9,
	pages: 0,
	offset: 0,
	postType: 'product',
	order: 'asc',
	orderBy: 'title',
	search: '',
	exclude: [],
	inherit: false,
	taxQuery: {},
	isProductCollectionBlock: true,
	featured: false,
	poocommerceOnSale: false,
	poocommerceStockStatus: getDefaultStockStatuses(),
	poocommerceAttributes: [],
	poocommerceHandPickedProducts: [],
	timeFrame: undefined,
	priceRange: undefined,
	filterable: false,
	relatedBy: {
		categories: true,
		tags: true,
	},
};

export const DEFAULT_ATTRIBUTES: Pick<
	ProductCollectionAttributes,
	| 'query'
	| 'tagName'
	| 'dimensions'
	| 'displayLayout'
	| 'queryContextIncludes'
	| 'forcePageReload'
> = {
	query: DEFAULT_QUERY,
	tagName: 'div',
	displayLayout: {
		type: LayoutOptions.GRID,
		columns: 3,
		shrinkColumns: true,
	},
	dimensions: {
		widthType: WidthOptions.FILL,
	},
	queryContextIncludes: [ 'collection' ],
	forcePageReload: false,
};

export const DEFAULT_FILTERS: Pick<
	ProductCollectionQuery,
	| 'poocommerceOnSale'
	| 'poocommerceStockStatus'
	| 'poocommerceAttributes'
	| 'poocommerceHandPickedProducts'
	| 'taxQuery'
	| 'featured'
	| 'timeFrame'
	| 'priceRange'
> = {
	poocommerceOnSale: DEFAULT_QUERY.poocommerceOnSale,
	poocommerceStockStatus: DEFAULT_QUERY.poocommerceStockStatus,
	poocommerceAttributes: DEFAULT_QUERY.poocommerceAttributes,
	poocommerceHandPickedProducts: DEFAULT_QUERY.poocommerceHandPickedProducts,
	taxQuery: DEFAULT_QUERY.taxQuery,
	featured: DEFAULT_QUERY.featured,
	timeFrame: DEFAULT_QUERY.timeFrame,
	priceRange: DEFAULT_QUERY.priceRange,
};

/**
 * Default inner block templates for the product collection block.
 * Exported for use in different collections, e.g., 'New Arrivals' collection.
 */
export const INNER_BLOCKS_PRODUCT_TEMPLATE: InnerBlockTemplate = [
	'poocommerce/product-template',
	{},
	[
		[
			'poocommerce/product-image',
			{
				imageSizing: ImageSizing.THUMBNAIL,
			},
		],
		[
			'core/post-title',
			{
				textAlign: 'center',
				level: 3,
				fontSize: 'medium',
				style: {
					spacing: {
						margin: {
							bottom: '0.75rem',
							top: '0',
						},
					},
				},
				isLink: true,
				__poocommerceNamespace: PRODUCT_TITLE_NAME,
			},
		],
		[
			'poocommerce/product-price',
			{
				textAlign: 'center',
				fontSize: 'small',
			},
		],
		[
			'poocommerce/product-button',
			{
				textAlign: 'center',
				fontSize: 'small',
			},
		],
	],
];

export const coreQueryPaginationBlockName = 'core/query-pagination';
export const INNER_BLOCKS_PAGINATION_TEMPLATE: InnerBlockTemplate = [
	coreQueryPaginationBlockName,
	{
		layout: {
			type: 'flex',
			justifyContent: 'center',
		},
	},
];

export const INNER_BLOCKS_NO_RESULTS_TEMPLATE: InnerBlockTemplate = [
	'poocommerce/product-collection-no-results',
];

export const INNER_BLOCKS_TEMPLATE: InnerBlockTemplate[] = [
	INNER_BLOCKS_PRODUCT_TEMPLATE,
	INNER_BLOCKS_PAGINATION_TEMPLATE,
	INNER_BLOCKS_NO_RESULTS_TEMPLATE,
];
