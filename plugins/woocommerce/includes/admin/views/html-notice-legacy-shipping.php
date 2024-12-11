<?php
/**
 * Admin View: Notice - Legacy Shipping.
 *
 * @package PooCommerce\Admin\Notices
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="message" class="updated poocommerce-message">
	<a class="poocommerce-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wc-hide-notice', 'legacy_shipping' ), 'poocommerce_hide_notices_nonce', '_wc_notice_nonce' ) ); ?>">
		<?php esc_html_e( 'Dismiss', 'poocommerce' ); ?>
	</a>

	<p class="main">
		<strong><?php esc_html_e( 'New:', 'poocommerce' ); ?> <?php esc_html_e( 'Shipping zones', 'poocommerce' ); ?></strong> &#8211; <?php esc_html_e( 'a group of regions that can be assigned different shipping methods and rates.', 'poocommerce' ); ?>
	</p>
	<p>
		<?php esc_html_e( 'Legacy shipping methods (flat rate, international flat rate, local pickup and delivery, and free shipping) are deprecated but will continue to work as normal for now. <b><em>They will be removed in future versions of PooCommerce</em></b>. We recommend disabling these and setting up new rates within shipping zones as soon as possible.', 'poocommerce' ); ?>
	</p>

	<p class="submit">
		<?php if ( empty( $_GET['page'] ) || empty( $_GET['tab'] ) || 'wc-settings' !== $_GET['page'] || 'shipping' !== $_GET['tab'] ) : ?>
			<a class="button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings&tab=shipping' ) ); ?>">
				<?php esc_html_e( 'Setup shipping zones', 'poocommerce' ); ?>
			</a>
		<?php endif; ?>
		<a class="button-secondary" href="https://poocommerce.com/document/setting-up-shipping-zones/">
			<?php esc_html_e( 'Learn more about shipping zones', 'poocommerce' ); ?>
		</a>
	</p>
</div>
