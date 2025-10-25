/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import EditProductLink from '@poocommerce/editor-components/edit-product-link';
import { ProductQueryContext as Context } from '@poocommerce/blocks/product-query/types';

/**
 * Internal dependencies
 */
import './editor.scss';
import Block from './block';
import type { Attributes } from './types';
import { useIsDescendentOfSingleProductTemplate } from '../shared/use-is-descendent-of-single-product-template';

const Edit = ( {
	attributes,
	setAttributes,
	context,
}: BlockEditProps< Attributes > & { context: Context } ): JSX.Element => {
	const { style, ...blockProps } = useBlockProps( {
		className:
			'wc-block-components-product-sku wp-block-poocommerce-product-sku',
	} );
	const blockAttrs = {
		...attributes,
		...context,
	};
	const isDescendentOfQueryLoop = Number.isFinite( context.queryId );

	let { isDescendentOfSingleProductTemplate } =
		useIsDescendentOfSingleProductTemplate();

	if ( isDescendentOfQueryLoop ) {
		isDescendentOfSingleProductTemplate = false;
	}

	return (
		<>
			<EditProductLink />
			<div
				{ ...blockProps }
				/**
				 * If block is a descendant of the All Products block, we don't
				 * want to apply style here because it will be applied inside
				 * Block using useColors, useTypography, and useSpacing hooks.
				 */
				style={
					attributes.isDescendantOfAllProducts ? undefined : style
				}
			>
				<Block
					{ ...blockAttrs }
					setAttributes={ setAttributes }
					isDescendentOfSingleProductTemplate={
						isDescendentOfSingleProductTemplate
					}
					isDescendantOfAllProducts={
						attributes.isDescendantOfAllProducts
					}
				/>
			</div>
		</>
	);
};

export default Edit;
