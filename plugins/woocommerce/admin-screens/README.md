# Admin screens

Experimental admin pages built with wp-build, DataForm and core-data. Each folder in `routes/` is a wp-build route.

Pages get their fields from the Entity fields API in WordPress 7.2. `packages/entity-fields` holds one field collection per page: a `field.php` per field, which PHP registers, and a script module for the parts PHP can't describe.

```sh
pnpm --filter=@poocommerce/plugin-poocommerce build:project:admin-screens
pnpm --filter=@poocommerce/plugin-poocommerce watch:build:project:admin-screens
```

The build writes to `plugins/poocommerce/assets/client/routes`.
