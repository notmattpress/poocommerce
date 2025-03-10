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
 * @version 3.8.0
 */

defined( 'ABSPATH' ) || exit;

if ( is_user_logged_in() || 'no' === get_option( 'poocommerce_enable_checkout_login_reminder' ) ) {
	return;
}

?>
<div class="poocommerce-form-login-toggle">
	<?php wc_print_notice( apply_filters( 'poocommerce_checkout_login_message', esc_html__( 'Returning customer?', 'poocommerce' ) ) . ' <a href="#" class="showlogin">' . esc_html__( 'Click here to login', 'poocommerce' ) . '</a>', 'notice' ); ?>
</div>
<?php

poocommerce_login_form(
	array(
		'message'  => esc_html__( 'If you have shopped with us before, please enter your details below. If you are a new customer, please proceed to the Billing section.', 'poocommerce' ),
		'redirect' => wc_get_checkout_url(),
		'hidden'   => true,
	)
);
