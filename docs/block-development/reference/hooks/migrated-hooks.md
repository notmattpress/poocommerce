---
sidebar_label:  Migrated legacy hooks
---

# Migrated legacy hooks

Below are the hooks that exist in PooCommerce core and that were brought over to PooCommerce Blocks.

Please note that the actions and filters here run on the server side. The client-side blocks won't necessarily change based on a callback added to a server side hook. [Please see our documentation relating to APIs for manipulating the blocks on the client-side](./README.md).

## Legacy Filters

- [wc_session_expiration](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#wc_session_expiration)
- [poocommerce_add_cart_item](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_add_cart_item)
- [poocommerce_add_cart_item_data](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_add_cart_item_data)
- [poocommerce_add_to_cart_quantity](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_add_to_cart_quantity)
- [poocommerce_add_to_cart_sold_individually_quantity](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_add_to_cart_sold_individually_quantity)
- [poocommerce_add_to_cart_validation](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_add_to_cart_validation)
- [poocommerce_adjust_non_base_location_prices](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_adjust_non_base_location_prices)
- [poocommerce_apply_individual_use_coupon](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_apply_individual_use_coupon)
- [poocommerce_apply_with_individual_use_coupon](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_apply_with_individual_use_coupon)
- [poocommerce_cart_contents_changed](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_cart_contents_changed)
- [poocommerce_cart_item_permalink](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_cart_item_permalink)
- [poocommerce_get_item_data](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_get_item_data)
- [poocommerce_loop_add_to_cart_args](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_loop_add_to_cart_args)
- [poocommerce_loop_add_to_cart_link](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_loop_add_to_cart_link)
- [poocommerce_pay_order_product_has_enough_stock](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_pay_order_product_has_enough_stock)
- [poocommerce_pay_order_product_in_stock](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_pay_order_product_in_stock)
- [poocommerce_show_page_title](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/filters.md#poocommerce_show_page_title)

## Legacy Actions

- [poocommerce_add_to_cart](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_add_to_cart)
- [poocommerce_after_main_content](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_after_main_content)
- [poocommerce_after_shop_loop](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_after_shop_loop)
- [poocommerce_applied_coupon](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_applied_coupon)
- [poocommerce_archive_description](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_archive_description)
- [poocommerce_before_main_content](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_before_main_content)
- [poocommerce_before_shop_loop](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_before_shop_loop)
- [poocommerce_check_cart_items](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_check_cart_items)
- [poocommerce_no_products_found](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_no_products_found)
- [poocommerce_shop_loop](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/hooks/actions.md#poocommerce_shop_loop)
