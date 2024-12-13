/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { Icon, postComments } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import '../editor.scss';
import { Edit } from './edit';
import sharedAttributes from '../attributes';
import save from '../save.js';
import { example } from '../example';
import type { AllReviewsEditorProps } from './types';

/**
 * Register and run the "All Reviews" block.
 * This block lists all product reviews.
 */
registerBlockType( 'poocommerce/all-reviews', {
	apiVersion: 3,
	title: __( 'All Reviews', 'poocommerce' ),
	icon: {
		src: (
			<Icon
				icon={ postComments }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __( 'Show a list of all product reviews.', 'poocommerce' ),
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
			showProductName: true,
		},
	},
	attributes: {
		...sharedAttributes,
		/**
		 * Show the product name.
		 */
		showProductName: {
			type: 'boolean',
			default: true,
		},
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/legacy-widget' ],
				// We can't transform if raw instance isn't shown in the REST API.
				isMatch: ( { idBase, instance }: AllReviewsEditorProps ) =>
					idBase === 'poocommerce_recent_reviews' && !! instance?.raw,
				transform: ( { instance } ) =>
					createBlock( 'poocommerce/all-reviews', {
						reviewsOnPageLoad: instance.raw.number,
						imageType: 'product',
						showLoadMore: false,
						showOrderby: false,
						showReviewDate: false,
						showReviewContent: false,
					} ),
			},
		],
	},

	edit: Edit,
	save,
} );
