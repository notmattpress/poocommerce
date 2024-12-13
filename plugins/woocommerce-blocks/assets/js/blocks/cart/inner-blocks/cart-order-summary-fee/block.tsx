/**
 * External dependencies
 */
import { TotalsFees, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

const Block = ( { className }: { className: string } ): JSX.Element => {
	const { cartFees, cartTotals } = useStoreCart();
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<TotalsFees currency={ totalsCurrency } cartFees={ cartFees } />
		</TotalsWrapper>
	);
};

export default Block;
