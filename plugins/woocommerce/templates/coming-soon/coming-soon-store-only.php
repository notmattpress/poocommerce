<?php
/**
 * Store-only Coming Soon content for classic themes.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/coming-soon/coming-soon-store-only.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 11.4.0
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<div class="poocommerce-coming-soon-classic poocommerce-coming-soon-classic--store-only">
	<div class="poocommerce-coming-soon-classic__content">
		<h1><?php esc_html_e( 'Great things are on the horizon', 'poocommerce' ); ?></h1>
		<p><?php esc_html_e( 'Something big is brewing! Our store is in the works and will be launching soon!', 'poocommerce' ); ?></p>
	</div>
</div>
<?php
get_footer();
