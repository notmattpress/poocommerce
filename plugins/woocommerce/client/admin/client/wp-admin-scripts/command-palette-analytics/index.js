/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useEffect } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { registerCommandWithTracking } from '../command-palette/register-command-with-tracking';
import { useEditedPostType } from '../command-palette/use-edited-post-type';

const registerPooCommerceAnalyticsCommand = ( { label, path, origin } ) => {
	registerCommandWithTracking( {
		name: `poocommerce${ path }`,
		label: sprintf(
			// translators: %s is the title of the Analytics Page. This is used as a command in the Command Palette.
			__( 'PooCommerce Analytics: %s', 'poocommerce' ),
			label
		),
		icon: chartBar,
		callback: () => {
			document.location = addQueryArgs( 'admin.php', {
				page: 'wc-admin',
				path,
			} );
		},
		origin,
	} );
};

const PooCommerceAnalyticsCommands = () => {
	const { editedPostType } = useEditedPostType();
	const origin = editedPostType ? editedPostType + '-editor' : null;

	useEffect( () => {
		if (
			window.hasOwnProperty( 'wcCommandPaletteAnalytics' ) &&
			window.wcCommandPaletteAnalytics.hasOwnProperty( 'reports' ) &&
			Array.isArray( window.wcCommandPaletteAnalytics.reports )
		) {
			const analyticsReports = window.wcCommandPaletteAnalytics.reports;

			analyticsReports.forEach( ( analyticsReport ) => {
				registerPooCommerceAnalyticsCommand( {
					label: analyticsReport.title,
					path: analyticsReport.path,
					origin,
				} );
			} );
		}
	}, [ origin ] );

	return null;
};

registerPlugin( 'poocommerce-analytics-commands-registration', {
	render: PooCommerceAnalyticsCommands,
} );
