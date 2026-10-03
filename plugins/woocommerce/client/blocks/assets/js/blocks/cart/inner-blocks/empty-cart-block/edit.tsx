/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';
import { useEditorContext } from '@poocommerce/base-context';
import { SHOP_URL } from '@poocommerce/block-settings';

/**
 * Internal dependencies
 */
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';

const returnToShopTemplate = SHOP_URL
	? [
			'core/buttons',
			{ layout: { type: 'flex', justifyContent: 'center' } },
			[
				[
					'core/button',
					{
						text: __( 'Return to shop', 'poocommerce' ),
						url: SHOP_URL,
					},
				],
			],
	  ]
	: null;

// Recent WordPress versions center headings through the typography support and no longer
// have a textAlign attribute; older ones only know textAlign. Unknown attributes are dropped
// on insert, so passing both keeps the heading centered on every supported version.
const centeredHeading = {
	textAlign: 'center',
	style: { typography: { textAlign: 'center' } },
};

const defaultTemplate = [
	[
		'core/heading',
		{
			...centeredHeading,
			content: __( 'Your cart is empty', 'poocommerce' ),
			level: 2,
			className: 'wc-block-cart__empty-cart__title',
		},
	],
	returnToShopTemplate,
	[
		'core/spacer',
		{
			height: '40px',
		},
	],
	[
		'core/heading',
		{
			...centeredHeading,
			content: __( 'New in store', 'poocommerce' ),
			level: 2,
		},
	],
	[
		'poocommerce/product-new',
		{
			columns: 4,
			rows: 1,
		},
	],
].filter( Boolean ) as unknown as TemplateArray;

export const Edit = ( { clientId }: { clientId: string } ): JSX.Element => {
	const blockProps = useBlockProps();
	const { currentView } = useEditorContext();
	const allowedBlocks = getAllowedBlocks( innerBlockAreas.EMPTY_CART );

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );

	return (
		<div
			{ ...blockProps }
			hidden={ currentView !== 'poocommerce/empty-cart-block' }
		>
			<InnerBlocks
				template={ defaultTemplate }
				templateLock={ false }
				renderAppender={ InnerBlocks.ButtonBlockAppender }
			/>
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
