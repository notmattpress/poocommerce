/**
 * External dependencies
 */
import { Icon, column } from '@wordpress/icons';
import {
	registerBlockType,
	createBlock,
	// @ts-expect-error Type definitions for this function are missing in Gutenberg
	createBlocksFromInnerBlocksTemplate,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import metadata from './block.json';
import crossSells from '../../../product-collection/collections/cross-sells';

export const createCrossSellsProductCollection = () => {
	return createBlock(
		'poocommerce/product-collection',
		{
			...crossSells.attributes,
			displayLayout: {
				...crossSells.attributes.displayLayout,
				columns: 3,
			},
			query: {
				...crossSells.attributes.query,
				perPage: 3,
			},
			collection: 'poocommerce/product-collection/cross-sells',
		},
		createBlocksFromInnerBlocksTemplate( crossSells.innerBlocks )
	);
};

// @ts-expect-error - blockName can be either string or object
registerBlockType( 'poocommerce/cart-cross-sells-block', {
	apiVersion: metadata.apiVersion,
	title: metadata.title,
	icon: {
		src: (
			<Icon
				icon={ column }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit: Edit,
	save: Save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'poocommerce/product-collection' ],
				transform: createCrossSellsProductCollection,
			},
		],
	},
} );
