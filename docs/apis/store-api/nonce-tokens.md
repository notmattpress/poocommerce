---
sidebar_position: 1
---

# Nonce Tokens 

Nonces are generated numbers used to verify origin and intent of requests for security purposes. You can read more about [nonces in the WordPress codex](https://developer.wordpress.org/apis/security/nonces/).

## Store API Endpoints that Require Nonces

POST requests to the `/cart` endpoints and all requests to the `/checkout` endpoints require a nonce to function. Failure to provide a valid nonce will return an error response, unless you're using [Cart Tokens](/docs/apis/store-api/cart-tokens) instead.

## Sending Nonce Tokens with requests

Nonce tokens are included with the request headers. Create a request header named `Nonce`. This will be validated by the API.

**Example:**

```sh
curl --header "Nonce: 12345" --request GET https://example-store.com/wp-json/wc/store/v1/checkout
```

After making a successful request, an updated `Nonce` header will be sent back--this needs to be stored and updated by the client to make subsequent requests.

## Generating security nonces from WordPress

Nonces must be created using the [`wp_create_nonce` function](https://developer.wordpress.org/reference/functions/wp_create_nonce/) with the key `wc_store_api`.

```php
wp_create_nonce( 'wc_store_api' )
```

There is no other mechanism in place for creating nonces.

## Disabling Nonces for Development

If you want to test REST endpoints without providing a nonce, you can use the following filter:

```php
add_filter( 'poocommerce_store_api_disable_nonce_check', '__return_true' );
```

Nonce checks will be bypassed if `poocommerce_store_api_disable_nonce_check` evaluates to `true`.

NOTE: This should only be done on development sites where security is not important. Do not enable this in production.
