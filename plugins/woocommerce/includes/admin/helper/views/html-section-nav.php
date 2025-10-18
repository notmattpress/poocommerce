<?php
/**
 * Helper admin navigation.
 *
 * @package PooCommerce\Helper
 *
 * @deprecated 5.7.0
 */

use Automattic\PooCommerce\Utilities\FeaturesUtil;

$addons_url = admin_url( 'admin.php?page=wc-addons' );
if ( FeaturesUtil::feature_is_enabled( 'marketplace' ) ) {
	$addons_url = admin_url( 'admin.php?page=wc-admin&path=/extensions&tab=extensions' );
}

defined( 'ABSPATH' ) || exit(); ?>

<nav class="nav-tab-wrapper woo-nav-tab-wrapper">
	<a href="<?php echo esc_url( $addons_url ); ?>" class="nav-tab"><?php esc_html_e( 'Browse Extensions', 'poocommerce' ); ?></a>

	<?php
		$count_html = WC_Helper_Updater::get_updates_count_html();
		/* translators: %s: PooCommerce.com Subscriptions tab count HTML. */
		$menu_title = sprintf( __( 'My Subscriptions %s', 'poocommerce' ), $count_html );
	?>
	<a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-addons&section=helper' ) ); ?>" class="nav-tab nav-tab-active"><?php echo wp_kses_post( $menu_title ); ?></a>
</nav>
