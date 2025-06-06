# Features Flags and Experimental Interfaces <!-- omit in toc -->

## Table of contents <!-- omit in toc -->

-   [Blocks behind flags](#blocks-behind-flags)
    -   [Feature plugin flag](#feature-plugin-flag)
    -   [Experimental flag](#experimental-flag)
-   [Features behind flags](#features-behind-flags)
    -   [Feature plugin flag](#feature-plugin-flag)
-   [Processes and commands that use a flag](#processes-and-commands-that-use-a-flag)
-   [Usages of `__experimental` prefix](#usages-of-__experimental-prefix)
    -   [PHP filters and actions](#php-filters-and-actions)
    -   [JS methods](#js-methods)
    -   [Slots](#slots)
    -   [Misc](#misc)
-   [Usages of `experimental` prefix](#usages-of-experimental-prefix)

We also use an `__experimental` prefix for any experimental interfaces. This is a signal to those reading our code that it should not be implemented in for production use. Currently, this prefix is used in the following ways:

-   Prefixing references that are experimental. An example would be PHP action or filter slugs.
-   Prefixing functions or methods that are experimental.

## Blocks behind flags

The majority of our feature flagging is blocks, this is a list of them:

### Experimental flag

- Clear (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L308)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L122)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/clear-button/index.tsx#L15)
- Product Filter (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L301)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L95)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/index.tsx#L30)
- Product Filters (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L302)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L98)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filters/index.tsx#L13)
- Product Filter: Active Filters (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L307)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L118)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/active-filters/index.tsx#L16)
- Product Filter: Attribute (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L305)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L110)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/attribute-filter/index.tsx#L14)
- Product Filter: Price (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L304)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L106)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/price-filter/index.tsx#L15)
- Product Filter: Rating (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L306)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L114)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/bad0b61a83c5e86703a985deaab67cbb3a88a06d/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/rating-filter/index.tsx#L14)
- Product Filter: Stock Status (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L303)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L101)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/assets/js/blocks/product-filter/inner-blocks/stock-filter/index.tsx#L15)
- Delayed Account Creation (Experimental)
   	- [PHP flag](https://github.com/poocommerce/poocommerce/blob/9897737880dcbef9831ee41799684dab1960d94f/plugins/poocommerce/src/Blocks/BlockTypesController.php#L417)
   	- [Webpack flag](https://github.com/poocommerce/poocommerce/blob/9897737880dcbef9831ee41799684dab1960d94f/plugins/poocommerce-blocks/bin/webpack-entries.js#L168)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/9897737880dcbef9831ee41799684dab1960d94f/plugins/poocommerce-blocks/assets/js/blocks/order-confirmation/create-account/index.tsx#L14)
- Add to Cart + Options (Experimental)
    - [PHP flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce/src/Blocks/BlockTypesController.php#L456)
    - [Webpack flag](https://github.com/poocommerce/poocommerce/blob/a0f9d159e5196983d93064762fd20a510de57d55/plugins/poocommerce-blocks/bin/webpack-entries.js#L23)
    - [JS flag](https://github.com/poocommerce/poocommerce/blob/9897737880dcbef9831ee41799684dab1960d94f/plugins/poocommerce-blocks/assets/js/blocks/order-confirmation/create-account/index.tsx#L14)

## Features behind flags

We also have individual features or code blocks behind a feature flag, this is a list of them:

### Feature plugin flag

-   ⚛️ Product Price new controls ([JS flag](https://github.com/poocommerce/poocommerce-blocks/blob/74badf254ecfe0c7811713a0f847a87f139c69c3/assets/js/atomic/blocks/product-elements/price/supports.ts#L14-L37)).
-   ⚛️ Product Title new controls ([JS flag 1](https://github.com/poocommerce/poocommerce-blocks/blob/fd8eeb7f49f0454d746d581bc892cf3c2d9e30cc/assets/js/atomic/blocks/product-elements/title/attributes.ts#L25-L32) | [JS flag 2-1](https://github.com/poocommerce/poocommerce-blocks/blob/df6d820bb47459d56c1329729ab8c364a1b8fddc/assets/js/atomic/blocks/product-elements/title/block.tsx#L84) | [JS flag 2-2](https://github.com/poocommerce/poocommerce-blocks/blob/df6d820bb47459d56c1329729ab8c364a1b8fddc/assets/js/atomic/blocks/product-elements/title/block.tsx#L88) | [JS flag 2-3](https://github.com/poocommerce/poocommerce-blocks/blob/df6d820bb47459d56c1329729ab8c364a1b8fddc/assets/js/atomic/blocks/product-elements/title/block.tsx#L110) | [JS flag 2-4](https://github.com/poocommerce/poocommerce-blocks/blob/df6d820bb47459d56c1329729ab8c364a1b8fddc/assets/js/atomic/blocks/product-elements/title/block.tsx#L114) | [JS flag 3-1](https://github.com/poocommerce/poocommerce-blocks/blob/c734f3e846b8da7d49a03347d92354efd786251f/assets/js/atomic/blocks/product-elements/title/edit.tsx#L45-L52) | [JS flag 3-2](https://github.com/poocommerce/poocommerce-blocks/blob/c734f3e846b8da7d49a03347d92354efd786251f/assets/js/atomic/blocks/product-elements/title/edit.tsx#L98)).

## Processes and commands that use a flag

-   `npm run build:deploy` uses the feature plugin flag ([env flag](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/c0de18ec0a798c072420c67a689e4cc4d3ac77c9/package.json#L28)).
-   GitHub actions uses the experimental flag when running automated tests ([env flags 1](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4cedb65367be0d1c4c1f9dd9c016e3b1325cf92e/.github/workflows/php-js-e2e-tests.yml) | [env flags 2](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4cedb65367be0d1c4c1f9dd9c016e3b1325cf92e/.github/workflows/unit-tests.yml)).
-   webpack creates a `blocks.ini` when running ([env flag](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/bin/webpack-configs.js#L110-L119)).
-   webpack filters out experimental blocks when building. ([env flag](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/b3a9753d8b7dae18b36025d09fbff835b8365de0/bin/webpack-entries.js#L61-L66)).
-   certain E2E tests are skipped if the environment is not met ([env flag 1](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/backend/cart.test.js#L26) | [env flag 2](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/backend/checkout.test.js#L26) | [env flag 3](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/backend/mini-cart.test.js#L18) | [env flag 4](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/backend/single-product.test.js#L8) | [env flag 5](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/frontend/cart.test.js#L29) | [env flag 6](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/961c0c476d4228a218859c658c42f9b6eebfdec4/tests/e2e/specs/frontend/checkout.test.js#L32)).

## Usages of `__experimental` prefix

### PHP filters and actions

-   `__experimental_poocommerce_blocks_payment_gateway_features_list` hook that allows modification of the features supported by PayPal Standard. ([experimental hook](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4cedb65367be0d1c4c1f9dd9c016e3b1325cf92e/src/Payments/Integrations/PayPal.php#L86)).
-   **Deprecated** - `__experimental_poocommerce_blocks_checkout_update_order_meta` hook when the draft order has been created or updated from the cart and is now ready for extensions to modify the metadata ([experimental hook](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/3686/files#diff-af2c90fa556cc086b780c8fad99b68373d87fd6007e6e2ff1b4c68ebe9ccb551R377-R393)). [Deprecated in PR 5017](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/5017).
-   **Deprecated** - `__experimental_poocommerce_blocks_checkout_update_order_from_request` hook gives extensions the chance to update orders based on the data in the request ([deprecated experimental hook](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/d469a45d572f2c52d7917707c492dfb905ddfac0/src/StoreApi/Routes/Checkout.php#L466-L477)). [Deprecated in PR 5015](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/5015).
-   **Deprecated** - `__experimental_poocommerce_blocks_checkout_order_processed` hook when order has completed processing and is ready for payment ([deprecated experimental hook](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/accd1bbf402e043b9fc322f118ab614ba7437c92/src/StoreApi/Routes/Checkout.php#L237)). [Deprecated in PR 5014](https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/5014).
-   `__experimental_poocommerce_blocks_add_data_attributes_to_namespace` hook that allows 3PD to add a namespace of blocks to receive block attributes as `data-` attributes ([experimental property](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4a1ee97eb97011458174e93e44a9b7ad2f10ca36/src/BlockTypesController.php#L88)).
-   `__experimental_poocommerce_blocks_add_data_attributes_to_block` hook that allows 3PD to add a block to receive block attributes as `data-` attributes ([experimental property](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4a1ee97eb97011458174e93e44a9b7ad2f10ca36/src/BlockTypesController.php#L97)).

### JS methods

-   `__experimentalDeRegisterPaymentMethod` function used to deregister a payment method, only used in tests ([experimental function](https://github.com/poocommerce/poocommerce-blocks/blob/f27456dd00fa0b21b29a935943defb18351edf48/assets/js/blocks-registry/payment-methods/registry.ts#L110-L114)).
-   `__experimentalDeRegisterExpressPaymentMethod` function used to deregister an express payment method, only used in tests ([experimental function](https://github.com/poocommerce/poocommerce-blocks/blob/f27456dd00fa0b21b29a935943defb18351edf48/assets/js/blocks-registry/payment-methods/registry.ts#L116-L120)).

### Slots

-   `__experimentalOrderMeta` slot that allows extensions to add content to the order meta in the Cart and Checkout blocks ([experimental slot](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4cedb65367be0d1c4c1f9dd9c016e3b1325cf92e/packages/checkout/order-meta/index.js#L12)).
-   `__experimentalOrderShippingPackages` slot that allows extensions to add content to the shipping packages in the Cart and Checkout blocks ([experimental slot](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/4cedb65367be0d1c4c1f9dd9c016e3b1325cf92e/packages/checkout/order-shipping-packages/index.js#L12)).
-   `__experimentalDiscountsMeta` slot that allows extensions to add content to the shipping packages in the Cart and Checkout blocks ([experimental slot](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/b6a9cc6342696f47cc08686522bdaca7989a6bc7/packages/checkout/discounts-meta/index.js)).

### Misc

-   `__experimental_poocommerce_blocks_hidden` property allows overwriting the `hidden` property for cart item data. This is useful to make some cart item data visible/hidden depending on whether it needs to be displayed in the Cart Block or the Cart Shortcode ([experimental property](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/9c4288b0ee46960bdc2bf8ef351d05ac23073b0c/src/StoreApi/Schemas/CartItemSchema.php#L439-L441)). This was added in [this PR](https://github.com/poocommerce/poocommerce-blocks/pull/3732) to resolve [this issue with Subscriptions](https://github.com/poocommerce/poocommerce-blocks/issues/3731). This property will not be needed if the blocks replace the shortcode experience, since in that scenario, the `hidden` property would be sufficient.

## Usages of `experimental` prefix

`useStoreEvents` makes use of an `experimental__` prefix for wp-hook actions (since `__experimental` is not a valid prefix in that context).

These are [`@wordpress/hooks`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-hooks/) actions that are fired at certain times while using PooCommerce Blocks. We separate them into "store" events (events that happen in the store, i.e. while browsing the store or cart) and "checkout events" (events that happen on the checkout page)

-   `experimental__poocommerce_blocks-` is used for store events.
-   `experimental__poocommerce_blocks-checkout-` is used for checkout events.

### Current list of events

#### `experimental__poocommerce_blocks-cart-add-item`

Fired when an item is added to the cart.

##### Args

| Argument | Type   | Description |
|----------|--------|--------|
| `product` | `object` | The product that was added to the cart. |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-cart-add-item',
	'plugin/namespace',
	( { product } ) => {
		console.log( `${ product.name } was added to the cart` );
	}
);
```

#### `experimental__poocommerce_blocks-cart-set-item-quantity`

Fired when cart item quantity is changed by the customer. Fires on the Mini-cart block and the Cart block.

##### Args

| Argument   | Type     | Description                             |
|------------|----------|-----------------------------------------|
| `product`  | `object` | The product that was added to the cart. |
| `quantity` | `number` | The new quantity of the product.        |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-cart-set-item-quantity',
	'plugin/namespace',
	( { product, quantity } ) => {
		console.log( `${ product.name }'s quantity was changed to ${ quantity }` );
	}
);
```

#### `experimental__poocommerce_blocks-cart-remove-item`

Fired when a cart item is removed from the cart. Fires on the Mini-cart block and the Cart block.

##### Args

| Argument   | Type     | Description                                      |
|------------|----------|--------------------------------------------------|
| `product`  | `object` | The product that was added to the cart.          |
| `quantity` | `number` | The quantity of the product when it was removed. |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-cart-remove-item',
	'plugin/namespace',
	( { product, quantity } ) => {
		console.log( `${ product.name } was removed from the cart. There were ${ quantity } in the cart.` );
	}
);
```

#### `experimental__poocommerce_blocks-product-view-link`

Fired when a product link is clicked.

##### Args

| Argument   | Type     | Description                             |
|------------|----------|-----------------------------------------|
| `product`  | `object` | The product that was added to the cart. |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-product-view-link',
	'plugin/namespace',
	( { product } ) => {
		console.log( `${ product.name } view link clicked.` );
	}
);
```

#### `experimental__poocommerce_blocks-product-list-render`

Fired when a product list is rendered.

This documentation will be amended following a review of this action.

#### `experimental__poocommerce_blocks-store-notice-create`

Fired when a store notice is created.

This documentation will be amended following a review of this action.

#### `experimental__poocommerce_blocks-product-render`

Fired when a single product block is rendered.

This documentation will be amended following a review of this action.

#### `experimental__poocommerce_blocks-checkout-submit`

Fired when the checkout form is submitted.

##### Args

This action has no arguments.

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-submit',
	'plugin/namespace',
	() => {
		console.log( 'The checkout form was submitted.' );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-set-selected-shipping-rate

Fired when a shipping rate is chosen on checkout.

##### Args

| Argument   | Type     | Description                    |
|------------|----------|--------------------------------|
| `shippingRateId`  | `string` | The selected shipping rate ID. |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-set-selected-shipping-rate',
	'plugin/namespace',
	( { shippingRateId } ) => {
		console.log( `Selected shipping rate was changed to ${ shippingRateId }` );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-set-active-payment-method`

Fired when a payment method is chosen on checkout.

##### Args

| Argument   | Type     | Description                      |
|------------|----------|----------------------------------|
| `paymentMethodSlug`  | `string` | The payment method slug.         |

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-set-active-payment-method',
	'plugin/namespace',
	( { paymentMethodSlug } ) => {
		console.log( `The selected payment method was changed to ${ paymentMethodSlug }` );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-render-checkout-form`

Fired when the checkout form is rendered.

##### Args

This action has no arguments.

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-render-checkout-form',
	'plugin/namespace',
	() => {
		console.log( 'The checkout form was rendered.' );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-set-email-address`

Fired when the email address is added or changed on the Checkout block.

##### Args

This action has no arguments.

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-set-email-address',
	'plugin/namespace',
	() => {
		console.log( 'The email address was changed.' );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-set-shipping-address`

Fired when the shipping address is added or changed on the Checkout block.

##### Args

This action has no arguments.

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-set-shipping-address',
	'plugin/namespace',
	() => {
		console.log( 'The shipping address was changed.' );
	}
);
```

#### `experimental__poocommerce_blocks-checkout-set-billing-address`

Fired when the billing address is added or changed on the Checkout block.

##### Args

This action has no arguments.

##### Example

```js
wp.hooks.addAction(
	'experimental__poocommerce_blocks-checkout-set-billing-address',
	'plugin/namespace',
	() => {
		console.log( 'The billing address was changed.' );
	}
);
```
