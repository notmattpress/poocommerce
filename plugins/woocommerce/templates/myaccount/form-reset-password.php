<?php
/**
 * Lost password reset form.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/myaccount/form-reset-password.php.
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

do_action( 'poocommerce_before_reset_password_form' );
?>

<form method="post" class="poocommerce-ResetPassword lost_reset_password">

	<p><?php echo apply_filters( 'poocommerce_reset_password_message', esc_html__( 'Enter a new password below.', 'poocommerce' ) ); ?></p><?php // @codingStandardsIgnoreLine ?>

	<p class="poocommerce-form-row poocommerce-form-row--first form-row form-row-first">
		<label for="password_1"><?php esc_html_e( 'New password', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
		<input type="password" class="poocommerce-Input poocommerce-Input--text input-text" name="password_1" id="password_1" autocomplete="new-password" required aria-required="true" />
	</p>
	<p class="poocommerce-form-row poocommerce-form-row--last form-row form-row-last">
		<label for="password_2"><?php esc_html_e( 'Re-enter new password', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
		<input type="password" class="poocommerce-Input poocommerce-Input--text input-text" name="password_2" id="password_2" autocomplete="new-password" required aria-required="true" />
	</p>

	<input type="hidden" name="reset_key" value="<?php echo esc_attr( $args['key'] ); ?>" />
	<input type="hidden" name="reset_login" value="<?php echo esc_attr( $args['login'] ); ?>" />

	<div class="clear"></div>

	<?php do_action( 'poocommerce_resetpassword_form' ); ?>

	<p class="poocommerce-form-row form-row">
		<input type="hidden" name="wc_reset_password" value="true" />
		<button type="submit" class="poocommerce-Button button<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" value="<?php esc_attr_e( 'Save', 'poocommerce' ); ?>"><?php esc_html_e( 'Save', 'poocommerce' ); ?></button>
	</p>

	<?php wp_nonce_field( 'reset_password', 'poocommerce-reset-password-nonce' ); ?>

</form>
<?php
do_action( 'poocommerce_after_reset_password_form' );

