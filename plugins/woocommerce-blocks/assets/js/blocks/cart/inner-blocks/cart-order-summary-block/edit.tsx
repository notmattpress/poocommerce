/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import type { TemplateArray } from '@wordpress/blocks';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import { __ } from '@wordpress/i18n';
import { TotalsFooterItem } from '@poocommerce/base-components/cart-checkout';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

/**
 * Internal dependencies
 */
import {
	useForcedLayout,
	getAllowedBlocks,
} from '../../../cart-checkout-shared';
import { OrderMetaSlotFill } from './slotfills';

export const Edit = ( { clientId }: { clientId: string } ): JSX.Element => {
	const blockProps = useBlockProps();
	const { cartTotals } = useStoreCart();
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );
	const allowedBlocks = getAllowedBlocks(
		innerBlockAreas.CART_ORDER_SUMMARY
	);
	const defaultTemplate = [
		[
			'poocommerce/cart-order-summary-heading-block',
			{
				content: __( 'Cart totals', 'poocommerce' ),
			},
			[],
		],
		[ 'poocommerce/cart-order-summary-coupon-form-block', {}, [] ],
		[ 'poocommerce/cart-order-summary-totals-block', {}, [] ],
	] as TemplateArray;

	useForcedLayout( {
		clientId,
		registeredBlocks: allowedBlocks,
		defaultTemplate,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ allowedBlocks }
				template={ defaultTemplate }
			/>
			<div className="wc-block-components-totals-wrapper">
				<TotalsFooterItem
					currency={ totalsCurrency }
					values={ cartTotals }
				/>
			</div>
			{ /* do I put an totals wrapper here? */ }
			<OrderMetaSlotFill />
		</div>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};
