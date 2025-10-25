<?php
/**
 * Email Downloads.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/emails/plain/email-downloads.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 3.4.0
 */

defined( 'ABSPATH' ) || exit;

echo esc_html( wc_strtoupper( esc_html__( 'Downloads', 'poocommerce' ) ) ) . "\n\n";

foreach ( $downloads as $download ) {
	foreach ( $columns as $column_id => $column_name ) {
		echo wp_kses_post( $column_name ) . ': ';

		if ( has_action( 'poocommerce_email_downloads_column_' . $column_id ) ) {
			do_action( 'poocommerce_email_downloads_column_' . $column_id, $download, $plain_text );
		} else {
			switch ( $column_id ) {
				case 'download-product':
					echo esc_html( $download['product_name'] );
					break;
				case 'download-file':
					echo esc_html( $download['download_name'] ) . ' - ' . esc_url( $download['download_url'] );
					break;
				case 'download-expires':
					if ( ! empty( $download['access_expires'] ) ) {
						echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $download['access_expires'] ) ) );
					} else {
						esc_html_e( 'Never', 'poocommerce' );
					}
					break;
			}
		}
		echo "\n";
	}
	echo "\n";
}
echo '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=';
echo "\n\n";
