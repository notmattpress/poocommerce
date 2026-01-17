# PooCommerce Admin Extension Examples

Examples for extending PooCommerce Admin

## Directions

Install dependencies, if you haven't already.

```bash
pnpm install
```

Build the example extension by running the pnpm script and passing the example name.


```bash
WC_EXT=<example> pnpm --filter=@poocommerce/admin-library example
```

You should see a new directory in `./poocommerce/plugins/{example} path.` Include the output plugin in your `.wp-env.json` or `.wp-env.override.json` and restart the WordPress instance. PooCommerce will now reflect the changes made by the example extension.

You can make changes to Javascript and PHP files in the example and see changes reflected upon refresh.

## Example Extensions

- `add-report` - Create a "Hello World" report page.
- `add-task` - Create a custom task for the onboarding task list.

> **Note:** Some of the previous examples have been moved to the [@poocommerce/create-woo-extension](https://www.npmjs.com/package/@poocommerce/create-woo-extension) package as extension variants for easier scaffolding of new extensions. See the [Create Woo Extension README](../../../../../../../packages/js/create-woo-extension/README.md) for more information.
