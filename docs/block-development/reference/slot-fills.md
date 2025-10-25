---
post_title: Slot and fill
sidebar_label: Slot and fill

---

# Slot and fill

## The problem

You added custom data to the [Store API](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/blocks/docs/third-party-developers/extensibility/rest-api/extend-rest-api-add-data.md). You changed several strings using [Checkout filters](/docs/block-development/extensible-blocks/cart-and-checkout-blocks/filters-in-cart-and-checkout/). Now you want to render your own components in specific places in the Cart and Checkout.

## Solution

Slot and Fill are a pair of components that add the possibility to render your own HTML in pre-defined places in the Cart and Checkout. Your component will get access to contextual data and will get re-rendered when needed.

A _Slot_ is a place in the Cart and Checkout that can render an indefinite number of external components.

A _Fill_ is the component provided by third-party developers to render inside a _Slot_.

Slot and Fill use WordPress' API, and you can learn more about how they work in [the Slot and Fill documentation.](https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/slot-fill).

## Basic Usage

`ExperimentalOrderMeta` is a fill that will render in a slot below the Order summary section in the Cart and Checkout blocks.
The `ExperimentalOrderMeta` will automatically pass props to its top level child:

-   `cart` which contains cart data
-   `extensions` which contains data registered with `ExtendSchema::class` in `wc/store/cart` endpoint
-   `context`, equal to the name of the Block in which the fill is rendered: `poocommerce/cart` or `poocommerce/checkout`

```jsx
const { registerPlugin } = wp.plugins;
const { ExperimentalOrderMeta } = wc.blocksCheckout;

const MyCustomComponent = ( { cart, extensions } ) => {
	return <div className="my-component">Hello PooCommerce</div>;
};

const render = () => {
	return (
		<ExperimentalOrderMeta>
			<MyCustomComponent />
		</ExperimentalOrderMeta>
	);
};

registerPlugin( 'my-plugin-namespace', {
	render,
	scope: 'poocommerce-checkout',
} );
```

## registerPlugin

In the above example, we're using `registerPlugin`. This plugin will take our component and render it, but it won't make it visible. The SlotFill part is the one responsible for actually having it show up in the correct place.

You use `registerPlugin` to feed in your plugin namespace, your component `render`, and the scope of your `registerPlugin`. The value of scope should always be `poocommerce-checkout`.

## Requirements

For this to work, your script must be enqueued after Cart and Checkout. You can follow the [IntegrationInterface](https://github.com/poocommerce/poocommerce-gutenberg-products-block/blob/50f9b3e8d012f425d318908cc13d9c601d97bd68/docs/extensibility/integration-interface.md) documentation for enqueueing your script.
