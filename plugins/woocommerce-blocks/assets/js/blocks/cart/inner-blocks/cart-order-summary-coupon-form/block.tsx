/**
 * External dependencies
 */
import { TotalsCoupon } from '@poocommerce/base-components/cart-checkout';
import { useStoreCartCoupons } from '@poocommerce/base-context/hooks';
import { getSetting } from '@poocommerce/settings';
import { TotalsWrapper } from '@poocommerce/blocks-components';

const Block = ( { className }: { className: string } ): JSX.Element | null => {
	const couponsEnabled = getSetting( 'couponsEnabled', true );

	const { applyCoupon, isApplyingCoupon } = useStoreCartCoupons( 'wc/cart' );

	if ( ! couponsEnabled ) {
		return null;
	}

	return (
		<TotalsWrapper className={ className }>
			<TotalsCoupon
				onSubmit={ applyCoupon }
				isLoading={ isApplyingCoupon }
				instanceId="coupon"
			/>
		</TotalsWrapper>
	);
};

export default Block;
