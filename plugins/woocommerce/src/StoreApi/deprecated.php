<?php
/**
 * Class Aliases for graceful Backwards compatibility.
 *
 * This file is autoloaded via composer.json and maps the old namespaces to new namespaces.
 */

$class_aliases = [
	// Old to new namespaces for utils and exceptions.
	Automattic\PooCommerce\StoreApi\Exceptions\RouteException::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\RouteException::class,
	Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema::class => Automattic\PooCommerce\Blocks\Domain\Services\ExtendRestApi::class,
	Automattic\PooCommerce\StoreApi\SchemaController::class => Automattic\PooCommerce\Blocks\StoreApi\SchemaController::class,
	Automattic\PooCommerce\StoreApi\RoutesController::class => Automattic\PooCommerce\Blocks\StoreApi\RoutesController::class,
	Automattic\PooCommerce\StoreApi\Formatters::class      => Automattic\PooCommerce\Blocks\StoreApi\Formatters::class,
	Automattic\PooCommerce\StoreApi\Payments\PaymentResult::class => Automattic\PooCommerce\Blocks\Payments\PaymentResult::class,
	Automattic\PooCommerce\StoreApi\Payments\PaymentContext::class => Automattic\PooCommerce\Blocks\Payments\PaymentContext::class,

	// Old schemas to V1 schemas under new namespace.
	Automattic\PooCommerce\StoreApi\Schemas\V1\AbstractAddressSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\AbstractAddressSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\AbstractSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\AbstractSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\BillingAddressSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\BillingAddressSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartCouponSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartCouponSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartExtensionsSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartExtensionsSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartFeeSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartFeeSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartItemSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartItemSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CartShippingRateSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CartShippingRateSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\CheckoutSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\CheckoutSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ErrorSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ErrorSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ImageAttachmentSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ImageAttachmentSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\OrderCouponSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\OrderCouponSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ProductAttributeSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ProductAttributeSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ProductCategorySchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ProductCategorySchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ProductCollectionDataSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ProductCollectionDataSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ProductReviewSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ProductReviewSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ProductSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ProductSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\ShippingAddressSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\ShippingAddressSchema::class,
	Automattic\PooCommerce\StoreApi\Schemas\V1\TermSchema::class => Automattic\PooCommerce\Blocks\StoreApi\Schemas\TermSchema::class,

	// Old routes to V1 routes under new namespace.
	Automattic\PooCommerce\StoreApi\Routes\V1\AbstractCartRoute::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\AbstractCartRoute::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\AbstractRoute::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\AbstractRoute::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\AbstractTermsRoute::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\AbstractTermsRoute::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\Batch::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\Batch::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\Cart::class  => Automattic\PooCommerce\Blocks\StoreApi\Routes\Cart::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartAddItem::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartAddItem::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartApplyCoupon::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartApplyCoupon::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartCoupons::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartCoupons::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartCouponsByCode::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartCouponsByCode::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartExtensions::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartExtensions::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartItems::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartItems::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartItemsByKey::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartItemsByKey::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartRemoveCoupon::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartRemoveCoupon::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartRemoveItem::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartRemoveItem::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartSelectShippingRate::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartSelectShippingRate::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartUpdateCustomer::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartUpdateCustomer::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\CartUpdateItem::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\CartUpdateItem::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\Checkout::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\Checkout::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductAttributes::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductAttributes::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductAttributesById::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductAttributesById::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductAttributeTerms::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductAttributeTerms::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductCategories::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductCategories::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductCategoriesById::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductCategoriesById::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductCollectionData::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductCollectionData::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductReviews::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductReviews::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\Products::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\Products::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductsById::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductsById::class,
	Automattic\PooCommerce\StoreApi\Routes\V1\ProductTags::class => Automattic\PooCommerce\Blocks\StoreApi\Routes\ProductTags::class,
];

foreach ( $class_aliases as $class => $alias ) {
	if ( ! class_exists( $alias, false ) ) {
		class_alias( $class, $alias );
	}
}

unset( $class_aliases );
