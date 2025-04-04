/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import formStepAttributes from '../../form-step/attributes';

export default {
	...formStepAttributes( {
		defaultTitle: __( 'Contact information', 'poocommerce' ),
		defaultDescription: __(
			"We'll use this email to send you details and updates about your order.",
			'poocommerce'
		),
	} ),
	className: {
		type: 'string',
		default: '',
	},
	lock: {
		type: 'object',
		default: {
			remove: true,
			move: true,
		},
	},
};
