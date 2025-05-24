---
post_title: How to configure caching plugins for PooCommerce
menu_title: Configure caching plugins
tags: how-to
---

## Excluding Pages from the Cache

Oftentimes if using caching plugins they'll already exclude these pages. Otherwise make sure you exclude the following pages from the cache through your caching systems respective settings.

- Cart
- My Account
- Checkout

These pages need to stay dynamic since they display information specific to the current customer and their cart.

## Excluding PooCommerce Session from the Cache

If the caching system you're using offers database caching, it might be helpful to exclude `_wc_session_` from being cached. This will be dependent on the plugin or host caching so refer to the specific instructions or docs for that system.

## Excluding PooCommerce Cookies from the Cache

Cookies in PooCommerce help track the products in your customers cart, can keep their cart in the database if they leave the site, and powers the recently viewed widget. Below is a list of the cookies PooCommerce uses for this, which you can exclude from caching.

| COOKIE NAME | DURATION | PURPOSE |
| --- | --- | --- |
| poocommerce_cart_hash | session | Helps PooCommerce determine when cart contents/data changes. |
| poocommerce_items_in_cart | session | Helps PooCommerce determine when cart contents/data changes. |
| wp_poocommerce_session_ | 2 days | Contains a unique code for each customer so that it knows where to find the cart data in the database for each customer. |
| poocommerce_recently_viewed | session | Powers the Recent Viewed Products widget. |
| store_notice[notice id] | session | Allows customers to dismiss the Store Notice. |


We're unable to cover all options, but we have added some tips for the popular caching plugins. For more specific support, please reach out to the support team responsible for your caching integration.

### W3 Total Cache Minify Settings

Ensure you add 'mfunc' to the 'Ignored comment stems' option in the Minify settings.

### WP-Rocket

PooCommerce is fully compatible with WP-Rocket. Please ensure that the following pages (Cart, Checkout, My Account) are not to be cached in the plugin's settings.

We recommend avoiding JavaScript file minification.

### WP Super Cache

PooCommerce is natively compatible with WP Super Cache. PooCommerce sends information to WP Super Cache so that it doesn't cache the Cart, Checkout, or My Account pages by default.

### Varnish

```varnish
if (req.url ~ "^/(cart|my-account|checkout|addons)") {
  return (pass);
}
if ( req.url ~ "\\?add-to-cart=" ) {
  return (pass);
}
```

## Troubleshooting

### Why is my Varnish configuration not working in PooCommerce?

Check out the following WordPress.org Support forum post on[ how cookies may be affecting your varnish coding](https://wordpress.org/support/topic/varnish-configuration-not-working-in-poocommerce).

```text
Add this to vcl_recv above "if (req.http.cookie) {":

# Unset Cookies except for WordPress admin and PooCommerce pages 
if (!(req.url ~ "(wp-login|wp-admin|cart|my-account/*|wc-api*|checkout|addons|logout|lost-password|product/*)")) { 
unset req.http.cookie; 
} 
# Pass through the PooCommerce dynamic pages 
if (req.url ~ "^/(cart|my-account/*|checkout|wc-api/*|addons|logout|lost-password|product/*)") { 
return (pass); 
} 
# Pass through the PooCommerce add to cart 
if (req.url ~ "\?add-to-cart=" ) { 
return (pass); 
} 
# Pass through the PooCommerce API
if (req.url ~ "\?wc-api=" ) { 
return (pass); 
} 
# Block access to php admin pages via website 
if (req.url ~ "^/phpmyadmin/.*$" || req.url ~ "^/phppgadmin/.*$" || req.url ~ "^/server-status.*$") { 
error 403 "For security reasons, this URL is only accessible using localhost (127.0.0.1) as the hostname"; 
} 

Add this to vcl_fetch:

# Unset Cookies except for WordPress admin and PooCommerce pages 
if ( (!(req.url ~ "(wp-(login|admin)|login|cart|my-account/*|wc-api*|checkout|addons|logout|lost-password|product/*)")) || (req.request == "GET") ) { 
unset beresp.http.set-cookie; 
} 
```

### Why is my Password Reset stuck in a loop?

This is due to the My Account page being cached, Some hosts with server-side caching don't prevent my-account.php from being cached.

If you're unable to reset your password and keep being returned to the login screen, please speak to your host to make sure this page is being excluded from their caching.
