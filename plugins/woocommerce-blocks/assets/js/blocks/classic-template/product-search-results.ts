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
	// @ts-expect-error Type definitions for this function are missing in Guteberg
	createBlocksFromInnerBlocksTemplate,
	type BlockInstance,
	type InnerBlockTemplate,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { createArchiveTitleBlock, createRowBlock } from './utils';
import { OnClickCallbackParameter, type InheritedAttributes } from './types';

const createNoResultsParagraph = () =>
	createBlock( 'core/paragraph', {
		content: __(
			'No products were found matching your selection.',
			'poocommerce'
		),
	} );

const createProductSearch = () =>
	createBlock( 'core/search', {
		buttonPosition: 'button-outside',
		buttonText: __( 'Search', 'poocommerce' ),
		buttonUseIcon: false,
		showLabel: false,
		placeholder: __( 'Search products…', 'poocommerce' ),
		query: { post_type: 'product' },
	} );

const extendInnerBlocksWithNoResultsContent = (
	innerBlocks: InnerBlockTemplate[],
	inheritedAttributes: InheritedAttributes
) => {
	// InnerBlockTemplate is an array block representation so properties
	// like name or attributes need to be accessed with array indexes.
	const nameArrayIndex = 0;
	const attributesArrayIndex = 1;

	const noResultsContent = [
		createNoResultsParagraph(),
		createProductSearch(),
	];

	const noResultsBlockName = 'poocommerce/product-collection-no-results';
	const noResultsBlockIndex = innerBlocks.findIndex(
		( block ) => block[ nameArrayIndex ] === noResultsBlockName
	);
	const noResultsBlock = innerBlocks[ noResultsBlockIndex ];
	const attributes = {
		...( noResultsBlock[ attributesArrayIndex ] || {} ),
		...inheritedAttributes,
	};

	const extendedNoResults = [
		noResultsBlockName,
		attributes,
		noResultsContent,
	];

	return [
		...innerBlocks.slice( 0, noResultsBlockIndex ),
		extendedNoResults,
		...innerBlocks.slice( noResultsBlockIndex + 1 ),
	];
};

const createProductCollectionBlock = (
	inheritedAttributes: InheritedAttributes
) => {
	const productCollectionInnerBlocksWithNoResults =
		extendInnerBlocksWithNoResultsContent(
			productCollectionInnerBlocksTemplate,
			inheritedAttributes
		);

	return createBlock(
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
			productCollectionInnerBlocksWithNoResults
		)
	);
};

const getBlockifiedTemplate = ( inheritedAttributes: InheritedAttributes ) =>
	[
		createArchiveTitleBlock( 'search-title', inheritedAttributes ),
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

const getButtonLabel = () => __( 'Transform into blocks', 'poocommerce' );

const blockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

export { isConversionPossible, getDescription, blockifyConfig };
