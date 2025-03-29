/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Icon, warning } from '@wordpress/icons';

export const setupErrorTypes = {
	DOWNLOAD: 'download',
	INSTALL: 'install',
	ACTIVATE: 'activate',
	SETUP: 'setup',
	START: 'start',
};

const setupErrorDescriptions = {
	[ setupErrorTypes.DOWNLOAD ]: __( 'download', 'poocommerce' ),
	[ setupErrorTypes.INSTALL ]: __( 'install', 'poocommerce' ),
	[ setupErrorTypes.ACTIVATE ]: __( 'activate', 'poocommerce' ),
	[ setupErrorTypes.SETUP ]: __( 'set up', 'poocommerce' ),
	[ setupErrorTypes.START ]: __( 'start', 'poocommerce' ),
};

export default function SetupNotice( { isSetupError, errorReason } ) {
	const getErrorMessage = ( errorType ) => {
		// Default to 'set up' description if the error type somehow doesn't exist.
		const description =
			errorType in setupErrorDescriptions
				? setupErrorDescriptions[ errorType ]
				: setupErrorDescriptions[ setupErrorTypes.SETUP ];

		return sprintf(
			/* translators: %s is the action from the setup error description above */
			__(
				'Unable to %s the plugin. Refresh the page and try again.',
				'poocommerce'
			),
			description
		);
	};

	if ( ! isSetupError ) {
		return null;
	}

	return (
		<div className="wc-admin-shipping-banner-install-error">
			<Icon icon={ warning } className="warning-icon" />
			{ getErrorMessage( errorReason ) }
		</div>
	);
}
