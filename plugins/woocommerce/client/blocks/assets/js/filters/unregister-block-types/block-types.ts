/**
 * PooCommerce block types hidden from post editors.
 */
export const POST_EDITOR_BLOCK_TYPES_TO_UNREGISTER = [
	'poocommerce/breadcrumbs',
	'poocommerce/catalog-sorting',
	'poocommerce/legacy-template',
	'poocommerce/product-results-count',
	'poocommerce/product-reviews',
	'poocommerce/order-confirmation-status',
	'poocommerce/order-confirmation-summary',
	'poocommerce/order-confirmation-totals',
	'poocommerce/order-confirmation-totals-wrapper',
	'poocommerce/order-confirmation-downloads',
	'poocommerce/order-confirmation-downloads-wrapper',
	'poocommerce/order-confirmation-billing-address',
	'poocommerce/order-confirmation-shipping-address',
	'poocommerce/order-confirmation-billing-wrapper',
	'poocommerce/order-confirmation-shipping-wrapper',
	'poocommerce/order-confirmation-additional-information',
	'poocommerce/order-confirmation-additional-fields-wrapper',
	'poocommerce/order-confirmation-additional-fields',
];

/**
 * PooCommerce block types allowed in Widget Areas. New blocks won't be
 * exposed in the Widget Area unless specifically added here.
 */
export const WIDGET_EDITOR_ALLOWED_BLOCK_TYPES = [
	'poocommerce/all-reviews',
	'poocommerce/breadcrumbs',
	'poocommerce/cart-link',
	'poocommerce/catalog-sorting',
	'poocommerce/classic-shortcode',
	'poocommerce/customer-account',
	'poocommerce/dropdown',
	'poocommerce/featured-category',
	'poocommerce/featured-product',
	'poocommerce/mini-cart',
	'poocommerce/product-categories',
	'poocommerce/product-results-count',
	'poocommerce/product-search',
	'poocommerce/reviews-by-category',
	'poocommerce/reviews-by-product',
	'poocommerce/product-filters',
	'poocommerce/product-filter-status',
	'poocommerce/product-filter-price',
	'poocommerce/product-filter-price-slider',
	'poocommerce/product-filter-attribute',
	'poocommerce/product-filter-rating',
	'poocommerce/product-filter-active',
	'poocommerce/product-filter-removable-chips',
	'poocommerce/product-filter-clear-button',
	'poocommerce/product-filter-checkbox-list',
	'poocommerce/product-filter-chips',
	'poocommerce/product-filter-taxonomy',

	// Keep hidden legacy filter blocks for backward compatibility.
	'poocommerce/active-filters',
	'poocommerce/attribute-filter',
	'poocommerce/filter-wrapper',
	'poocommerce/price-filter',
	'poocommerce/rating-filter',
	'poocommerce/stock-filter',
	// End: legacy filter blocks.

	// Below product grids are hidden from inserter however they could have been used in widgets.
	// Keep them for backward compatibility.
	'poocommerce/handpicked-products',
	'poocommerce/product-best-sellers',
	'poocommerce/product-new',
	'poocommerce/product-on-sale',
	'poocommerce/product-top-rated',
	'poocommerce/products-by-attribute',
	'poocommerce/product-category',
	'poocommerce/product-tag',
	// End: legacy product grids blocks.
];
