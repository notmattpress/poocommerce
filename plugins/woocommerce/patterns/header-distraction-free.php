<?php
/**
 * Title: Distraction Free Header
 * Slug: poocommerce-blocks/header-distraction-free
 * Categories: PooCommerce
 * Block Types: core/template-part/header
 */
?>

<!-- wp:group {"className":"wc-blocks-header-pattern","metadata":{"name":"Checkout Header"},"layout":{"type":"constrained"}} -->
<div class="wc-blocks-pattern-header-distraction-free wc-blocks-header-pattern wp-block-group">
	<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"bottom":"var:preset|spacing|20","top":"var:preset|spacing|20"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
		<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
			<!-- wp:site-title {"level":0} /-->
			<!-- wp:poocommerce/cart-link {"fontSize":"small"} /-->
		</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
