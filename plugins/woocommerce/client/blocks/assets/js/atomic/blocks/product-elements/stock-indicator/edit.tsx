/**
 * External dependencies
 */
import EditProductLink from '@poocommerce/editor-components/edit-product-link';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { ProductQueryContext as Context } from '@poocommerce/blocks/product-query/types';
import { useEffect } from '@wordpress/element';
import { useProductDataContext } from '@poocommerce/shared-context';

/**
 * Internal dependencies
 */
import Block from './block';
import withProductSelector from '../shared/with-product-selector';
import { BLOCK_ICON as icon } from './constants';
import metadata from './block.json';
import type { BlockAttributes } from './types';

const Edit = ( {
	attributes,
	setAttributes,
	context,
}: BlockEditProps< BlockAttributes > & { context: Context } ): JSX.Element => {
	const { style, ...blockProps } = useBlockProps( {
		className: 'wc-block-components-product-stock-indicator',
	} );

	const blockAttrs = {
		...attributes,
		...context,
	};
	const isDescendentOfQueryLoop = Number.isFinite( context.queryId );

	useEffect(
		() => setAttributes( { isDescendentOfQueryLoop } ),
		[ setAttributes, isDescendentOfQueryLoop ]
	);

	return (
		<div
			{ ...blockProps }
			/**
			 * If block is a descendant of the All Products block, we don't
			 * want to apply style here because it will be applied inside
			 * Block using useColors, useTypography, and useSpacing hooks.
			 */
			style={ attributes.isDescendantOfAllProducts ? undefined : style }
		>
			<EditProductLink />
			<Block { ...blockAttrs } />
		</div>
	);
};

const StockIndicatorEdit: React.FC<
	BlockEditProps< BlockAttributes > & { context: Context }
> = ( props ) => {
	const { product } = useProductDataContext();
	if ( product.id === 0 ) {
		return <Edit { ...props } />;
	}
	return withProductSelector( {
		icon,
		label: metadata.title,
		description: metadata.description,
	} )( Edit )( props );
};

export default StockIndicatorEdit;
