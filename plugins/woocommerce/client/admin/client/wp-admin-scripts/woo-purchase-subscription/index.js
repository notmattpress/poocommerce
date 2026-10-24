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
		'.poocommerce-purchase-subscription',
		'woo_purchase_subscription_in_plugins'
	);
} );
