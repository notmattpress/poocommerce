<?php
/**
 * Title: Related Products
 * Slug: poocommerce-blocks/related-products
 * Categories: PooCommerce
 * Inserter: false
 */
?>

<!-- wp:poocommerce/product-collection {"align":"wide","queryId":0,"query":{"perPage":5,"pages":1,"offset":0,"postType":"product","order":"asc","orderBy":"title","search":"","exclude":[],"inherit":false,"taxQuery":{},"isProductCollectionBlock":true,"featured":false,"poocommerceOnSale":false,"poocommerceStockStatus":["instock","onbackorder"],"poocommerceAttributes":[],"poocommerceHandPickedProducts":[],"filterable":false},"tagName":"div","displayLayout":{"type":"flex","columns":5,"shrinkColumns":false},"dimensions":{"widthType":"fill"},"collection":"poocommerce/product-collection/related","hideControls":["inherit"],"queryContextIncludes":["collection"],"__privatePreviewState":{"isPreview":true,"previewMessage":"Actual products will vary depending on the product being viewed."}} -->
	<div class="wp-block-poocommerce-product-collection alignwide">
		<!-- wp:heading {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}}} -->
		<h2 class="wp-block-heading" style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30)">
				<?php
					echo esc_html__(
						'Related products',
						'poocommerce'
					)
					?>
			</h2>
		<!-- /wp:heading -->

		<!-- wp:poocommerce/product-template -->
			<!-- wp:poocommerce/product-image {"imageSizing":"thumbnail","isDescendentOfQueryLoop":true} /-->
			<!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"0.75rem","top":"0"}}},"fontSize":"medium","__poocommerceNamespace":"poocommerce/product-collection/product-title"} /-->
			<!-- wp:poocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"center","fontSize":"small"} /-->
			<!-- wp:poocommerce/product-button {"textAlign":"center","isDescendentOfQueryLoop":true,"fontSize":"small"} /-->
		<!-- /wp:poocommerce/product-template -->
	</div>
<!-- /wp:poocommerce/product-collection -->
