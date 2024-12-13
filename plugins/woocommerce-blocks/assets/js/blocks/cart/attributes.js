/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
import { Icon } from '@wordpress/icons';
import { filledCart, removeCart } from '@poocommerce/icons';

export const blockName = 'poocommerce/cart';
export const blockAttributes = {
	isPreview: {
		type: 'boolean',
		default: false,
	},
	currentView: {
		type: 'string',
		default: 'poocommerce/filled-cart-block',
		source: 'readonly', // custom source to prevent saving to post content
	},
	editorViews: {
		type: 'object',
		default: [
			{
				view: 'poocommerce/filled-cart-block',
				label: __( 'Filled Cart', 'poocommerce' ),
				icon: <Icon icon={ filledCart } />,
			},
			{
				view: 'poocommerce/empty-cart-block',
				label: __( 'Empty Cart', 'poocommerce' ),
				icon: <Icon icon={ removeCart } />,
			},
		],
	},
	hasDarkControls: {
		type: 'boolean',
		default: getSetting( 'hasDarkEditorStyleSupport', false ),
	},
	// Deprecated - here for v1 migration support
	isShippingCalculatorEnabled: {
		type: 'boolean',
		default: getSetting( 'isShippingCalculatorEnabled', true ),
	},
	checkoutPageId: {
		type: 'number',
		default: 0,
	},
	showRateAfterTaxName: {
		type: 'boolean',
		default: true,
	},
	align: {
		type: 'string',
		default: 'wide',
	},
};
