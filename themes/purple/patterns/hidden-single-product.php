<?php
/**
 * Title: PooCommerce single product
 * Slug: purple/hidden-single-product
 * Inserter: no
 *
 * @package purple
 */

?>

<!-- wp:group {"metadata":{"name":"Single Product"},"align":"wide","style":{"spacing":{"blockGap":"0","margin":{"top":"0","bottom":"0"},"padding":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignwide" style="margin-top:0;margin-bottom:0;padding-bottom:var(--wp--preset--spacing--50)"><!-- wp:poocommerce/store-notices /-->

<!-- wp:poocommerce/breadcrumbs /-->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|90"},"margin":{"top":"var:preset|spacing|30"}}}} -->
<div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--30)"><!-- wp:column {"width":"50%","layout":{"type":"default"}} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:poocommerce/product-gallery {"hoverZoom":false} -->
<div class="wp-block-poocommerce-product-gallery wc-block-product-gallery"><!-- wp:poocommerce/product-gallery-thumbnails {"thumbnailSize":"18%","aspectRatio":"1","activeThumbnailStyle":"outline"} /-->

<!-- wp:poocommerce/product-gallery-large-image -->
<div class="wp-block-poocommerce-product-gallery-large-image wc-block-product-gallery-large-image__inner-blocks"><!-- wp:poocommerce/product-image {"showProductLink":false,"showSaleBadge":false,"style":{"dimensions":{"aspectRatio":"1"}}} -->
<div class="is-loading"></div>
<!-- /wp:poocommerce/product-image -->

<!-- wp:poocommerce/product-gallery-large-image-next-previous {"align":"right","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-poocommerce-product-gallery-large-image-next-previous alignright"></div>
<!-- /wp:poocommerce/product-gallery-large-image-next-previous --></div>
<!-- /wp:poocommerce/product-gallery-large-image --></div>
<!-- /wp:poocommerce/product-gallery --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"50%","style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"blockGap":"0","margin":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0"><!-- wp:post-title {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"x-large","__poocommerceNamespace":"poocommerce/product-query/product-title"} /-->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|10"},"blockGap":"var:preset|spacing|10"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--10)"><!-- wp:poocommerce/product-price {"isDescendentOfSingleProductTemplate":true,"fontSize":"large","style":{"typography":{"lineHeight":"1"},"spacing":{"padding":{"top":"0"}}}} /-->

<!-- wp:poocommerce/product-sale-badge /--></div>
<!-- /wp:group -->

<!-- wp:poocommerce/product-rating {"isDescendentOfSingleProductTemplate":true,"style":{"spacing":{"margin":{"bottom":"0","top":"var:preset|spacing|20"}}}} /--></div>
<!-- /wp:group -->

<!-- wp:poocommerce/product-summary {"isDescendentOfSingleProductTemplate":true,"showDescriptionIfEmpty":true,"style":{"spacing":{"padding":{"top":"0","bottom":"0"}}}} /-->

<!-- wp:poocommerce/add-to-cart-with-options /-->

<!-- wp:poocommerce/product-details -->
<div class="wp-block-poocommerce-product-details alignwide"><!-- wp:accordion {"style":{"spacing":{"blockGap":"0"}}} -->
<div role="group" class="wp-block-accordion"><!-- wp:accordion-item {"openByDefault":true} -->
<div class="wp-block-accordion-item is-open"><!-- wp:accordion-heading {"level":3,"style":{"border":{"bottom":{"color":"var:preset|color|theme-6","width":"1px"}},"spacing":{"padding":{"top":"0.94rem","bottom":"0.94rem"}}}} -->
<h3 class="wp-block-accordion-heading has-icon has-icon-right" style="border-bottom-color:var(--wp--preset--color--theme-6);border-bottom-width:1px"><button type="button" class="wp-block-accordion-heading__toggle" style="padding-top:0.94rem;padding-bottom:0.94rem"><span class="wp-block-accordion-heading__toggle-title"><?php esc_html_e( 'Description', 'purple' ); ?></span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel {"style":{"spacing":{"blockGap":"0","padding":{"top":"0","bottom":"0"}}}} -->
<div role="region" class="wp-block-accordion-panel" style="padding-top:0;padding-bottom:0"><!-- wp:spacer {"height":"10px"} -->
<div style="height:10px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:poocommerce/product-description /-->

<!-- wp:spacer {"height":"20px"} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item -->

<!-- wp:accordion-item -->
<div class="wp-block-accordion-item"><!-- wp:accordion-heading {"level":3,"style":{"border":{"bottom":{"color":"var:preset|color|theme-6","width":"1px"}},"spacing":{"padding":{"top":"0.94rem","bottom":"0.94rem"}}}} -->
<h3 class="wp-block-accordion-heading has-icon has-icon-right" style="border-bottom-color:var(--wp--preset--color--theme-6);border-bottom-width:1px"><button type="button" class="wp-block-accordion-heading__toggle" style="padding-top:0.94rem;padding-bottom:0.94rem"><span class="wp-block-accordion-heading__toggle-title"><?php esc_html_e( 'Additional information', 'purple' ); ?></span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel {"style":{"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"0"}}} -->
<div role="region" class="wp-block-accordion-panel" style="padding-top:0;padding-bottom:0"><!-- wp:spacer {"height":"10px"} -->
<div style="height:10px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:poocommerce/product-specifications /-->

<!-- wp:spacer {"height":"20px"} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item --></div>
<!-- /wp:accordion --></div>
<!-- /wp:poocommerce/product-details -->

<!-- wp:spacer {"height":"var:preset|spacing|20","style":{"spacing":{"margin":{"top":"var:preset|spacing|20","bottom":"0"}}}} -->
<div style="margin-top:var(--wp--preset--spacing--20);margin-bottom:0;height:var(--wp--preset--spacing--20)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:pattern {"slug":"purple/store-features-two-columns"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->

<!-- wp:pattern {"slug":"purple/poocommerce-upsell-products-collection"} /-->

<!-- wp:pattern {"slug":"purple/poocommerce-related-products-collection"} /-->

<!-- wp:pattern {"slug":"purple/about-left-aligned-product-right-text"} /-->

<!-- wp:pattern {"slug":"purple/categories-on-three-columns"} /-->

<!-- wp:group {"metadata":{"name":"Product reviews"},"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|90","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"48.75rem","wideSize":"48.75rem"}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--90);margin-bottom:0"><!-- wp:poocommerce/product-reviews -->
<div class="wp-block-poocommerce-product-reviews"><!-- wp:poocommerce/product-reviews-title {"showProductTitle":false,"showReviewsCount":false,"level":3,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"fontSize":"x-large"} /-->

<!-- wp:poocommerce/product-review-template -->
<!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"0","left":"var:preset|spacing|20"},"margin":{"top":"0","bottom":"var:preset|spacing|70"}}}} -->
<div class="wp-block-columns" style="margin-top:0;margin-bottom:var(--wp--preset--spacing--70)"><!-- wp:column {"width":"100px"} -->
<div class="wp-block-column" style="flex-basis:100px"><!-- wp:poocommerce/product-review-author-name {"isLink":false,"style":{"spacing":{"padding":{"bottom":"0","top":"0.25em"}}}} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"blockGap":"0"},"@mobile":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:poocommerce/product-review-rating /-->

<!-- wp:poocommerce/product-review-content /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"140px"} -->
<div class="wp-block-column" style="flex-basis:140px"><!-- wp:poocommerce/product-review-date {"isLink":false,"style":{"spacing":{"padding":{"bottom":"0","top":"0.25em"}},"@mobile":{"spacing":{"padding":{"top":"0"}}}}} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->


<!-- /wp:poocommerce/product-review-template -->

<!-- wp:poocommerce/product-reviews-pagination {"paginationArrow":"arrow","layout":{"type":"flex","justifyContent":"space-between"}} -->
<!-- wp:poocommerce/product-reviews-pagination-previous /-->

<!-- wp:poocommerce/product-reviews-pagination-next /-->
<!-- /wp:poocommerce/product-reviews-pagination -->

<!-- wp:poocommerce/product-review-form {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} /--></div>
<!-- /wp:poocommerce/product-reviews --></div>
<!-- /wp:group -->
