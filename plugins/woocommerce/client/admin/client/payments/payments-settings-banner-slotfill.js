/**
 * External dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { PaymentsBannerWrapper } from './payment-settings-banner';
import { SETTINGS_SLOT_FILL_CONSTANT } from '../settings/settings-slots';

const { Fill } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );
const PaymentsBannerFill = () => {
	return (
		<Fill>
			<PaymentsBannerWrapper />
		</Fill>
	);
};

export const registerPaymentsSettingsBannerFill = () => {
	registerPlugin( 'poocommerce-admin-paymentsgateways-settings-banner', {
		scope: 'poocommerce-payments-settings',
		render: PaymentsBannerFill,
	} );
};
