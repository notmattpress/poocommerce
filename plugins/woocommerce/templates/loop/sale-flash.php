<?php
/**
 * Product loop sale flash
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/loop/sale-flash.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://poocommerce.com/document/template-structure/
 * @package     PooCommerce\Templates
 * @version     1.6.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

global $post, $product;

?>
<?php if ( $product->is_on_sale() ) : ?>

	<?php echo apply_filters( 'poocommerce_sale_flash', '<span class="onsale">' . esc_html__( 'Sale!', 'poocommerce' ) . '</span>', $post, $product ); ?>

	<?php
endif;

/* Omit closing PHP tag at the end of PHP files to avoid "headers already sent" issues. */
