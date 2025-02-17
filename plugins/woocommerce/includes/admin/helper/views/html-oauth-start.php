<?php
/**
 * Admin -> PooCommerce -> Extensions -> PooCommerce.com Subscriptions main page.
 *
 * @package PooCommerce\Views
 */

use Automattic\PooCommerce\Internal\BrandingController;

defined( 'ABSPATH' ) || exit();

// Old branding.
$logo_filename = 'poocommerce_logo.png';

if (
	class_exists( 'Automattic\PooCommerce\Internal\BrandingController' )
	&& BrandingController::use_new_branding()
) {
	// New branding.
	$logo_filename = 'woo-logo.svg';
}

?>

<div class="wrap poocommerce wc-addons-wrap wc-helper">
	<?php require WC_Helper::get_view_filename( 'html-section-nav.php' ); ?>
	<h1 class="screen-reader-text"><?php esc_html_e( 'PooCommerce Extensions', 'poocommerce' ); ?></h1>
	<?php require WC_Helper::get_view_filename( 'html-section-notices.php' ); ?>

		<div class="start-container">
			<div class="text">
			<img src="<?php echo esc_url( WC()->plugin_url() . '/assets/images/' . $logo_filename ); ?>" alt="
								<?php
								esc_attr_e(
									'PooCommerce',
									'poocommerce'
								);
								?>
				" style="width:180px;">

			<?php
			// phpcs:disable WordPress.Security.NonceVerification.Recommended
			if ( ! empty( $_GET['wc-helper-status'] ) && 'helper-disconnected' === $_GET['wc-helper-status'] ) :
				// phpcs:enable WordPress.Security.NonceVerification.Recommended
				?>
					<p><strong><?php esc_html_e( 'Sorry to see you go.', 'poocommerce' ); ?></strong> <?php esc_html_e( 'Feel free to reconnect again using the button below.', 'poocommerce' ); ?></p>
				<?php endif; ?>

				<h2><?php esc_html_e( 'Manage your subscriptions, get important product notifications, and updates, all from the convenience of your PooCommerce dashboard', 'poocommerce' ); ?></h2>
				<p><?php esc_html_e( 'Once connected, your PooCommerce.com purchases will be listed here.', 'poocommerce' ); ?></p>
				<p><a class="button button-primary button-helper-connect" href="<?php echo esc_url( $connect_url ); ?>"><?php esc_html_e( 'Connect', 'poocommerce' ); ?></a></p>
			</div>
		</div>
</div>
