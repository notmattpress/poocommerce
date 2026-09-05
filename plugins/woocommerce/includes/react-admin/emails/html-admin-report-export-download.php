<?php
/**
 * Admin report export download
 *
 * @package PooCommerce\Admin\Templates\Emails\HTML
 */

defined( 'ABSPATH' ) || exit;

/*
 * @hooked WC_Emails::email_header() Output the email header
 */
do_action( 'poocommerce_email_header', $email_heading, $email );

?>
<a href="<?php echo esc_url( $download_url ); ?>">
	<?php
		/* translators: %s: report name */
		echo esc_html( sprintf( __( 'Download your %s Report', 'poocommerce' ), $report_name ) );
	?>
</a>
<p>
	<?php
		/**
		 * Length of time the download link stays valid, passed in by ReportCSVEmail.
		 *
		 * @var string $retention
		 */
		/* translators: %s: length of time the download link stays valid, e.g. "1 week" */
		echo esc_html( sprintf( __( 'This link is available for %s.', 'poocommerce' ), $retention ) );
	?>
</p>
<?php
/*
 * @hooked WC_Emails::email_footer() Output the email footer
 */
do_action( 'poocommerce_email_footer', $email );
