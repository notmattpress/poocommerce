---
post_title: Disabling Marketplace Suggestions Programmatically
menu_title: Disabling marketplace suggestions
current wccom url: https://poocommerce.com/document/poocommerce-marketplace-suggestions-settings/#section-6
---


For those who prefer to programmatically disable marketplace suggestions that are fetched from poocommerce.com, add the `poocommerce_allow_marketplace_suggestions` filter to your theme’s `functions.php` or a custom plugin. 

For example: 

```php
add_filter( 'poocommerce_allow_marketplace_suggestions', '__return_false' );
```

This filter will completely remove Marketplace Suggestions from your PooCommerce admin.
