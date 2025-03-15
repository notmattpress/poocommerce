/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Slot, Fill } from '@wordpress/components';

type WooPaymentGatewaySetupProps = {
	id: string;
};
/**
 * PooCommerce Payment Gateway setup.
 *
 * @slotFill WooPaymentGatewaySetup
 * @scope poocommerce-admin
 * @param {Object} props    React props.
 * @param {string} props.id Setup id.
 */
export const WooPaymentGatewaySetup: React.FC< WooPaymentGatewaySetupProps > & {
	Slot: React.VFC< React.ComponentProps< typeof Slot > & { id: string } >;
} = ( { id, ...props } ) => (
	<Fill name={ 'poocommerce_payment_gateway_setup_' + id } { ...props } />
);

WooPaymentGatewaySetup.Slot = ( { id, fillProps } ) => (
	<Slot
		name={ 'poocommerce_payment_gateway_setup_' + id }
		fillProps={ fillProps }
	/>
);
