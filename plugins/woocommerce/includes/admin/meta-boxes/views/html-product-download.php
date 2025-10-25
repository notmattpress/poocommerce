<?php
/**
 * Template used to form individual rows within the downloadable files table.
 *
 * @package PooCommerce\Admin\Views
 *
 * @var bool   $disabled_download Indicates if the current downloadable file is disabled.
 * @var array  $file              Product download data.
 * @var string $key               Product download key.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<tr>
	<td class="sort"></td>
	<td class="file_name">
		<input type="text" class="input_text" placeholder="<?php esc_attr_e( 'File name', 'poocommerce' ); ?>" name="_wc_file_names[]" value="<?php echo esc_attr( $file['name'] ); ?>" />
		<input type="hidden" name="_wc_file_hashes[]" value="<?php echo esc_attr( $key ); ?>" />
	</td>
	<td class="file_url">
		<input type="text" class="input_text" placeholder="<?php esc_attr_e( 'http://', 'poocommerce' ); ?>" name="_wc_file_urls[]" value="<?php echo esc_attr( $file['file'] ); ?>" />
		<?php if ( $disabled_download ) : ?>
			<span class="disabled">*</span>
		<?php endif; ?>
	</td>
	<td class="file_url_choose" width="1%"><a href="#" class="button upload_file_button" data-choose="<?php esc_attr_e( 'Choose file', 'poocommerce' ); ?>" data-update="<?php esc_attr_e( 'Insert file URL', 'poocommerce' ); ?>"><?php echo esc_html__( 'Choose file', 'poocommerce' ); ?></a></td>
	<td width="1%"><a href="#" class="delete"><?php esc_html_e( 'Delete', 'poocommerce' ); ?></a></td>
</tr>
