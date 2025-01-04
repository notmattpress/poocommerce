<?php
/**
 * Title: Coming Soon With Header and Footer
 * Slug: poocommerce/page-coming-soon-with-header-footer
 * Categories: PooCommerce
 * Template Types: coming-soon
 * Inserter: false
 * Feature Flag: coming-soon-newsletter-template
 */

$current_theme     = wp_get_theme()->get_stylesheet();
$inter_font_family = 'inter';
$cardo_font_family = 'cardo';

if ( 'twentytwentyfour' === $current_theme ) {
	$inter_font_family = 'body';
	$cardo_font_family = 'heading';
}

?>

<!-- wp:poocommerce/coming-soon {"comingSoonPatternId":"page-coming-soon-with-header-footer","className":"poocommerce-coming-soon-store-only"} -->
<div class="wp-block-poocommerce-coming-soon poocommerce-coming-soon-store-only">

<?php
if ( wc_current_theme_is_fse_theme() ) {
	echo '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->';
}
?>

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"textAlign":"center","level":1,"fontFamily":"<?php echo esc_html( $cardo_font_family ); ?>"} -->
<h1 class="wp-block-heading has-text-align-center has-<?php echo esc_html( $cardo_font_family ); ?>-font-family"><?php echo esc_html__( 'Great things are on the horizon', 'poocommerce' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:spacer {"height":"10px"} -->
<div style="height:10px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph {"align":"center","fontFamily":"<?php echo esc_html( $inter_font_family ); ?>"} -->
<p class="has-text-align-center has-<?php echo esc_html( $inter_font_family ); ?>-font-family"><?php echo esc_html__( 'Something big is brewing! Our store is in the works and will be launching soon!', 'poocommerce' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:group -->

<?php
if ( wc_current_theme_is_fse_theme() ) {
	echo '<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';
}
?>
</div>
<!-- /wp:poocommerce/coming-soon -->
