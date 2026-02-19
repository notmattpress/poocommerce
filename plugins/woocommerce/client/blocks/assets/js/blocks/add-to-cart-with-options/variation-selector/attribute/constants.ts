/**
 * External dependencies
 */
import type { TemplateArray } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export const ATTRIBUTE_ITEM_TEMPLATE: TemplateArray = [
	[
		'poocommerce/add-to-cart-with-options-variation-selector-attribute',
		{},
		[
			[
				'core/group',
				{
					layout: {
						type: 'flex',
						orientation: 'vertical',
						flexWrap: 'nowrap',
					},
					style: {
						spacing: {
							blockGap: '0.5rem',
							margin: {
								top: '1rem',
								bottom: '1rem',
							},
						},
					},
				},
				[
					[
						'poocommerce/add-to-cart-with-options-variation-selector-attribute-name',
						{
							fontSize: 'medium',
						},
					],
					[
						'poocommerce/add-to-cart-with-options-variation-selector-attribute-options',
					],
				],
			],
		],
	],
] as const;

export const DEFAULT_ATTRIBUTES = [
	{
		id: 1,
		taxonomy: 'pa_color',
		name: __( 'Color', 'poocommerce' ),
		has_variations: true,
		terms: [
			{ id: 1, slug: 'blue', name: __( 'Blue', 'poocommerce' ) },
			{ id: 2, slug: 'red', name: __( 'Red', 'poocommerce' ) },
			{ id: 3, slug: 'green', name: __( 'Green', 'poocommerce' ) },
		],
	},
	{
		id: 2,
		taxonomy: 'pa_size',
		name: __( 'Size', 'poocommerce' ),
		has_variations: true,
		terms: [
			{ id: 1, slug: 'sm', name: __( 'Small', 'poocommerce' ) },
			{ id: 2, slug: 'md', name: __( 'Medium', 'poocommerce' ) },
			{ id: 3, slug: 'lg', name: __( 'Large', 'poocommerce' ) },
		],
	},
] as const;
