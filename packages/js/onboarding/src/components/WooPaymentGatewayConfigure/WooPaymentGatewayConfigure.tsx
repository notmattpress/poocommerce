/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Slot, Fill } from '@wordpress/components';

type WooPaymentGatewayConfigureProps = {
	id: string;
};

/**
 * PooCommerce Payment Gateway configuration
 *
 * @slotFill WooPaymentGatewayConfigure
 * @scope poocommerce-admin
 * @param {Object} props    React props.
 * @param {string} props.id gateway id.
 */
export const WooPaymentGatewayConfigure: React.FC< WooPaymentGatewayConfigureProps > & {
	Slot: React.VFC< React.ComponentProps< typeof Slot > & { id: string } >;
} = ( { id, ...props } ) => (
	<Fill name={ 'poocommerce_payment_gateway_configure_' + id } { ...props } />
);

WooPaymentGatewayConfigure.Slot = ( { id, fillProps } ) => (
	<Slot
		name={ 'poocommerce_payment_gateway_configure_' + id }
		fillProps={ fillProps }
	/>
);
