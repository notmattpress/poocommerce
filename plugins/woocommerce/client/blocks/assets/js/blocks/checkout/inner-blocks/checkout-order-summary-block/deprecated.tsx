/**
 * External dependencies
 */
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
						'poocommerce/checkout-order-summary-cart-items-block',
						{},
						[]
					),
					createBlock(
						'poocommerce/checkout-order-summary-coupon-form-block',
						{},
						[]
					),
					createBlock(
						'poocommerce/checkout-order-summary-totals-block',
						{},
						[
							createBlock(
								'poocommerce/checkout-order-summary-subtotal-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/checkout-order-summary-fee-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/checkout-order-summary-discount-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/checkout-order-summary-shipping-block',
								{},
								[]
							),
							createBlock(
								'poocommerce/checkout-order-summary-taxes-block',
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
					block.name ===
					'poocommerce/checkout-order-summary-totals-block'
			);
		},
	},
];

export default deprecated;
