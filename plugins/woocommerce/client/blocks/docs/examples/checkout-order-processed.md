# Checkout Order Processed

```php
// The action callback function.
function my_function_callback( $order ) {
  // Do something with the $order object.
  $order->save();
}

add_action( 'poocommerce_blocks_checkout_order_processed', 'my_function_callback', 10 );
```
