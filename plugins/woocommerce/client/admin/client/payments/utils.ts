/**
 * External dependencies
 */
import { Plugin } from '@poocommerce/data';

export const isWcPaySupported = ( paymentGatewaySuggestions: Plugin[] ) =>
	paymentGatewaySuggestions &&
	paymentGatewaySuggestions.filter( ( paymentGatewaySuggestion: Plugin ) => {
		return (
			paymentGatewaySuggestion.id.indexOf( 'poocommerce_payments' ) === 0
		);
	} ).length === 1;
