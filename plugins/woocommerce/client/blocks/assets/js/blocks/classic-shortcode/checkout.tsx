/**
 * External dependencies
 */
import { createBlock, type BlockInstance } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { OnClickCallbackParameter, InheritedAttributes } from './types';

const isConversionPossible = () => {
	return true;
};

const getButtonLabel = () => __( 'Transform into blocks', 'poocommerce' );

const getBlockifiedTemplate = ( inheritedAttributes: InheritedAttributes ) =>
	[
		createBlock( 'poocommerce/checkout', {
			...inheritedAttributes,
			className: 'wc-block-checkout',
		} ),
	].filter( Boolean ) as BlockInstance[];

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

const getTitle = () => {
	return __( 'Classic Checkout', 'poocommerce' );
};

const getDescription = () => {
	return __(
		'This block will render the classic checkout shortcode. You can optionally transform it into blocks for more control over the checkout experience.',
		'poocommerce'
	);
};

const blockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

export { blockifyConfig, isConversionPossible, getDescription, getTitle };
