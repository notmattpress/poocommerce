/**
 * External dependencies
 */
import { Subtotal, TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import { useStoreCart } from '@poocommerce/base-context/hooks';

export type BlockAttributes = {
	className: string;
	heading: string;
};

export type BlockProps = Omit< BlockAttributes, 'heading' > & {
	headingElement: React.ReactNode;
};

const Block = ( { className, headingElement }: BlockProps ): JSX.Element => {
	const { cartTotals } = useStoreCart();
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<TotalsWrapper className={ className }>
			<Subtotal
				label={ headingElement }
				currency={ totalsCurrency }
				values={ cartTotals }
			/>
		</TotalsWrapper>
	);
};

export default Block;
