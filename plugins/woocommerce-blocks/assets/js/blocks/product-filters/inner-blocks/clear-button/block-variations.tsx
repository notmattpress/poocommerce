/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockVariation } from '@wordpress/blocks';

const variations: BlockVariation[] = [
	{
		name: 'product-filter-clear-all-button',
		title: __( 'Clear All (Experimental)', 'poocommerce' ),
		description: __(
			'Allows shoppers to reset all filters.',
			'poocommerce'
		),
		attributes: {
			clearType: 'all',
		},
		isDefault: false,
		isActive: [ 'clearType' ],
	},
];

export const blockVariations = variations;
