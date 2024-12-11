<?php
/**
 * Product data variations
 *
 * @package PooCommerce\Admin\Metaboxes\Views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$add_attributes_img_url = WC_ADMIN_IMAGES_FOLDER_URL . '/icons/info.svg';
$background_img_url     = WC_ADMIN_IMAGES_FOLDER_URL . '/product_data/no-variation-background-image.svg';
$arrow_img_url          = WC_ADMIN_IMAGES_FOLDER_URL . '/product_data/no-variation-arrow.svg';
?>
<div id="variable_product_options" class="panel wc-metaboxes-wrapper hidden">
	<div id="variable_product_options_inner">
		<?php if ( ! isset( $variation_attributes ) || ! is_array( $variation_attributes ) || count( $variation_attributes ) === 0 ) : ?>

		<div class="add-attributes-container">
			<div class="add-attributes-message">
				<img src="<?php echo esc_url( $add_attributes_img_url ); ?>" />
				<p>
					<?php
						echo wp_kses_post(
							sprintf(
								/* translators: %1$s: url for attributes tab, %2$s: url for variable product documentation */
								__( 'Add some attributes in the <a class="variations-add-attributes-link" href="%1$s">Attributes</a> tab to generate variations. Make sure to check the <b>Used for variations</b> box. <a class="variations-learn-more-link" href="%2$s" target="_blank" rel="noreferrer">Learn more</a>', 'poocommerce' ),
								esc_url( '#product_attributes' ),
								esc_url( 'https://poocommerce.com/document/variable-product/' )
							)
						);
					?>
				</p>
			</div>
		</div>

		<?php else : ?>

			<div class="toolbar toolbar-variations-defaults">
				<div class="variations-defaults">
					<strong><?php esc_html_e( 'Default Form Values', 'poocommerce' ); ?>: <?php echo wc_help_tip( __( 'Choose a default form value if you want a certain variation already selected when a user visits the product page.', 'poocommerce' ) ); ?></strong>
					<?php
					foreach ( $variation_attributes as $attribute ) {
						$selected_value = isset( $default_attributes[ sanitize_title( $attribute->get_name() ) ] ) ? $default_attributes[ sanitize_title( $attribute->get_name() ) ] : '';
						?>
						<select name="default_attribute_<?php echo esc_attr( sanitize_title( $attribute->get_name() ) ); ?>" data-current="<?php echo esc_attr( $selected_value ); ?>">
							<?php /* translators: PooCommerce attribute label */ ?>
							<option value=""><?php echo esc_html( sprintf( __( 'No default %s&hellip;', 'poocommerce' ), wc_attribute_label( $attribute->get_name() ) ) ); ?></option>
							<?php if ( $attribute->is_taxonomy() ) : ?>
								<?php foreach ( $attribute->get_terms() as $option ) : ?>
									<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
									<option <?php selected( $selected_value, $option->slug ); ?> value="<?php echo esc_attr( $option->slug ); ?>"><?php echo esc_html( apply_filters( 'poocommerce_variation_option_name', $option->name, $option, $attribute->get_name(), $product_object ) ); ?></option>
									<?php /* phpcs:enable */ ?>
								<?php endforeach; ?>
							<?php else : ?>
								<?php foreach ( $attribute->get_options() as $option ) : ?>
									<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
									<option <?php selected( $selected_value, $option ); ?> value="<?php echo esc_attr( $option ); ?>"><?php echo esc_html( apply_filters( 'poocommerce_variation_option_name', $option, null, $attribute->get_name(), $product_object ) ); ?></option>
									<?php /* phpcs:enable */ ?>
								<?php endforeach; ?>
							<?php endif; ?>
						</select>
						<?php
					}
					?>
				</div>
				<div class="clear"></div>
			</div>

			<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
			<?php do_action( 'poocommerce_variable_product_before_variations' ); ?>
			<?php /* phpcs:enable */ ?>

			<div class="toolbar toolbar-top">
				<button type="button" class="button generate_variations"><?php esc_html_e( 'Generate variations', 'poocommerce' ); ?></button>
				<button type="button" class="button add_variation_manually"><?php esc_html_e( 'Add manually', 'poocommerce' ); ?></button>
				<select id="field_to_edit" class="select variation_actions hidden">
					<option value="bulk_actions" disabled>Bulk actions</option>
					<option value="delete_all"><?php esc_html_e( 'Delete all variations', 'poocommerce' ); ?></option>
					<optgroup label="<?php esc_attr_e( 'Status', 'poocommerce' ); ?>">
						<option value="toggle_enabled"><?php esc_html_e( 'Toggle &quot;Enabled&quot;', 'poocommerce' ); ?></option>
						<option value="toggle_downloadable"><?php esc_html_e( 'Toggle &quot;Downloadable&quot;', 'poocommerce' ); ?></option>
						<option value="toggle_virtual"><?php esc_html_e( 'Toggle &quot;Virtual&quot;', 'poocommerce' ); ?></option>
					</optgroup>
					<optgroup label="<?php esc_attr_e( 'Pricing', 'poocommerce' ); ?>">
						<option value="variable_regular_price"><?php esc_html_e( 'Set regular prices', 'poocommerce' ); ?></option>
						<option value="variable_regular_price_increase"><?php esc_html_e( 'Increase regular prices (fixed amount or percentage)', 'poocommerce' ); ?></option>
						<option value="variable_regular_price_decrease"><?php esc_html_e( 'Decrease regular prices (fixed amount or percentage)', 'poocommerce' ); ?></option>
						<option value="variable_sale_price"><?php esc_html_e( 'Set sale prices', 'poocommerce' ); ?></option>
						<option value="variable_sale_price_increase"><?php esc_html_e( 'Increase sale prices (fixed amount or percentage)', 'poocommerce' ); ?></option>
						<option value="variable_sale_price_decrease"><?php esc_html_e( 'Decrease sale prices (fixed amount or percentage)', 'poocommerce' ); ?></option>
						<option value="variable_sale_schedule"><?php esc_html_e( 'Set scheduled sale dates', 'poocommerce' ); ?></option>
					</optgroup>
					<optgroup label="<?php esc_attr_e( 'Inventory', 'poocommerce' ); ?>">
						<option value="toggle_manage_stock"><?php esc_html_e( 'Toggle &quot;Manage stock&quot;', 'poocommerce' ); ?></option>
						<option value="variable_stock"><?php esc_html_e( 'Stock', 'poocommerce' ); ?></option>
						<option value="variable_stock_status_instock"><?php esc_html_e( 'Set Status - In stock', 'poocommerce' ); ?></option>
						<option value="variable_stock_status_outofstock"><?php esc_html_e( 'Set Status - Out of stock', 'poocommerce' ); ?></option>
						<option value="variable_stock_status_onbackorder"><?php esc_html_e( 'Set Status - On backorder', 'poocommerce' ); ?></option>
						<option value="variable_low_stock_amount"><?php esc_html_e( 'Low stock threshold', 'poocommerce' ); ?></option>
					</optgroup>
					<optgroup label="<?php esc_attr_e( 'Shipping', 'poocommerce' ); ?>">
						<option value="variable_length"><?php esc_html_e( 'Length', 'poocommerce' ); ?></option>
						<option value="variable_width"><?php esc_html_e( 'Width', 'poocommerce' ); ?></option>
						<option value="variable_height"><?php esc_html_e( 'Height', 'poocommerce' ); ?></option>
						<option value="variable_weight"><?php esc_html_e( 'Weight', 'poocommerce' ); ?></option>
					</optgroup>
					<optgroup label="<?php esc_attr_e( 'Downloadable products', 'poocommerce' ); ?>">
						<option value="variable_download_limit"><?php esc_html_e( 'Download limit', 'poocommerce' ); ?></option>
						<option value="variable_download_expiry"><?php esc_html_e( 'Download expiry', 'poocommerce' ); ?></option>
					</optgroup>
					<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
					<?php do_action( 'poocommerce_variable_product_bulk_edit_actions' ); ?>
					<?php /* phpcs:enable */ ?>
				</select>

				<div class="variations-pagenav">
					<?php /* translators: variations count */ ?>
					<span class="displaying-num"><?php echo esc_html( sprintf( _n( '%s item', '%s items', $variations_count, 'poocommerce' ), $variations_count ) ); ?></span>
					<span class="expand-close">
						(<a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'poocommerce' ); ?></a> / <a href="#" class="close_all"><?php esc_html_e( 'Close', 'poocommerce' ); ?></a>)
					</span>
					<span class="pagination-links">
						<a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'poocommerce' ); ?>" href="#">&laquo;</a>
						<a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'poocommerce' ); ?>" href="#">&lsaquo;</a>
						<span class="paging-select">
							<label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'poocommerce' ); ?></label>
							<select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'poocommerce' ); ?>">
								<?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
									<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
									<option value="<?php echo $i; // WPCS: XSS ok. ?>"><?php echo $i; // WPCS: XSS ok. ?></option>
									<?php /* phpcs:enable */ ?>
								<?php endfor; ?>
							</select>
							<?php echo esc_html_x( 'of', 'number of pages', 'poocommerce' ); ?> <span class="total-pages"><?php echo esc_html( $variations_total_pages ); ?></span>
						</span>
						<a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'poocommerce' ); ?>" href="#">&rsaquo;</a>
						<a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'poocommerce' ); ?>" href="#">&raquo;</a>
					</span>
				</div>
				<div class="clear"></div>
			</div>

			<div class="add-variation-container">
				<div class="arrow-image-wrapper">
					<img src="<?php echo esc_url( $arrow_img_url ); ?>" />
				</div>
				<img src="<?php echo esc_url( $background_img_url ); ?>" />
				<p>
					<?php
					esc_html_e(
						'No variations yet. Generate them from all added attributes or add a new variation manually.',
						'poocommerce'
					);
					?>
				</p>
			</div>

			<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
			<div class="poocommerce_variations wc-metaboxes" data-attributes="<?php echo wc_esc_json( wp_json_encode( wc_list_pluck( $variation_attributes, 'get_data' ) ) ); // WPCS: XSS ok. ?>" data-total="<?php echo esc_attr( $variations_count ); ?>" data-total_pages="<?php echo esc_attr( $variations_total_pages ); ?>" data-page="1" data-edited="false"></div>
			<?php /* phpcs:enable */ ?>

			<div class="toolbar">
				<button type="button" class="button-primary save-variation-changes" disabled="disabled"><?php esc_html_e( 'Save changes', 'poocommerce' ); ?></button>
				<button type="button" class="button cancel-variation-changes" disabled="disabled"><?php esc_html_e( 'Cancel', 'poocommerce' ); ?></button>

				<div class="variations-pagenav">
					<?php /* translators: variations count*/ ?>
					<span class="displaying-num"><?php echo esc_html( sprintf( _n( '%s item', '%s items', $variations_count, 'poocommerce' ), $variations_count ) ); ?></span>
					<span class="expand-close">
						(<a href="#" class="expand_all"><?php esc_html_e( 'Expand', 'poocommerce' ); ?></a> / <a href="#" class="close_all"><?php esc_html_e( 'Close', 'poocommerce' ); ?></a>)
					</span>
					<span class="pagination-links">
						<a class="first-page disabled" title="<?php esc_attr_e( 'Go to the first page', 'poocommerce' ); ?>" href="#">&laquo;</a>
						<a class="prev-page disabled" title="<?php esc_attr_e( 'Go to the previous page', 'poocommerce' ); ?>" href="#">&lsaquo;</a>
						<span class="paging-select">
							<label for="current-page-selector-1" class="screen-reader-text"><?php esc_html_e( 'Select Page', 'poocommerce' ); ?></label>
							<select class="page-selector" id="current-page-selector-1" title="<?php esc_attr_e( 'Current page', 'poocommerce' ); ?>">
								<?php for ( $i = 1; $i <= $variations_total_pages; $i++ ) : ?>
									<?php /* phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment */ ?>
									<option value="<?php echo $i; // WPCS: XSS ok. ?>"><?php echo $i; // WPCS: XSS ok. ?></option>
									<?php /* phpcs:enable */ ?>
								<?php endfor; ?>
							</select>
							<?php echo esc_html_x( 'of', 'number of pages', 'poocommerce' ); ?> <span class="total-pages"><?php echo esc_html( $variations_total_pages ); ?></span>
						</span>
						<a class="next-page" title="<?php esc_attr_e( 'Go to the next page', 'poocommerce' ); ?>" href="#">&rsaquo;</a>
						<a class="last-page" title="<?php esc_attr_e( 'Go to the last page', 'poocommerce' ); ?>" href="#">&raquo;</a>
					</span>
				</div>
				<div class="clear"></div>
			</div>

		<?php endif; ?>
	</div>
</div>
<script type="text/template" id="tmpl-wc-modal-set-price-variations">
	<div class="wc-backbone-modal">
		<div class="wc-backbone-modal-content">
			<div class="components-modal__content poocommerce-set-price-variations" role="document">
				<div class="components-modal__header">
					<h2><?php echo esc_attr( $modal_title ); ?></h2>
				</div>
				<div class="poocommerce-usage-modal__wrapper">
					<div class="poocommerce-usage-modal__message">
						<span><?php esc_html_e( 'Add price to all variations that don\'t have a price', 'poocommerce' ); ?> (<?php echo esc_attr( get_poocommerce_currency_symbol() ); ?> <?php echo esc_textarea( get_poocommerce_currency() ); ?>)</span>
						<input type="text" class="components-text-control__input wc_input_variations_price"/>
					</div>
					<div class="poocommerce-usage-modal__actions">
						<button class="modal-close components-button is-secondary"><?php esc_html_e( 'Cancel', 'poocommerce' ); ?></button>
						<button class="modal-close button components-button add_variations_price_button button-primary" disabled><?php esc_html_e( 'Add prices', 'poocommerce' ); ?></button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="wc-backbone-modal-backdrop modal-close"></div>
</script>
