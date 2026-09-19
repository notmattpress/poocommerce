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
Cannot find module '@poocommerce/settings' from 'node_modules/@poocommerce/navigation/build/index.js'
```

`@poocommerce/settings` is an alias for the `wc.wcSettings` module from PooCommerce core, not an npm package, so Jest cannot resolve it. Some dependencies of this package import it. To fix the error, map the alias to a local mock and define the `wcSettings` data global that the module reads in a Jest setup file. See [Using `@poocommerce/settings` with Jest](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/dependency-extraction-webpack-plugin/README.md#using-poocommercesettings-with-jest) in the dependency extraction plugin README for the config and mock to use.
