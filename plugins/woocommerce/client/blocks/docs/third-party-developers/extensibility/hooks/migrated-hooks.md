---
post_title: Cart and Checkout - Legacy hooks
menu_title: Legacy Hooks
tags: reference, checkout-hooks
---

# Migrated Legacy Hooks

Below are the hooks that exist in PooCommerce core and that were brought over to PooCommerce Blocks.

Please note that the actions and filters here run on the server side. The client-side blocks won't necessarily change based on a callback added to a server side hook. [Please see our documentation relating to APIs for manipulating the blocks on the client-side](../README.md).

## Legacy Filters

- [loop_shop_per_page](./filters.md#loop_shop_per_page)
- [wc_session_expiration](./filters.md#wc_session_expiration)
- [poocommerce_add_cart_item](./filters.md#poocommerce_add_cart_item)
- [poocommerce_add_cart_item_data](./filters.md#poocommerce_add_cart_item_data)
- [poocommerce_add_to_cart_quantity](./filters.md#poocommerce_add_to_cart_quantity)
- [poocommerce_add_to_cart_sold_individually_quantity](./filters.md#poocommerce_add_to_cart_sold_individually_quantity)
- [poocommerce_add_to_cart_validation](./filters.md#poocommerce_add_to_cart_validation)
- [poocommerce_adjust_non_base_location_prices](./filters.md#poocommerce_adjust_non_base_location_prices)
- [poocommerce_apply_base_tax_for_local_pickup](./filters.md#poocommerce_apply_base_tax_for_local_pickup)
- [poocommerce_apply_individual_use_coupon](./filters.md#poocommerce_apply_individual_use_coupon)
- [poocommerce_apply_with_individual_use_coupon](./filters.md#poocommerce_apply_with_individual_use_coupon)
- [poocommerce_cart_contents_changed](./filters.md#poocommerce_cart_contents_changed)
- [poocommerce_cart_item_permalink](./filters.md#poocommerce_cart_item_permalink)
- [poocommerce_get_item_data](./filters.md#poocommerce_get_item_data)
- [poocommerce_loop_add_to_cart_args](./filters.md#poocommerce_loop_add_to_cart_args)
- [poocommerce_loop_add_to_cart_link](./filters.md#poocommerce_loop_add_to_cart_link)
- [poocommerce_new_customer_data](./filters.md#poocommerce_new_customer_data)
- [poocommerce_pay_order_product_has_enough_stock](./filters.md#poocommerce_pay_order_product_has_enough_stock)
- [poocommerce_pay_order_product_in_stock](./filters.md#poocommerce_pay_order_product_in_stock)
- [poocommerce_registration_errors](./filters.md#poocommerce_registration_errors)
- [poocommerce_shipping_package_name](./filters.md#poocommerce_shipping_package_name)
- [poocommerce_show_page_title](./filters.md#poocommerce_show_page_title)
- [poocommerce_single_product_image_thumbnail_html](./filters.md#poocommerce_single_product_image_thumbnail_html)

## Legacy Actions

- [poocommerce_add_to_cart](./actions.md#poocommerce_add_to_cart)
- [poocommerce_after_main_content](./actions.md#poocommerce_after_main_content)
- [poocommerce_after_shop_loop](./actions.md#poocommerce_after_shop_loop)
- [poocommerce_applied_coupon](./actions.md#poocommerce_applied_coupon)
- [poocommerce_archive_description](./actions.md#poocommerce_archive_description)
- [poocommerce_before_main_content](./actions.md#poocommerce_before_main_content)
- [poocommerce_before_shop_loop](./actions.md#poocommerce_before_shop_loop)
- [poocommerce_check_cart_items](./actions.md#poocommerce_check_cart_items)
- [poocommerce_created_customer](./actions.md#poocommerce_created_customer)
- [poocommerce_no_products_found](./actions.md#poocommerce_no_products_found)
- [poocommerce_register_post](./actions.md#poocommerce_register_post)
- [poocommerce_shop_loop](./actions.md#poocommerce_shop_loop)
