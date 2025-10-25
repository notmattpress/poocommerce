/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { blocksConfig } from '@poocommerce/block-settings';

export const previewReviews = [
	{
		id: 1,
		date_created: '2019-07-15T17:05:04',
		formatted_date_created: __( 'July 15, 2019', 'poocommerce' ),
		date_created_gmt: '2019-07-15T15:05:04',
		product_id: 0,
		product_name: __( 'WordPress Pennant', 'poocommerce' ),
		product_permalink: '#',
		/* translators: An example person name used for the block previews. */
		reviewer: __( 'Alice', 'poocommerce' ),
		review: `<p>${ __(
			"I bought this product last week and I'm very happy with it.",
			'poocommerce'
		) }</p>\n`,
		reviewer_avatar_urls: {
			48: blocksConfig.defaultAvatar,
			96: blocksConfig.defaultAvatar,
		},
		rating: 5,
		verified: true,
	},
	{
		id: 2,
		date_created: '2019-07-12T12:39:39',
		formatted_date_created: __( 'July 12, 2019', 'poocommerce' ),
		date_created_gmt: '2019-07-12T10:39:39',
		product_id: 0,
		product_name: __( 'WordPress Pennant', 'poocommerce' ),
		product_permalink: '#',
		/* translators: An example person name used for the block previews. */
		reviewer: __( 'Bob', 'poocommerce' ),
		review: `<p>${ __(
			'This product is awesome, I love it!',
			'poocommerce'
		) }</p>\n`,
		reviewer_avatar_urls: {
			48: blocksConfig.defaultAvatar,
			96: blocksConfig.defaultAvatar,
		},
		rating: null,
		verified: false,
	},
];
