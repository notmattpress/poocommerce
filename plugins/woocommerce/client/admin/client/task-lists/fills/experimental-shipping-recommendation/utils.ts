/**
 * External dependencies
 */

import { getAdminLink } from '@poocommerce/settings';

export const redirectToWCSSettings = () => {
	if ( window?.location ) {
		window.location.href = getAdminLink(
			'admin.php?page=wc-settings&tab=shipping&section=poocommerce-services-settings'
		);
	}
};
