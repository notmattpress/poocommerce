<?php
/**
 * Admin failed order email (initial block content)
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
<h2 class="wp-block-heading"><?php
/* translators: %s: order number */
printf( esc_html__( 'Order failed: #%s,', 'poocommerce' ), '<!--[poocommerce/order-number]-->' );
?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %1$s: Order number. %2$s: Customer full name. */
	$text = __( 'Unfortunately, the payment for order #%1$s from %2$s has failed. The order was as follows:', 'poocommerce' );
	printf( esc_html( $text ), '<!--[poocommerce/order-number]-->', '<!--[poocommerce/customer-full-name]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:poocommerce/email-content -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"><?php
echo wp_kses_post( __( 'We hope they’ll be back soon! Read more about <a href="https://poocommerce.com/document/managing-orders/">troubleshooting failed payments</a>.', 'poocommerce' ) );
?></p>
<!-- /wp:paragraph -->
