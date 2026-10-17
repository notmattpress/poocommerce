# Purple development and releases

Purple is the private `@poocommerce/theme-purple` workspace package. Its installable artifact is a WordPress theme, and its releases are independent of other themes and PooCommerce Core.

## Development

From the repository root, run `pnpm install`, `composer install --working-dir=tools/theme-cli`, and `composer install --working-dir=themes/purple`.

```bash
pnpm --filter=@poocommerce/theme-purple validate
pnpm --filter=@poocommerce/theme-purple lint:php
pnpm --filter=@poocommerce/theme-purple lint
pnpm --filter=@poocommerce/theme-purple changelog add
pnpm --filter=@poocommerce/theme-purple changelog validate
```

The package delegates validation and PHP linting to shared tools. Its Composer dependencies and changelog configuration belong to Purple. See the [theme development guide](../README.md) for its local environment and import provenance.

### Playground environment

The shared theme CLI starts WordPress with the experimental Playground runtime by default:

```bash
pnpm --filter=@poocommerce/theme-cli wp-env start purple
```

The theme shortcut `pnpm --filter=@poocommerce/theme-purple env:start` delegates to the same command. This uses Purple's `.wp-env.json`, mounts Purple, and installs PooCommerce without Docker. Open <http://localhost:8890/wp-admin/> and activate Purple under Appearance > Themes. Use `admin` / `password` if prompted to sign in. Stop it with `pnpm --filter=@poocommerce/theme-purple env:stop`.

Playground uses SQLite and does not support `wp-env run`; use wp-admin for setup. To use Docker explicitly, run `pnpm --filter=@poocommerce/theme-cli wp-env start purple --runtime=docker`. Switching between Docker and Playground prompts to destroy the previous environment. Set `WP_ENV_HOME` to a separate directory when starting and stopping Playground if you want to preserve an existing Docker environment.

## Prepare a release

1. Choose Purple's next version from its own changes, independently of PooCommerce Core. Keep `package.json` version, the `style.css` Version header, and the `readme.txt` Stable tag aligned.
2. Compile only Purple's `changelog/` fragments into `CHANGELOG.md`. For example, when preparing version 1.0.4, run:

    ```bash
    pnpm --filter=@poocommerce/theme-purple changelog write --use-version=1.0.4
    ```

3. Review and commit the generated history and version updates, preserving the imported release history in `readme.txt`. Run the development checks above.

Packaging, release tags, and publishing automation are deferred in this layer. Development manifests, changelog fragments, and this guide are excluded from installable theme archives.
