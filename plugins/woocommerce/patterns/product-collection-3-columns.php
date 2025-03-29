<?php
/**
 * Title: Product Collection 3 Columns
 * Slug: poocommerce-blocks/product-collection-3-columns
 * Categories: PooCommerce
 */
?>

<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"margin":{"top":"0px","bottom":"80px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="margin-top:0px;margin-bottom:80px;padding-top:0;padding-right:var(--wp--preset--spacing--30);padding-bottom:0;padding-left:var(--wp--preset--spacing--30)">
	<!-- wp:poocommerce/product-collection {"query":{"perPage":3,"pages":0,"offset":0,"postType":"product","order":"asc","orderBy":"title","search":"","exclude":[],"inherit":false,"taxQuery":{},"isProductCollectionBlock":true,"poocommerceOnSale":false,"poocommerceStockStatus":["instock","outofstock","onbackorder"],"poocommerceAttributes":[],"poocommerceHandPickedProducts":[]},"tagName":"div","dimensions":{"widthType":"fill","fixedWidth":""},"displayLayout":{"type":"flex","columns":3},"align":"wide"} -->
	<div class="wp-block-poocommerce-product-collection alignwide">
		<!-- wp:poocommerce/product-template -->
		<!-- wp:poocommerce/product-image {"aspectRatio":"3/5","imageSizing":"single","isDescendentOfQueryLoop":true} /-->

		<!-- wp:poocommerce/product-rating {"isDescendentOfQueryLoop":true,"textAlign":"center"} /-->

		<!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"0.75rem","top":"0"}}},"fontSize":"medium","__poocommerceNamespace":"poocommerce/product-collection/product-title"} /-->

		<!-- wp:poocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"center","fontSize":"small"} /-->
		<!-- /wp:poocommerce/product-template -->
	</div>
	<!-- /wp:poocommerce/product-collection -->
</div>
<!-- /wp:group -->
