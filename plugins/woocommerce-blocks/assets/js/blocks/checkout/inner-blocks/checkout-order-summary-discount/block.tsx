/**
 * External dependencies
 */
import { TotalsDiscount } from '@poocommerce/base-components/cart-checkout';
import { TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	useStoreCartCoupons,
	useStoreCart,
} from '@poocommerce/base-context/hooks';
import { ExperimentalDiscountsMeta } from '@poocommerce/blocks-checkout';

const DiscountSlotFill = (): JSX.Element => {
	// Prepare props to pass to the ExperimentalOrderMeta slot fill. We need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { extensions, receiveCart, ...cart } = useStoreCart();
	const discountsSlotFillProps = {
		extensions,
		cart,
		context: 'poocommerce/checkout',
	};

	return <ExperimentalDiscountsMeta.Slot { ...discountsSlotFillProps } />;
};

const Block = ( { className = '' }: { className?: string } ): JSX.Element => {
	const { cartTotals, cartCoupons } = useStoreCart();
	const { removeCoupon, isRemovingCoupon } =
		useStoreCartCoupons( 'wc/checkout' );
	const totalsCurrency = getCurrencyFromPriceResponse( cartTotals );

	return (
		<>
			<TotalsWrapper className={ className }>
				<TotalsDiscount
					cartCoupons={ cartCoupons }
					currency={ totalsCurrency }
					isRemovingCoupon={ isRemovingCoupon }
					removeCoupon={ removeCoupon }
					values={ cartTotals }
				/>
			</TotalsWrapper>
			<DiscountSlotFill />
		</>
	);
};

export default Block;
