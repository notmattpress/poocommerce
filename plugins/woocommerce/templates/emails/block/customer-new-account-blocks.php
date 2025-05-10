<?php
/**
 * Customer new account email (initial block content).
 *
 * This is intended as a replacement to WC_Email_Customer_New_Account(),
 * with a set password link instead of including the new password in email
 * content.
 *
 * @package  PooCommerce/Blocks
 * @version 9.9.0
 */

use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;

defined( 'ABSPATH' ) || exit;

?>

<!-- wp:heading -->
<h2>
<?php
/* translators: %s: Site title*/
printf( esc_html__( 'Welcome to %s', 'poocommerce' ), '<!--[poocommerce/site-title]-->' );
?>
</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>
<?php
	/* translators: %s: Customer first name */
	printf( esc_html__( 'Hi %s,', 'poocommerce' ), '<!--[poocommerce/customer-first-name]-->' );
?>
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>
<?php
	/* translators: %s: Site title */
	printf( esc_html__( 'Thanks for creating an account on %s. Here’s a copy of your user details.', 'poocommerce' ), '<!--[poocommerce/site-title]-->' );
?>
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>
<?php
/* translators: %s: Username */
echo wp_kses( sprintf( __( 'Username: <b>%s</b>', 'poocommerce' ), '<!--[poocommerce/customer-username]-->' ), array( 'b' => array() ) );
?>
</p>
<!-- /wp:paragraph -->

<!-- wp:woo/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-woo-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:woo/email-content -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'You can access your account area to view orders, change your password, and more via the link below:', 'poocommerce' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>
<?php
	$text = '<a data-link-href="%1$s" contenteditable="false" style="text-decoration: underline;"> %2$s </a>';
	printf( wp_kses_post( $text ), '[poocommerce/my-account-url]', esc_html__( 'My account', 'poocommerce' ) );
?>
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p> <?php echo esc_html__( 'We look forward to seeing you soon.', 'poocommerce' ); ?> </p>
<!-- /wp:paragraph -->

