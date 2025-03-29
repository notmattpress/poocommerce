/**
 * External dependencies
 */
import { Subtotal, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

const Block = ( { className = '' }: { className?: string } ): JSX.Element => {
	const { cartTotals } = useStoreCart();
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<Subtotal currency={ totalsCurrency } values={ cartTotals } />
		</TotalsWrapper>
	);
};

export default Block;
