/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

const attributes = ( {
	defaultTitle = __( 'Step', 'poocommerce' ),
	defaultDescription = __( 'Step description text.', 'poocommerce' ),
	defaultShowStepNumber = true,
}: {
	defaultTitle: string;
	defaultDescription: string;
	defaultShowStepNumber?: boolean;
} ): Record< string, Record< string, unknown > > => ( {
	title: {
		type: 'string',
		default: defaultTitle,
	},
	description: {
		type: 'string',
		default: defaultDescription,
	},
	showStepNumber: {
		type: 'boolean',
		default: defaultShowStepNumber,
	},
} );

export default attributes;
