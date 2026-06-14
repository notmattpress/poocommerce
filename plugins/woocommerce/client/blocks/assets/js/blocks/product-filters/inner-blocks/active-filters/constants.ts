/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export const filtersPreview = [
	{
		id: 'color_blue',
		type: __( 'Color', 'poocommerce' ),
		value: 'blue',
		label: __( 'Blue', 'poocommerce' ),
	},
	{
		id: 'color_red',
		type: __( 'Color', 'poocommerce' ),
		value: 'red',
		label: __( 'Red', 'poocommerce' ),
	},
	{
		id: 'size_large',
		type: __( 'Size', 'poocommerce' ),
		value: 'large',
		label: __( 'Large', 'poocommerce' ),
	},
	{
		id: 'status_instock',
		type: __( 'Status', 'poocommerce' ),
		value: 'instock',
		label: __( 'In stock', 'poocommerce' ),
	},
	{
		id: 'status_onsale',
		type: __( 'Status', 'poocommerce' ),
		value: 'onsale',
		label: __( 'On sale', 'poocommerce' ),
	},
];
