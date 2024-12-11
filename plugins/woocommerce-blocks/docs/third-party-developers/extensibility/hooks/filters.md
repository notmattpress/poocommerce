<!-- DO NOT UPDATE THIS DOC DIRECTLY -->

<!-- Use `npm run build:docs` to automatically build hook documentation -->

# Filters

## Table of Contents


- [__experimental_poocommerce_blocks_add_data_attributes_to_block](#__experimental_poocommerce_blocks_add_data_attributes_to_block)
- [__experimental_poocommerce_blocks_add_data_attributes_to_namespace](#__experimental_poocommerce_blocks_add_data_attributes_to_namespace)
- [__experimental_poocommerce_blocks_payment_gateway_features_list](#__experimental_poocommerce_blocks_payment_gateway_features_list)
- [deprecated_function_trigger_error](#deprecated_function_trigger_error)
- [loop_shop_per_page](#loop_shop_per_page)
- [wc_session_expiration](#wc_session_expiration)
- [poocommerce_add_cart_item](#poocommerce_add_cart_item)
- [poocommerce_add_cart_item_data](#poocommerce_add_cart_item_data)
- [poocommerce_add_to_cart_quantity](#poocommerce_add_to_cart_quantity)
- [poocommerce_add_to_cart_sold_individually_quantity](#poocommerce_add_to_cart_sold_individually_quantity)
- [poocommerce_add_to_cart_validation](#poocommerce_add_to_cart_validation)
- [poocommerce_adjust_non_base_location_prices](#poocommerce_adjust_non_base_location_prices)
- [poocommerce_apply_base_tax_for_local_pickup](#poocommerce_apply_base_tax_for_local_pickup)
- [poocommerce_apply_individual_use_coupon](#poocommerce_apply_individual_use_coupon)
- [poocommerce_apply_with_individual_use_coupon](#poocommerce_apply_with_individual_use_coupon)
- [poocommerce_blocks_hook_compatibility_additional_data](#poocommerce_blocks_hook_compatibility_additional_data)
- [poocommerce_blocks_product_grid_is_cacheable](#poocommerce_blocks_product_grid_is_cacheable)
- [poocommerce_blocks_product_grid_item_html](#poocommerce_blocks_product_grid_item_html)
- [poocommerce_blocks_register_script_dependencies](#poocommerce_blocks_register_script_dependencies)
- [poocommerce_cart_contents_changed](#poocommerce_cart_contents_changed)
- [poocommerce_cart_item_permalink](#poocommerce_cart_item_permalink)
- [poocommerce_disable_compatibility_layer](#poocommerce_disable_compatibility_layer)
- [poocommerce_ga_disable_tracking](#poocommerce_ga_disable_tracking)
- [poocommerce_get_item_data](#poocommerce_get_item_data)
- [poocommerce_loop_add_to_cart_args](#poocommerce_loop_add_to_cart_args)
- [poocommerce_loop_add_to_cart_link](#poocommerce_loop_add_to_cart_link)
- [poocommerce_new_customer_data](#poocommerce_new_customer_data)
- [poocommerce_pay_order_product_has_enough_stock](#poocommerce_pay_order_product_has_enough_stock)
- [poocommerce_pay_order_product_in_stock](#poocommerce_pay_order_product_in_stock)
- [poocommerce_registration_errors](#poocommerce_registration_errors)
- [poocommerce_shared_settings](#poocommerce_shared_settings)
- [poocommerce_shipping_package_name](#poocommerce_shipping_package_name)
- [poocommerce_shipping_{$this->id}_is_available](#poocommerce_shipping_this-id_is_available)
- [poocommerce_show_page_title](#poocommerce_show_page_title)
- [poocommerce_single_product_image_thumbnail_html](#poocommerce_single_product_image_thumbnail_html)
- [poocommerce_store_api_add_to_cart_data](#poocommerce_store_api_add_to_cart_data)
- [poocommerce_store_api_disable_nonce_check](#poocommerce_store_api_disable_nonce_check)
- [poocommerce_store_api_cart_item_images](#poocommerce_store_api_cart_item_images)
- [poocommerce_store_api_product_quantity_limit](#poocommerce_store_api_product_quantity_limit)
- [poocommerce_store_api_product_quantity_{$value_type}](#poocommerce_store_api_product_quantity_value_type)
- [poocommerce_store_api_rate_limit_options](#poocommerce_store_api_rate_limit_options)

---

## __experimental_poocommerce_blocks_add_data_attributes_to_block


Filters the list of allowed Block Names

```php
apply_filters( '__experimental_poocommerce_blocks_add_data_attributes_to_block', array $allowed_namespaces )
```

### Description

This hook defines which block names should have block name and attribute data- attributes appended on render.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $allowed_namespaces | array | List of namespaces. |

### Source


- [BlockTypesController.php](../../../../../poocommerce/src/Blocks/BlockTypesController.php)

---

## __experimental_poocommerce_blocks_add_data_attributes_to_namespace


Filters the list of allowed block namespaces.

```php
apply_filters( '__experimental_poocommerce_blocks_add_data_attributes_to_namespace', array $allowed_namespaces )
```

### Description

This hook defines which block namespaces should have block name and attribute `data-` attributes appended on render.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $allowed_namespaces | array | List of namespaces. |

### Source


- [BlockTypesController.php](../../../../../poocommerce/src/Blocks/BlockTypesController.php)

---

## __experimental_poocommerce_blocks_payment_gateway_features_list


Filter to control what features are available for each payment gateway.

```php
apply_filters( '__experimental_poocommerce_blocks_payment_gateway_features_list', array $features, string $name )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $features | array | List of supported features. |
| $name | string | Gateway name. |

### Returns


`array` Updated list of supported features.

### Example

## Payment Gateway Featured List

```php
// The action callback function.
function my_function_callback( $features, $gateway ) {
    if ( 'my-gateway' !== $gateway->id ) {
			return $features;
		}
    $features[] = 'some-feature';
    return $features;
}

add_filter( '__experimental_poocommerce_blocks_payment_gateway_features_list', 'my_function_callback', 10, 2 );
```


### Source


- [Payments/Integrations/PayPal.php](../../../../../poocommerce/src/Blocks/Payments/Integrations/PayPal.php)

---

## deprecated_function_trigger_error


Filters whether to trigger an error for deprecated functions. (Same as WP core)

```php
apply_filters( 'deprecated_function_trigger_error', bool $trigger )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $trigger | bool | Whether to trigger the error for deprecated functions. Default true. |

### Source


- [Domain/Bootstrap.php](../../../../../poocommerce/src/Blocks/Domain/Bootstrap.php)

---

## loop_shop_per_page




```php
apply_filters( 'loop_shop_per_page' )
```

### Source


- [BlockTypes/ProductQuery.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductQuery.php)
- [BlockTypes/ProductCollection.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductCollection/Controller.php)

---

## wc_session_expiration


Filters the session expiration.

```php
apply_filters( 'wc_session_expiration', int $expiration )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $expiration | int | Expiration in seconds. |

### Source


- [StoreApi/Routes/V1/AbstractCartRoute.php](../../../../../poocommerce/src/StoreApi/Routes/V1/AbstractCartRoute.php)

---

## poocommerce_add_cart_item


Filters the item being added to the cart.

```php
apply_filters( 'poocommerce_add_cart_item', array $cart_item_data, string $cart_id )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $cart_item_data | array | Array of cart item data being added to the cart. |
| $cart_id | string | Id of the item in the cart. |

### Returns


`array` Updated cart item data.

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_add_cart_item_data


Filter cart item data for add to cart requests.

```php
apply_filters( 'poocommerce_add_cart_item_data', array $cart_item_data, integer $product_id, integer $variation_id, integer $quantity )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $cart_item_data | array | Array of other cart item data. |
| $product_id | integer | ID of the product added to the cart. |
| $variation_id | integer | Variation ID of the product added to the cart. |
| $quantity | integer | Quantity of the item added to the cart. |

### Returns


`array`

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_add_to_cart_quantity


Filters the change the quantity to add to cart.

```php
apply_filters( 'poocommerce_add_to_cart_quantity', \Automattic\PooCommerce\Blocks\BlockTypes\number $default_quantity, \Automattic\PooCommerce\Blocks\BlockTypes\number $product_id )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $default_quantity | \Automattic\PooCommerce\Blocks\BlockTypes\number | The default quantity. |
| $product_id | \Automattic\PooCommerce\Blocks\BlockTypes\number | The product id. |

### Source


- [BlockTypes/ProductButton.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductButton.php)

---

## poocommerce_add_to_cart_sold_individually_quantity


Filter sold individually quantity for add to cart requests.

```php
apply_filters( 'poocommerce_add_to_cart_sold_individually_quantity', integer $sold_individually_quantity, integer $quantity, integer $product_id, integer $variation_id, array $cart_item_data )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $sold_individually_quantity | integer | Defaults to 1. |
| $quantity | integer | Quantity of the item added to the cart. |
| $product_id | integer | ID of the product added to the cart. |
| $variation_id | integer | Variation ID of the product added to the cart. |
| $cart_item_data | array | Array of other cart item data. |

### Returns


`integer`

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## ~~poocommerce_add_to_cart_validation~~


Filters if an item being added to the cart passed validation checks.

```php
apply_filters( 'poocommerce_add_to_cart_validation', boolean $passed_validation, integer $product_id, integer $quantity, integer $variation_id, array $variation )
```

<!-- markdownlint-disable-next-line MD036 -->
**Deprecated: This hook is deprecated and will be removed**

### Description

Allow 3rd parties to validate if an item can be added to the cart. This is a legacy hook from Woo core. This filter will be deprecated because it encourages usage of wc_add_notice. For the API we need to capture notices and convert to exceptions instead.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $passed_validation | boolean | True if the item passed validation. |
| $product_id | integer | Product ID being validated. |
| $quantity | integer | Quantity added to the cart. |
| $variation_id | integer | Variation ID being added to the cart. |
| $variation | array | Variation data. |

### Returns


`boolean`

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_adjust_non_base_location_prices


Filters if taxes should be removed from locations outside the store base location.

```php
apply_filters( 'poocommerce_adjust_non_base_location_prices', boolean $adjust_non_base_location_prices )
```


**Note: Matches filter name in PooCommerce core.**

### Description

The poocommerce_adjust_non_base_location_prices filter can stop base taxes being taken off when dealing with out of base locations. e.g. If a product costs 10 including tax, all users will pay 10 regardless of location and taxes.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $adjust_non_base_location_prices | boolean | True by default. |

### Returns


`boolean`

### Source


- [StoreApi/Utilities/ProductQuery.php](../../../../../poocommerce/src/StoreApi/Utilities/ProductQuery.php)

---

## poocommerce_apply_base_tax_for_local_pickup




```php
apply_filters( 'poocommerce_apply_base_tax_for_local_pickup' )
```

### Source


- [Shipping/ShippingController.php](../../../../../poocommerce/src/Blocks/Shipping/ShippingController.php)

---

## poocommerce_apply_individual_use_coupon


Filter coupons to remove when applying an individual use coupon.

```php
apply_filters( 'poocommerce_apply_individual_use_coupon', array $coupons, \WC_Coupon $coupon, array $applied_coupons )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $coupons | array | Array of coupons to remove from the cart. |
| $coupon | \WC_Coupon | Coupon object applied to the cart. |
| $applied_coupons | array | Array of applied coupons already applied to the cart. |

### Returns


`array`

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_apply_with_individual_use_coupon


Filters if a coupon can be applied alongside other individual use coupons.

```php
apply_filters( 'poocommerce_apply_with_individual_use_coupon', boolean $apply_with_individual_use_coupon, \WC_Coupon $coupon, \WC_Coupon $individual_use_coupon, array $applied_coupons )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $apply_with_individual_use_coupon | boolean | Defaults to false. |
| $coupon | \WC_Coupon | Coupon object applied to the cart. |
| $individual_use_coupon | \WC_Coupon | Individual use coupon already applied to the cart. |
| $applied_coupons | array | Array of applied coupons already applied to the cart. |

### Returns


`boolean`

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_blocks_hook_compatibility_additional_data


When extensions implement their equivalent blocks of the template hook functions, they can use this filter to register their old hooked data here, so in the blockified template, the old hooked functions can be removed in favor of the new blocks while keeping the old hooked functions working in classic templates.

```php
apply_filters( 'poocommerce_blocks_hook_compatibility_additional_data', array $data )
```

### Description

Accepts an array of hooked data. The array should be in the following format: [ [ hook =&gt; &lt;hook-name&gt;, function =&gt; &lt;function-name&gt;, priority =&gt; &lt;priority&gt;, ], ... ] Where:

- `hook-name` is the name of the hook that has the functions hooked to.
- `function-name` is the hooked function name.
- `priority` is the priority of the hooked function.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $data | array | Additional hooked data. Default to empty |

### Source


- [Templates/AbstractTemplateCompatibility.php](../../../../../poocommerce/src/Blocks/Templates/AbstractTemplateCompatibility.php)

---

## poocommerce_blocks_product_grid_is_cacheable


Filters whether the product grid is cacheable.

```php
apply_filters( 'poocommerce_blocks_product_grid_is_cacheable', boolean $is_cacheable, array $query_args )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $is_cacheable | boolean | The list of script dependencies. |
| $query_args | array | Query args for the products query passed to BlocksWpQuery. |

### Returns


`array` True to enable cache, false to disable cache.

### Source


- [BlockTypes/AbstractProductGrid.php](../../../../../poocommerce/src/Blocks/BlockTypes/AbstractProductGrid.php)

---

## poocommerce_blocks_product_grid_item_html


Filters the HTML for products in the grid.

```php
apply_filters( 'poocommerce_blocks_product_grid_item_html', string $html, array $data, \WC_Product $product )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $html | string | Product grid item HTML. |
| $data | array | Product data passed to the template. |
| $product | \WC_Product | Product object. |

### Returns


`string` Updated product grid item HTML.

### Source


- [BlockTypes/AbstractProductGrid.php](../../../../../poocommerce/src/Blocks/BlockTypes/AbstractProductGrid.php)

---

## poocommerce_blocks_register_script_dependencies


Filters the list of script dependencies.

```php
apply_filters( 'poocommerce_blocks_register_script_dependencies', array $dependencies, string $handle )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $dependencies | array | The list of script dependencies. |
| $handle | string | The script's handle. |

### Returns


`array`

### Source


- [Assets/Api.php](../../../../../poocommerce/src/Blocks/Assets/Api.php)

---

## poocommerce_cart_contents_changed


Filters the entire cart contents when the cart changes.

```php
apply_filters( 'poocommerce_cart_contents_changed', array $cart_contents )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $cart_contents | array | Array of all cart items. |

### Returns


`array` Updated array of all cart items.

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_cart_item_permalink


Filter the product permalink.

```php
apply_filters( 'poocommerce_cart_item_permalink', string $product_permalink, array $cart_item, string $cart_item_key )
```

### Description

This is a hook taken from the legacy cart/mini-cart templates that allows the permalink to be changed for a product. This is specific to the cart endpoint.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $product_permalink | string | Product permalink. |
| $cart_item | array | Cart item array. |
| $cart_item_key | string | Cart item key. |

### Source


- [StoreApi/Schemas/V1/CartItemSchema.php](../../../../../poocommerce/src/StoreApi/Schemas/V1/CartItemSchema.php)

---

## poocommerce_disable_compatibility_layer


Filter to disable the compatibility layer for the blockified templates.

```php
apply_filters( 'poocommerce_disable_compatibility_layer', \Automattic\PooCommerce\Blocks\Templates\boolean. $argument0 )
```

### Description

This hook allows to disable the compatibility layer for the blockified.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| 1 | \Automattic\PooCommerce\Blocks\Templates\boolean. |  |

### Source


- [Templates/AbstractTemplateCompatibility.php](../../../../../poocommerce/src/Blocks/Templates/AbstractTemplateCompatibility.php)
- [Templates/AbstractTemplateCompatibility.php](../../../../../poocommerce/src/Blocks/Templates/AbstractTemplateCompatibility.php)

---

## poocommerce_ga_disable_tracking


Filter to disable Google Analytics tracking.

```php
apply_filters( 'poocommerce_ga_disable_tracking', boolean $disable_tracking )
```


**Note: Matches filter name in GA extension.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $disable_tracking | boolean | If true, tracking will be disabled. |

### Source


- [Domain/Services/GoogleAnalytics.php](../../../../../poocommerce/src/Blocks/Domain/Services/GoogleAnalytics.php)

---

## poocommerce_get_item_data


Filters cart item data.

```php
apply_filters( 'poocommerce_get_item_data', array $item_data, array $cart_item )
```


**Note: Matches filter name in PooCommerce core.**

### Description

Filters the variation option name for custom option slugs.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $item_data | array | Cart item data. Empty by default. |
| $cart_item | array | Cart item array. |

### Returns


`array`

### Source


- [StoreApi/Schemas/V1/CartItemSchema.php](../../../../../poocommerce/src/StoreApi/Schemas/V1/CartItemSchema.php)

---

## poocommerce_loop_add_to_cart_args


Allow filtering of the add to cart button arguments.

```php
apply_filters( 'poocommerce_loop_add_to_cart_args' )
```

### Source


- [BlockTypes/ProductButton.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductButton.php)

---

## poocommerce_loop_add_to_cart_link


Filters the add to cart button class.

```php
apply_filters( 'poocommerce_loop_add_to_cart_link', string $class )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $class | string | The class. |

### Source


- [BlockTypes/ProductButton.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductButton.php)

---

## poocommerce_new_customer_data


Filters customer data before a customer account is registered.

```php
apply_filters( 'poocommerce_new_customer_data', array $add_to_cart_data )
```

### Description

This hook filters customer data. It allows user data to be changed, for example, username, password, email, first name, last name, and role.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $customer_data | array | An array of customer (user) data. |

### Returns


`array`

### Source


- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_pay_order_product_has_enough_stock


Filters whether or not the product has enough stock.

```php
apply_filters( 'poocommerce_pay_order_product_has_enough_stock', boolean $argument0, \WC_Product $product, \WC_Order $order )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| 1 | boolean | True if has enough stock. |
| $product | \WC_Product | Product. |
| $order | \WC_Order | Order. |

### Source


- [StoreApi/Utilities/OrderController.php](../../../../../poocommerce/src/StoreApi/Utilities/OrderController.php)

---

## poocommerce_pay_order_product_in_stock


Filters whether or not the product is in stock for this pay for order.

```php
apply_filters( 'poocommerce_pay_order_product_in_stock', boolean $argument0, \WC_Product $product, \WC_Order $order )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| 1 | boolean | True if in stock. |
| $product | \WC_Product | Product. |
| $order | \WC_Order | Order. |

### Source


- [StoreApi/Utilities/OrderController.php](../../../../../poocommerce/src/StoreApi/Utilities/OrderController.php)

---

## poocommerce_registration_errors


Filters registration errors before a customer account is registered.

```php
apply_filters( 'poocommerce_registration_errors', \WP_Error $errors, string $username, string $user_email )
```


**Note: Matches filter name in PooCommerce core.**

### Description

This hook filters registration errors. This can be used to manipulate the array of errors before they are displayed.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $errors | \WP_Error | Error object. |
| $username | string | Customer username. |
| $user_email | string | Customer email address. |

### Returns


`\WP_Error`

### Source


- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## ~~poocommerce_shared_settings~~


Filters the array of shared settings.

```php
apply_filters( 'poocommerce_shared_settings', array $data )
```

<!-- markdownlint-disable-next-line MD036 -->
**Deprecated: This hook is deprecated and will be removed**

### Description

Low level hook for registration of new data late in the cycle. This is deprecated. Instead, use the data api:

```php
Automattic\PooCommerce\Blocks\Package::container()->get( Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry::class )->add( $key, $value )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $data | array | Settings data. |

### Returns


`array`

### Source


- [Assets/AssetDataRegistry.php](../../../../../poocommerce/src/Blocks/Assets/AssetDataRegistry.php)

---

## poocommerce_shipping_package_name


Filters the shipping package name.

```php
apply_filters( 'poocommerce_shipping_package_name', string $shipping_package_name, string $package_id, array $package )
```


**Note: Matches filter name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $shipping_package_name | string | Shipping package name. |
| $package_id | string | Shipping package ID. |
| $package | array | Shipping package from PooCommerce. |

### Returns


`string` Shipping package name.

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_shipping_{$this->id}_is_available




```php
apply_filters( 'poocommerce_shipping_{$this->id}_is_available' )
```

### Source


- [Shipping/PickupLocation.php](../../../../../poocommerce/src/Blocks/Shipping/PickupLocation.php)

---

## poocommerce_show_page_title


Hook: poocommerce_show_page_title

```php
apply_filters( 'poocommerce_show_page_title' )
```

### Description

Allows controlling the display of the page title.

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_single_product_image_thumbnail_html


Filter the HTML markup for a single product image thumbnail in the gallery.

```php
apply_filters( 'poocommerce_single_product_image_thumbnail_html', string $thumbnail_html, int $attachment_id )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $thumbnail_html | string | The HTML markup for the thumbnail. |
| $attachment_id | int | The attachment ID of the thumbnail. |

### Source


- [BlockTypes/ProductGalleryThumbnails.php](../../../../../poocommerce/src/Blocks/BlockTypes/ProductGalleryThumbnails.php)

---

## poocommerce_store_api_add_to_cart_data


Filters cart item data sent via the API before it is passed to the cart controller.

```php
apply_filters( 'poocommerce_store_api_add_to_cart_data', array $customer_data )
```

### Description

This hook filters cart items. It allows the request data to be changed, for example, quantity, or supplemental cart item data, before it is passed into CartController::add_to_cart and stored to session. CartController::add_to_cart only expects the keys id, quantity, variation, and cart_item_data, so other values may be ignored. CartController::add_to_cart (and core) do already have a filter hook called poocommerce_add_cart_item, but this does not have access to the original Store API request like this hook does.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $customer_data | array | An array of customer (user) data. |

### Returns


`array`

### Source


- [StoreApi/Routes/V1/CartAddItem.php](../../../../../poocommerce/src/StoreApi/Routes/V1/CartAddItem.php)

---

## poocommerce_store_api_disable_nonce_check


Filters the Store API nonce check.

```php
apply_filters( 'poocommerce_store_api_disable_nonce_check', boolean $disable_nonce_check )
```

### Description

This can be used to disable the nonce check when testing API endpoints via a REST API client.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $disable_nonce_check | boolean | If true, nonce checks will be disabled. |

### Returns


`boolean`

### Source


- [StoreApi/Routes/V1/AbstractCartRoute.php](../../../../../poocommerce/src/StoreApi/Routes/V1/AbstractCartRoute.php)

---

## poocommerce_store_api_cart_item_images


This hook allows the cart item images to be changed. This is specific to the cart endpoint.

```php
apply_filters( 'poocommerce_store_api_cart_item_images', array $product_images, array $cart_item, string $cart_item_key )
```

### Description

This hook allows the cart item images to be changed. This is specific to the cart endpoint.

### Parameters

| Argument        | Type   | Description                                       |
|-----------------|--------|---------------------------------------------------|
| $product_images | array  | An array of images associated with the cart item. |
| $cart_item      | array  | The cart item.                                    |
| $cart_item_key  | string | The cart item key.                                |

### Returns


`array`

### Source


- [StoreApi/Schemas/V1/CartItemSchema.php](../../../../../poocommerce/src/StoreApi/Schemas/V1/CartItemSchema.php)

---

## poocommerce_store_api_product_quantity_limit


Filters the quantity limit for a product being added to the cart via the Store API.

```php
apply_filters( 'poocommerce_store_api_product_quantity_limit', integer $quantity_limit, \WC_Product $product )
```

### Description

Filters the variation option name for custom option slugs.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $quantity_limit | integer | Quantity limit which defaults to 9999 unless sold individually. |
| $product | \WC_Product | Product instance. |

### Returns


`integer`

### Source


- [StoreApi/Utilities/QuantityLimits.php](../../../../../poocommerce/src/StoreApi/Utilities/QuantityLimits.php)

---

## poocommerce_store_api_product_quantity_{$value_type}


Filters the quantity minimum for a cart item in Store API. This allows extensions to control the minimum qty of items already within the cart.

```php
apply_filters( 'poocommerce_store_api_product_quantity_{$value_type}', mixed $value, \WC_Product $product, array|null $cart_item )
```

### Description

The suffix of the hook will vary depending on the value being filtered. For example, minimum, maximum, multiple_of, editable.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $value | mixed | The value being filtered. |
| $product | \WC_Product | The product object. |
| $cart_item | array, null | The cart item if the product exists in the cart, or null. |

### Returns


`mixed`

### Source


- [StoreApi/Utilities/QuantityLimits.php](../../../../../poocommerce/src/StoreApi/Utilities/QuantityLimits.php)

---

## poocommerce_store_api_rate_limit_options


Filters options for Rate Limits.

```php
apply_filters( 'poocommerce_store_api_rate_limit_options', array $rate_limit_options )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $rate_limit_options | array | Array of option values. |

### Returns


`array`

### Source


- [StoreApi/Utilities/RateLimits.php](../../../../../poocommerce/src/StoreApi/Utilities/RateLimits.php)

---
<!-- FEEDBACK -->

---

[We're hiring!](https://poocommerce.com/careers/) Come work with us!

🐞 Found a mistake, or have a suggestion? [Leave feedback about this document here.](https://github.com/poocommerce/poocommerce/issues/new?assignees=&labels=type%3A+documentation&template=suggestion-for-documentation-improvement-correction.md&title=Feedback%20on%20./docs/third-party-developers/extensibility/hooks/filters.md)

<!-- /FEEDBACK -->

