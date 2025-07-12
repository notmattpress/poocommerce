/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsShipping } from '@poocommerce/base-components/cart-checkout';
import { useStoreCart } from '@poocommerce/base-context';
import { TotalsWrapper } from '@poocommerce/blocks-checkout';
import { useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
import {
	filterShippingRatesByPrefersCollection,
	hasAllFieldsForShippingRates,
	selectedRatesAreCollectable,
} from '@poocommerce/base-utils';

const Block = ( {
	className = '',
}: {
	className?: string;
} ): JSX.Element | null => {
	const { cartNeedsShipping, shippingRates, shippingAddress } =
		useStoreCart();
	const prefersCollection = useSelect( ( select ) =>
		select( checkoutStore ).prefersCollection()
	);

	if ( ! cartNeedsShipping ) {
		return null;
	}

	const hasSelectedCollectionOnly = selectedRatesAreCollectable(
		filterShippingRatesByPrefersCollection(
			shippingRates,
			prefersCollection ?? false
		)
	);

	const hasCompleteAddress = hasAllFieldsForShippingRates( shippingAddress );
	return (
		<TotalsWrapper className={ className }>
			<TotalsShipping
				label={
					hasSelectedCollectionOnly
						? __( 'Pickup', 'poocommerce' )
						: __( 'Delivery', 'poocommerce' )
				}
				placeholder={
					<span className="wc-block-components-shipping-placeholder__value">
						{ hasCompleteAddress
							? __(
									'No available delivery option',
									'poocommerce'
							  )
							: __(
									'Enter address to calculate',
									'poocommerce'
							  ) }
					</span>
				}
			/>
		</TotalsWrapper>
	);
};

export default Block;
