/**
 * External dependencies
 */
import { TotalsDiscount } from '@poocommerce/base-components/cart-checkout';
import { TotalsWrapper } from '@poocommerce/blocks-components';
import { getCurrencyFromPriceResponse } from '@poocommerce/price-format';
import {
	useStoreCartCoupons,
	useStoreCart,
	useOrderSummaryLoadingState,
	useOrderSummaryRow,
} from '@poocommerce/base-context/hooks';
import {
	ExperimentalDiscountsMeta,
	applyCheckoutFilter,
} from '@poocommerce/blocks-checkout';

const couponsFilterArg = { context: 'summary' };

const DiscountSlotFill = (): JSX.Element => {
	// Prepare props to pass to the ExperimentalOrderMeta slot fill. We need to pluck out receiveCart.

	const { extensions, receiveCart, ...cart } = useStoreCart();
	const discountsSlotFillProps = {
		extensions,
		cart,
		context: 'poocommerce/checkout',
	};

	return <ExperimentalDiscountsMeta.Slot { ...discountsSlotFillProps } />;
};

const Block = ( { className = '' }: { className?: string } ): JSX.Element => {
	const { cart, isStale, wrapperProps } = useOrderSummaryRow(
		useStoreCart(),
		// Matches `TotalsDiscount`, so coupons that a `coupons` filter adds still show.
		( { cartCoupons, cartTotals } ) =>
			!! parseInt( cartTotals.total_discount, 10 ) ||
			applyCheckoutFilter( {
				arg: couponsFilterArg,
				filterName: 'coupons',
				defaultValue: cartCoupons,
			} ).length > 0
	);
	const { removeCoupon, isRemovingCoupon } =
		useStoreCartCoupons( 'wc/checkout' );
	const { isLoading } = useOrderSummaryLoadingState();

	return (
		<>
			{ /* Kept before the slot, so the slot stays mounted and its fills keep their state. */ }
			{ cart && (
				<TotalsWrapper className={ className } { ...wrapperProps }>
					<TotalsDiscount
						cartCoupons={ cart.cartCoupons }
						currency={ getCurrencyFromPriceResponse(
							cart.cartTotals
						) }
						isRemovingCoupon={ isRemovingCoupon }
						removeCoupon={ removeCoupon }
						values={ cart.cartTotals }
						isLoading={ isLoading }
						disabled={ isStale }
					/>
				</TotalsWrapper>
			) }
			<DiscountSlotFill />
		</>
	);
};

export default Block;
