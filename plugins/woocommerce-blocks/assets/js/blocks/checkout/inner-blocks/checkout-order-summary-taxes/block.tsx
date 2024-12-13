/**
 * External dependencies
 */
import { TotalsTaxes, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';
import { getSetting } from '@poocommerce/settings';

const Block = ( {
	className,
	showRateAfterTaxName,
}: {
	className: string;
	showRateAfterTaxName: boolean;
} ): JSX.Element | null => {
	const { cartTotals } = useStoreCart();
	const displayCartPricesIncludingTax = getSetting(
		'displayCartPricesIncludingTax',
		false
	);

	if (
		displayCartPricesIncludingTax ||
		parseInt( cartTotals.total_tax, 10 ) <= 0
	) {
		return null;
	}

	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<TotalsTaxes
				showRateAfterTaxName={ showRateAfterTaxName }
				currency={ totalsCurrency }
				values={ cartTotals }
			/>
		</TotalsWrapper>
	);
};

export default Block;
