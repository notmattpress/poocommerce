<?php
/**
 * Admin payment gateway enabled email (initial block content)
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
 * @version 10.7.0
 */

use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;

defined( 'ABSPATH' ) || exit;

// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentBeforeOpen -- removed to prevent empty new lines.
// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentAfterEnd -- removed to prevent empty new lines.
?>

<!-- wp:heading -->
<h2 class="wp-block-heading"><?php echo esc_html__( 'Payment gateway enabled', 'poocommerce' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Hello,', 'poocommerce' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Site title */
	printf( esc_html__( 'A payment gateway was just enabled on %s.', 'poocommerce' ), '<!--[poocommerce/site-title]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:poocommerce/email-content -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"> <?php echo esc_html__( 'If this was intentional, you can safely ignore and delete this email.', 'poocommerce' ); ?> </p>
<!-- /wp:paragraph -->
