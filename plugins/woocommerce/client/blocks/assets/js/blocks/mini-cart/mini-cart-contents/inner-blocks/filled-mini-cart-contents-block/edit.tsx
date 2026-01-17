/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';
import { EditorProvider, useEditorContext } from '@poocommerce/base-context';
import { previewCart } from '@poocommerce/resource-previews';

/**
 * Internal dependencies
 */
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../../cart-checkout-shared';

export const Edit = ( { clientId }: { clientId: string } ): JSX.Element => {
	const blockProps = useBlockProps();
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.FILLED_MINI_CART );
	const { currentView } = useEditorContext();

	const defaultTemplate = [
		[ 'poocommerce/mini-cart-title-block', {} ],
		[ 'poocommerce/mini-cart-items-block', {} ],
		[ 'poocommerce/mini-cart-footer-block', {} ],
	].filter( Boolean ) as unknown as TemplateArray;

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );

	return (
		<div
			{ ...blockProps }
			hidden={
				currentView !== 'poocommerce/filled-mini-cart-contents-block'
			}
		>
			<EditorProvider
				currentView={ currentView }
				previewData={ { previewCart } }
			>
				<InnerBlocks
					template={ defaultTemplate }
					allowedBlocks={ allowedBlocks }
					templateLock="insert"
				/>
			</EditorProvider>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
