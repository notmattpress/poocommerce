/**
 * External dependencies
 */
import { getSettingWithCoercion } from '@poocommerce/settings';
import { type BlockInstance } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { isBoolean } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import type { IsBlockType, GetBlocksClientIds } from './types';

const isProductsBlock: IsBlockType = ( block ) =>
	block.name === 'core/query' &&
	block.attributes.namespace === 'poocommerce/product-query';

const isConvertedProductCollectionBlock: IsBlockType = ( block ) =>
	block.name === 'poocommerce/product-collection' &&
	block.attributes.convertedFromProducts;

const getBlockClientIdsByPredicate = (
	blocks: BlockInstance[],
	predicate: ( block: BlockInstance ) => boolean
): string[] => {
	let clientIds: string[] = [];
	blocks.forEach( ( block ) => {
		if ( predicate( block ) ) {
			clientIds = [ ...clientIds, block.clientId ];
		}
		clientIds = [
			...clientIds,
			...getBlockClientIdsByPredicate( block.innerBlocks, predicate ),
		];
	} );
	return clientIds;
};

const getProductsBlockClientIds: GetBlocksClientIds = ( blocks ) =>
	getBlockClientIdsByPredicate( blocks, isProductsBlock );

const getProductCollectionBlockClientIds: GetBlocksClientIds = ( blocks ) =>
	getBlockClientIdsByPredicate( blocks, isConvertedProductCollectionBlock );

const checkIfBlockCanBeInserted = (
	clientId: string,
	blockToBeInserted: string
) => {
	// We need to duplicate checks that are happening within replaceBlocks method
	// as replacement is initially blocked and there's no information returned
	// that would determine if replacement happened or not.
	// https://github.com/WordPress/gutenberg/issues/46740
	const rootClientId =
		select( 'core/block-editor' ).getBlockRootClientId( clientId ) ||
		undefined;
	return select( 'core/block-editor' ).canInsertBlockType(
		blockToBeInserted,
		rootClientId
	);
};

const postTemplateHasSupportForGridView = getSettingWithCoercion(
	'postTemplateHasSupportForGridView',
	false,
	isBoolean
);

export {
	getProductsBlockClientIds,
	getProductCollectionBlockClientIds,
	checkIfBlockCanBeInserted,
	postTemplateHasSupportForGridView,
};
