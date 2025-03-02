/**
 * External dependencies
 */
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { getSetting, getSettingWithCoercion } from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';

// Pick the value of the "blockify add to cart flag"
const isBlockifiedAddToCart = getSettingWithCoercion(
	'isBlockifiedAddToCart',
	false,
	isBoolean
);

const isBlockTheme = getSetting< boolean >( 'isBlockTheme' );

export const shouldBlockifiedAddToCartWithOptionsBeRegistered =
	isExperimentalBlocksEnabled() && isBlockifiedAddToCart && isBlockTheme;
