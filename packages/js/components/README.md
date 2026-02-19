# Components

This packages includes a library of components that can be used to create pages in the PooCommerce dashboard and reports pages.

## Installation

Install the module

```bash
pnpm install @poocommerce/components --save
```

## Usage

```jsx
/**
 * PooCommerce dependencies
 */
import { Card } from '@poocommerce/components';

export default function MyCard() {
  return (
    <Card title="Store Performance" description="Key performance metrics">
      <p>Your stuff in a Card.</p>
    </Card>
  );
}
```

Many components include CSS to add style, you will need to add in order to appear correctly. Within PooCommerce, add the `wc-components` stylesheet as a dependency of your plugin's stylesheet. See [wp_enqueue_style documentation](https://developer.wordpress.org/reference/functions/wp_enqueue_style/#parameters) for how to specify dependencies.

In non-WordPress projects, link to the `build-style/card/style.css` file directly, it is located at `node_modules/@poocommerce/components/build-style/<component_name>/style.css`.

## Usage with tests

If you are using these components in a project that uses Jest for testing, you may get an error that looks like this:

```bash
Cannot find module '@poocommerce/settings' from 'node_modules/@poocommerce/experimental/node_modules/@poocommerce/navigation/build/index.js'
```

To fix this, you will need to mock the `@poocommerce/settings` because it's an alias that points to the `window.wcSettings`, which in turn comes from and is maintained by the [WC Blocks](https://github.com/poocommerce/poocommerce-blocks) package, the front-end code for this is located [here](https://github.com/poocommerce/poocommerce-gutenberg-products-block/tree/trunk/assets/js/settings/shared).

This can be done by adding the following to your Jest config:

```js
module.exports = {
  moduleNameMapper: {
    '@poocommerce/settings': path.resolve(
      __dirname,
      './mock/poocommerce-settings'
    ),
  }
  setupFiles: [
    path.resolve( __dirname, 'build/setup-globals.js' ),
  ],
  // ...other config
}
```

Then, you will need to create the following files:

1. Create a new file called poocommerce-settings.js in the ./mock directory. You can find the content for this file [here](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/internal-js-tests/src/mocks/poocommerce-settings.js#L1).
2. Next, create a file named setup-globals.js. You can find the content for this file [here](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/internal-js-tests/src/setup-globals.js#L44). The purpose of this file is to mock the wcSettings global variable.
