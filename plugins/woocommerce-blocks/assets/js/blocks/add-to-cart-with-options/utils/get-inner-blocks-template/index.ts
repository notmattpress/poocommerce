/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { InnerBlockTemplate } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { QuantitySelectorStyleProps } from '../../types';

const getInnerBlocksTemplate = (
	quantitySelectorStyle: QuantitySelectorStyleProps = 'input'
) => {
	const INNER_BLOCKS_TEMPLATE: InnerBlockTemplate[] = [
		[
			'core/heading',
			{
				level: 2,
				content: __( 'Add to Cart', 'poocommerce' ),
			},
		],
		[ 'poocommerce/add-to-cart-with-options-variation-selector' ],
		[ 'poocommerce/product-stock-indicator' ],
		[
			'poocommerce/add-to-cart-with-options-quantity-selector',
			{
				quantitySelectorStyle,
			},
		],
		[
			'poocommerce/product-button',
			{
				textAlign: 'center',
				fontSize: 'small',
			},
		],
	];

	return INNER_BLOCKS_TEMPLATE;
};

export default getInnerBlocksTemplate;
