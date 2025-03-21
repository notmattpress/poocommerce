/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { barcode } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';

export const BLOCK_TITLE: string = __( 'Product SKU', 'poocommerce' );
export const BLOCK_ICON: JSX.Element = (
	<Icon icon={ barcode } className="wc-block-editor-components-block-icon" />
);
export const BLOCK_DESCRIPTION: string = __(
	'Display the SKU of a product.',
	'poocommerce'
);
