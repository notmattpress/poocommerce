/**
 * External dependencies
 */
import { BlockAttributes, InnerBlockTemplate } from '@wordpress/blocks';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { stacks } from '@poocommerce/icons';
import { registerProductBlockType } from '@poocommerce/atomic-utils';
import { getSettingWithCoercion } from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import { QUERY_LOOP_ID } from '../constants';

import { VARIATION_NAME as PRODUCT_TEMPLATE_ID } from './elements/product-template';
import { VARIATION_NAME as PRODUCT_TITLE_ID } from './elements/product-title';

const VARIATION_NAME = 'poocommerce/related-products';

export const BLOCK_ATTRIBUTES = {
	namespace: VARIATION_NAME,
	allowedControls: [],
	displayLayout: {
		type: 'flex',
		columns: 5,
	},
	query: {
		perPage: 5,
		pages: 0,
		offset: 0,
		postType: 'product',
		order: 'asc',
		orderBy: 'title',
		author: '',
		search: '',
		exclude: [],
		sticky: '',
		inherit: false,
	},
	lock: {
		remove: true,
		move: true,
	},
};

const postTemplateHasSupportForGridView = getSettingWithCoercion(
	'postTemplateHasSupportForGridView',
	false,
	isBoolean
);

export const INNER_BLOCKS_TEMPLATE: InnerBlockTemplate[] = [
	[
		'core/heading',
		{
			level: 2,
			content: __( 'Related products', 'poocommerce' ),
			style: { spacing: { margin: { top: '1rem', bottom: '1rem' } } },
		},
	],
	[
		'core/post-template',
		{
			__poocommerceNamespace: PRODUCT_TEMPLATE_ID,
			...( postTemplateHasSupportForGridView && {
				layout: { type: 'grid', columnCount: 5 },
			} ),
		},
		[
			[
				'poocommerce/product-image',
				{
					productId: 0,
					imageSizing: 'cropped',
				},
			],
			[
				'core/post-title',
				{
					textAlign: 'center',
					level: 3,
					fontSize: 'medium',
					isLink: true,
					__poocommerceNamespace: PRODUCT_TITLE_ID,
				},
				[],
			],
			[
				'poocommerce/product-price',
				{
					textAlign: 'center',
					fontSize: 'small',
					style: {
						spacing: {
							margin: { bottom: '1rem' },
						},
					},
				},
				[],
			],
			[
				'poocommerce/product-button',
				{
					textAlign: 'center',
					fontSize: 'small',
					style: {
						spacing: {
							margin: { bottom: '1rem' },
						},
					},
				},
				[],
			],
		],
	],
];

const blockConfig = {
	name: QUERY_LOOP_ID,
	description: __( 'Display related products.', 'poocommerce' ),
	title: __( 'Related Products Controls', 'poocommerce' ),
	isActive: ( blockAttributes: BlockAttributes ) =>
		blockAttributes.namespace === VARIATION_NAME,
	icon: (
		<Icon
			icon={ stacks }
			className="wc-block-editor-components-block-icon wc-block-editor-components-block-icon--stacks"
		/>
	),
	attributes: BLOCK_ATTRIBUTES,
	// Gutenberg doesn't support this type yet, discussion here:
	// https://github.com/WordPress/gutenberg/pull/43632
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	allowedControls: [],
	innerBlocks: INNER_BLOCKS_TEMPLATE,
	scope: [ 'block' ],
};

registerProductBlockType( blockConfig, {
	isVariationBlock: true,
	variationName: VARIATION_NAME,
	isAvailableOnPostEditor: false,
} );
