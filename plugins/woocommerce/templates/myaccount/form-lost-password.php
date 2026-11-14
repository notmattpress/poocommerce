<?php
/**
 * Lost password form
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/myaccount/form-lost-password.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 9.2.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'poocommerce_before_lost_password_form' );
?>

<form method="post" class="poocommerce-ResetPassword lost_reset_password">

	<p><?php echo apply_filters( 'poocommerce_lost_password_message', esc_html__( 'Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.', 'poocommerce' ) ); ?></p><?php // @codingStandardsIgnoreLine ?>

	<p class="poocommerce-form-row poocommerce-form-row--first form-row form-row-first">
		<label for="user_login"><?php esc_html_e( 'Username or email', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
		<input class="poocommerce-Input poocommerce-Input--text input-text" type="text" name="user_login" id="user_login" autocomplete="username" required aria-required="true" />
	</p>

	<div class="clear"></div>

	<?php do_action( 'poocommerce_lostpassword_form' ); ?>

	<p class="poocommerce-form-row form-row">
		<input type="hidden" name="wc_reset_password" value="true" />
		<button type="submit" class="poocommerce-Button button<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" value="<?php esc_attr_e( 'Reset password', 'poocommerce' ); ?>"><?php esc_html_e( 'Reset password', 'poocommerce' ); ?></button>
	</p>

	<?php wp_nonce_field( 'lost_password', 'poocommerce-lost-password-nonce' ); ?>

</form>
<?php
do_action( 'poocommerce_after_lost_password_form' );
