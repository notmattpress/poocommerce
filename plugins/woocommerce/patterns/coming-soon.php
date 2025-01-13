<?php
/**
 * Title: Coming Soon
 * Slug: poocommerce/coming-soon
 * Categories: PooCommerce
 * Inserter: false
 * Feature Flag: launch-your-store
 *
 * @package PooCommerce\Blocks
 */

$store_pages_only = 'yes' === get_option( 'poocommerce_store_pages_only', 'no' );
$default_pattern  = $store_pages_only ? 'coming-soon-store-only' : 'coming-soon-entire-site';

if ( class_exists( 'Automattic\PooCommerce\Admin\Features\Features', false ) &&
	\Automattic\PooCommerce\Admin\Features\Features::is_enabled( 'coming-soon-newsletter-template' ) ) {
	$default_pattern = $store_pages_only ? 'coming-soon-store-only' : 'page-coming-soon-default';
}
?>

<!-- wp:pattern {"slug":"poocommerce/<?php echo $default_pattern; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"} /-->
