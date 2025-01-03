/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { recordEvent } from '@poocommerce/tracks';

domReady( () => {
	const enableAutorenewLink = document.querySelectorAll(
		'.poocommerce-enable-autorenew'
	);

	if ( enableAutorenewLink.length > 0 ) {
		recordEvent( 'woo_enable_autorenew_in_plugins_shown' );
		enableAutorenewLink.forEach( ( link ) => {
			link.addEventListener( 'click', function () {
				recordEvent( 'woo_enable_autorenew_in_plugins_clicked' );
			} );
		} );
	}
} );
