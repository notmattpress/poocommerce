---
post_title: PooCommerce developer documentation
---

# PooCommerce Developer Documentation

> ⚠️ **Notice:** This documentation is currently a **work in progress**. While it's open to the public for transparency and collaboration, please be aware that some sections might be incomplete or subject to change. We appreciate your patience and welcome any contributions!

This is your go-to place to find everything you need to know to get started with PooCommerce development, including implementation details for specific parts of the PooCommerce code base. 

## Getting started

PooCommerce is a customizable, open-source eCommerce platform built on WordPress. It empowers businesses worldwide to sell anything from physical products and digital downloads to subscriptions, content, and even appointments.

Get familiar with [WordPress Plugin Development](https://developer.wordpress.org/plugins/).

Take a moment to familiarize yourself with our [Developer Resources](https://developer.wordpress.org/plugins/plugin-basics/).

Once you're ready to move forward, consider one of the following:

- [Tools for low-code development](getting-started/developer-tools.md)
- [Building your first extension](extension-development/building-your-first-extension.md)
- [How to design a simple extension](extension-development/how-to-design-a-simple-extension.md)

## Contributions

The PooCommerce ecosystem thrives on community contributions. Whether it's improving documentation, reporting bugs, or contributing code, we greatly appreciate every contribution from our community. 

- To contribute to **the core PooCommerce project**, check out our [Contributing guide](https://github.com/poocommerce/poocommerce/blob/trunk/.github/CONTRIBUTING.md).
- To contribute to **documentation** please refer to the [documentation style guide](contributing-docs/style-guide.md).

## Support

- To request a **new document, correction, or improvement**, [create an issue](https://github.com/poocommerce/poocommerce/issues/new).
- For development help, start with the [PooCommerce Community Forum](https://wordpress.org/support/plugin/poocommerce/), to see if someone else has already asked the same question. You can also pose your question in the `#developers` channel of our [Community Slack](https://poocommerce.com/community-slack/). If you're not sure where to ask your question, you can always [contact us](https://poocommerce.com/contact-us/), and our Happiness Engineers will be glad to point you in the right direction.
- For additional support with customizations, you might consider hiring from [WooExperts](https://poocommerce.com/experts/) or [Codeable](https://codeable.io/).

### Additional Resources

- [PooCommerce Official Website](https://poocommerce.com/)
- [Woo Marketplace](https://poocommerce.com/marketplace)
- All [PooCommerce Repositories on GitHub](https://poocommerce.github.io/)

### Other documentation

Some directories contain documentation about their own contents, in the form of README file. The available files are listed below, **if you create a new README file please add it to the corresponding list.**

Available READMe files for the PooCommerce plugin: 

- [`Root README`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/README.md)
- [`i18n/languages`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/i18n/languages/README.md)
- [`includes`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/includes/README.md)
- [`lib`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/lib/README.md)
- [`packages`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/packages/README.md)
- [`src`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/README.md)
- [`src/Admin/RemoteInboxNotifications`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Admin/RemoteInboxNotifications/README.md)
- [`src/Enums`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Enums/README.md)
- [`src/Internal`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/README.md)
- [`src/Internal/Admin/ProductForm`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/Admin/ProductForm/README.md)blob
- [`src/TransientFiles`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/TransientFiles/README.md)
- [`tests`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/README.md)
- [`tests/api-core-tests`](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/api-core-tests/README.md)
- [`tests/e2e`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/e2e/README.md)
- [`tests/e2e-pw`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/e2e-pw/README.md)
- [`tests/performance`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/performance/README.md)
- [`tests/Tools/CodeHacking`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/Tools/CodeHacking/README.md)

Available READMe files for the PooCommerce Admin plugin:

- [`Root README`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/README.md)
- [`client/activity-panel`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/activity-panel/README.md)
- [`client/activity-panel/activity-card`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/activity-panel/activity-card/README.md)
- [`client/activity-panel/activity-header`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/activity-panel/activity-header/README.md)
- [`client/analytics/report`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/analytics/report/README.md)
- [`client/analytics/settings`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/analytics/settings/README.md)
- [`client/dashboard`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/dashboard/README.md)
- [`client/header`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/header/README.md)
- [`client/marketing`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/marketing/README.md)
- [`client/marketing/coupons/card`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/marketing/coupons/card/README.md)
- [`client/marketing/components/product-icon`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/marketing/components/product-icon/README.md)
- [`client/utils`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/utils/README.md)
- [`client/wp-admin-scripts`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/client/wp-admin-scripts/README.md)
- [`docs`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/docs/README.md)
- [`docs/examples`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/docs/examples/README.md)
- [`docs/examples/extensions`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/docs/examples/extensions/README.md)
- [`docs/features`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/docs/features/README.md)
- [`docs/poocommerce.com`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/client/admin/docs/poocommerce.com/README.md)

Available READMe files for the PooCommerce Beta Tested plugin:

- [`Root README`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce-beta-tester/README.md)
- [`src/tools`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce-beta-tester/src/tools/README.md)
- [`userscripts`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce-beta-tester/userscripts/README.md)

Available READMe files for the PooCommerce Blueprint package:

- [`Root README`](https://github.com/poocommerce/poocommerce/blob/trunk/packages/php/blueprint/README.md)
