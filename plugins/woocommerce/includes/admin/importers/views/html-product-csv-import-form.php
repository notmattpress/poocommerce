<?php
/**
 * Admin View: Product import form
 *
 * @package PooCommerce\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<form class="wc-progress-form-content poocommerce-importer" enctype="multipart/form-data" method="post">
	<header>
		<h2><?php esc_html_e( 'Import products from a CSV file', 'poocommerce' ); ?></h2>
		<p><?php esc_html_e( 'This tool allows you to import (or merge) product data to your store from a CSV or TXT file.', 'poocommerce' ); ?></p>
	</header>
	<section>
		<table class="form-table poocommerce-importer-options">
			<tbody>
				<tr>
					<th scope="row">
						<label for="upload">
							<?php esc_html_e( 'Choose a CSV file from your computer:', 'poocommerce' ); ?>
						</label>
					</th>
					<td>
						<?php
						if ( ! empty( $upload_dir['error'] ) ) {
							?>
							<div class="inline error">
								<p><?php esc_html_e( 'Before you can upload your import file, you will need to fix the following error:', 'poocommerce' ); ?></p>
								<p><strong><?php echo esc_html( $upload_dir['error'] ); ?></strong></p>
							</div>
							<?php
						} else {
							?>
							<input type="file" id="upload" name="import" size="25" />
							<input type="hidden" name="action" value="save" />
							<input type="hidden" name="max_file_size" value="<?php echo esc_attr( $bytes ); ?>" />
							<br>
							<small>
								<?php
								printf(
									/* translators: %s: maximum upload size */
									esc_html__( 'Maximum size: %s', 'poocommerce' ),
									esc_html( $size )
								);
								?>
							</small>
							<?php
						}
						?>
					</td>
				</tr>
				<tr>
					<th><label for="poocommerce-importer-update-existing"><?php esc_html_e( 'Update existing products', 'poocommerce' ); ?></label><br/></th>
					<td>
						<input type="hidden" name="update_existing" value="0" />
						<input type="checkbox" id="poocommerce-importer-update-existing" name="update_existing" value="1" />
						<label for="poocommerce-importer-update-existing"><?php esc_html_e( 'Existing products that match by ID or SKU will be updated. Products that do not exist will be skipped.', 'poocommerce' ); ?></label>
					</td>
				</tr>
				<tr class="poocommerce-importer-advanced hidden">
					<th>
						<label for="poocommerce-importer-file-url"><?php esc_html_e( 'Alternatively, enter the path to a CSV file on your server:', 'poocommerce' ); ?></label>
					</th>
					<td>
						<label for="poocommerce-importer-file-url" class="poocommerce-importer-file-url-field-wrapper">
							<code><?php echo esc_html( ABSPATH ) . ' '; ?></code><input type="text" id="poocommerce-importer-file-url" name="file_url" />
						</label>
					</td>
				</tr>
				<tr class="poocommerce-importer-advanced hidden">
					<th><label><?php esc_html_e( 'CSV Delimiter', 'poocommerce' ); ?></label><br/></th>
					<td><input type="text" name="delimiter" placeholder="," size="2" /></td>
				</tr>
				<tr class="poocommerce-importer-advanced hidden">
					<th><label><?php esc_html_e( 'Use previous column mapping preferences?', 'poocommerce' ); ?></label><br/></th>
					<td><input type="checkbox" id="poocommerce-importer-map-preferences" name="map_preferences" value="1" /></td>
				</tr>
				<tr class="poocommerce-importer-advanced hidden">
					<th><label><?php esc_html_e( 'Character encoding of the file', 'poocommerce' ); ?></label><br/></th>
					<td><select id="poocommerce-importer-character-encoding" name="character_encoding">
							<option value="" selected><?php esc_html_e( 'Autodetect', 'poocommerce' ); ?></option>
							<?php
							$encodings = mb_list_encodings();
							sort( $encodings, SORT_NATURAL );
							foreach ( $encodings as $encoding ) {
								echo '<option>' . esc_html( $encoding ) . '</option>';
							}
							?>
						</select>
					</td>
				</tr>
			</tbody>
		</table>
	</section>
	<script type="text/javascript">
		jQuery(function() {
			jQuery( '.poocommerce-importer-toggle-advanced-options' ).on( 'click', function() {
				var elements = jQuery( '.poocommerce-importer-advanced' );
				if ( elements.is( '.hidden' ) ) {
					elements.removeClass( 'hidden' );
					jQuery( this ).text( jQuery( this ).data( 'hidetext' ) );
				} else {
					elements.addClass( 'hidden' );
					jQuery( this ).text( jQuery( this ).data( 'showtext' ) );
				}
				return false;
			} );
		});
	</script>
	<div class="wc-actions">
		<a href="#" class="poocommerce-importer-toggle-advanced-options" data-hidetext="<?php esc_attr_e( 'Hide advanced options', 'poocommerce' ); ?>" data-showtext="<?php esc_attr_e( 'Show advanced options', 'poocommerce' ); ?>"><?php esc_html_e( 'Show advanced options', 'poocommerce' ); ?></a>
		<button type="submit" class="button button-primary button-next" value="<?php esc_attr_e( 'Continue', 'poocommerce' ); ?>" name="save_step"><?php esc_html_e( 'Continue', 'poocommerce' ); ?></button>
		<?php wp_nonce_field( 'poocommerce-csv-importer' ); ?>
	</div>
</form>
