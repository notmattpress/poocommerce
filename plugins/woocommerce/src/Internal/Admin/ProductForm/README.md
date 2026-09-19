# Product Form

This folder contains helper classes to specifically extend the PooCommerce Admin product form.
This will primarily be done through the `Form` class, under the `Automattic\PooCommerce\Internal\Admin\ProductForm` namespace.

## Ex - Adding a new field:

```php
function add_product_form_field() {
    if (
        ! method_exists( '\Automattic\PooCommerce\Internal\Admin\ProductForm\FormFactory', 'add_field' )
    ) {
        return;
    }

    \Automattic\PooCommerce\Internal\Admin\ProductForm\FormFactory::add_field(
        'test_new_field',
        'poocommerce-plugin-name',
        array(
          'type'       => 'text',
          'section'    => 'Section',
          'properties' => array( 'name' => 'test_new_field', 'label' => 'Test New Field' ),
        )
    );
}
add_action( 'init', 'add_product_form_field' );
```
