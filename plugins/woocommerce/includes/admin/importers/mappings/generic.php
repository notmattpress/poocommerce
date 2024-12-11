<?php
/**
 * Generic mappings
 *
 * @package PooCommerce\Admin\Importers
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add generic mappings.
 *
 * @since 3.1.0
 * @param array $mappings Importer columns mappings.
 * @return array
 */
function wc_importer_generic_mappings( $mappings ) {
	$generic_mappings = array(
		__( 'Title', 'poocommerce' )         => 'name',
		__( 'Product Title', 'poocommerce' ) => 'name',
		__( 'Price', 'poocommerce' )         => 'regular_price',
		__( 'Parent SKU', 'poocommerce' )    => 'parent_id',
		__( 'Quantity', 'poocommerce' )      => 'stock_quantity',
		__( 'Menu order', 'poocommerce' )    => 'menu_order',
	);

	return array_merge( $mappings, $generic_mappings );
}
add_filter( 'poocommerce_csv_product_import_mapping_default_columns', 'wc_importer_generic_mappings' );
