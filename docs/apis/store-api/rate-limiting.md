---
sidebar_label: Rate Limiting 
sidebar_position: 4
---

# Rate Limiting for Store API endpoints 

[Rate Limiting](https://github.com/poocommerce/poocommerce-blocks/pull/5962) is available for Store API endpoints. This is optional and disabled by default. It can be enabled by following [these instructions](#rate-limiting-options-filter).

The main purpose prevent abuse on endpoints from excessive calls and performance degradation on the machine running the store.

Rate limit tracking is controlled by either `USER ID` (logged in), `IP ADDRESS` (unauthenticated requests) or filter defined logic to fingerprint and group requests.

It also offers standard support for running behind a proxy, load balancer, etc. This also optional and disabled by default.

## UI Control

Currently, this feature is only controlled via the `poocommerce_store_api_rate_limit_options` filter. To control it via a UI, you can use the following community plugin: [Rate Limiting UI for PooCommerce](https://wordpress.org/plugins/rate-limiting-ui-for-poocommerce/).

## Checkout rate limiting

You can enable rate limiting for Checkout place order and `POST /checkout` endpoint only via the UI by going to PooCommerce -> Settings -> Advanced -> Features and enabling "Rate limiting Checkout block and Store API".

When enabled via the UI, the rate limiting will only be applied to the `POST /checkout` and Place Order flow for Checkout block. The limit will be a maximum of 3 requests per 60 seconds.

## Limit information

A default maximum of 25 requests can be made within a 10-second time frame. These can be changed through an [options filter](#rate-limiting-options-filter).

## Methods restricted by Rate Limiting

`POST`, `PUT`, `PATCH`, and `DELETE`

## Rate Limiting options filter

A filter is available for setting options for rate limiting:

```php
add_filter( 'poocommerce_store_api_rate_limit_options', function() {
	return [
		'enabled' => false, // enables/disables Rate Limiting. Default: false
		'proxy_support' => false, // enables/disables Proxy support. Default: false
		'limit' => 25, // limit of request per timeframe. Default: 25
		'seconds' => 10, // timeframe in seconds. Default: 10
	];
} );
```

## Proxy standard support

If the Store is running behind a proxy, load balancer, cache service, CDNs, etc. keying limits by IP is supported through standard IP forwarding headers, namely:

* `X_REAL_IP`|`CLIENT_IP` _Custom popular implementations that simplify obtaining the origin IP for the request_
* `X_FORWARDED_FOR` _De-facto standard header for identifying the originating IP, [Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)_
* `X_FORWARDED` _[Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded), [RFC 7239](https://datatracker.ietf.org/doc/html/rfc7239)_

This is disabled by default.

## Enable Rate Limit by request custom fingerprinting

For more advanced use cases, you can enable rate limiting by custom fingerprinting.
This allows for a custom implementation to group requests without relying on logged-in User ID or IP Address.

### Custom basic example for grouping requests by User-Agent and Accept-Language combination

```php
add_filter( 'poocommerce_store_api_rate_limit_id', function() {
    $accept_language = isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ) : '';
    
    return md5( wc_get_user_agent() . $accept_language );
} );
```

## Limit usage information observability

Current limit information can be observed via custom response headers:

* `RateLimit-Limit` _Maximum requests per time frame._
* `RateLimit-Remaining` _Requests available during current time frame._
* `RateLimit-Reset` _Unix timestamp of next time frame reset._
* `RateLimit-Retry-After` _Seconds until requests are unblocked again. Only shown when the limit is reached._

### Response headers example

```http
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1654880642
RateLimit-Retry-After: 28
```

## Tracking limit abuses

This uses a modified wc_rate_limit table with an additional remaining column for tracking the request count in any given request window.
A custom action `poocommerce_store_api_rate_limit_exceeded` was implemented for extendability in tracking such abuses.

### Custom tracking usage example

```php
add_action(
    'poocommerce_store_api_rate_limit_exceeded',
    function ( $offending_ip, $action_id ) { /* Custom tracking implementation */ }
);
```
