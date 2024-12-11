---
post_title: How to check if PooCommerce is active
menu_title: Check if PooCommerce is active
tags: how-to
---

When developing for PooCommerce, ensuring that PooCommerce is installed and active before your code runs is crucial. This prevents errors related to missing PooCommerce functions or classes.

There are a few methods to achieve this. The first is to execute your code on the `poocommerce_loaded` action. This approach guarantees that PooCommerce and its functionalities are fully loaded and available for use. This is fired around the same time as the core `plugins_loaded` action. 

```php
add_action( 'poocommerce_loaded', 'prefix_poocommerce_loaded' );

function prefix_poocommerce_loaded() {
	// Custom code here. PooCommerce is active and all plugins have been loaded...
}
```

**Note**: At this stage, WordPress has not yet initialized the current user data.

Another method is to execute your code on the `poocommerce_init` action. This is executed right _after_ PooCommerce is active and initialized. This action (and the `before_poocommerce_init` action) fires in the context of the WordPress `init` action so at this point current user data has been initialized.

```php
add_action( 'poocommerce_init', 'prefix_poocommerce_init' );

function prefix_poocommerce_init() {
	// Custom code here. PooCommerce is active and initialized...
}
```

**Note**: The `before_poocommerce_init` hook is also an option, running just _before_ PooCommerce's initialization

Using the above hooks grants access to PooCommerce functions, enabling further condition checks. For instance, you might want to verify PooCommerce's version to ensure compatibility with your code:

```php
add_action( 'poocommerce_init', 'prefix_poocommerce_init' );

function prefix_poocommerce_init() {
	// Only continue if we have access to version 8.7.0 or higher.
	if ( version_compare( wc()->version, '8.7.0', '<' ) ) {
		return;
	}

	// Custom code here. PooCommerce is active and initialized...
}
```

Choosing the right hook based on your development needs ensures your PooCommerce extensions or customizations work seamlessly and efficiently.
