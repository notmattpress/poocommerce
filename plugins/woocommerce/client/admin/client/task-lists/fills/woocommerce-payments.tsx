/**
 * External dependencies
 */
import React from 'react';
import { registerPlugin } from '@wordpress/plugins';
import { WooOnboardingTask } from '@poocommerce/onboarding';

/**
 * Internal dependencies
 */
import { PaymentGatewaySuggestions } from './PaymentGatewaySuggestions';

// Shows up at http://host/wp-admin/admin.php?page=wc-admin&task=poocommerce-payments which is the default url for poocommerce-payments task
const WoocommercePaymentsTaskPage = () => (
	<WooOnboardingTask id="poocommerce-payments">
		{ ( {
			onComplete,
			query,
		}: {
			onComplete: () => void;
			query: { id: string };
		} ) => (
			<PaymentGatewaySuggestions
				onComplete={ onComplete }
				query={ query }
			/>
		) }
	</WooOnboardingTask>
);

registerPlugin( 'poocommerce-admin-task-wcpay-page', {
	scope: 'poocommerce-tasks',
	render: WoocommercePaymentsTaskPage,
} );
