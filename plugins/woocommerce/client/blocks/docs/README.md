# PooCommerce Blocks Handbook <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

-   [Contributors](#contributors)
-   [Internal developers](#internal-developers)
-   [Third-party developers](#third-party-developers)
-   [Designers and theme developers](#designers-and-theme-developers)
-   [Block References](#block-references)
-   [Developer Resources](#developer-resources)
    -   [Tools](#tools)
    -   [Articles](#articles)
    -   [Tutorials](#tutorials)

The PooCommerce Blocks Handbook provides documentation for designers and developers on how to extend or contribute to blocks, and how internal developers should handle new releases.

## Contributors

> Want to contribute to the PooCommerce Blocks plugin? The following documents offer information that can help you get started.

-   [Contributing](contributors/README.md)
    -   [Getting Started](contributors/getting-started.md)
    -   [Coding Guidelines](contributors/coding-guidelines.md)
    -   [Block Script Assets](contributors/block-assets.md)
    -   [CSS Build System](contributors/css-build-system.md)
    -   [JavaScript Build System](contributors/javascript-build-system.md)
    -   [JavaScript Testing](contributors/javascript-testing.md)
    -   [Storybook & Components](contributors/storybook-and-components.md)

## Internal developers

> Are you an internal developer? The following documents offer information about the different blocks, the Block Client APIs, the Store API, the templates and the testing process.

-   [Blocks](internal-developers/blocks/README.md)
    -   [Stock Reservation during Checkout](internal-developers/blocks/stock-reservation.md)
    -   [Features Flags and Experimental interfaces](internal-developers/blocks/feature-flags-and-experimental-interfaces.md)
-   [Block Data](../assets/js/data/README.md)
    -   [Collections Store](../assets/js/data/collections/README.md)
    -   [Query State Store](../assets/js/data/query-state/README.md)
    -   [Schema Store](../assets/js/data/schema/README.md)
-   [Block Client APIs](internal-developers/block-client-apis/README.md)
    -   [Checkout API interface](internal-developers/block-client-apis/checkout/checkout-api.md)
    -   [Notices](internal-developers/block-client-apis/notices.md)
-   [Data store](internal-developers/data-store/README.md)
    -   [Validation](internal-developers/data-store/validation.md)
-   [Editor Components](../assets/js/editor-components/README.md)
    -   [SearchListControl](../assets/js/editor-components/search-list-control/README.md)
    -   [Tag](../assets/js/editor-components/tag/README.md)
    -   [TextToolbarButton](../assets/js/editor-components/text-toolbar-button/README.md)
-   [Icons](../assets/js/icons/README.md)
-   [Store API (REST API)](../../poocommerce/src/StoreApi/README.md)
-   [Storybook](../storybook/README.md)
-   [Templates](internal-developers/templates/README.md)
    -   [BlockTemplateController.php](internal-developers/templates/block-template-controller.md)
    -   [ClassicTemplate.php](internal-developers/templates/classic-template.md)
    -   [Classic Template Block](../assets/js/blocks/classic-template/README.md)
-   [Testing](internal-developers/testing/README.md)
    -   [When to employ end to end testing](internal-developers/testing/when-to-employ-e2e-testing.md)
    -   [Smoke Testing](internal-developers/testing/smoke-testing.md)
    -   [Cart and Checkout Testing](internal-developers/testing/cart-checkout/README.md)
        -   [General Flow](internal-developers/testing/cart-checkout/general-flow.md)
        -   [Editor](internal-developers/testing/cart-checkout/editor.md)
        -   [Shipping](internal-developers/testing/cart-checkout/shipping.md)
        -   [Payments](internal-developers/testing/cart-checkout/payment.md)
        -   [Items](internal-developers/testing/cart-checkout/items.md)
        -   [Taxes](internal-developers/testing/cart-checkout/taxes.md)
        -   [Coupons](internal-developers/testing/cart-checkout/coupons.md)
        -   [Compatibility](internal-developers/testing/cart-checkout/compatibility.md)
    -   [Releases](internal-developers/testing/releases/README.md)
-   [Translations](internal-developers/translations/README.md)
    -   [Translation basics](internal-developers/translations/translation-basics.md)
    -   [Translations in PHP files](internal-developers/translations/translations-in-PHP-files.md)
    -   [Translations in JS/TS files](internal-developers/translations/translations-in-JS-TS-files.md)
    -   [Translations in FSE templates](internal-developers/translations/translations-in-FSE-templates.md)
    -   [Translations for lazy-loaded components](internal-developers/translations/translations-for-lazy-loaded-components.md)
    -   [Translation loading](internal-developers/translations/translation-loading.md)
    -   [Translation management](internal-developers/translations/translation-management.md)

## Third-party developers

> Are you a third-party developer? The following documents explain how to extend the PooCommerce Blocks plugin with your custom extension.

### Extensibility

-   Hooks
    -   [Actions](third-party-developers/extensibility/hooks/actions.md)
    -   [Filters](third-party-developers/extensibility/hooks/filters.md)
-   REST API
    -   [Exposing your data in the Store API](third-party-developers/extensibility/rest-api/extend-rest-api-add-data.md)
    -   [Available endpoints to extend with ExtendSchema](third-party-developers/extensibility/rest-api/available-endpoints-to-extend.md)
    -   [Adding an endpoint to ExtendSchema](internal-developers/rest-api/extend-rest-api-new-endpoint.md)
    -   [Available Formatters](third-party-developers/extensibility/rest-api/extend-rest-api-formatters.md)
    -   [Updating the cart with the Store API](third-party-developers/extensibility/rest-api/extend-rest-api-update-cart.md)
-   Checkout Payment Methods
    -   [Check out more in the PooCommerce Developer Documentation](https://developer.poocommerce.com/docs/category/cart-and-checkout-blocks/payment-methods/)
-   Cart and Checkout Blocks
    -   [Blocks Registry](../packages/checkout/blocks-registry/README.md)
    -   [Components](../packages/checkout/components/README.md)
    -   [Filter Registry](../packages/checkout/filter-registry/README.md)
    -   [Slot and Fill](../packages/checkout/slot/README.md)
    -   [Utilities](../packages/checkout/utils/README.md)
    -   [Check out more in PooCommerce Developer Documentation](https://developer.poocommerce.com/docs/category/cart-and-checkout-blocks/)

## Designers and theme developers

> The following document explains how to to create block themes that work in PooCommerce and how to customize the styles of PooCommerce blocks.

-   [Theming](/docs/block-theme-development/theming-woo-blocks.md)

## Block References

-   [Block References](/docs/block-development/block-references.md)

## Developer Resources

### Tools

-   [@poocommerce/extend-cart-checkout-block](https://www.npmjs.com/package/@poocommerce/extend-cart-checkout-block) This is a template to be used with @wordpress/create-block to create a PooCommerce Blocks extension starting point. It also showcases how to use some extensibility points, e.g. registering an inner block in the Checkout Block, applying filters to certain texts such as the place order button, using Slot/Fill and how to change the behaviour of the Store API.

### Articles

The following posts from [developer.woo.com](https://developer.poocommerce.com/category/developer-resources/) provide deeper insights into the PooCommerce Blocks development.

-   [Store API is now considered stable](https://developer.poocommerce.com/2022/03/25/store-api-is-now-considered-stable/)
-   [Available Extensibility Interfaces for The Cart and Checkout Blocks](https://developer.poocommerce.com/2021/11/09/available-extensibility-interfaces-for-the-cart-and-checkout-blocks/)
-   [How The Checkout Block Processes An Order](https://developer.poocommerce.com/2022/10/06/how-the-checkout-block-processes-an-order/)
-   [New @wordpress/data stores in PooCommerce Blocks](https://developer.poocommerce.com/2022/10/17/new-wordpress-data-stores-in-poocommerce-blocks/)

### Tutorials

The following tutorials from [developer.woo.com](https://developer.poocommerce.com/) help you with extending the PooCommerce Blocks plugin.

-   [📺 Tutorial: Extending the PooCommerce Checkout Block](https://developer.poocommerce.com/2023/08/07/extending-the-poocommerce-checkout-block-to-add-custom-shipping-options/)
-   [Hiding Shipping and Payment Options in the Cart and Checkout Blocks](https://developer.poocommerce.com/2022/05/20/hiding-shipping-and-payment-options-in-the-cart-and-checkout-blocks/)
-   [Integrating your Payment Method with Cart and Checkout Blocks](https://developer.poocommerce.com/2021/03/15/integrating-your-payment-method-with-cart-and-checkout-blocks/)
-   [Exposing Payment Options in the Checkout Block](https://developer.poocommerce.com/2022/07/07/exposing-payment-options-in-the-checkout-block/)

<!-- FEEDBACK -->

---

[We're hiring!](https://poocommerce.com/careers/) Come work with us!

🐞 Found a mistake, or have a suggestion? [Leave feedback about this document here.](https://github.com/poocommerce/poocommerce/issues/new?assignees=&labels=type%3A+documentation&template=suggestion-for-documentation-improvement-correction.md&title=Feedback%20on%20./docs/README.md)

<!-- /FEEDBACK -->
