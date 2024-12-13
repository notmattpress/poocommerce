/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { InnerBlocks } from '@wordpress/block-editor';
import { cart } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';
import { registerBlockType, createBlock } from '@wordpress/blocks';
/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import './style.scss';
import { blockName, blockAttributes } from './attributes';
import './inner-blocks';

/**
 * Register and run the Cart block.
 */
const settings = {
	title: __( 'Cart', 'poocommerce' ),
	apiVersion: 3,
	icon: {
		src: (
			<Icon
				icon={ cart }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __( 'Shopping cart.', 'poocommerce' ),
	supports: {
		align: [ 'wide' ],
		html: false,
		multiple: false,
	},
	example: {
		attributes: {
			isPreview: true,
		},
		viewportWidth: 800,
	},
	attributes: blockAttributes,
	edit: Edit,
	save: Save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'poocommerce/classic-shortcode' ],
				transform: ( attributes ) => {
					return createBlock(
						'poocommerce/classic-shortcode',
						{
							shortcode: 'cart',
							align: attributes.align,
						},
						[]
					);
				},
			},
		],
	},
	// Migrates v1 to v2 checkout.
	deprecated: [
		{
			attributes: blockAttributes,
			save: ( { attributes } ) => {
				return (
					<div
						className={ clsx( 'is-loading', attributes.className ) }
					>
						<InnerBlocks.Content />
					</div>
				);
			},
			migrate: ( attributes, innerBlocks ) => {
				const { checkoutPageId, align } = attributes;
				return [
					attributes,
					[
						createBlock(
							'poocommerce/filled-cart-block',
							{ align },
							[
								createBlock( 'poocommerce/cart-items-block' ),
								createBlock(
									'poocommerce/cart-totals-block',
									{},
									[
										createBlock(
											'poocommerce/cart-order-summary-block',
											{}
										),
										createBlock(
											'poocommerce/cart-express-payment-block'
										),
										createBlock(
											'poocommerce/proceed-to-checkout-block',
											{ checkoutPageId }
										),
										createBlock(
											'poocommerce/cart-accepted-payment-methods-block'
										),
									]
								),
							]
						),
						createBlock(
							'poocommerce/empty-cart-block',
							{ align },
							innerBlocks
						),
					],
				];
			},
			isEligible: ( _, innerBlocks ) => {
				return ! innerBlocks.find(
					( block ) => block.name === 'poocommerce/filled-cart-block'
				);
			},
		},
	],
};

registerBlockType( blockName, settings );
