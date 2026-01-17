/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsShipping } from '@poocommerce/base-components/cart-checkout';
import { useStoreCart } from '@poocommerce/base-context';
import { TotalsWrapper } from '@poocommerce/blocks-checkout';
import { hasSelectedShippingRate } from '@poocommerce/base-utils';

const Block = ( { className }: { className: string } ) => {
	const { cartNeedsShipping, shippingRates } = useStoreCart();

	if ( ! cartNeedsShipping ) {
		return null;
	}

	const hasSelectedRates = hasSelectedShippingRate( shippingRates );

	if ( ! hasSelectedRates ) {
		return null;
	}

	return (
		<TotalsWrapper className={ className }>
			<TotalsShipping
				label={ __( 'Shipping', 'poocommerce' ) }
				placeholder={
					<span className="wc-block-components-shipping-placeholder__value">
						{ __( 'Calculated at checkout', 'poocommerce' ) }
					</span>
				}
			/>
		</TotalsWrapper>
	);
};

export default Block;
