/**
 * External dependencies
 */
import { registerBlockComponent } from '@poocommerce/blocks-registry';
import { lazy } from '@wordpress/element';
import { WC_BLOCKS_BUILD_URL } from '@poocommerce/block-settings';

// Modify webpack publicPath at runtime based on location of WordPress Plugin.
// eslint-disable-next-line no-undef,camelcase
__webpack_public_path__ = WC_BLOCKS_BUILD_URL;

registerBlockComponent( {
	blockName: 'poocommerce/active-filters',
	component: lazy(
		() =>
			import(
				/* webpackChunkName: "active-filters-wrapper" */
				'../active-filters/block-wrapper'
			)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/price-filter',
	component: lazy(
		() =>
			import(
				/* webpackChunkName: "price-filter-wrapper" */
				'../price-filter/block-wrapper'
			)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/stock-filter',
	component: lazy(
		() =>
			import(
				/* webpackChunkName: "stock-filter-wrapper" */
				'../stock-filter/block-wrapper'
			)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/attribute-filter',
	component: lazy(
		() =>
			import(
				/* webpackChunkName: "attribute-filter-wrapper" */
				'../attribute-filter/block-wrapper'
			)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/rating-filter',
	component: lazy(
		() =>
			import(
				/* webpackChunkName: "rating-filter-wrapper" */
				'../rating-filter/block-wrapper'
			)
	),
} );
