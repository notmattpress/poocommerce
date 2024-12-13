/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { isWpVersion } from '@poocommerce/settings';
import { VARIATION_NAME as PRODUCT_TITLE_VARIATION_NAME } from '@poocommerce/blocks/product-query/variations/elements/product-title';
import {
	INNER_BLOCKS_PRODUCT_TEMPLATE as productCollectionInnerBlocksTemplate,
	DEFAULT_ATTRIBUTES as productCollectionDefaultAttributes,
	DEFAULT_QUERY as productCollectionDefaultQuery,
} from '@poocommerce/blocks/product-collection/constants';
import {
	BlockInstance,
	createBlock,
	// @ts-expect-error Type definitions for this function are missing in Gutenberg
	createBlocksFromInnerBlocksTemplate,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { OnClickCallbackParameter } from './types';

const getBlockifiedTemplate = () =>
	[
		createBlock( 'poocommerce/breadcrumbs' ),
		createBlock( 'poocommerce/store-notices' ),
		createBlock(
			'core/columns',
			{
				align: 'wide',
			},
			[
				createBlock(
					'core/column',
					{
						type: 'constrained',
						justifyContent: 'right',
						width: '512px',
					},
					[ createBlock( 'poocommerce/product-image-gallery' ) ]
				),
				createBlock( 'core/column', {}, [
					createBlock( 'core/post-title', {
						__poocommerceNamespace: PRODUCT_TITLE_VARIATION_NAME,
						level: 1,
					} ),
					createBlock( 'poocommerce/product-rating' ),
					createBlock( 'poocommerce/product-price', {
						fontSize: 'large',
					} ),
					createBlock( 'poocommerce/product-summary', {
						isDescendentOfSingleProductTemplate: true,
					} ),
					createBlock( 'poocommerce/add-to-cart-form' ),
					createBlock( 'poocommerce/product-meta' ),
				] ),
			]
		),
		createBlock( 'poocommerce/product-details', {
			align: 'wide',
			className: 'is-style-minimal',
		} ),
		createBlock( 'core/heading', {
			align: 'wide',
			level: 2,
			content: __( 'Related Products', 'poocommerce' ),
			style: { spacing: { margin: { bottom: '1rem' } } },
		} ),
		createBlock(
			'poocommerce/product-collection',
			{
				...productCollectionDefaultAttributes,
				query: {
					...productCollectionDefaultQuery,
					perPage: 5,
					pages: 1,
					poocommerceStockStatus: [ 'instock', 'onbackorder' ],
					filterable: false,
				},
				displayLayout: {
					type: 'flex',
					columns: 5,
					shrinkColumns: true,
				},
				collection: 'poocommerce/product-collection/related',
				hideControls: [ 'inherit' ],
				align: 'wide',
			},
			createBlocksFromInnerBlocksTemplate( [
				productCollectionInnerBlocksTemplate,
			] )
		),
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

const getButtonLabel = () => __( 'Transform into blocks', 'poocommerce' );

const onClickCallback = ( {
	clientId,
	getBlocks,
	replaceBlock,
	selectBlock,
}: OnClickCallbackParameter ) => {
	replaceBlock( clientId, getBlockifiedTemplate() );

	const blocks = getBlocks();
	const groupBlock = blocks.find(
		( block ) =>
			block.name === 'core/group' &&
			block.innerBlocks.some(
				( innerBlock ) => innerBlock.name === 'poocommerce/breadcrumbs'
			)
	);

	if ( groupBlock ) {
		selectBlock( groupBlock.clientId );
	}
};

const blockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

export { isConversionPossible, getDescription, blockifyConfig };
