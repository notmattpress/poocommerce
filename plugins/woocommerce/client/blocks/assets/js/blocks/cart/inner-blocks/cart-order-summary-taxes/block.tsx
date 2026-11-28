/**
 * External dependencies
 */
import { TotalsTaxes, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	useStoreCart,
	useOrderSummaryLoadingState,
	useOrderSummaryRow,
} from '@poocommerce/base-context';
import { getSetting } from '@poocommerce/settings';

const Block = ( {
	className,
	showRateAfterTaxName,
}: {
	className: string;
	showRateAfterTaxName: boolean;
} ) => {
	const { isLoading } = useOrderSummaryLoadingState();
	const { cart, wrapperProps } = useOrderSummaryRow(
		useStoreCart(),
		( { cartTotals } ) =>
			! getSetting( 'displayCartPricesIncludingTax', false ) &&
			parseInt( cartTotals.total_tax, 10 ) > 0
	);

	if ( ! cart ) {
		return null;
	}

	const totalsCurrency = getCurrencyFromPriceResponse( cart.cartTotals );

	return (
		<TotalsWrapper className={ className } { ...wrapperProps }>
			<TotalsTaxes
				showRateAfterTaxName={ showRateAfterTaxName }
				currency={ totalsCurrency }
				values={ cart.cartTotals }
				showSkeleton={ isLoading }
			/>
		</TotalsWrapper>
	);
};

export default Block;
