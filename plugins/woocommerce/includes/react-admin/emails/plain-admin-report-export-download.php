<?php
/**
 * Admin report export download email (plain text)
 *
 * @package PooCommerce\Admin\Templates\Emails\HTML
 */

defined( 'ABSPATH' ) || exit;

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

/* translators: %1$s: report name, %2$s: download URL */
echo wp_kses_post( sprintf( __( 'Download your %1$s Report: %2$s', 'poocommerce' ), $report_name, $download_url ) );

echo "\n\n----------------------------------------\n\n";

echo wp_kses_post( apply_filters( 'poocommerce_email_footer_text', get_option( 'poocommerce_email_footer_text' ) ) );
