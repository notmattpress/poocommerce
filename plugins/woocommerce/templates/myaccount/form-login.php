<?php
/**
 * Login Form
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/myaccount/form-login.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 9.7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

do_action( 'poocommerce_before_customer_login_form' ); ?>

<?php if ( 'yes' === get_option( 'poocommerce_enable_myaccount_registration' ) ) : ?>

<div class="u-columns col2-set" id="customer_login">

	<div class="u-column1 col-1">

<?php endif; ?>

		<h2><?php esc_html_e( 'Login', 'poocommerce' ); ?></h2>

		<form class="poocommerce-form poocommerce-form-login login" method="post" novalidate>

			<?php do_action( 'poocommerce_login_form_start' ); ?>

			<p class="poocommerce-form-row poocommerce-form-row--wide form-row form-row-wide">
				<label for="username"><?php esc_html_e( 'Username or email address', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
				<input type="text" class="poocommerce-Input poocommerce-Input--text input-text" name="username" id="username" autocomplete="username" value="<?php echo ( ! empty( $_POST['username'] ) ) ? esc_attr( wp_unslash( $_POST['username'] ) ) : ''; ?>" required aria-required="true" /><?php // @codingStandardsIgnoreLine ?>
			</p>
			<p class="poocommerce-form-row poocommerce-form-row--wide form-row form-row-wide">
				<label for="password"><?php esc_html_e( 'Password', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
				<input class="poocommerce-Input poocommerce-Input--text input-text" type="password" name="password" id="password" autocomplete="current-password" required aria-required="true" />
			</p>

			<?php do_action( 'poocommerce_login_form' ); ?>

			<p class="form-row">
				<label class="poocommerce-form__label poocommerce-form__label-for-checkbox poocommerce-form-login__rememberme">
					<input class="poocommerce-form__input poocommerce-form__input-checkbox" name="rememberme" type="checkbox" id="rememberme" value="forever" /> <span><?php esc_html_e( 'Remember me', 'poocommerce' ); ?></span>
				</label>
				<?php wp_nonce_field( 'poocommerce-login', 'poocommerce-login-nonce' ); ?>
				<button type="submit" class="poocommerce-button button poocommerce-form-login__submit<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" name="login" value="<?php esc_attr_e( 'Log in', 'poocommerce' ); ?>"><?php esc_html_e( 'Log in', 'poocommerce' ); ?></button>
			</p>
			<p class="poocommerce-LostPassword lost_password">
				<a href="<?php echo esc_url( wp_lostpassword_url() ); ?>"><?php esc_html_e( 'Lost your password?', 'poocommerce' ); ?></a>
			</p>

			<?php do_action( 'poocommerce_login_form_end' ); ?>

		</form>

<?php if ( 'yes' === get_option( 'poocommerce_enable_myaccount_registration' ) ) : ?>

	</div>

	<div class="u-column2 col-2">

		<h2><?php esc_html_e( 'Register', 'poocommerce' ); ?></h2>

		<form method="post" class="poocommerce-form poocommerce-form-register register" <?php do_action( 'poocommerce_register_form_tag' ); ?> >

			<?php do_action( 'poocommerce_register_form_start' ); ?>

			<?php if ( 'no' === get_option( 'poocommerce_registration_generate_username' ) ) : ?>

				<p class="poocommerce-form-row poocommerce-form-row--wide form-row form-row-wide">
					<label for="reg_username"><?php esc_html_e( 'Username', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
					<input type="text" class="poocommerce-Input poocommerce-Input--text input-text" name="username" id="reg_username" autocomplete="username" value="<?php echo ( ! empty( $_POST['username'] ) ) ? esc_attr( wp_unslash( $_POST['username'] ) ) : ''; ?>" required aria-required="true" /><?php // @codingStandardsIgnoreLine ?>
				</p>

			<?php endif; ?>

			<p class="poocommerce-form-row poocommerce-form-row--wide form-row form-row-wide">
				<label for="reg_email"><?php esc_html_e( 'Email address', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
				<input type="email" class="poocommerce-Input poocommerce-Input--text input-text" name="email" id="reg_email" autocomplete="email" value="<?php echo ( ! empty( $_POST['email'] ) ) ? esc_attr( wp_unslash( $_POST['email'] ) ) : ''; ?>" required aria-required="true" /><?php // @codingStandardsIgnoreLine ?>
			</p>

			<?php if ( 'no' === get_option( 'poocommerce_registration_generate_password' ) ) : ?>

				<p class="poocommerce-form-row poocommerce-form-row--wide form-row form-row-wide">
					<label for="reg_password"><?php esc_html_e( 'Password', 'poocommerce' ); ?>&nbsp;<span class="required" aria-hidden="true">*</span><span class="screen-reader-text"><?php esc_html_e( 'Required', 'poocommerce' ); ?></span></label>
					<input type="password" class="poocommerce-Input poocommerce-Input--text input-text" name="password" id="reg_password" autocomplete="new-password" required aria-required="true" />
				</p>

			<?php else : ?>

				<p><?php esc_html_e( 'A link to set a new password will be sent to your email address.', 'poocommerce' ); ?></p>

			<?php endif; ?>

			<?php do_action( 'poocommerce_register_form' ); ?>

			<p class="poocommerce-form-row form-row">
				<?php wp_nonce_field( 'poocommerce-register', 'poocommerce-register-nonce' ); ?>
				<button type="submit" class="poocommerce-Button poocommerce-button button<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?> poocommerce-form-register__submit" name="register" value="<?php esc_attr_e( 'Register', 'poocommerce' ); ?>"><?php esc_html_e( 'Register', 'poocommerce' ); ?></button>
			</p>

			<?php do_action( 'poocommerce_register_form_end' ); ?>

		</form>

	</div>

</div>
<?php endif; ?>

<?php do_action( 'poocommerce_after_customer_login_form' ); ?>
