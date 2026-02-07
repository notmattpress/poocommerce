# Marketplace

This folder contains the components used in the Marketplace page found in `PooCommerce > Extensions`.

The page contains two parts, the PooCommerce.com marketplace and a list of products the user purchased.

## Marketplace Tabs

- **Discover**: A curated list of extensions and themes.
- **Browse**: All extensions.
- **Themes**: All themes.
- **Business Services**: All business services.
- **Search**: Search results.

### Marketplace API

The Marketplace API handles interactions with PooCommerce.com and local product data. Here are the main endpoints:

1. **Product Discovery**:
   - `/wc/v3/marketplace/featured`: Gets curated extensions and themes for the Discover page.
     (Source: `class-wc-helper-admin.php` → `class-wc-admin-addons.php`)
   - `/wp-json/wccom-extensions/1.0/search`: Searches PooCommerce.com products.
     (Source: `fetchSearchResults()` in `./utils/functions.tsx`)
   - `wp-json/wccom-extensions/1.0/categories`: Returns a list of categories.
     (Source: `fetchCategories()` in `./utils/functions.tsx`)

API responses are cached locally for performance, with automatic cache invalidation on product updates and user activity.

### Discover page

The data for the Discover section is fetched from the `/wc/v3/marketplace/featured` endpoint. This behaves as a proxy to fetch and cache the content from the `poocommerce.com/wp-json/wccom-extensions` endpoint.

Themes, extensions, business services and search results are fetched directly from PooCommerce.com.

## My Subscriptions

This tab contains the list of all the extensions and themes the PooCommerce merchant has purchased from the PooCommerce.com Marketplace.

The merchant needs to connect the site to their PooCommerce.com account to view this list and install, update, and enable the products.

If a subscription is expired, the merchant will be prompted to renew it.

### My Subscriptions API

My Subscriptions data uses `/wc/v3/marketplace/subscriptions` API endpoints to list, install, connect, and update products.

You can find a full list of endpoints in the [subscriptions API source code](/plugins/poocommerce/includes/admin/helper/class-wc-helper-subscriptions-api.php).

## Project Structure

The project is structured as follows:

- **components**: The React components used in the Marketplace page.
- **contexts**: React contexts.
- **utils**: Functions used to interact with APIs.
- **stylesheets**: Shared stylesheets.
- **assets**: Images.

## Development

This feature is part of PooCommerce Admin and uses the [same development environment.](/plugins/poocommerce-admin/README.md)
