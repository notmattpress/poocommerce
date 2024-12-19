---
post_title: Classes in PooCommerce
menu_title: Classes in PooCommerce
tags: reference
---

## List of Classes in PooCommerce

For a list of Classes in PooCommerce, please see the [PooCommerce Code Reference](https://poocommerce.github.io/code-reference/packages/PooCommerce-Classes.html).

## Common Classes

### PooCommerce

The main class is `poocommerce` which is available globally via the `$poocommerce` variable. This handles the main functions of PooCommerce and init's other classes, stores site-wide variables, and handles error/success messages. The poocommerce class initializes the following classes when constructed:

-   `WC_Query` - stored in `$poocommerce->query`
-   `WC_Customer` - stored in `$poocommerce->customer`
-   `WC_Shipping` - stored in `$poocommerce->shipping`
-   `WC_Payment_Gateways` - stored in `$poocommerce->payment_gateways`
-   `WC_Countries` - stored in `$poocommerce->countries`

Other classes are auto-loaded on demand.

View the [PooCommerce Class Code Reference](https://poocommerce.github.io/code-reference/classes/PooCommerce.html) for a full list of methods contained in this class.

### WC_Product

PooCommerce has several product classes responsible for loading and outputting product data. This can be loaded through PHP using:

`$product = wc_get_product( $post->ID );`

In the loop this is not always necessary since calling  `the_post()` will automatically populate the global  `$product` variable if the post is a product.

View the [WC_Product Code Reference](https://poocommerce.github.io/code-reference/classes/WC-Product.html) for a full list of methods contained in this class.

### WC_Customer

The customer class allows you to get data about the current customer, for example:

```php
global $poocommerce;
$customer_country = $poocommerce->customer->get_country();
```

View the [WC_Customer Code Reference](https://poocommerce.github.io/code-reference/classes/WC-Customer.html) for a full list of methods contained in this class.

### WC_Cart

The cart class loads and stores the users cart data in a session. For example, to get the cart subtotal you could use:

```php
global $poocommerce;
$cart_subtotal = $poocommerce->cart->get_cart_subtotal();
```

View the [WC_Cart Code Reference](https://poocommerce.github.io/code-reference/classes/WC-Cart.html) for a full list of methods contained in this class.
