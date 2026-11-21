<?php
/**
 * Title: Upsell products collection
 * Slug: purple/poocommerce-upsell-products-collection
 * Categories: woo-commerce, purple
 * Keywords: woo-commerce, products, upsell, collection
 * Description: A section with a heading and a carousel of upsell products.
 * Block Types: poocommerce/product-collection
 * Viewport width: 1440
 *
 * @package purple
 */

?>

<!-- wp:group {"metadata":{"name":"Upsell products collection","categories":["woo-commerce","purple"],"patternName":"purple/poocommerce-upsell-products-collection","description":"A section with a heading and a carousel of upsell products."},"align":"full","style":{"spacing":{"blockGap":"0","margin":{"top":"0","bottom":"0"},"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)"><!-- wp:poocommerce/product-collection {"queryId":24,"query":{"perPage":8,"pages":1,"offset":0,"postType":"product","order":"desc","orderBy":"date","search":"","exclude":[],"inherit":false,"taxQuery":[],"isProductCollectionBlock":true,"featured":false,"poocommerceOnSale":false,"poocommerceStockStatus":["instock","onbackorder"],"poocommerceAttributes":[],"poocommerceHandPickedProducts":[],"filterable":false,"relatedBy":{"categories":true,"tags":true}},"tagName":"div","displayLayout":{"type":"carousel","columns":4,"shrinkColumns":true},"dimensions":{"widthType":"fill"},"collection":"poocommerce/product-collection/upsells","hideControls":["inherit","filterable"],"queryContextIncludes":["collection"],"__privatePreviewState":{"isPreview":true,"previewMessage":"Actual products will vary depending on the product being viewed."},"align":"wide"} -->
<div class="wp-block-poocommerce-product-collection alignwide"><!-- wp:group {"style":{"typography":{"lineHeight":"1"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"top","flexWrap":"nowrap","orientation":"horizontal"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;line-height:1"><!-- wp:heading {"fontSize":"x-large"} -->
<h2 class="wp-block-heading has-x-large-font-size"><?php esc_html_e( 'You might also like', 'purple' );?></h2>
<!-- /wp:heading -->

<!-- wp:poocommerce/product-gallery-large-image-next-previous {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-poocommerce-product-gallery-large-image-next-previous"></div>
<!-- /wp:poocommerce/product-gallery-large-image-next-previous --></div>
<!-- /wp:group -->

<!-- wp:poocommerce/product-template {"style":{"typography":{"lineHeight":"1"}},"layout":{"type":"flex","justifyContent":"left","verticalAlignment":"top","flexWrap":"nowrap","orientation":"horizontal"}} -->
<!-- wp:poocommerce/product-image {"showSaleBadge":false,"isDescendentOfQueryLoop":true,"style":{"dimensions":{"aspectRatio":"1"}}} -->
<!-- wp:poocommerce/product-sale-badge /-->
<!-- /wp:poocommerce/product-image -->

<!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"lineHeight":"1.5625"},"spacing":{"margin":{"top":"var:preset|spacing|20","bottom":"0"}}},"fontSize":"medium","__poocommerceNamespace":"poocommerce/product-collection/product-title"} /-->

<!-- wp:poocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"left","style":{"spacing":{"margin":{"top":"var:preset|spacing|10","left":"0"}}}} /-->
<!-- /wp:poocommerce/product-template --></div>
<!-- /wp:poocommerce/product-collection --></div>
<!-- /wp:group -->
