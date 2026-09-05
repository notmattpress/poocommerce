<?php
/**
 * Admin View: Product Export
 *
 * @package PooCommerce\Admin\Export
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_script( 'wc-product-export' );

$exporter = new WC_Product_CSV_Exporter();

$product_ids_to_export    = array();
$is_exporting_product_ids = false;

if ( ! empty( $_GET['product_ids'] ) ) {
	check_admin_referer( 'export-selected-products' );

	$ids_raw                  = explode( ',', sanitize_text_field( wp_unslash( $_GET['product_ids'] ) ) );
	$product_ids_to_export    = array_filter( array_map( 'absint', $ids_raw ) );
	$is_exporting_product_ids = ! empty( $product_ids_to_export ) ? true : false;
}
?>
<div class="wrap poocommerce">
	<h1><?php esc_html_e( 'Export Products', 'poocommerce' ); ?></h1>

	<?php
	if ( $is_exporting_product_ids ) {
		$clear_url = remove_query_arg( 'product_ids' );
		$count     = count( $product_ids_to_export );
		$notice    = sprintf(
			// translators: %1$d: Number of products, %2$s: URL to clear selection.
			_n(
				'You are about to export %1$d product. To export all products, <a href="%2$s">clear your selection</a>.',
				'You are about to export %1$d products. To export all products, <a href="%2$s">clear your selection</a>.',
				$count,
				'poocommerce'
			),
			$count,
			esc_url( $clear_url )
		);
		?>
		<div id="selected-product-export-notice" class="notice notice-info inline">
			<p><?php echo wp_kses_post( $notice ); ?></p>
		</div>
		<?php
	}
	?>

	<div class="poocommerce-exporter-wrapper">
		<form class="poocommerce-exporter">
			<?php
			// Add hidden input if exporting product IDs, so JS can potentially pick it up.
			if ( $is_exporting_product_ids ) {
				echo '<input type="hidden" name="product_ids" value="' . esc_attr( implode( ',', $product_ids_to_export ) ) . '" />';
			}
			?>
			<header>
				<span class="spinner is-active"></span>
				<h2><?php esc_html_e( 'Export products to a CSV file', 'poocommerce' ); ?></h2>
				<p>
					<?php
					if ( $is_exporting_product_ids ) {
						esc_html_e( 'This tool allows you to generate and download a CSV file containing the selected products.', 'poocommerce' );
					} else {
						esc_html_e( 'This tool allows you to generate and download a CSV file containing a list of all products.', 'poocommerce' );
					}
					?>
				</p>
			</header>
			<section>
				<table class="form-table poocommerce-exporter-options">
					<tbody>
						<tr>
							<th scope="row">
								<label for="poocommerce-exporter-columns"><?php esc_html_e( 'Which columns should be exported?', 'poocommerce' ); ?></label>
							</th>
							<td>
								<select id="poocommerce-exporter-columns" class="poocommerce-exporter-columns wc-enhanced-select" style="width:100%;" multiple data-placeholder="<?php esc_attr_e( 'Export all columns', 'poocommerce' ); ?>">
									<?php
									foreach ( $exporter->get_default_column_names() as $column_id => $column_name ) {
										echo '<option value="' . esc_attr( $column_id ) . '">' . esc_html( $column_name ) . '</option>';
									}
									?>
									<option value="downloads"><?php esc_html_e( 'Downloads', 'poocommerce' ); ?></option>
									<option value="attributes"><?php esc_html_e( 'Attributes', 'poocommerce' ); ?></option>
								</select>
							</td>
						</tr>
						<?php if ( ! $is_exporting_product_ids ) : ?>
						<tr>
							<th scope="row">
								<label for="poocommerce-exporter-types"><?php esc_html_e( 'Which product types should be exported?', 'poocommerce' ); ?></label>
							</th>
							<td>
								<select id="poocommerce-exporter-types" class="poocommerce-exporter-types wc-enhanced-select" style="width:100%;" multiple data-placeholder="<?php esc_attr_e( 'Export all products', 'poocommerce' ); ?>">
									<?php
									foreach ( WC_Admin_Exporters::get_product_types() as $value => $label ) {
										echo '<option value="' . esc_attr( $value ) . '">' . esc_html( $label ) . '</option>';
									}
									?>
								</select>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="poocommerce-exporter-category"><?php esc_html_e( 'Which product category should be exported?', 'poocommerce' ); ?></label>
							</th>
							<td>
								<select id="poocommerce-exporter-category" class="poocommerce-exporter-category wc-enhanced-select" style="width:100%;" multiple data-placeholder="<?php esc_attr_e( 'Export all categories', 'poocommerce' ); ?>">
								<?php
								$categories = get_categories(
									array(
										'taxonomy'   => 'product_cat',
										'hide_empty' => false,
									)
								);
								foreach ( $categories as $category ) {
									echo '<option value="' . esc_attr( $category->slug ) . '">' . esc_html( $category->name ) . '</option>';
								}
								?>
								</select>
							</td>
						</tr>
						<?php endif; ?>
						<tr>
							<th scope="row">
								<label for="poocommerce-exporter-meta"><?php esc_html_e( 'Export custom meta?', 'poocommerce' ); ?></label>
							</th>
							<td>
								<input type="checkbox" id="poocommerce-exporter-meta" value="1" />
								<label for="poocommerce-exporter-meta"><?php esc_html_e( 'Yes, export all custom meta', 'poocommerce' ); ?></label>
							</td>
						</tr>
						<?php do_action( 'poocommerce_product_export_row' ); ?>
					</tbody>
				</table>
				<progress class="poocommerce-exporter-progress" max="100" value="0"></progress>
			</section>
			<div class="wc-actions">
				<button type="submit" class="poocommerce-exporter-button button button-primary" value="<?php esc_attr_e( 'Generate CSV', 'poocommerce' ); ?>"><?php esc_html_e( 'Generate CSV', 'poocommerce' ); ?></button>
			</div>
		</form>
	</div>
</div>
