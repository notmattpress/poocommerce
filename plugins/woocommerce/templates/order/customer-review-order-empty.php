<?php
/**
 * Customer Review Order — empty-state thank-you view.
 *
 * Theme-overridable. Copy to `yourtheme/poocommerce/order/customer-review-order-empty.php`.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 10.8.0
 *
 * @var WC_Order $order          Order being reviewed.
 * @var int      $reviewed_count Number of items reviewed on this order.
 */

defined( 'ABSPATH' ) || exit;

if ( ! $order instanceof WC_Order ) {
	return;
}

$meta_parts = \Automattic\PooCommerce\Internal\OrderReviews\Meta::parts_for_order( $order );
?>
<div class="poocommerce-review-order poocommerce-review-order--empty">
	<p class="poocommerce-breadcrumb poocommerce-review-order__meta">
		<?php echo esc_html( implode( ' · ', $meta_parts ) ); ?>
	</p>

	<h1 class="poocommerce-review-order__empty-title">
		<?php
		if ( $reviewed_count > 0 ) {
			esc_html_e( 'Thank you for your reviews', 'poocommerce' );
		} else {
			// Defensive fallback for direct-URL visits (bookmark, admin-shared link).
			// The email pipeline never schedules or sends when an order has no
			// reviewable items, so customers don't reach this branch via the email.
			esc_html_e( 'Nothing to review here', 'poocommerce' );
		}
		?>
	</h1>

	<p class="poocommerce-review-order__empty-body">
		<?php
		if ( $reviewed_count > 0 ) {
			esc_html_e( 'Your feedback helps other customers make better purchasing decisions.', 'poocommerce' );
		} else {
			esc_html_e( 'There are no products on this order that are open for reviews right now.', 'poocommerce' );
		}
		?>
	</p>
</div>
