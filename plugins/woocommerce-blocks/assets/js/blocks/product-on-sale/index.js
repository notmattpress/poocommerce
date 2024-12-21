/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { Icon, percent } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import Block from './block';
import './editor.scss';
import sharedAttributes, {
	sharedAttributeBlockTypes,
} from '../../utils/shared-attributes';

registerBlockType( 'poocommerce/product-on-sale', {
	title: __( 'On Sale Products', 'poocommerce' ),
	apiVersion: 3,
	icon: {
		src: (
			<Icon
				icon={ percent }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __(
		'Display a grid of products currently on sale.',
		'poocommerce'
	),
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
		inserter: false,
	},
	attributes: {
		...sharedAttributes,

		/**
		 * How to order the products: 'date', 'popularity', 'price_asc', 'price_desc' 'rating', 'title'.
		 */
		orderby: {
			type: 'string',
			default: 'date',
		},
	},
	transforms: {
		from: [
			{
				type: 'block',
				blocks: sharedAttributeBlockTypes.filter(
					( value ) => value !== 'poocommerce/product-on-sale'
				),
				transform: ( attributes ) =>
					createBlock( 'poocommerce/product-on-sale', attributes ),
			},
		],
	},

	/**
	 * Renders and manages the block.
	 *
	 * @param {Object} props Props to pass to block.
	 */
	edit( props ) {
		return <Block { ...props } />;
	},

	save() {
		return null;
	},
} );
