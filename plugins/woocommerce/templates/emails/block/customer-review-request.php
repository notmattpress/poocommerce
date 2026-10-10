<?php
/**
 * Customer review request email (initial block content)
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
 * @version 10.8.0
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentBeforeOpen -- removed to prevent empty new lines.
// phpcs:disable Squiz.PHP.EmbeddedPhp.ContentAfterEnd -- removed to prevent empty new lines.
?>

<!-- wp:heading -->
<h2 class="wp-block-heading"> <?php echo esc_html__( 'Rate your recent purchases', 'poocommerce' ); ?> </h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php
	/* translators: %s: Customer first name */
	printf( esc_html__( 'Hi %s,', 'poocommerce' ), '<!--[poocommerce/customer-first-name]-->' );
?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p> <?php echo esc_html__( 'We’d love to know what you thought of the products you ordered. Your review helps other shoppers make better decisions and helps us improve.', 'poocommerce' ); ?> </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php
/* translators: 1: order number, 2: order date */
$order_meta_format = esc_html__( 'Order #%1$s (%2$s)', 'poocommerce' );
printf( $order_meta_format, '<!--[poocommerce/order-number]-->', '<!--[poocommerce/order-date]-->' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $order_meta_format is escaped above; personalization tokens are literal HTML comments.
?></p>
<!-- /wp:paragraph -->
