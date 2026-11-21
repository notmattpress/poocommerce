/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsShipping } from '@poocommerce/base-components/cart-checkout';
import { useStoreCart } from '@poocommerce/base-context';
import { TotalsWrapper } from '@poocommerce/blocks-checkout';
import { useSelect } from '@wordpress/data';
import { cartStore, checkoutStore } from '@poocommerce/block-data';
import {
	filterShippingRatesByPrefersCollection,
	hasAllFieldsForShippingRates,
} from '@poocommerce/base-utils';
import { Skeleton } from '@poocommerce/base-components/skeleton';

const Block = ( {
	className = '',
}: {
	className?: string;
} ): JSX.Element | null => {
	const { cartNeedsShipping, shippingRates, shippingAddress } =
		useStoreCart();
	const { prefersCollection, isShippingRatesStale } = useSelect(
		( select ) => ( {
			prefersCollection: select( checkoutStore ).prefersCollection(),
			isShippingRatesStale: select( cartStore ).isShippingRatesStale(),
		} ),
		[]
	);

	if ( ! cartNeedsShipping ) {
		return null;
	}

	const filteredRates = filterShippingRatesByPrefersCollection(
		shippingRates,
		prefersCollection ?? false
	);

	const hasCompleteAddress = hasAllFieldsForShippingRates( shippingAddress );

	// Rates for a completed address are still on their way, so expect some rather than reporting there are none.
	const placeholder =
		hasCompleteAddress && isShippingRatesStale ? (
			<Skeleton
				width="45px"
				height="1em"
				ariaMessage={ __( 'Loading price…', 'poocommerce' ) }
			/>
		) : (
			<span className="wc-block-components-shipping-placeholder__value">
				{ hasCompleteAddress
					? __( 'No available delivery option', 'poocommerce' )
					: __( 'Enter address to calculate', 'poocommerce' ) }
			</span>
		);

	return (
		<TotalsWrapper className={ className }>
			<TotalsShipping
				shippingRates={ filteredRates }
				label={
					prefersCollection
						? __( 'Pickup', 'poocommerce' )
						: __( 'Delivery', 'poocommerce' )
				}
				placeholder={ placeholder }
			/>
		</TotalsWrapper>
	);
};

export default Block;
