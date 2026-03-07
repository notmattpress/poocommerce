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
export const WooPaymentGatewaySetup = ( {
	id,
	...props
}: WooPaymentGatewaySetupProps ) => (
	<Fill name={ 'poocommerce_payment_gateway_setup_' + id } { ...props } />
);

WooPaymentGatewaySetup.Slot = ( {
	id,
	fillProps,
}: WooPaymentGatewaySetupProps & {
	fillProps?: React.ComponentProps< typeof Slot >[ 'fillProps' ];
} ) => (
	<Slot
		name={ 'poocommerce_payment_gateway_setup_' + id }
		fillProps={ fillProps }
	/>
);
