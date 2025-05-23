<?php
/**
 * My Downloads - Deprecated
 *
 * Shows downloads on the account page.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/myaccount/my-downloads.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://poocommerce.com/document/template-structure/
 * @package     PooCommerce\Templates
 * @version     2.0.0
 * @deprecated  2.6.0
 */

defined( 'ABSPATH' ) || exit;

$downloads = WC()->customer->get_downloadable_products();

if ( $downloads ) : ?>

	<?php do_action( 'poocommerce_before_available_downloads' ); ?>

	<h2><?php echo apply_filters( 'poocommerce_my_account_my_downloads_title', esc_html__( 'Available downloads', 'poocommerce' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></h2>

	<ul class="poocommerce-Downloads digital-downloads">
		<?php foreach ( $downloads as $download ) : ?>
			<li>
				<?php
				do_action( 'poocommerce_available_download_start', $download );

				if ( is_numeric( $download['downloads_remaining'] ) ) {
					/* translators: %s product name */
					echo apply_filters( 'poocommerce_available_download_count', '<span class="poocommerce-Count count">' . sprintf( _n( '%s download remaining', '%s downloads remaining', $download['downloads_remaining'], 'poocommerce' ), $download['downloads_remaining'] ) . '</span> ', $download ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}

				echo apply_filters( 'poocommerce_available_download_link', '<a href="' . esc_url( $download['download_url'] ) . '">' . $download['download_name'] . '</a>', $download ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

				do_action( 'poocommerce_available_download_end', $download );
				?>
			</li>
		<?php endforeach; ?>
	</ul>

	<?php do_action( 'poocommerce_after_available_downloads' ); ?>

<?php endif; ?>
