/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { WooHeaderItem } from '@poocommerce/admin-layout';
import { useUserPreferences } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { Banner } from './banner';

export const MobileAppBanner = () => {
	const { updateUserPreferences, ...userData } = useUserPreferences();
	const isDismissed = userData.android_app_banner_dismissed === 'yes';

	const onClick = () => {
		updateUserPreferences( {
			android_app_banner_dismissed: 'yes',
		} );
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<WooHeaderItem>
			<Banner onDismiss={ onClick } onInstall={ onClick } />
		</WooHeaderItem>
	);
};

registerPlugin( 'mobile-banner-header-item', {
	render: MobileAppBanner,
	scope: 'poocommerce-admin',
} );
