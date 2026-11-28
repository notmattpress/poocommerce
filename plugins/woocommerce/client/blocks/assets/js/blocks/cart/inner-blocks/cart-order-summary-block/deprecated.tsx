/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const deprecated = [
	{
		attributes: metadata.attributes,
		save: () => {
			return (
				<div { ...useBlockProps.save() }>
					<InnerBlocks.Content />
				</div>
			);
		},
		supports: metadata.supports,
		migrate: ( { attributes } ) => {
			return [
				attributes,
				[
					createBlock(
						'poocommerce/cart-order-summary-heading-block',
						{
							content: __( 'Cart totals', 'poocommerce' ),
						},
						[]
					),
					createBlock(
						'poocommerce/cart-order-summary-coupon-form-block',
						{},
						[]
					),
					createBlock(
						'poocommerce/cart-order-summary-totals-block',
						{},
						[
							createBlock(
								'poocommerce/cart-order-summary-subtotal-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/cart-order-summary-fee-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/cart-order-summary-discount-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/cart-order-summary-shipping-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/cart-order-summary-taxes-block',
								{},
								[]
							),
						]
					),
				],
			];
		},
		isEligible: ( attributes, innerBlocks ) => {
			return ! innerBlocks.some(
				( block ) =>
					block.name === 'poocommerce/cart-order-summary-totals-block'
			);
		},
	},
];

export default deprecated;
