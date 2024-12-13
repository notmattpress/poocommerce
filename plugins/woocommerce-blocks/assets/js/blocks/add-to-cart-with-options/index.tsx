/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { Icon, button } from '@wordpress/icons';
import { dispatch } from '@wordpress/data';
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { getSettingWithCoercion } from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import AddToCartOptionsEdit from './edit';
import './style.scss';
import registerStore, { store as poocommerceTemplateStateStore } from './store';
import getProductTypeOptions from './utils/get-product-types';
import save from './save';

// Pick the value of the "blockify add to cart flag"
const isBlockifiedAddToCart = getSettingWithCoercion(
	'isBlockifiedAddToCart',
	false,
	isBoolean
);

export const shouldRegisterBlock =
	isExperimentalBlocksEnabled() && isBlockifiedAddToCart;

if ( shouldRegisterBlock ) {
	// Register the store
	registerStore();

	// loads the product types
	dispatch( poocommerceTemplateStateStore ).setProductTypes(
		getProductTypeOptions()
	);

	// Select Simple product type
	dispatch( poocommerceTemplateStateStore ).switchProductType( 'simple' );

	// Register the block
	registerBlockType( metadata, {
		icon: <Icon icon={ button } />,
		edit: AddToCartOptionsEdit,
		save,
	} );
}
