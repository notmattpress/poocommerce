/**
 * External dependencies
 */

import { isWpVersion } from '@poocommerce/settings';
import { __, sprintf } from '@wordpress/i18n';
import {
	INNER_BLOCKS_TEMPLATE as productCollectionInnerBlocksTemplate,
	DEFAULT_ATTRIBUTES as productCollectionDefaultAttributes,
	DEFAULT_QUERY as productCollectionDefaultQuery,
} from '@poocommerce/blocks/product-collection/constants';
import {
	createBlock,
	// @ts-expect-error Type definitions for this function are missing in Gutenberg
	createBlocksFromInnerBlocksTemplate,
	type BlockInstance,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { createArchiveTitleBlock, createRowBlock } from './utils';
import { OnClickCallbackParameter, type InheritedAttributes } from './types';

const createProductCollectionBlock = (
	inheritedAttributes: InheritedAttributes
) =>
	createBlock(
		'poocommerce/product-collection',
		{
			...productCollectionDefaultAttributes,
			...inheritedAttributes,
			query: {
				...productCollectionDefaultQuery,
				inherit: true,
			},
		},
		createBlocksFromInnerBlocksTemplate(
			productCollectionInnerBlocksTemplate
		)
	);

const getBlockifiedTemplate = (
	inheritedAttributes: InheritedAttributes,
	withTermDescription = false
) =>
	[
		createBlock( 'poocommerce/breadcrumbs', inheritedAttributes ),
		createArchiveTitleBlock( 'archive-title', inheritedAttributes ),
		withTermDescription
			? createBlock( 'core/term-description', inheritedAttributes )
			: null,
		createBlock( 'poocommerce/store-notices', inheritedAttributes ),
		createRowBlock(
			[
				createBlock( 'poocommerce/product-results-count' ),
				createBlock( 'poocommerce/catalog-sorting' ),
			],
			inheritedAttributes
		),
		createProductCollectionBlock( inheritedAttributes ),
	].filter( Boolean ) as BlockInstance[];

const getBlockifiedTemplateWithTermDescription = (
	inheritedAttributes: InheritedAttributes
) => getBlockifiedTemplate( inheritedAttributes, true );

const isConversionPossible = () => {
	// Blockification is possible for the WP version 6.1 and above,
	// which are the versions the Products block supports.
	return isWpVersion( '6.1', '>=' );
};

const getDescriptionAllowingConversion = ( templateTitle: string ) =>
	sprintf(
		/* translators: %s is the template title */
		__(
			'Transform this template into multiple blocks so you can add, remove, reorder, and customize your %s template.',
			'poocommerce'
		),
		templateTitle
	);

const getDescriptionDisallowingConversion = ( templateTitle: string ) =>
	sprintf(
		/* translators: %s is the template title */
		__(
			'This block serves as a placeholder for your %s. It will display the actual product image, title, price in your store. You can move this placeholder around and add more blocks around to customize the template.',
			'poocommerce'
		),
		templateTitle
	);

const getDescription = ( templateTitle: string, canConvert: boolean ) => {
	if ( canConvert ) {
		return getDescriptionAllowingConversion( templateTitle );
	}

	return getDescriptionDisallowingConversion( templateTitle );
};

const getButtonLabel = () => __( 'Transform into blocks', 'poocommerce' );

const onClickCallback = ( {
	clientId,
	attributes,
	getBlocks,
	replaceBlock,
	selectBlock,
}: OnClickCallbackParameter ) => {
	replaceBlock( clientId, getBlockifiedTemplate( attributes ) );

	const blocks = getBlocks();

	const groupBlock = blocks.find(
		( block ) =>
			block.name === 'core/group' &&
			block.innerBlocks.some(
				( innerBlock ) =>
					innerBlock.name === 'poocommerce/store-notices'
			)
	);

	if ( groupBlock ) {
		selectBlock( groupBlock.clientId );
	}
};

const onClickCallbackWithTermDescription = ( {
	clientId,
	attributes,
	getBlocks,
	replaceBlock,
	selectBlock,
}: OnClickCallbackParameter ) => {
	replaceBlock( clientId, getBlockifiedTemplate( attributes, true ) );

	const blocks = getBlocks();

	const groupBlock = blocks.find(
		( block ) =>
			block.name === 'core/group' &&
			block.innerBlocks.some(
				( innerBlock ) =>
					innerBlock.name === 'poocommerce/store-notices'
			)
	);

	if ( groupBlock ) {
		selectBlock( groupBlock.clientId );
	}
};

const productCatalogBlockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

const productTaxonomyBlockifyConfig = {
	getButtonLabel,
	onClickCallback: onClickCallbackWithTermDescription,
	getBlockifiedTemplate: getBlockifiedTemplateWithTermDescription,
};

export const blockifiedProductCatalogConfig = {
	isConversionPossible,
	getDescription,
	blockifyConfig: productCatalogBlockifyConfig,
};

export const blockifiedProductTaxonomyConfig = {
	isConversionPossible,
	getDescription,
	blockifyConfig: productTaxonomyBlockifyConfig,
};
