<?php
/**
 * Admin order withdrawal request email (initial block version)
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
 * @version 11.5.0
 */

use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;

defined( 'ABSPATH' ) || exit;

// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentBeforeOpen -- removed to prevent empty new lines.
// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentAfterEnd -- removed to prevent empty new lines.
?>

<!-- wp:heading -->
<h2 class="wp-block-heading"><?php echo esc_html__( 'Order withdrawal request received', 'poocommerce' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'A customer submitted an order withdrawal request.', 'poocommerce' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:poocommerce/email-content -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Review the request details and contact the customer about next steps.', 'poocommerce' ); ?></p>
<!-- /wp:paragraph -->
