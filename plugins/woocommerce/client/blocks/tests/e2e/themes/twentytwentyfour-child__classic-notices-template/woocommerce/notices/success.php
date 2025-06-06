<?php
/**
 * Show messages
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/notices/success.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 3.9.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! $notices ) {
	return;
}

?>

<?php foreach ( $notices as $notice ) : ?>
	<div class="poocommerce-message"<?php echo wc_get_notice_data_attr( $notice ); ?> role="alert">
		CLASSIC SUCCESS NOTICE: <?php echo wc_kses_notice( $notice['notice'] ); ?>
	</div>
<?php endforeach; ?>
