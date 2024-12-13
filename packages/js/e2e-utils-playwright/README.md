# End-to-End Test Utilities For PooCommerce

This package contains utilities to help writing e2e tests specific to PooCommerce using Playwright.

> [!WARNING]
>
> This package is still under active development.
> Documentation might not be up-to-date, and the 0.x version can introduce breaking changes.

## Installation

```bash
npm install @poocommerce/e2e-utils-playwright --save-dev
```

## Usage

Example:

```js
import { addAProductToCart } from '@poocommerce/e2e-utils-playwright';

test('can add products to cart', async ({ page }) => {
  const product = {
    id: 1,
    name: 'Test Product',
  };

  await addAProductToCart(page, product.id);
  await page.goto('/cart/');

  await expect(page.locator('td.product-name')).toContainText(product.name);
});
```

## Contributing to this package

This is an individual package that's part of the PooCommerce project, which is organized as a monorepo.

To find out more about contributing to this package or PooCommerce as a whole, please read the project's
main [contributor guide](https://developer.poocommerce.com/docs/category/contributing/).
