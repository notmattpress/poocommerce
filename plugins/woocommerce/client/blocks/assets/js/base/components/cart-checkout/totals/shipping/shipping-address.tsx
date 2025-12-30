/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	formatShippingAddress,
	hasShippingRate,
	hasAllFieldsForShippingRates,
} from '@poocommerce/base-utils';
import { useStoreCart } from '@poocommerce/base-context';
import {
	ShippingCalculatorPanel,
	ShippingCalculatorContext,
} from '@poocommerce/base-components/cart-checkout';
import { useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
import { createInterpolateElement, useContext } from '@wordpress/element';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { getPickupLocation } from './utils';

export const ShippingAddress = (): JSX.Element => {
	const { shippingRates, shippingAddress } = useStoreCart();
	const prefersCollection = useSelect( ( select ) =>
		select( checkoutStore ).prefersCollection()
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

	const addressComplete = hasAllFieldsForShippingRates( shippingAddress );

	const shippingCostRequiresAddress = getSetting< boolean >(
		'shippingCostRequiresAddress',
		false
	);

	const showEnterAddressMessage =
		shippingCostRequiresAddress && ! addressComplete;

	const addressLabel = prefersCollection
		? // Translators: <address/> is the pickup location.
		  __( 'Collection from <address/>', 'poocommerce' )
		: deliversToLabel;

	const title = (
		<p className="wc-block-components-totals-shipping-address-summary">
			{ !! formattedAddress && ! showEnterAddressMessage ? (
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
