/**
 * External dependencies
 */
import { useWooBlockProps } from '@poocommerce/block-templates';
import { CollapsibleContent } from '@poocommerce/components';
import type { BlockAttributes } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { ProductEditorBlockEditProps } from '../../../types';

export function Edit( {
	attributes,
}: ProductEditorBlockEditProps< BlockAttributes > ) {
	const blockProps = useWooBlockProps( attributes );
	const { toggleText, initialCollapsed, persistRender = true } = attributes;

	return (
		<div { ...blockProps }>
			<CollapsibleContent
				toggleText={ toggleText }
				initialCollapsed={ initialCollapsed }
				persistRender={ persistRender }
			>
				<InnerBlocks templateLock="all" />
			</CollapsibleContent>
		</div>
	);
}
