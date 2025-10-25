<!-- DO NOT UPDATE THIS DOC DIRECTLY -->

<!-- Use `npm run build:docs` to automatically build hook documentation -->

# Actions

## Table of Contents


- [deprecated_function_run](#deprecated_function_run)
- [poocommerce_add_to_cart](#poocommerce_add_to_cart)
- [poocommerce_after_main_content](#poocommerce_after_main_content)
- [poocommerce_after_shop_loop](#poocommerce_after_shop_loop)
- [poocommerce_applied_coupon](#poocommerce_applied_coupon)
- [poocommerce_archive_description](#poocommerce_archive_description)
- [poocommerce_before_main_content](#poocommerce_before_main_content)
- [poocommerce_before_shop_loop](#poocommerce_before_shop_loop)
- [poocommerce_blocks_cart_enqueue_data](#poocommerce_blocks_cart_enqueue_data)
- [poocommerce_blocks_checkout_enqueue_data](#poocommerce_blocks_checkout_enqueue_data)
- [poocommerce_blocks_enqueue_cart_block_scripts_after](#poocommerce_blocks_enqueue_cart_block_scripts_after)
- [poocommerce_blocks_enqueue_cart_block_scripts_before](#poocommerce_blocks_enqueue_cart_block_scripts_before)
- [poocommerce_blocks_enqueue_checkout_block_scripts_after](#poocommerce_blocks_enqueue_checkout_block_scripts_after)
- [poocommerce_blocks_enqueue_checkout_block_scripts_before](#poocommerce_blocks_enqueue_checkout_block_scripts_before)
- [poocommerce_blocks_loaded](#poocommerce_blocks_loaded)
- [poocommerce_blocks_{$this->registry_identifier}_registration](#poocommerce_blocks_this-registry_identifier_registration)
- [poocommerce_check_cart_items](#poocommerce_check_cart_items)
- [poocommerce_created_customer](#poocommerce_created_customer)
- [poocommerce_no_products_found](#poocommerce_no_products_found)
- [poocommerce_register_post](#poocommerce_register_post)
- [poocommerce_shop_loop](#poocommerce_shop_loop)
- [poocommerce_store_api_cart_errors](#poocommerce_store_api_cart_errors)
- [poocommerce_store_api_cart_select_shipping_rate](#poocommerce_store_api_cart_select_shipping_rate)
- [poocommerce_store_api_cart_update_customer_from_request](#poocommerce_store_api_cart_update_customer_from_request)
- [poocommerce_store_api_cart_update_order_from_request](#poocommerce_store_api_cart_update_order_from_request)
- [poocommerce_store_api_checkout_order_processed](#poocommerce_store_api_checkout_order_processed)
- [poocommerce_store_api_checkout_update_customer_from_request](#poocommerce_store_api_checkout_update_customer_from_request)
- [poocommerce_store_api_checkout_update_order_meta](#poocommerce_store_api_checkout_update_order_meta)
- [poocommerce_store_api_rate_limit_exceeded](#poocommerce_store_api_rate_limit_exceeded)
- [poocommerce_store_api_validate_add_to_cart](#poocommerce_store_api_validate_add_to_cart)
- [poocommerce_store_api_validate_cart_item](#poocommerce_store_api_validate_cart_item)
- [poocommerce_{$product->get_type()}_add_to_cart](#poocommerce_product-get_type_add_to_cart)
- [{$hook}](#hook)

---

## deprecated_function_run


Fires when a deprecated function is called.

```php
do_action( 'deprecated_function_run' )
```

### Source


- [Domain/Bootstrap.php](../../../../../poocommerce/src/Blocks/Domain/Bootstrap.php)

---

## poocommerce_add_to_cart


Fires when an item is added to the cart.

```php
do_action( 'poocommerce_add_to_cart', string $cart_id, integer $product_id, integer $request_quantity, integer $variation_id, array $variation, array $cart_item_data )
```


**Note: Matches action name in PooCommerce core.**

### Description

This hook fires when an item is added to the cart. This is triggered from the Store API in this context, but PooCommerce core add to cart events trigger the same hook.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $cart_id | string | ID of the item in the cart. |
| $product_id | integer | ID of the product added to the cart. |
| $request_quantity | integer | Quantity of the item added to the cart. |
| $variation_id | integer | Variation ID of the product added to the cart. |
| $variation | array | Array of variation data. |
| $cart_item_data | array | Array of other cart item data. |

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_after_main_content


Hook: poocommerce_after_main_content

```php
do_action( 'poocommerce_after_main_content' )
```

### Description

Called after rendering the main content for a product.

### See


- poocommerce_output_content_wrapper_end() - Outputs closing DIV for the content (priority 10)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)
- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_after_shop_loop


Hook: poocommerce_after_shop_loop.

```php
do_action( 'poocommerce_after_shop_loop' )
```

### See


- poocommerce_pagination() - Renders pagination (priority 10)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_applied_coupon


Fires after a coupon has been applied to the cart.

```php
do_action( 'poocommerce_applied_coupon', string $coupon_code )
```


**Note: Matches action name in PooCommerce core.**

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $coupon_code | string | The coupon code that was applied. |

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_archive_description


Hook: poocommerce_archive_description.

```php
do_action( 'poocommerce_archive_description' )
```

### See


- poocommerce_taxonomy_archive_description() - Renders the taxonomy archive description (priority 10)
- poocommerce_product_archive_description() - Renders the product archive description (priority 10)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_before_main_content


Hook: poocommerce_before_main_content

```php
do_action( 'poocommerce_before_main_content' )
```

### Description

Called before rendering the main content for a product.

### See


- poocommerce_output_content_wrapper() - Outputs opening DIV for the content (priority 10)
- poocommerce_breadcrumb() - Outputs breadcrumb trail to the current product (priority 20)
- WC_Structured_Data::generate_website_data() - Outputs schema markup (priority 30)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)
- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_before_shop_loop


Hook: poocommerce_before_shop_loop.

```php
do_action( 'poocommerce_before_shop_loop' )
```

### See


- poocommerce_output_all_notices() - Render error notices (priority 10)
- poocommerce_result_count() - Show number of results found (priority 20)
- poocommerce_catalog_ordering() - Show form to control sort order (priority 30)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_blocks_cart_enqueue_data


Fires after cart block data is registered.

```php
do_action( 'poocommerce_blocks_cart_enqueue_data' )
```

### Source


- [BlockTypes/MiniCart.php](../../../../../poocommerce/src/Blocks/BlockTypes/MiniCart.php)
- [BlockTypes/Cart.php](../../../../../poocommerce/src/Blocks/BlockTypes/Cart.php)

---

## poocommerce_blocks_checkout_enqueue_data


Fires after checkout block data is registered.

```php
do_action( 'poocommerce_blocks_checkout_enqueue_data' )
```

### Source


- [BlockTypes/Checkout.php](../../../../../poocommerce/src/Blocks/BlockTypes/Checkout.php)

---

## poocommerce_blocks_enqueue_cart_block_scripts_after


Fires after cart block scripts are enqueued.

```php
do_action( 'poocommerce_blocks_enqueue_cart_block_scripts_after' )
```

### Source


- [BlockTypes/Cart.php](../../../../../poocommerce/src/Blocks/BlockTypes/Cart.php)

---

## poocommerce_blocks_enqueue_cart_block_scripts_before


Fires before cart block scripts are enqueued.

```php
do_action( 'poocommerce_blocks_enqueue_cart_block_scripts_before' )
```

### Source


- [BlockTypes/Cart.php](../../../../../poocommerce/src/Blocks/BlockTypes/Cart.php)

---

## poocommerce_blocks_enqueue_checkout_block_scripts_after


Fires after checkout block scripts are enqueued.

```php
do_action( 'poocommerce_blocks_enqueue_checkout_block_scripts_after' )
```

### Source


- [BlockTypes/Checkout.php](../../../../../poocommerce/src/BLocks/BlockTypes/Checkout.php)

---

## poocommerce_blocks_enqueue_checkout_block_scripts_before


Fires before checkout block scripts are enqueued.

```php
do_action( 'poocommerce_blocks_enqueue_checkout_block_scripts_before' )
```

### Source


- [BlockTypes/Checkout.php](../../../../../poocommerce/src/Blocks/BlockTypes/Checkout.php)

---

## poocommerce_blocks_loaded


Fires when the poocommerce blocks are loaded and ready to use.

```php
do_action( 'poocommerce_blocks_loaded' )
```

### Description

This hook is intended to be used as a safe event hook for when the plugin has been loaded, and all dependency requirements have been met. To ensure blocks are initialized, you must use the `poocommerce_blocks_loaded` hook instead of the `plugins_loaded` hook. This is because the functions hooked into plugins_loaded on the same priority load in an inconsistent and unpredictable manner.

### Source


- [Domain/Bootstrap.php](../../../../../poocommerce/src/Blocks/Domain/Bootstrap.php)

---

## poocommerce_blocks_{$this->registry_identifier}_registration


Fires when the IntegrationRegistry is initialized.

```php
do_action( 'poocommerce_blocks_{$this->registry_identifier}_registration', \Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry $this )
```

### Description

Runs before integrations are initialized allowing new integration to be registered for use. This should be used as the primary hook for integrations to include their scripts, styles, and other code extending the blocks.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $this | \Automattic\PooCommerce\Blocks\Integrations\IntegrationRegistry | Instance of the IntegrationRegistry class which exposes the IntegrationRegistry::register() method. |

### Source


- [Integrations/IntegrationRegistry.php](../../../../../poocommerce/src/Blocks/Integrations/IntegrationRegistry.php)

---

## ~~poocommerce_check_cart_items~~


Fires when cart items are being validated.

```php
do_action( 'poocommerce_check_cart_items' )
```

<!-- markdownlint-disable-next-line MD036 -->
**Deprecated: This hook is deprecated and will be removed**

<!-- markdownlint-disable-next-line MD036 -->
**Note: Matches action name in PooCommerce core.**

### Description

Allow 3rd parties to validate cart items. This is a legacy hook from Woo core. This filter will be deprecated because it encourages usage of wc_add_notice. For the API we need to capture notices and convert to wp errors instead.

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_created_customer


Fires after a customer account has been registered.

```php
do_action( 'poocommerce_created_customer', integer $customer_id, array $new_customer_data, string $password_generated )
```


**Note: Matches filter name in PooCommerce core.**

### Description

This hook fires after customer accounts are created and passes the customer data.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $customer_id | integer | New customer (user) ID. |
| $new_customer_data | array | Array of customer (user) data. |
| $password_generated | string | The generated password for the account. |

### Source


- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_no_products_found


Hook: poocommerce_no_products_found.

```php
do_action( 'poocommerce_no_products_found' )
```

### See


- wc_no_products_found() - Default no products found content (priority 10)

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_register_post


Fires before a customer account is registered.

```php
do_action( 'poocommerce_register_post', string $username, string $user_email, \WP_Error $errors )
```


**Note: Matches filter name in PooCommerce core.**

### Description

This hook fires before customer accounts are created and passes the form data (username, email) and an array of errors. This could be used to add extra validation logic and append errors to the array.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $username | string | Customer username. |
| $user_email | string | Customer email address. |
| $errors | \WP_Error | Error object. |

### Source


- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_shop_loop


Hook: poocommerce_shop_loop.

```php
do_action( 'poocommerce_shop_loop' )
```

### Source


- [BlockTypes/ClassicTemplate.php](../../../../../poocommerce/src/Blocks/BlockTypes/ClassicTemplate.php)

---

## poocommerce_store_api_cart_errors


Fires an action to validate the cart.

```php
do_action( 'poocommerce_store_api_cart_errors', \WP_Error $errors, \WC_Cart $cart )
```

### Description

Functions hooking into this should add custom errors using the provided WP_Error instance.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $errors | \WP_Error | WP_Error object. |
| $cart | \WC_Cart | Cart object. |

### Example

#### Validate Cart

```php
// The action callback function.
function my_function_callback( $errors, $cart ) {

  // Validate the $cart object and add errors. For example, to create an error if the cart contains more than 10 items:
  if ( $cart->get_cart_contents_count() > 10 ) {
    $errors->add( 'my_error_code', 'Too many cart items!' );
  }
}

add_action( 'poocommerce_store_api_cart_errors', 'my_function_callback', 10 );
```


### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_store_api_cart_select_shipping_rate


Fires an action after a shipping method has been chosen for package(s) via the Store API.

```php
do_action( 'poocommerce_store_api_cart_select_shipping_rate', string|null $package_id, string $rate_id, \WP_REST_Request $request )
```

### Description

This allows extensions to perform addition actions after a shipping method has been chosen, but before the cart totals are recalculated.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $package_id | string, null | The sanitized ID of the package being updated. Null if all packages are being updated. |
| $rate_id | string | The sanitized chosen rate ID for the package. |
| $request | \WP_REST_Request | Full details about the request. |

### Source


- [StoreApi/Routes/V1/CartSelectShippingRate.php](../../../../../poocommerce/src/StoreApi/Routes/V1/CartSelectShippingRate.php)

---

## poocommerce_store_api_cart_update_customer_from_request


Fires when the Checkout Block/Store API updates a customer from the API request data.

```php
do_action( 'poocommerce_store_api_cart_update_customer_from_request', \WC_Customer $customer, \WP_REST_Request $request )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $customer | \WC_Customer | Customer object. |
| $request | \WP_REST_Request | Full details about the request. |

### Source


- [StoreApi/Routes/V1/CartUpdateCustomer.php](../../../../../poocommerce/src/StoreApi/Routes/V1/CartUpdateCustomer.php)

---

## poocommerce_store_api_cart_update_order_from_request


Fires when the order is synced with cart data from a cart route.

```php
do_action( 'poocommerce_store_api_cart_update_order_from_request', \WC_Order $draft_order, \WC_Customer $customer, \WP_REST_Request $request )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $draft_order | \WC_Order | Order object. |
| $customer | \WC_Customer | Customer object. |
| $request | \WP_REST_Request | Full details about the request. |

### Source


- [StoreApi/Routes/V1/AbstractCartRoute.php](../../../../../poocommerce/src/StoreApi/Routes/V1/AbstractCartRoute.php)

---

## poocommerce_store_api_checkout_order_processed


Fires before an order is processed by the Checkout Block/Store API.

```php
do_action( 'poocommerce_store_api_checkout_order_processed', \WC_Order $order )
```

### Description

This hook informs extensions that $order has completed processing and is ready for payment. This is similar to existing core hook poocommerce_checkout_order_processed. We're using a new action:

- To keep the interface focused (only pass $order, not passing request data).
- This also explicitly indicates these orders are from checkout block/StoreAPI.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $order | \WC_Order | Order object. |

### Example

#### Checkout Order Processed

```php
// The action callback function.
function my_function_callback( $order ) {
  // Do something with the $order object.
  $order->save();
}

add_action( 'poocommerce_blocks_checkout_order_processed', 'my_function_callback', 10 );
```


### See


- [#3238](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/3238)

### Source


- [StoreApi/Routes/V1/CheckoutOrder.php](../../../../../poocommerce/src/StoreApi/Routes/V1/CheckoutOrder.php)
- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_store_api_checkout_update_customer_from_request


Fires when the Checkout Block/Store API updates a customer from the API request data.

```php
do_action( 'poocommerce_store_api_checkout_update_customer_from_request', \WC_Customer $customer, \WP_REST_Request $request )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $customer | \WC_Customer | Customer object. |
| $request | \WP_REST_Request | Full details about the request. |

### Source


- [StoreApi/Routes/V1/CheckoutOrder.php](../../../../../poocommerce/src/StoreApi/Routes/V1/CheckoutOrder.php)
- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_store_api_checkout_update_order_meta


Fires when the Checkout Block/Store API updates an order's metadata.

```php
do_action( 'poocommerce_store_api_checkout_update_order_meta', \WC_Order $order )
```

### Description

This hook gives extensions the chance to add or update metadata on the $order. Throwing an exception from a callback attached to this action will make the Checkout Block render in a warning state, effectively preventing checkout. This is similar to existing core hook poocommerce_checkout_update_order_meta. We're using a new action:

- To keep the interface focused (only pass $order, not passing request data).
- This also explicitly indicates these orders are from checkout block/StoreAPI.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $order | \WC_Order | Order object. |

### See


- [#3686](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/3686)

### Source


- [StoreApi/Routes/V1/Checkout.php](../../../../../poocommerce/src/StoreApi/Routes/V1/Checkout.php)

---

## poocommerce_store_api_rate_limit_exceeded


Fires when the rate limit is exceeded.

```php
do_action( 'poocommerce_store_api_rate_limit_exceeded', string $ip_address, string $action_id )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $ip_address | string | The IP address of the request. |

### Source


- [StoreApi/Authentication.php](../../../../../poocommerce/src/StoreApi/Authentication.php)

---

## poocommerce_store_api_validate_add_to_cart


Fires during validation when adding an item to the cart via the Store API.

```php
do_action( 'poocommerce_store_api_validate_add_to_cart', \WC_Product $product, array $request )
```

### Description

Fire action to validate add to cart. Functions hooking into this should throw an \Exception to prevent add to cart from happening.

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $product | \WC_Product | Product object being added to the cart. |
| $request | array | Add to cart request params including id, quantity, and variation attributes. |

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_store_api_validate_cart_item


Fire action to validate add to cart. Functions hooking into this should throw an \Exception to prevent add to cart from occurring.

```php
do_action( 'poocommerce_store_api_validate_cart_item', \WC_Product $product, array $cart_item )
```

### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| $product | \WC_Product | Product object being added to the cart. |
| $cart_item | array | Cart item array. |

### Source


- [StoreApi/Utilities/CartController.php](../../../../../poocommerce/src/StoreApi/Utilities/CartController.php)

---

## poocommerce_{$product->get_type()}_add_to_cart


Trigger the single product add to cart action for each product type.

```php
do_action( 'poocommerce_{$product->get_type()}_add_to_cart' )
```

### Source


- [BlockTypes/AddToCartForm.php](../../../../../poocommerce/src/Blocks/BlockTypes/AddToCartForm.php)

---

## {$hook}


Action to render the content of a hook.

```php
do_action( '{$hook}' )
```

### Source


- [Templates/AbstractTemplateCompatibility.php](../../../../../poocommerce/src/Blocks/Templates/AbstractTemplateCompatibility.php)

---
<!-- FEEDBACK -->

---

[We're hiring!](https://poocommerce.com/careers/) Come work with us!

🐞 Found a mistake, or have a suggestion? [Leave feedback about this document here.](https://github.com/poocommerce/poocommerce/issues/new?assignees=&labels=type%3A+documentation&template=suggestion-for-documentation-improvement-correction.md&title=Feedback%20on%20./docs/third-party-developers/extensibility/hooks/actions.md)

<!-- /FEEDBACK -->

