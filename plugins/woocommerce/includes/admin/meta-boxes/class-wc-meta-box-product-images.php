<?php
/**
 * Product Images
 *
 * Display the product images meta box.
 *
 * @author      WooThemes
 * @category    Admin
 * @package     PooCommerce\Admin\Meta Boxes
 * @version     2.1.0
 */

use Automattic\PooCommerce\Enums\ProductType;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * WC_Meta_Box_Product_Images Class.
 */
class WC_Meta_Box_Product_Images {

	/**
	 * Output the metabox.
	 *
	 * @param WP_Post $post
	 */
	public static function output( $post ) {
		global $thepostid, $product_object;

		$thepostid      = $post->ID;
		$product_object = $thepostid ? wc_get_product( $thepostid ) : new WC_Product();
		wp_nonce_field( 'poocommerce_save_data', 'poocommerce_meta_nonce' );
		?>
		<div id="product_images_container">
			<ul class="product_images">
				<?php
				$product_image_gallery = $product_object->get_gallery_image_ids( 'edit' );

				$attachments         = array_filter( $product_image_gallery );
				$update_meta         = false;
				$updated_gallery_ids = array();

				if ( ! empty( $attachments ) ) {
					foreach ( $attachments as $attachment_id ) {
						$attachment = wp_get_attachment_image( $attachment_id, 'thumbnail' );

						// if attachment is empty skip.
						if ( empty( $attachment ) ) {
							$update_meta = true;
							continue;
						}
						?>
						<li class="image" data-attachment_id="<?php echo esc_attr( $attachment_id ); ?>">
							<?php echo $attachment; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<ul class="actions">
								<li><a href="#" class="delete tips" data-tip="<?php esc_attr_e( 'Delete image', 'poocommerce' ); ?>"><?php esc_html_e( 'Delete', 'poocommerce' ); ?></a></li>
							</ul>
							<?php
							// Allow for extra info to be exposed or extra action to be executed for this attachment.
							do_action( 'poocommerce_admin_after_product_gallery_item', $thepostid, $attachment_id );
							?>
						</li>
						<?php

						// rebuild ids to be saved.
						$updated_gallery_ids[] = $attachment_id;
					}

					// need to update product meta to set new gallery ids
					if ( $update_meta ) {
						update_post_meta( $post->ID, '_product_image_gallery', implode( ',', $updated_gallery_ids ) );
					}
				}
				?>
			</ul>

			<input type="hidden" id="product_image_gallery" name="product_image_gallery" value="<?php echo esc_attr( implode( ',', $updated_gallery_ids ) ); ?>" />

		</div>
		<p class="add_product_images hide-if-no-js">
			<a href="#" data-choose="<?php esc_attr_e( 'Add images to product gallery', 'poocommerce' ); ?>" data-update="<?php esc_attr_e( 'Add to gallery', 'poocommerce' ); ?>" data-delete="<?php esc_attr_e( 'Delete image', 'poocommerce' ); ?>" data-text="<?php esc_attr_e( 'Delete', 'poocommerce' ); ?>"><?php esc_html_e( 'Add product gallery images', 'poocommerce' ); ?></a>
		</p>
		<?php
	}

	/**
	 * Save meta box data.
	 *
	 * @param int     $post_id
	 * @param WP_Post $post
	 */
	public static function save( $post_id, $post ) {
		$product_type   = empty( $_POST['product-type'] ) ? WC_Product_Factory::get_product_type( $post_id ) : sanitize_title( stripslashes( $_POST['product-type'] ) );
		$classname      = WC_Product_Factory::get_product_classname( $post_id, $product_type ? $product_type : ProductType::SIMPLE );
		$product        = new $classname( $post_id );
		$attachment_ids = isset( $_POST['product_image_gallery'] ) ? array_filter( explode( ',', wc_clean( $_POST['product_image_gallery'] ) ) ) : array();

		$product->set_gallery_image_ids( $attachment_ids );
		$product->save();
	}
}
