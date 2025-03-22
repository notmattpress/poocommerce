---
post_title: DOM Events sent from product collection block
menu_title: DOM Events
tags: how-to
---

# Product Collection - DOM Events

## `wc-blocks_product_list_rendered`

This event is triggered when Product Collection block was rendered or re-rendered (e.g. due to page change).

### `detail` parameters

| Parameter          | Type    | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `collection` | string | `undefined`       | Collection type. It's `undefined` for "create your own" collections as the type is not specified. For other Core collections it can be one of type: `poocommerce/product-collection/best-sellers`, `poocommerce/product-collection/featured`, `poocommerce/product-collection/new-arrivals`, `poocommerce/product-collection/on-sale`, `poocommerce/product-collection/top-rated`. For custom collections it will hold their name. |

### Example usage

```javascript
window.document.addEventListener(
  'wc-blocks_product_list_rendered',
  ( e ) => {
    const { collection } = e.detail;
    console.log( collection ) // -> collection name, e.g. poocommerce/product-collection/on-sale
  }
);
```

## Event: `wc-blocks_viewed_product`

This event is triggered when some blocks are clicked in order to view product (redirect to product page).

### `detail` parameters

| Parameter          | Type    | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `collection` | string | `undefined`       | Collection type. It's `undefined` for "create your own" collections as the type is not specified. For other Core collections it can be one of type: `poocommerce/product-collection/best-sellers`, `poocommerce/product-collection/featured`, `poocommerce/product-collection/new-arrivals`, `poocommerce/product-collection/on-sale`, `poocommerce/product-collection/top-rated`. For custom collections it will hold their name. |
| `productId` | number |        | Product ID |

### Example usage

```javascript
window.document.addEventListener(
  'wc-blocks_viewed_product',
  ( e ) => {
    const { collection, productId } = e.detail;
    console.log( collection ) // -> collection name, e.g. "poocommerce/product-collection/featured" or undefined for default one
    console.log( productId ) // -> product ID, e.g. 34
  }
);
```
