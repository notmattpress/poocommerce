---
post_title: Uninstall and remove all PooCommerce Data
sidebar_label: Uninstalling and removing data

current wccom url: https://poocommerce.com/document/installing-uninstalling-poocommerce/#uninstalling-poocommerce
---

# Uninstall and remove all PooCommerce Data

The PooCommerce plugin can be uninstalled like any other WordPress plugin. By default, the PooCommerce data is left in place though. 

If you need to remove *all* PooCommerce data as well, including products, order data, coupons, etc., you need to to modify the site's `wp-config.php` *before* deactivating and deleting the PooCommerce plugin.

As this action is destructive and permanent, the information is provided as is. PooCommerce Support cannot help with this process or anything that happens as a result. 

To fully remove all PooCommerce data from your WordPress site, open `wp-config.php`, scroll down to the bottom of the file, and add the following constant on its own line above `/* That's all, stop editing. */`.

```php
define( 'WC_REMOVE_ALL_DATA', true );

/* That's all, stop editing! Happy publishing. */ 
```

Then, once the changes are saved to the file, when you deactivate and delete PooCommerce, all of its data is removed from your WordPress site database.

![Uninstall PooCommerce WPConfig](https://poocommerce.com/wp-content/uploads/2020/03/uninstall_wocommerce_plugin_wpconfig.png)

## Removing the Action Scheduler tables

PooCommerce uses [Action Scheduler](https://actionscheduler.org/) to run background tasks. Action Scheduler is a shared library that other plugins can also bundle, so its database tables (`actionscheduler_actions`, `actionscheduler_claims`, `actionscheduler_groups` and `actionscheduler_logs`) are **not** removed by `WC_REMOVE_ALL_DATA`, even when the constant is set to `true`. Keeping them avoids deleting scheduled tasks that another active plugin might still rely on.

If you are certain that no other plugin on the site uses Action Scheduler, you can also remove those tables by adding the `WC_REMOVE_ACTION_SCHEDULER` constant alongside `WC_REMOVE_ALL_DATA` in `wp-config.php`:

```php
define( 'WC_REMOVE_ALL_DATA', true );
define( 'WC_REMOVE_ACTION_SCHEDULER', true );

/* That's all, stop editing! Happy publishing. */
```

Both constants are required: `WC_REMOVE_ALL_DATA` triggers the removal of PooCommerce data, and `WC_REMOVE_ACTION_SCHEDULER` additionally drops the Action Scheduler tables.
