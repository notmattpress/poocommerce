/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import React, { createElement } from 'react';

/**
 * Internal dependencies
 */
import { Label, LabelProps } from '../label';

export default {
	title: 'Product Editor/components/Label',
	component: Label,
	args: {
		label: 'sku',
		required: true,
		note: __( '(stock keeping unit)', 'poocommerce' ),
		tooltip: __( 'Visit woo.com', 'poocommerce' ),
	},
};

export const Default = ( args: LabelProps ) => <Label { ...args } />;
