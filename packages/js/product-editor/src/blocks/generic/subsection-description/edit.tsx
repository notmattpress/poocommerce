/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { useWooBlockProps } from '@poocommerce/block-templates';

/**
 * Internal dependencies
 */
import { BlockFill } from '../../../components/block-slot-fill';
import { ProductEditorBlockEditProps } from '../../../types';
import { SubsectionDescriptionBlockAttributes } from './types';

export function SubsectionDescriptionBlockEdit( {
	attributes,
}: ProductEditorBlockEditProps< SubsectionDescriptionBlockAttributes > ) {
	const { content } = attributes;
	const blockProps = useWooBlockProps( attributes );

	return (
		<BlockFill
			{ ...blockProps }
			name="section-description"
			slotContainerBlockName="poocommerce/product-subsection"
		>
			<div>{ content }</div>
		</BlockFill>
	);
}
