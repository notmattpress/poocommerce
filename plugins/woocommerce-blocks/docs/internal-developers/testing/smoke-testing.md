# Smoke Testing

We generally consider smoke testing using this definition [from Wikipedia](<https://href.li/?https://en.wikipedia.org/wiki/Smoke_testing_(software)>):

> **Smoke Testing** is a subset of test cases that cover the most important functionality of a component or system, used to aid assessment of whether the main functions of the software appear to work correctly. It is a set of tests run on each new build of a product to verify that the build is testable before the build is released into the hands of the test team

When testing builds the following things should be tested to ensure critical parts of the Blocks plugin are still functional.

## Setup

To make future testing more efficient, we recommend setting up some Blocks in advance so you can repeat tests on them whenever smoke testing.

### 1. Create a page with most blocks

<details><!-- markdownlint-disable-line no-inline-html -->
<summary>You can copy and paste (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>) the following code into a new page to add all the blocks (click):</summary><!-- markdownlint-disable-line no-inline-html -->

Note: some blocks might fail to render because they are based on products having a specific id or depend on the site URL. You will need to remove and re-insert them.

```html
<!-- wp:poocommerce/featured-product {"editMode":false,"productId":15} -->
<!-- wp:button {"align":"center"} -->
<div class="wp-block-button aligncenter">
	<a
		class="wp-block-button__link"
		href=""
		>Shop now</a
	>
</div>
<!-- /wp:button -->
<!-- /wp:poocommerce/featured-product -->

<!-- wp:poocommerce/featured-category {"editMode":false,"categoryId":16} -->
<!-- wp:button {"align":"center"} -->
<div class="wp-block-button aligncenter">
	<a
		class="wp-block-button__link"
		href=""
		>Shop now</a
	>
</div>
<!-- /wp:button -->
<!-- /wp:poocommerce/featured-category -->

<!-- wp:poocommerce/handpicked-products {"editMode":false,"products":[15,32,16]} /-->

<!-- wp:poocommerce/product-best-sellers /-->

<!-- wp:poocommerce/product-top-rated /-->

<!-- wp:poocommerce/product-new /-->

<!-- wp:poocommerce/product-on-sale /-->

<!-- wp:poocommerce/product-category {"categories":[16]} /-->

<!-- wp:poocommerce/product-tag /-->

<!-- wp:poocommerce/products-by-attribute {"attributes":[{"id":22,"attr_slug":"pa_color"}],"editMode":false} /-->

<!-- wp:poocommerce/product-categories /-->

<!-- wp:poocommerce/product-categories {"isDropdown":true} /-->

<!-- wp:poocommerce/reviews-by-product {"editMode":false,"productId":15} -->
<div
	class="wp-block-poocommerce-reviews-by-product wc-block-reviews-by-product has-image has-name has-date has-rating has-content"
	data-image-type="reviewer"
	data-orderby="most-recent"
	data-reviews-on-page-load="10"
	data-reviews-on-load-more="10"
	data-show-load-more="true"
	data-show-orderby="true"
	data-product-id="15"
></div>
<!-- /wp:poocommerce/reviews-by-product -->

<!-- wp:poocommerce/reviews-by-category {"editMode":false,"categoryIds":[16]} -->
<div
	class="wp-block-poocommerce-reviews-by-category wc-block-reviews-by-category has-image has-name has-date has-rating has-content has-product-name"
	data-image-type="reviewer"
	data-orderby="most-recent"
	data-reviews-on-page-load="10"
	data-reviews-on-load-more="10"
	data-show-load-more="true"
	data-show-orderby="true"
	data-category-ids="16"
></div>
<!-- /wp:poocommerce/reviews-by-category -->

<!-- wp:poocommerce/all-reviews -->
<div
	class="wp-block-poocommerce-all-reviews wc-block-all-reviews has-image has-name has-date has-rating has-content has-product-name"
	data-image-type="reviewer"
	data-orderby="most-recent"
	data-reviews-on-page-load="10"
	data-reviews-on-load-more="10"
	data-show-load-more="true"
	data-show-orderby="true"
></div>
<!-- /wp:poocommerce/all-reviews -->

<!-- wp:search {"label":"Search","placeholder":"Search products…","buttonText":"Search","query":{"post_type":"product"}} /-->

<!-- wp:poocommerce/mini-cart /-->

<!-- wp:poocommerce/customer-account {"iconClass":"wc-block-customer-account__account-icon"} /-->

<!-- wp:poocommerce/all-products {"columns":3,"rows":3,"alignButtons":false,"contentVisibility":{"orderBy":true},"orderby":"date","layoutConfig":[["poocommerce/product-image",{"imageSizing":"cropped"}],["poocommerce/product-title"],["poocommerce/product-price"],["poocommerce/product-rating"],["poocommerce/product-button"]]} -->
<div class="wp-block-poocommerce-all-products wc-block-all-products" data-attributes="{&quot;alignButtons&quot;:false,&quot;columns&quot;:3,&quot;contentVisibility&quot;:{&quot;orderBy&quot;:true},&quot;isPreview&quot;:false,&quot;layoutConfig&quot;:[[&quot;poocommerce/product-image&quot;,{&quot;imageSizing&quot;:&quot;cropped&quot;}],[&quot;poocommerce/product-title&quot;],[&quot;poocommerce/product-price&quot;],[&quot;poocommerce/product-rating&quot;],[&quot;poocommerce/product-button&quot;]],&quot;orderby&quot;:&quot;date&quot;,&quot;rows&quot;:3}"></div>
<!-- /wp:poocommerce/all-products -->
```

</details>

### 2. Create a page with the Product Collection block, and filter blocks, setup to test that functionality in isolation. Using the columns block here too is a good idea to keep things organized

<details><!-- markdownlint-disable-line no-inline-html -->
<summary>You can copy and paste (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>) the following code into a new page to add all the blocks (click):</summary><!-- markdownlint-disable-line no-inline-html -->

```html
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:poocommerce/filter-wrapper {"filterType":"price-filter","heading":"Filter by price"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Filter by price</h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/price-filter {"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-price-filter is-loading"><span aria-hidden="true" class="wc-block-product-categories__placeholder"></span></div>
<!-- /wp:poocommerce/price-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"attribute-filter","heading":"Filter by attribute"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Filter by attribute</h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/attribute-filter {"attributeId":1,"showCounts":true,"queryType":"and","displayStyle":"dropdown","heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-attribute-filter is-loading"></div>
<!-- /wp:poocommerce/attribute-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"stock-filter","heading":"Filter by stock status"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Filter by stock status</h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/stock-filter {"showCounts":true,"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-stock-filter is-loading"></div>
<!-- /wp:poocommerce/stock-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"rating-filter","heading":"Filter by rating"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Filter by rating</h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/rating-filter {"showCounts":true,"displayStyle":"dropdown","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-rating-filter is-loading"></div>
<!-- /wp:poocommerce/rating-filter --></div>
<!-- /wp:poocommerce/filter-wrapper -->

<!-- wp:poocommerce/filter-wrapper {"filterType":"active-filters","heading":"Active filters"} -->
<div class="wp-block-poocommerce-filter-wrapper"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Active filters</h3>
<!-- /wp:heading -->

<!-- wp:poocommerce/active-filters {"heading":"","lock":{"remove":true}} -->
<div class="wp-block-poocommerce-active-filters is-loading"><span aria-hidden="true" class="wc-block-active-filters__placeholder"></span></div>
<!-- /wp:poocommerce/active-filters --></div>
<!-- /wp:poocommerce/filter-wrapper --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"66.66%"} -->
<div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:poocommerce/product-collection {"query":{"perPage":9,"pages":0,"offset":0,"postType":"product","order":"asc","orderBy":"title"","search":"","exclude":[],"inherit":false,"taxQuery":{},"isProductCollectionBlock":true,"poocommerceOnSale":false,"poocommerceStockStatus":["instock","outofstock","onbackorder"],"poocommerceAttributes":[],"poocommerceHandPickedProducts":[]},"tagName":"div","displayLayout":{"type":"flex","columns":3}} -->
<div class="wp-block-poocommerce-product-collection"><!-- wp:poocommerce/product-template -->
<!-- wp:poocommerce/product-image {"imageSizing":"thumbnail","isDescendentOfQueryLoop":true} /-->

<!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"0.75rem","top":"0"}}},"fontSize":"medium","__poocommerceNamespace":"poocommerce/product-collection/product-title"} /-->

<!-- wp:poocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"center","fontSize":"small"} /-->

<!-- wp:poocommerce/product-button {"textAlign":"center","isDescendentOfQueryLoop":true,"fontSize":"small"} /-->
<!-- /wp:poocommerce/product-template -->

<!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"center"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph {"placeholder":"Add text or blocks that will display when a query returns no results."} -->
<p></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:poocommerce/product-collection --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
```

</details>

### 3. Add the Cart and Checkout block to the relevant templates

## Editor Tests

-   [ ] Ensure all PooCommerce Blocks are shown in the Block Inserter.
-   [ ] Check behaviour of Blocks added to a previous saved page from earlier plugin version
    -   [ ] Do they look correct?
    -   [ ] Ensure there are no block invalidation errors for blocks added to a page in a prior version.
    -   [ ] Can you change options/attributes in the Block inspector?
    -   [ ] Are changes persisted on save?
    -   [ ] Is the Browser error console free from errors/notices/warnings?
-   [ ] Test inserting various blocks into the editor
    -   [ ] This can be verified by copying and pasting the code examples above. However, please do also test manually inserting the next three blocks as representative examples for related blocks.
        -   [ ] All Products Blocks (this is powered by the Store API)
        -   [ ] Featured Product (this is powered by the REST API)
        -   [ ] On Sale Products (this is SSR)
    -   [ ] Is the Browser error console free from errors/notices/warnings after inserting them?
    -   [ ] Do they persist and continue to display correctly after save/refresh?

## Frontend Tests

-   [ ] Do the blocks on your pre-made pages render correctly?
-   [ ] Are the blocks with user facing interactions working as expected without errors in the browser console or user facing errors (such as All Products block and filter blocks).
-   [ ] Do critical flows for the Cart and Checkout blocks work?
    -   [ ] Address and shipping calculations
    -   [ ] Payment with core payment methods
    -   [ ] Payment with Stripe (extension) and saved payment methods
    -   [ ] Payment with Express payment methods (Chrome Pay or Apple Pay)
    -   [ ] Make sure you test with logged in user and in browser incognito mode.
