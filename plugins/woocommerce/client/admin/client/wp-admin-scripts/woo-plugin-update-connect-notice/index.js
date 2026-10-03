/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import { trackPluginNoticeLinks } from '~/utils/plugin-notice-tracking';

domReady( () => {
	trackPluginNoticeLinks(
		'.poocommerce-connect-your-store',
		'woo_connect_notice_in_plugins'
	);
} );
