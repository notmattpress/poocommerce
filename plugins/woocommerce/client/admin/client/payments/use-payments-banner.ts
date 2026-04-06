/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	onboardingStore,
	PAYMENT_GATEWAYS_STORE_NAME,
	PaymentGateway,
} from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { isWcPaySupported } from './utils';

export const usePaymentsBanner = () => {
	const {
		installedPaymentGateways,
		paymentGatewaySuggestions,
		hasFinishedResolution,
	} = useSelect( ( select ) => {
		return {
			installedPaymentGateways: select(
				PAYMENT_GATEWAYS_STORE_NAME
			).getPaymentGateways(),
			paymentGatewaySuggestions:
				select( onboardingStore ).getPaymentGatewaySuggestions(),
			hasFinishedResolution:
				select( onboardingStore ).hasFinishedResolution(
					'getPaymentGatewaySuggestions',
					[]
				) &&
				select( PAYMENT_GATEWAYS_STORE_NAME ).hasFinishedResolution(
					'getPaymentGateways'
				),
		};
	}, [] );

	const isWcPayInstalled = installedPaymentGateways.some(
		( gateway: PaymentGateway ) => {
			return gateway.id === 'poocommerce_payments';
		}
	);

	const isWcPayDisabled = installedPaymentGateways.find(
		( gateway: PaymentGateway ) => {
			return (
				gateway.id === 'poocommerce_payments' &&
				gateway.enabled === false
			);
		}
	);

	const shouldShowBanner =
		isWcPaySupported( paymentGatewaySuggestions ) &&
		isWcPayInstalled &&
		isWcPayDisabled;

	return {
		hasFinishedResolution,
		shouldShowBanner,
	};
};
