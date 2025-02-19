/**
 * External dependencies
 */
import { Icon, mediaAndText } from '@wordpress/icons';
import { getBlockMap } from '@poocommerce/atomic-utils';
import type { InnerBlockTemplate } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { VARIATION_NAME as PRODUCT_TITLE_VARIATION_NAME } from '../product-query/variations/elements/product-title';
import { ImageSizing } from '../../atomic/blocks/product-elements/image/types';

export const BLOCK_ICON = (
	<Icon
		icon={ mediaAndText }
		className="wc-block-editor-components-block-icon"
	/>
);

export const DEFAULT_INNER_BLOCKS: InnerBlockTemplate[] = [
	[
		'core/columns',
		{},
		[
			[
				'core/column',
				{},
				[
					[
						'poocommerce/product-image',
						{
							showSaleBadge: false,
							isDescendentOfSingleProductBlock: true,
							imageSizing: ImageSizing.SINGLE,
						},
					],
				],
			],
			[
				'core/column',
				{},
				[
					[
						'core/post-title',
						{
							headingLevel: 2,
							isLink: true,
							__poocommerceNamespace:
								PRODUCT_TITLE_VARIATION_NAME,
						},
					],
					[
						'poocommerce/product-rating',
						{ isDescendentOfSingleProductBlock: true },
					],
					[
						'poocommerce/product-price',
						{ isDescendentOfSingleProductBlock: true },
					],
					[
						'poocommerce/product-summary',
						{ isDescendentOfSingleProductBlock: true },
					],
					[ 'poocommerce/add-to-cart-form' ],
					[ 'poocommerce/product-meta' ],
				],
			],
		],
	],
];

export const ALLOWED_INNER_BLOCKS = [
	'core/columns',
	'core/column',
	'core/post-title',
	'core/post-excerpt',
	'poocommerce/add-to-cart-form',
	'poocommerce/add-to-cart-with-options',
	'poocommerce/product-meta',
	'poocommerce/product-gallery',
	...Object.keys( getBlockMap( metadata.name ) ),
];
