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
export const WooPaymentGatewayConfigure = ( {
	id,
	...props
}: WooPaymentGatewayConfigureProps ) => (
	<Fill name={ 'poocommerce_payment_gateway_configure_' + id } { ...props } />
);

WooPaymentGatewayConfigure.Slot = ( {
	id,
	fillProps,
}: WooPaymentGatewayConfigureProps & {
	fillProps?: React.ComponentProps< typeof Slot >[ 'fillProps' ];
} ) => (
	<Slot
		name={ 'poocommerce_payment_gateway_configure_' + id }
		fillProps={ fillProps }
	/>
);
