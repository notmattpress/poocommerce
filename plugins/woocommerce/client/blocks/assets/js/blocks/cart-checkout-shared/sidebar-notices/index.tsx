/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { addFilter, hasFilter } from '@wordpress/hooks';
import type { StoreDescriptor } from '@wordpress/data';
import { DefaultNotice } from '@poocommerce/editor-components/default-notice';
import { IncompatibleExtensionsNotice } from '@poocommerce/editor-components/incompatible-extension-notice';
import { useSelect } from '@wordpress/data';
import { CartCheckoutFeedbackPrompt } from '@poocommerce/editor-components/feedback-prompt';

declare module '@wordpress/editor' {
	let store: StoreDescriptor;
}

declare module '@wordpress/core-data' {
	let store: StoreDescriptor;
}

declare module '@wordpress/block-editor' {
	let store: StoreDescriptor;
}

const withSidebarNotices = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const {
			clientId,
			name: blockName,
			isSelected: isBlockSelected,
		} = props;

		const { isCart, isCheckout, parentId } = useSelect( ( select ) => {
			const { getBlockParentsByBlockName, getBlockName } =
				select( blockEditorStore );

			const parents = getBlockParentsByBlockName( clientId, [
				'poocommerce/cart',
				'poocommerce/checkout',
			] ).reduce(
				(
					accumulator: Record< string, string >,
					parentClientId: string
				) => {
					const parentName = getBlockName( parentClientId );
					accumulator[ parentName ] = parentClientId;
					return accumulator;
				},
				{}
			);

			const currentBlockName = getBlockName( clientId );
			const parentBlockIsCart =
				Object.keys( parents ).includes( 'poocommerce/cart' );
			const parentBlockIsCheckout = Object.keys( parents ).includes(
				'poocommerce/checkout'
			);
			const currentBlockIsCart =
				currentBlockName === 'poocommerce/cart' || parentBlockIsCart;
			const currentBlockIsCheckout =
				currentBlockName === 'poocommerce/checkout' ||
				parentBlockIsCheckout;
			const targetParentBlock = currentBlockIsCart
				? 'poocommerce/cart'
				: 'poocommerce/checkout';

			return {
				isCart: currentBlockIsCart,
				isCheckout: currentBlockIsCheckout,
				parentId:
					currentBlockName === targetParentBlock
						? clientId
						: parents[ targetParentBlock ],
			};
		} );

		// Show sidebar notices only when a PooCommerce block is selected.
		if (
			! blockName.startsWith( 'poocommerce/' ) ||
			! isBlockSelected ||
			! ( isCart || isCheckout )
		) {
			return <BlockEdit key="edit" { ...props } />;
		}

		return (
			<>
				<InspectorControls>
					<IncompatibleExtensionsNotice
						block={
							isCart ? 'poocommerce/cart' : 'poocommerce/checkout'
						}
						clientId={ parentId }
					/>

					<DefaultNotice block={ isCheckout ? 'checkout' : 'cart' } />
					<CartCheckoutFeedbackPrompt />
				</InspectorControls>
				<BlockEdit key="edit" { ...props } />
			</>
		);
	},
	'withSidebarNotices'
);

if (
	! hasFilter(
		'editor.BlockEdit',
		'poocommerce/add/sidebar-compatibility-notice'
	)
) {
	addFilter(
		'editor.BlockEdit',
		'poocommerce/add/sidebar-compatibility-notice',
		withSidebarNotices,
		11
	);
}
