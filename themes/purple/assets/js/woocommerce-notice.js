/* global ajaxurl, purplePooCommerceNotice */
( function ( $ ) {
	$( document ).on( 'click', '#purple-poocommerce-notice .notice-dismiss', function () {
		$.post( ajaxurl, {
			action: 'purple_dismiss_poocommerce_notice',
			nonce: purplePooCommerceNotice.nonce
		} );
	} );
} )( jQuery );
