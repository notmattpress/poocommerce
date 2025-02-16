/**
 * External dependencies
 */
import clsx from 'clsx';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { Sidebar } from '@poocommerce/base-components/sidebar-layout';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';

export const Edit = ( {
	clientId,
	attributes,
}: {
	clientId: string;
	attributes: {
		className?: string;
	};
} ): JSX.Element => {
	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-checkout__sidebar', attributes?.className ),
	} );
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.CHECKOUT_TOTALS );

	const defaultTemplate = [
		[ 'poocommerce/checkout-order-summary-block', {}, [] ],
	] as TemplateArray;

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );

	return (
		<Sidebar { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ allowedBlocks }
				templateLock={ false }
				template={ defaultTemplate }
				renderAppender={ InnerBlocks.ButtonBlockAppender }
			/>
		</Sidebar>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
