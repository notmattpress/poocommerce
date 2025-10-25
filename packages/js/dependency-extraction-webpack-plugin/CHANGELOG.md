# Changelog 

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/4.0.0) - 2025-06-24 

-   Major [ **BREAKING CHANGE** ] - Monorepo: bump @wordpress/dependency-extraction-webpack-plugin dependency version to the latest (breaking changes, see https://github.com/WordPress/gutenberg/blob/trunk/packages/dependency-extraction-webpack-plugin/CHANGELOG.md for details). [#59106]
-   Patch - Monorepo: consolidate @babel/* dependencies versions across the monorepo. [#56575]
-   Patch - Monorepo: consolidate packages licenses to `GPL-2.0-or-later`. [#58941]
-   Patch - Monorepo: consolidate Webpack dependencies versions across the monorepo. [#59104]

## [3.1.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/3.1.0) - 2025-01-06 

-   Minor - Add JS remote logging package [#49702]
-   Minor - Add Settings package, feature flag, and initial page. [#52391]
-   Minor - Upgraded Typescript in the monorepo to 5.7.2 [#53165]
-   Patch - CI: liverage composer packages cache in lint monorepo job [#52054]
-   Patch - Fix pnpm version to 9.1.3 to avoid dependency installation issues. [#50828]
-   Patch - Monorepo: consolidate syncpack config around React 17/18 usage. [#52022]
-   Patch - Update pnpm to 9.1.0 [#47385]

## [3.0.1](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/3.0.1) - 2024-05-07 

-   Patch - Add @poocommerce/price-format package. [#47099]

## [3.0.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/3.0.0) - 2024-04-23 

-   Patch - Fix a bug where the assets folder was not distributed with @poocommerce/dependency-extraction-webpack-plugin [#46755]
-   Patch - bump php version in packages/js/*/composer.json [#42020]
-   Minor - Bump node version. [#45148]

## [2.3.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/2.3.0) - 2023-10-27 

-   Minor - Add @poocommerce/admin-layout package. [#37094]
-   Minor - Add @poocommerce/product-editor package to the packages list. [#36600]
-   Minor - Add @poocommerce/block-templates. [#40263]
-   Minor - Fix node and pnpm versions via engines [#34773]
-   Minor - Match TypeScript version with syncpack [#34787]
-   Minor - Remove direct dependency on eslint so that linting works properly with pnpm7 [#34661]
-   Minor - Sync @wordpress package versions via syncpack. [#37034]
-   Minor - Update pnpm monorepo-wide to 8.6.5 [#38990]
-   Minor - Update pnpm to 8.6.7 [#39245]
-   Minor - Update pnpm to version 8. [#37915]
-   Minor - Update pnpm version constraint to 7.13.3 to avoid auto-install-peers issues [#35007]
-   Minor - Upgrade TypeScript to 5.1.6 [#39531]
-   Minor - Add `@poocommerce/blocks-components` to the list of packages that will be resolved. [#41042]
-   Patch - Make eslint emit JSON report for annotating PRs. [#39704]
-   Patch - Update eslint to 8.32.0 across the monorepo. [#36700]

## [2.2.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/2.2.0) - 2022-07-08 

-   Minor - Remove PHP and Composer dependencies for packaged JS packages

## [2.1.0](https://www.npmjs.com/package/@poocommerce/dependency-extraction-webpack-plugin/v/2.1.0) - 2022-06-14 

-   Patch - Add '@poocommerce/extend-cart-checkout-block' to list of packages
-   Patch - Standardize lint scripts: add lint:fix
-   Minor - Add Jetpack Changelogger

[See legacy changelogs for previous versions](https://github.com/poocommerce/poocommerce/blob/68581955106947918d2b17607a01bdfdf22288a9/packages/js/dependency-extraction-webpack-plugin/CHANGELOG.md).
