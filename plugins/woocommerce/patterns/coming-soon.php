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
?>

<!-- wp:pattern {"slug":"poocommerce/<?php echo $store_pages_only ? 'coming-soon-store-only' : 'coming-soon-entire-site'; ?>"} /-->
