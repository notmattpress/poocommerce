/* global Cookies */
jQuery( function ( $ ) {
	// Orderby
	$( '.poocommerce-ordering' ).on( 'change', 'select.orderby', function () {
		$( this ).closest( 'form' ).trigger( 'submit' );
	} );

	// Target quantity inputs on product pages
	$( 'input.qty:not(.product-quantity input.qty)' ).each( function () {
		var min = parseFloat( $( this ).attr( 'min' ) );

		if ( min >= 0 && parseFloat( $( this ).val() ) < min ) {
			$( this ).val( min );
		}
	} );

	// Global accessibility handler for all links with role="button"
	// This ensures both spacebar and enter keypresses trigger click events, as per ARIA specification
	document.body.addEventListener( 'keydown', function ( event ) {
		if ( ! event.target.matches( 'a[role="button"]' ) ) {
			return;
		}

		if ( event.key === ' ' || event.key === 'Enter' ) {
			event.preventDefault();
			event.target.click();
		}
	} );

	var noticeID = $( '.poocommerce-store-notice' ).data( 'noticeId' ) || '',
		cookieName = 'store_notice' + noticeID;

	// Check the value of that cookie and show/hide the notice accordingly
	if ( 'hidden' === Cookies.get( cookieName ) ) {
		$( '.poocommerce-store-notice' ).hide();
	} else {
		$( '.poocommerce-store-notice' ).show();

		// Set a cookie and hide the store notice when the dismiss button is clicked
		function store_notice_click_handler( event ) {
			Cookies.set( cookieName, 'hidden', { path: '/' } );
			$( '.poocommerce-store-notice' ).hide();
			event.preventDefault();
			$( '.poocommerce-store-notice__dismiss-link' ).off(
				'click',
				store_notice_click_handler
			);
		}

		$( '.poocommerce-store-notice__dismiss-link' ).on(
			'click',
			store_notice_click_handler
		);
	}

	// Make form field descriptions toggle on focus.
	if ( $( '.poocommerce-input-wrapper span.description' ).length ) {
		$( document.body ).on( 'click', function () {
			$( '.poocommerce-input-wrapper span.description:visible' )
				.prop( 'aria-hidden', true )
				.slideUp( 250 );
		} );
	}

	$( '.poocommerce-input-wrapper' ).on( 'click', function ( event ) {
		event.stopPropagation();
	} );

	$( '.poocommerce-input-wrapper :input' )
		.on( 'keydown', function ( event ) {
			var input = $( this ),
				parent = input.parent(),
				description = parent.find( 'span.description' );

			if (
				27 === event.which &&
				description.length &&
				description.is( ':visible' )
			) {
				description.prop( 'aria-hidden', true ).slideUp( 250 );
				event.preventDefault();
				return false;
			}
		} )
		.on( 'click focus', function () {
			var input = $( this ),
				parent = input.parent(),
				description = parent.find( 'span.description' );

			parent.addClass( 'currentTarget' );

			$(
				'.poocommerce-input-wrapper:not(.currentTarget) span.description:visible'
			)
				.prop( 'aria-hidden', true )
				.slideUp( 250 );

			if ( description.length && description.is( ':hidden' ) ) {
				description.prop( 'aria-hidden', false ).slideDown( 250 );
			}

			parent.removeClass( 'currentTarget' );
		} );

	// Common scroll to element code.
	$.scroll_to_notices = function ( scrollElement ) {
		if ( scrollElement.length ) {
			$( 'html, body' ).animate(
				{
					scrollTop: scrollElement.offset().top - 100,
				},
				1000
			);
		}
	};

	// Show password visibility hover icon on poocommerce forms
	$( '.poocommerce form .poocommerce-Input[type="password"]' ).wrap(
		'<span class="password-input"></span>'
	);
	// Add 'password-input' class to the password wrapper in checkout page.
	$( '.poocommerce form input' )
		.filter( ':password' )
		.parent( 'span' )
		.addClass( 'password-input' );

	$( '.password-input' ).each( function () {
		const describedBy = $( this ).find( 'input' ).attr( 'id' );
		$( this ).append(
			'<button type="button" class="show-password-input" aria-label="' +
				poocommerce_params.i18n_password_show +
				'" aria-describedBy="' +
				describedBy +
				'"></button>'
		);
	} );

	$( '.show-password-input' ).on( 'click', function ( event ) {
		event.preventDefault();

		if ( $( this ).hasClass( 'display-password' ) ) {
			$( this ).removeClass( 'display-password' );
			$( this ).attr(
				'aria-label',
				poocommerce_params.i18n_password_show
			);
		} else {
			$( this ).addClass( 'display-password' );
			$( this ).attr(
				'aria-label',
				poocommerce_params.i18n_password_hide
			);
		}
		if ( $( this ).hasClass( 'display-password' ) ) {
			$( this )
				.siblings( [ 'input[type="password"]' ] )
				.prop( 'type', 'text' );
		} else {
			$( this )
				.siblings( 'input[type="text"]' )
				.prop( 'type', 'password' );
		}

		$( this ).siblings( 'input' ).focus();
	} );

	$( 'a.coming-soon-footer-banner-dismiss' ).on( 'click', function ( e ) {
		var target = $( e.target );
		$.ajax( {
			type: 'post',
			url: target.data( 'rest-url' ),
			data: {
				poocommerce_meta: {
					coming_soon_banner_dismissed: 'yes',
				},
			},
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader(
					'X-WP-Nonce',
					target.data( 'rest-nonce' )
				);
			},
			complete: function () {
				$( '#coming-soon-footer-banner' ).hide();
			},
		} );
	} );

	$( document.body ).on(
		'item_removed_from_classic_cart updated_wc_div',
		focus_populate_live_region
	);
} );

/**
 * Focus on the first notice element on the page.
 *
 * Populated live regions don't always are announced by screen readers.
 * This function focus on the first notice message with the role="alert"
 * attribute to make sure it's announced.
 */
function focus_populate_live_region() {
	var noticeClasses = [
		'poocommerce-message',
		'poocommerce-error',
		'wc-block-components-notice-banner',
	];
	var noticeSelectors = noticeClasses
		.map( function ( className ) {
			return '.' + className + '[role="alert"]';
		} )
		.join( ', ' );
	var noticeElements = document.querySelectorAll( noticeSelectors );

	if ( noticeElements.length === 0 ) {
		return;
	}

	var firstNotice = noticeElements[ 0 ];

	firstNotice.setAttribute( 'tabindex', '-1' );

	// Wait for the element to get the tabindex attribute so it can be focused.
	var delayFocusNoticeId = setTimeout( function () {
		firstNotice.focus();
		clearTimeout( delayFocusNoticeId );
	}, 500 );
}

/**
 * Refresh the sorted by live region.
 */
function refresh_sorted_by_live_region() {
	var sorted_by_live_region = document.querySelector(
		'.poocommerce-result-count'
	);

	if ( sorted_by_live_region ) {
		var text = sorted_by_live_region.innerHTML;
		sorted_by_live_region.setAttribute( 'aria-hidden', 'true' );

		var sorted_by_live_region_id = setTimeout( function () {
			sorted_by_live_region.setAttribute( 'aria-hidden', 'false' );
			sorted_by_live_region.innerHTML = '';
			sorted_by_live_region.innerHTML = text;
			clearTimeout( sorted_by_live_region_id );
		}, 2000 );
	}
}

function on_document_ready() {
	focus_populate_live_region();
	refresh_sorted_by_live_region();
}

document.addEventListener( 'DOMContentLoaded', on_document_ready );
