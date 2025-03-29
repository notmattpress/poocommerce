# Compatibility Layer - [AbstractTemplateCompatibility.php](https://github.com/poocommerce/poocommerce-blocks/blob/trunk/src/Templates/AbstractTemplateCompatibility.php)

The Compatibility Layer ensures that blockified templates work correctly with extensions that use hooks to extend their behavior. It appends/pre-appends the corresponding hooks to each block. Also, it removes the default callbacks added to those hooks by PooCommerce.

A limitation of the Compatibility Layer is the order of hook execution. Blocks are rendered from the innermost to the outermost, meaning inner blocks are rendered first. This may cause the execution order of hooks to differ from that of the classic template.

The Compatibility Layer is disabled when either of classic template blocks are added on the page:

- `Product (Classic)`,
- `Product Attribute (Classic)`,
- `Product Category (Classic)`,
- `Product Tag (Classic)`,
- `Product's Custom Taxonomy (Classic)`,
- `Product Search Results (Classic)`,
- `Product Grid (Classic)`.

Please note these blocks represent classic templates. As an example, using Single Product block won't disable Compatibility Layer.

Furthermore, it is possible to disable the compatibility layer via the hook: [`poocommerce_disable_compatibility_layer`](https://github.com/poocommerce/poocommerce-blocks/blob/trunk/src/Templates/AbstractTemplateCompatibility.php/#L41-L42).

## Archive Product Templates - [ArchiveProductTemplatesCompatibility](https://github.com/poocommerce/poocommerce-blocks/blob/trunk/src/Templates/ArchiveProductTemplatesCompatibility.php)

The compatibility is built around the Product Collection and Products (Beta) blocks because the loop is the main element of archive templates and hooks are placed inside and around the loop. The Compatibility Layer injects custom attributes for the Product Collection and Products (Beta) blocks that **inherit query from the template** and their inner blocks.

The following table shows where the hooks are injected into the page.


| Hook Name                               | Block Name       | Position |
|-----------------------------------------|------------------|----------|
| poocommerce_before_main_content         | Products         | before   |
| poocommerce_after_main_content          | Products         | after    |
| poocommerce_before_shop_loop_item_title | Product Title    | before   |
| poocommerce_shop_loop_item_title        | Product Title    | after    |
| poocommerce_after_shop_loop_item_title  | Product Title    | before   |
| poocommerce_before_shop_loop_item       | Loop Item        | before   |
| poocommerce_after_shop_loop_item        | Loop Item        | after    |
| poocommerce_before_shop_loop            | Product Template | before   |
| poocommerce_after_shop_loop             | Product Template | after    |
| poocommerce_no_products_found           | No Results       | before   |
| poocommerce_archive_description         | Term Description | before   |

## Single Product Templates - [SingleProductTemplateCompatibility](https://github.com/poocommerce/poocommerce-blocks/blob/c8d82b20f4e4b8a424f1f0ebff80aca6f62588e5/src/Templates/SingleProductTemplateCompatibility.php)

The compatibility is built around the entire page. The classic Single Product Page has a main div with the class `product` that wraps all the elements, which has multiple classes: the style of the elements inside the wrapper is applied via CSS with the selector `.product`. For this reason, the Compatibility Layer wraps inside a div with the class `product` all the blocks related to the Single Product Template that aren’t interrupted by a template part.

The following table shows where the hooks are injected into the page.


| Hook                                      | Block Name                                                                                                                                             | Position |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| poocommerce_before_main_content           | First block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs) | before   |
| poocommerce_after_main_content            | Last block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs)  | after    |
| poocommerce_sidebar                       | Last block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs)  | after    |
| poocommerce_before_single_product         | First block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs) | before   |
| poocommerce_before_single_product_summary | First block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs) | before |
| poocommerce_single_product_summary        | First `core/post-excerpt` or `poocommerce/product-summary` block                                                                                                                         | before   |
| poocommerce_after_single_product          | Last block related to the Single Product Template (Product Image Gallery, Product Details, Add to Cart Form, Product Meta, Product Price, Breadcrumbs)  | after    |
| poocommerce_product_meta_start            | Product Meta                                                                                                                                           | before   |
| poocommerce_product_meta_end              | Product Meta                                                                                                                                           | after    |
| poocommerce_share                         | Product Details                                                                                                                                        | before   |
| poocommerce_after_single_product_summary  | Product Details                                                                                                                                        | before   |
