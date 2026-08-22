<?php
/**
 * Checkout login form
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/checkout/form-login.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 10.0.0
 */

defined( 'ABSPATH' ) || exit;

$registration_at_checkout   = WC_Checkout::instance()->is_registration_enabled();
$login_reminder_at_checkout = 'yes' === get_option( 'poocommerce_enable_checkout_login_reminder' );

if ( is_user_logged_in() ) {
	return;
}

if ( $login_reminder_at_checkout ) : ?>
	<div class="poocommerce-form-login-toggle">
		<?php
		wc_print_notice(
			apply_filters( 'poocommerce_checkout_login_message', esc_html__( 'Returning customer?', 'poocommerce' ) ) . // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
			' <a href="#" class="showlogin">' . esc_html__( 'Click here to login', 'poocommerce' ) . '</a>',
			'notice'
		);
		?>
	</div>
	<?php
endif;

if ( $registration_at_checkout || $login_reminder_at_checkout ) :

	// Always show the form after a login attempt.
	$show_form = isset( $_POST['login'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing

	poocommerce_login_form(
		array(
			'message'  => esc_html__( 'If you have shopped with us before, please enter your details below. If you are a new customer, please proceed to the Billing section.', 'poocommerce' ),
			'redirect' => wc_get_checkout_url(),
			'hidden'   => ! $show_form,
		)
	);
endif;
