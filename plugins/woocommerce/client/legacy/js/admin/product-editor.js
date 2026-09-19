/* global poocommerce_admin_product_editor */
jQuery( function ( $ ) {
	$( function () {
		var editorWrapper = $( '#postdivrich' );

		/**
		 * In the Product Editor context, the footer needs to be hidden otherwise the computation of the postbox position is wrong.
		 * For more details, see https://github.com/poocommerce/poocommerce/pull/59212.
		 */
		$( '#wpfooter' ).css( { visibility: 'hidden', display: 'unset' } );

		if ( editorWrapper.length ) {
			editorWrapper.addClass( 'postbox poocommerce-product-description' );
			editorWrapper.prepend(
				'<h2 class="postbox-header"><label>' +
					poocommerce_admin_product_editor.i18n_description +
					'</label></h2>'
			);
		}
	} );
} );
