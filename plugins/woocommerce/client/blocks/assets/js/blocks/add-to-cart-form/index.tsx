/**
 * External dependencies
 */
import { registerProductBlockType } from '@poocommerce/atomic-utils';
import { Icon, button } from '@wordpress/icons';
import type { BlockConfiguration } from '@wordpress/blocks';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { QuantitySelectorStyle } from './settings';
import AddToCartFormEdit from './edit';
export interface Attributes {
	className?: string;
	quantitySelectorStyle: QuantitySelectorStyle;
}

const blockConfig = {
	...( metadata as BlockConfiguration< Attributes > ),
	edit: AddToCartFormEdit,
	icon: {
		src: (
			<Icon
				icon={ button }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	ancestor: [ 'poocommerce/single-product' ],
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'poocommerce/add-to-cart-with-options' ],
				transform: () =>
					createBlock( 'poocommerce/add-to-cart-with-options' ),
			},
		],
	},
	save() {
		return null;
	},
};

registerProductBlockType( blockConfig, {
	isAvailableOnPostEditor: true,
} );
