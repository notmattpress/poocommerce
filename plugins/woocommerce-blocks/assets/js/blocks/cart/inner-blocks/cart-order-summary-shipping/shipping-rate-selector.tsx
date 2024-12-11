/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ShippingRatesControl } from '@poocommerce/base-components/cart-checkout';
import { useStoreCart } from '@poocommerce/base-context/hooks';

export const ShippingRateSelector = () => {
	const { shippingRates, isLoadingRates } = useStoreCart();

	return (
		<fieldset className="wc-block-components-totals-shipping__fieldset">
			<legend className="screen-reader-text">
				{ __( 'Shipping options', 'poocommerce' ) }
			</legend>
			<ShippingRatesControl
				className="wc-block-components-totals-shipping__options"
				shippingRates={ shippingRates }
				isLoadingRates={ isLoadingRates }
				context="poocommerce/cart"
			/>
		</fieldset>
	);
};

export default ShippingRateSelector;
