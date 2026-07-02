<?php
/**
 * Customer Reset Password email (initial block version)
 *
 * This template can be overridden by editing it in the PooCommerce email editor.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates\Emails\Block
 * @version 10.6.0
 */

use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;

defined( 'ABSPATH' ) || exit;

// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentBeforeOpen -- removed to prevent empty new lines.
// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentAfterEnd -- removed to prevent empty new lines.
?>

<!-- wp:heading -->
<h2 class="wp-block-heading"> <?php echo esc_html__( 'Reset your password', 'poocommerce' ); ?> </h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Customer username */
	printf( esc_html__( 'Hi %s,', 'poocommerce' ), '<!--[poocommerce/customer-username]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Store name */
	printf( esc_html__( 'Someone has requested a new password for the following account on %s:', 'poocommerce' ), '<!--[poocommerce/site-title]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
/* translators: %s: Username */
echo wp_kses( sprintf( __( 'Username: <b>%s</b>', 'poocommerce' ), '<!--[poocommerce/customer-username]-->' ), array( 'b' => array() ) );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
	echo esc_html__( 'If you didn’t make this request, just ignore this email. If you’d like to proceed, reset your password via the link below:', 'poocommerce' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:poocommerce/email-content -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"> <?php echo esc_html__( 'Thanks for reading.', 'poocommerce' ); ?> </p>
<!-- /wp:paragraph -->

