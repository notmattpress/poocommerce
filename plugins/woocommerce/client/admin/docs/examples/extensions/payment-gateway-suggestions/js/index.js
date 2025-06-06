/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createElement } from '@wordpress/element';
import { PAYMENT_GATEWAYS_STORE_NAME } from '@poocommerce/data';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch } from '@wordpress/data';
import { WooPaymentGatewayConfigure } from '@poocommerce/onboarding';

const MyPaymentGatewaySuggestion = () => {
	const { updatePaymentGateway } = useDispatch( PAYMENT_GATEWAYS_STORE_NAME );

	return (
		<WooPaymentGatewayConfigure id={ 'my-slot-filled-gateway' }>
			{ ( { markConfigured, paymentGateway } ) => {
				const completeSetup = () => {
					updatePaymentGateway( paymentGateway.id, {
						settings: {
							my_setting: 123,
						},
					} ).then( () => {
						markConfigured();
					} );
				};

				return (
					<>
						<p>
							{ __(
								"This payment's configuration screen can be slot filled with any custom content.",
								'poocommerce-admin'
							) }
						</p>
						<button onClick={ completeSetup }>
							{ __( 'Complete', 'poocommerce-admin' ) }
						</button>
					</>
				);
			} }
		</WooPaymentGatewayConfigure>
	);
};

export default registerPlugin( 'my-payment-gateway-suggestion', {
	render: MyPaymentGatewaySuggestion,
	scope: 'poocommerce-tasks',
} );
