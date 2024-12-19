/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
import { LOGIN_URL } from '@poocommerce/block-settings';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';

const LOGIN_TO_CHECKOUT_URL = `${ LOGIN_URL }?redirect_to=${ encodeURIComponent(
	window.location.href
) }`;

const LoginPrompt = () => {
	const customerId = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).getCustomerId()
	);

	if ( ! getSetting( 'checkoutShowLoginReminder', true ) || customerId ) {
		return null;
	}

	return (
		<a
			className="wc-block-checkout__login-prompt"
			href={ LOGIN_TO_CHECKOUT_URL }
		>
			{ __( 'Log in', 'poocommerce' ) }
		</a>
	);
};

export default LoginPrompt;
