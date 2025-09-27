/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { cart } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';
import { BlockConfiguration } from '@wordpress/blocks';

export const metadata: BlockConfiguration = {
	apiVersion: 3,
	title: __( 'Mini-Cart Contents', 'poocommerce' ),
	icon: {
		src: (
			<Icon
				icon={ cart }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __( 'Display a Mini-Cart widget.', 'poocommerce' ),
	supports: {
		align: false,
		html: false,
		multiple: false,
		reusable: false,
		inserter: false,
		color: {
			link: true,
		},
		lock: false,
		__experimentalBorder: {
			color: true,
			width: true,
		},
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
};
