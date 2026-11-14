---
post_title: 'Dual API (code + GraphQL)'
sidebar_label: 'Dual API'
sidebar_position: 0
---

# PooCommerce Dual API

The **dual API** is a code-first API architecture: you write plain PHP classes (the **code API**), and a build script generates a fully functional **GraphQL API** that mirrors them.

The dual API was introduced as an experimental feature in PooCommerce core 10.9, but as of PooCommerce 11.2 its engine has moved to a dedicated plugin, [PooCommerce Dual API](https://github.com/poocommerce/poocommerce-dual-api), which any plugin can use to build its own dual API.

> **This feature is experimental.** Everything under the `Automattic\PooCommerce\Api` namespace can change in backwards-incompatible ways, or be removed, in any release. Do not use it in production extensions.

## Where the documentation lives

The engine and its documentation live in the plugin's repository:

- **Plugin**: [poocommerce/poocommerce-dual-api](https://github.com/poocommerce/poocommerce-dual-api)
- **Documentation**: the [`docs/` directory](https://github.com/poocommerce/poocommerce-dual-api/tree/trunk/docs) of that repository
- **Working example**: [poocommerce/poocommerce-simple-events](https://github.com/poocommerce/poocommerce-simple-events), a runnable reference plugin that exercises the engine end to end

## Requirements

PooCommerce 11.2 or newer on PHP 8.1+, with the PooCommerce Dual API plugin installed and active. There is no feature flag: activating the plugin enables the engine.

PooCommerce 10.9 to 11.1 ship the engine inside core, behind a hidden `dual_code_graphql_api` feature flag (`wp option update poocommerce_feature_dual_code_graphql_api_enabled yes` to enable it). The plugin stays dormant on those versions and the flag remains the switch there.
