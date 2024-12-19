# PooCommerce Blocks End-to-End Tests

This document provides an overview of the PooCommerce Blocks end-to-end testing process. For detailed instructions and comprehensive guidelines, please refer to the [contributor guidelines document](../../docs/contributors/e2e-guidelines.md).

## Quick Start

### Preparing the Environment

1. Build the PooCommerce Plugin:

    ```sh
    pnpm --filter='@poocommerce/plugin-poocommerce' watch:build
    ```

2. Go to the PooCommerce Blocks plugin folder:

    ```sh
    cd plugins/poocommerce-blocks/
    ```

3. Start the environment:

    ```sh
    pnpm env:start
    ```

### Running the Tests

1. Run all tests:

    ```sh
    pnpm test:e2e
    ```

2. Run a single test file:

    ```sh
    pnpm test:e2e path/to/the/file.spec.ts
    ```

3. Run in UI mode:

    ```sh
    pnpm test:e2e --ui
    ```

4. Run in debug mode:

```sh
pnpm test:e2e --debug
```
