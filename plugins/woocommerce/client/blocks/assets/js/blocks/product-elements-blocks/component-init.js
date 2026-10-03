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
	blockName: 'poocommerce/product-price',
	component: lazy( () =>
		import( /* webpackChunkName: "product-price" */ './price/block' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-image',
	component: lazy( () =>
		import( /* webpackChunkName: "product-image" */ './image/frontend' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-title',
	component: lazy( () =>
		import( /* webpackChunkName: "product-title" */ './title/frontend' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-rating',
	component: lazy( () =>
		import( /* webpackChunkName: "product-rating" */ './rating/block' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-rating-stars',
	component: lazy( () =>
		import(
			/* webpackChunkName: "product-rating-stars" */ './rating-stars/block'
		)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-rating-counter',
	component: lazy( () =>
		import(
			/* webpackChunkName: "product-rating-counter" */ './rating-counter/block'
		)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-average-rating',
	component: lazy( () =>
		import(
			/* webpackChunkName: "product-average-rating" */ './average-rating/block'
		)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-button',
	component: lazy( () =>
		import( /* webpackChunkName: "product-button" */ './button/block' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-summary',
	component: lazy( () =>
		import( /* webpackChunkName: "product-summary" */ './summary/block' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-sale-badge',
	component: lazy( () =>
		import(
			/* webpackChunkName: "product-sale-badge" */ './sale-badge/block'
		)
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-sku',
	component: lazy( () =>
		import( /* webpackChunkName: "product-sku" */ './sku/block' )
	),
} );

registerBlockComponent( {
	blockName: 'poocommerce/product-stock-indicator',
	component: lazy( () =>
		import(
			/* webpackChunkName: "product-stock-indicator" */ './stock-indicator/block'
		)
	),
} );
