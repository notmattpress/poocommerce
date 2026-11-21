# Purple development and releases

Purple is the private `@poocommerce/theme-purple` workspace package. Its installable artifact is a WordPress theme, and its releases are independent of other themes and PooCommerce Core.

## Development

From the repository root, run `pnpm install`, `composer install --working-dir=tools/theme-cli`, and `composer install --working-dir=themes/purple`.

```bash
pnpm --filter=@poocommerce/theme-purple validate
pnpm --filter=@poocommerce/theme-purple changelog add
pnpm --filter=@poocommerce/theme-purple changelog validate
```

### Playground environment

The shared theme CLI starts WordPress with the experimental Playground runtime by default:

```bash
pnpm --filter=@poocommerce/theme-cli wp-env start purple
```

