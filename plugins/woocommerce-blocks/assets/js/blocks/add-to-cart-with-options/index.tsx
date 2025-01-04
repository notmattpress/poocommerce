/**
 * External dependencies
 */
import { button } from '@wordpress/icons';
import { getPlugin, registerPlugin } from '@wordpress/plugins';
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { getSettingWithCoercion } from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';
import { registerProductBlockType } from '@poocommerce/atomic-utils';
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import ProductTypeSelectorPlugin from './plugins';
import metadata from './block.json';
import AddToCartOptionsEdit from './edit';
import save from './save';
import './style.scss';
import type { Attributes } from './types';

// Pick the value of the "blockify add to cart flag"
const isBlockifiedAddToCart = getSettingWithCoercion(
	'isBlockifiedAddToCart',
	false,
	isBoolean
);

export const shouldBlockifiedAddToCartWithOptionsBeRegistered =
	isExperimentalBlocksEnabled() && isBlockifiedAddToCart;

if ( shouldBlockifiedAddToCartWithOptionsBeRegistered ) {
	// Register a plugin that adds a product type selector to the template sidebar.
	const PLUGIN_NAME = 'document-settings-template-selector-pane';
	if ( ! getPlugin( PLUGIN_NAME ) ) {
		registerPlugin( PLUGIN_NAME, {
			render: ProductTypeSelectorPlugin,
		} );
	}

	// Register the block
	registerProductBlockType< Attributes >(
		{
			...( metadata as BlockConfiguration< Attributes > ),
			icon: {
				src: button,
			},
			edit: AddToCartOptionsEdit,
			save,
			ancestor: [ 'poocommerce/single-product' ],
		},
		{
			isAvailableOnPostEditor: true,
		}
	);
}
