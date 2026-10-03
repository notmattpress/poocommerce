<?php
/**
 * Admin View: Importer - CSV import progress
 *
 * @package PooCommerce\Admin\Importers
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wc-progress-form-content poocommerce-importer poocommerce-importer__importing">
	<header>
		<span class="spinner is-active"></span>
		<h2><?php esc_html_e( 'Importing', 'poocommerce' ); ?></h2>
		<p><?php esc_html_e( 'Your products are now being imported...', 'poocommerce' ); ?></p>
	</header>
	<section>
		<progress class="poocommerce-importer-progress" max="100" value="0"></progress>
	</section>
</div>
