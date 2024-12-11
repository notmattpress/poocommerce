/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { Icon, commentContent } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Edit } from './edit';
import sharedAttributes from '../attributes';
import save from '../save.js';
import { example } from '../example.js';

/**
 * Register and run the "Reviews by category" block.
 */
registerBlockType( 'poocommerce/reviews-by-category', {
	apiVersion: 3,
	title: __( 'Reviews by Category', 'poocommerce' ),
	icon: {
		src: (
			<Icon
				icon={ commentContent }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __(
		'Show product reviews from specific categories.',
		'poocommerce'
	),
	supports: {
		html: false,
		color: {
			background: false,
		},
		typography: {
			fontSize: true,
		},
	},
	example: {
		...example,
		attributes: {
			...example.attributes,
			categoryIds: [ 1 ],
			showProductName: true,
		},
	},
	attributes: {
		...sharedAttributes,
		/**
		 * The ids of the categories to load reviews for.
		 */
		categoryIds: {
			type: 'array',
			default: [],
		},
		/**
		 * Show the product name.
		 */
		showProductName: {
			type: 'boolean',
			default: true,
		},
	},

	/**
	 * Renders and manages the block.
	 *
	 * @param {Object} props Props to pass to block.
	 */
	edit: Edit,

	/**
	 * Save the props to post content.
	 */
	save,
} );
