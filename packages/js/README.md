# PooCommerce Packages

Currently we have a set of public-facing packages that can be downloaded from [npm](https://www.npmjs.com/org/poocommerce) and used in external applications. Here is a non-exhaustive list.

- `@poocommerce/components`: A library of components that can be used to create pages in the PooCommerce dashboard and reports pages.
- `@poocommerce/csv-export`: A set of functions to convert data into CSV values, and enable a browser download of the CSV data.
- `@poocommerce/currency`: A class to display and work with currency values.
- `@poocommerce/date`: A collection of utilities to display and work with date values.
- `@poocommerce/navigation`: A collection of navigation-related functions for handling query parameter objects, serializing query parameters, updating query parameters, and triggering path changes.
- `@poocommerce/tracks`: User event tracking utility functions for Automattic based projects.

## Working with existing packages

- You can make changes to packages files as normal, and running `pnpm start` will compile and watch both app files and packages.
- :warning: Add any dependencies to a package using `pnpm add` from the package root.
- :warning: Make sure you're not importing from any other files outside of the package (you can import from other packages, just use the `import from @poocommerce/package` syntax).
- Don't change the version in `package.json`.
- Label your PR with the `Packages` label.
- See the [Package Release Tool](https://github.com/poocommerce/poocommerce/blob/f9e7a5a3fb11cdd4dc064c02e045cf429cb6a2b6/tools/package-release/README.md) for instructions on how to release packages.

---

## Creating a new package

Most of this is pulled [from the Gutenberg workflow](https://github.com/WordPress/gutenberg/blob/trunk/CONTRIBUTING.md#creating-new-package).

To create a new package, add a new folder to `/packages`, containing…

1. `package.json` based on the template:

    ```json
    {
     "name": "@poocommerce/package-name",
     "version": "1.0.0-beta.0",
     "description": "Package description.",
     "author": "Automattic",
     "license": "GPL-2.0-or-later",
     "keywords": [ "wordpress", "poocommerce" ],
     "homepage": "https://github.com/poocommerce/poocommerce/tree/trunk/packages/js/[_YOUR_PACKAGE_]/README.md",
     "repository": {
      "type": "git",
      "url": "https://github.com/poocommerce/poocommerce.git"
     },
     "bugs": {
      "url": "https://github.com/poocommerce/poocommerce/issues"
     },
     "main": "build/index.js",
     "module": "build-module/index.js",
     "react-native": "src/index",
     "publishConfig": {
      "access": "public"
     }
    }
    ```

2. `.npmrc` file which disables creating `package-lock.json` file for the package:

    ```text
    package-lock=false
    ```

3. `README.md` file containing at least:
    - Package name
    - Package description
    - Installation details
    - Usage example
4. A `src` directory for the source of your module. Note that you'll want an `index.js` file that exports the package contents, see other packages for examples.
5. A blank Changelog file, `changelog.md`.

    ```text
    # Changelog

    This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
    ```

6. Add the new package name to `packages/js/dependency-extraction-webpack-plugin/assets/packages.js` so that users of that plugin will also be able to use the new package without enqueuing it.
