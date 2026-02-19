/**
 * External dependencies
 */
import { TotalsFees, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

const Block = ( { className }: { className: string } ) => {
	const { cartFees, cartTotals } = useStoreCart();

	// Hide if there are no fees to show.
	if ( ! cartFees.length ) {
		return null;
	}

	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<TotalsFees currency={ totalsCurrency } cartFees={ cartFees } />
		</TotalsWrapper>
	);
};

export default Block;
