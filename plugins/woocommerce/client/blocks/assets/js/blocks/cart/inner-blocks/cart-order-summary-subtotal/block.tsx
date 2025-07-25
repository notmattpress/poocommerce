/**
 * External dependencies
 */
import { Subtotal, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	useStoreCart,
	useOrderSummaryLoadingState,
} from '@poocommerce/base-context/hooks';

const Block = ( { className = '' }: { className?: string } ) => {
	const { cartTotals } = useStoreCart();
	const { isLoading } = useOrderSummaryLoadingState();

	// Hide if there are no other totals to show.
	if (
		! parseFloat( cartTotals.total_fees ) &&
		! parseFloat( cartTotals.total_discount ) &&
		! parseFloat( cartTotals.total_shipping )
	) {
		return null;
	}

	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<Subtotal
				currency={ totalsCurrency }
				values={ cartTotals }
				showSkeleton={ isLoading }
			/>
		</TotalsWrapper>
	);
};

export default Block;
