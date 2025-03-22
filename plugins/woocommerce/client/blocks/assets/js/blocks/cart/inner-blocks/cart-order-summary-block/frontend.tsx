/**
 * External dependencies
 */
import { TotalsFooterItem } from '@poocommerce/base-components/cart-checkout';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

/**
 * Internal dependencies
 */
import { OrderMetaSlotFill } from './slotfills';

const FrontendBlock = ( {
	children,
	className = '',
}: {
	children?: JSX.Element | JSX.Element[];
	className?: string;
} ): JSX.Element | null => {
	const { cartTotals } = useStoreCart();
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<div className={ className }>
			{ children }
			<div className="wc-block-components-totals-wrapper">
				<TotalsFooterItem
					currency={ totalsCurrency }
					values={ cartTotals }
				/>
			</div>
			<OrderMetaSlotFill />
		</div>
	);
};

export default FrontendBlock;
