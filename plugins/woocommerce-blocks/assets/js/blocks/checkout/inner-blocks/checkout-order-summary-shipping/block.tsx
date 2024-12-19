/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsShipping } from '@poocommerce/base-components/cart-checkout';
import { useStoreCart } from '@poocommerce/base-context';
import { TotalsWrapper } from '@poocommerce/blocks-checkout';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import {
	filterShippingRatesByPrefersCollection,
	isAddressComplete,
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
		select( CHECKOUT_STORE_KEY ).prefersCollection()
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

	const hasCompleteAddress = isAddressComplete( shippingAddress, [
		'state',
		'country',
		'postcode',
		'city',
	] );

	return (
		<TotalsWrapper className={ className }>
			<TotalsShipping
				label={
					hasSelectedCollectionOnly
						? __( 'Collection', 'poocommerce' )
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
