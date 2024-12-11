/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	formatShippingAddress,
	hasShippingRate,
} from '@poocommerce/base-utils';
import { useStoreCart } from '@poocommerce/base-context';
import {
	ShippingCalculatorPanel,
	ShippingCalculatorContext,
} from '@poocommerce/base-components/cart-checkout';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { createInterpolateElement, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getPickupLocation } from './utils';

export const ShippingAddress = (): JSX.Element => {
	const { shippingRates, shippingAddress } = useStoreCart();
	const prefersCollection = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).prefersCollection()
	);

	const hasRates = hasShippingRate( shippingRates );

	const { showCalculator } = useContext( ShippingCalculatorContext );

	const formattedAddress = prefersCollection
		? getPickupLocation( shippingRates )
		: formatShippingAddress( shippingAddress );

	const deliversToLabel = hasRates
		? // Translators: <address/> is the formatted shipping address.
		  __( 'Delivers to <address/>', 'poocommerce' )
		: // Translators: <address/> is the formatted shipping address.
		  __( 'No delivery options available for <address/>', 'poocommerce' );

	const addressLabel = prefersCollection
		? // Translators: <address/> is the pickup location.
		  __( 'Collection from <address/>', 'poocommerce' )
		: deliversToLabel;

	const title = (
		<p className="wc-block-components-totals-shipping-address-summary">
			{ !! formattedAddress ? (
				createInterpolateElement( addressLabel, {
					address: <strong>{ formattedAddress }</strong>,
				} )
			) : (
				<>
					{ __(
						'Enter address to check delivery options',
						'poocommerce'
					) }
				</>
			) }
		</p>
	);

	return (
		<div className="wc-block-components-shipping-address">
			{ showCalculator && <ShippingCalculatorPanel title={ title } /> }
		</div>
	);
};

export default ShippingAddress;
