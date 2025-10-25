/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { filledCart, removeCart } from '@poocommerce/icons';

export const blockName = 'poocommerce/mini-cart-contents';

export const attributes = {
	isPreview: {
		type: 'boolean',
		default: false,
	},
	lock: {
		type: 'object',
		default: {
			remove: true,
			move: true,
		},
	},
	currentView: {
		type: 'string',
		default: 'poocommerce/filled-mini-cart-contents-block',
		source: 'readonly', // custom source to prevent saving to post content
	},
	editorViews: {
		type: 'object',
		default: [
			{
				view: 'poocommerce/filled-mini-cart-contents-block',
				label: __( 'Filled Mini-Cart', 'poocommerce' ),
				icon: <Icon icon={ filledCart } />,
			},
			{
				view: 'poocommerce/empty-mini-cart-contents-block',
				label: __( 'Empty Mini-Cart', 'poocommerce' ),
				icon: <Icon icon={ removeCart } />,
			},
		],
	},
	width: {
		type: 'string',
		default: '480px',
	},
};
