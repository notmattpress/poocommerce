/**
 * External dependencies
 */
import clsx from 'clsx';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import { SidebarLayout } from '@poocommerce/base-components/sidebar-layout';
import type { TemplateArray } from '@wordpress/blocks';
import { useEditorContext } from '@poocommerce/base-context';

/**
 * Internal dependencies
 */
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';
import './editor.scss';
import { useCartBlockContext } from '../../context';

export const Edit = ( { clientId }: { clientId: string } ): JSX.Element => {
	const blockProps = useBlockProps();
	const { currentView } = useEditorContext();
	const { hasDarkControls } = useCartBlockContext();
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.FILLED_CART );
	const defaultTemplate = [
		[ 'poocommerce/cart-items-block', {}, [] ],
		[ 'poocommerce/cart-totals-block', {}, [] ],
	] as TemplateArray;

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );
	return (
		<div
			{ ...blockProps }
			hidden={ currentView !== 'poocommerce/filled-cart-block' }
		>
			<SidebarLayout
				className={ clsx( 'wc-block-cart', {
					'has-dark-controls': hasDarkControls,
				} ) }
			>
				<InnerBlocks
					allowedBlocks={ allowedBlocks }
					template={ defaultTemplate }
					templateLock="insert"
				/>
			</SidebarLayout>
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
