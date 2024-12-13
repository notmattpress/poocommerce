<?php
/**
 * Title: Product Filters
 * Slug: poocommerce-blocks/product-filters
 * Categories: PooCommerce
 * Block Types: poocommerce/active-filters, poocommerce/price-filter, poocommerce/attribute-filter, poocommerce/stock-filter
 */

declare( strict_types = 1 );

?>

<!-- wp:poocommerce/filter-wrapper {"filterType":"active-filters"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3><?php esc_html_e( 'Active filters', 'poocommerce' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/active-filters {"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-active-filters is-loading" data-display-style="list" data-heading="" data-heading-level="3"><span aria-hidden="true" class="wc-block-active-filters__placeholder"></span></div>
<!-- /wp:poocommerce/active-filters --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"price-filter"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3><?php esc_html_e( 'Filter by price', 'poocommerce' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/price-filter {"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-price-filter is-loading" data-showinputfields="true" data-showfilterbutton="false" data-heading="" data-heading-level="3"><span aria-hidden="true" class="wc-block-product-categories__placeholder"></span></div>
<!-- /wp:poocommerce/price-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"stock-filter"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3><?php esc_html_e( 'Filter by stock status', 'poocommerce' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/stock-filter {"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-stock-filter is-loading" data-show-counts="true" data-heading="" data-heading-level="3"><span aria-hidden="true" class="wc-block-product-stock-filter__placeholder"></span></div>
<!-- /wp:poocommerce/stock-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"attribute-filter"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3><?php esc_html_e( 'Filter by attribute', 'poocommerce' ); ?></h3>
<!-- /wp:heading -->

<?php
$attribute_id = 0;

$attributes = wc_get_attribute_taxonomies();
if ( ! empty( $attributes ) ) {
	$attribute_id = reset( $attributes )->attribute_id;
}
?>

<!-- wp:poocommerce/attribute-filter {"attributeId":<?php echo esc_attr( $attribute_id ); ?>,"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-attribute-filter is-loading" data-attribute-id="<?php echo esc_attr( $attribute_id ); ?>" data-show-counts="true" data-query-type="or" data-heading="" data-heading-level="3"><span aria-hidden="true" class="wc-block-product-attribute-filter__placeholder"></span></div>
<!-- /wp:poocommerce/attribute-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"rating-filter"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3><?php esc_html_e( 'Filter by rating', 'poocommerce' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/rating-filter {"lock":{"remove":true}} -->
<div class="wp-block-poocommerce-rating-filter is-loading" data-show-counts="true"><span aria-hidden="true" class="wc-block-product-rating-filter__placeholder"></span></div>
<!-- /wp:poocommerce/rating-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->
