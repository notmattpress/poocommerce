/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { WC_BLOCKS_IMAGE_URL } from '@poocommerce/block-settings';

export const previewCategories = [
	{
		id: 1,
		name: __( 'Clothing', 'poocommerce' ),
		slug: 'clothing',
		parent: 0,
		count: 10,
		description: `<p>${ __(
			'Branded t-shirts, jumpers, pants and more!',
			'poocommerce'
		) }</p>\n`,
		image: {
			id: 1,
			date_created: '2019-07-15T17:05:04',
			date_created_gmt: '2019-07-15T17:05:04',
			date_modified: '2019-07-15T17:05:04',
			date_modified_gmt: '2019-07-15T17:05:04',
			src: WC_BLOCKS_IMAGE_URL + 'previews/collection.jpg',
			name: '',
			alt: '',
		},
		permalink: '#',
	},
];
