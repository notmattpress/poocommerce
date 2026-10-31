# Admin screens

Experimental admin pages built with wp-build, DataForm and core-data. Each folder in `routes/` is a wp-build route.

```sh
pnpm --filter=@poocommerce/plugin-poocommerce build:project:admin-screens
pnpm --filter=@poocommerce/plugin-poocommerce watch:build:project:admin-screens
```

The build writes to `plugins/poocommerce/assets/client/routes`.
