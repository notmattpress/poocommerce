# poocommerce/product-radio-field block

Radio button field for the product editor.

![Product radio field](https://poocommerce.files.wordpress.com/2023/09/poocommerceproduct-radio-field.png)

## Attributes

### title

-   **Type:** `String`
-   **Required:** `Yes`

### description

-   **Type:** `String`
-   **Required:** `No`

### property

-   **Type:** `String`
-   **Required:** `Yes`

### options

-   **Type:** `Array`
-   **Required:** `Yes`

### disabled

-   **Type:** `Boolean`
-   **Required:** `No`

## Usage

Here's an example of the usage on the "Charge sales tax on" field in the Pricing section:

```php
$product_pricing_section->add_block(
  [
    'id'         => 'product-sale-tax',
    'blockName'  => 'poocommerce/product-radio-field',
    'order'      => 30,
    'attributes' => [
      'title'    => __( 'Charge sales tax on', 'poocommerce' ),
      'property' => 'tax_status',
      'options'  => [
        [
          'label' => __( 'Product and shipping', 'poocommerce' ),
          'value' => 'taxable',
        ],
        [
          'label' => __( 'Only shipping', 'poocommerce' ),
          'value' => 'shipping',
        ],
        [
          'label' => __( "Don't charge tax", 'poocommerce' ),
          'value' => 'none',
        ],
      ],
    ],
  ]
);
```
