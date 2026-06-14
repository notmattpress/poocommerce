<?php
/**
 * Customer on-hold order email (initial block version)
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
<h2 class="wp-block-heading"> <?php echo esc_html__( 'Payment confirmation pending', 'poocommerce' ); ?> </h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Customer first name */
	printf( esc_html__( 'Hi %s,', 'poocommerce' ), '<!--[poocommerce/customer-first-name]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Payment method (bold, personalization tag) */
	printf( esc_html__( 'Thanks for your order. It’s currently on hold while we confirm your payment via %s.', 'poocommerce' ), '<strong><!--[poocommerce/order-payment-method]--></strong>' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p> <?php echo esc_html__( 'We’ll update you once payment has been confirmed. Here’s a summary of your order:', 'poocommerce' ); ?> </p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"> <?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?> </div>
<!-- /wp:poocommerce/email-content -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"><?php
/* translators: %s: Store admin email */
	printf( esc_html__( 'Thanks again! If you need any help with your order, please contact us at %s.', 'poocommerce' ), '<!--[poocommerce/store-email]-->' );
?></p>
<!-- /wp:paragraph -->
