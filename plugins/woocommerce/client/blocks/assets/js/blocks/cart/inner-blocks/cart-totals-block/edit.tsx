/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { Sidebar } from '@poocommerce/base-components/sidebar-layout';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';

export const Edit = ( { clientId }: { clientId: string } ): JSX.Element => {
	const blockProps = useBlockProps( { className: 'wc-block-cart__sidebar' } );
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.CART_TOTALS );
	const defaultTemplate = [
		[ 'poocommerce/cart-order-summary-block', {}, [] ],
		[ 'poocommerce/cart-express-payment-block', {}, [] ],
		[ 'poocommerce/proceed-to-checkout-block', {}, [] ],
		[ 'poocommerce/cart-accepted-payment-methods-block', {}, [] ],
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
				template={ defaultTemplate }
				templateLock={ false }
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
