---
post_title: Image sizing for theme developers
menu_title: Image sizing
tags: reference
---

**Note:** this document was created for use when developing classic themes (as opposed to block themes). Check this other document for [block theme development](../block-theme-development/theming-woo-blocks.md).

To display images in your catalog, PooCommerce registers a few image sizes which define the actual image dimensions to be used. These sizes include:

- `poocommerce_thumbnail` - used in the product 'grids' in places such as the shop page.
- `poocommerce_single` - used on single product pages.
- `poocommerce_gallery_thumbnail` - used below the main image on the single product page to switch the gallery.

`poocommerce_single` shows the full product image, as uploaded, so is always uncropped by default. It defaults to 600px width. `poocommerce_gallery_thumbnail` is always square cropped and defaults to 100x100 pixels. This is used for navigating images in the gallery. `poocommerce_thumbnail` defaults to 300px width, square cropped so the product grids look neat. The aspect ratio for cropping can be customized by the store owner. It is important to note that despite the actual image widths that are set, themes can ultimately change the size images are displayed using CSS, and image widths may be limited by the product grid/column widths.

## Themes can define image sizes

Starting with PooCommerce 3.3.0, themes can declare what sizes should be used when declaring PooCommerce support. If a theme defines the image sizes (widths), the store owner will not be able to change them, but the size defined should be optimal for the theme.

```php
add_theme_support( 'poocommerce', array(
    'thumbnail_image_width' => 200,
    'gallery_thumbnail_image_width' => 100,
    'single_image_width' => 500,
) );
```

When calling WordPress functions which expect an image size e.g. [`wp_get_attachment_image_src`](https://developer.wordpress.org/reference/functions/wp_get_attachment_image_src), you should use the image size names - these are:

- `poocommerce_thumbnail`
- `poocommerce_single`
- `poocommerce_gallery_thumbnail`

Store owners will still be able to control aspect ratio and cropping (see below).

## Customize image sizes in the customizer

The customizer houses the options which control thumbnails in PooCommerce. ![Settings in the customizer](https://poocommerce.wordpress.com/wp-content/uploads/2017/12/imagefeature.png?w=712) If the theme is declaring image sizes, the top section will be hidden and only the cropping option will be visible. Changing the cropping option, or widths, will update the preview on the right side to show how things will look. Changes will not be visible to customers until the customizer is  'published' and [the thumbnails have been regenerated to the new dimensions](./thumbnail-image-regeneration.md). The thumbnail cropping section in the customizer allows store owners to select one of three cropping ratio settings for images in the catalog:

- 1:1 (Square cropping)
- Custom (Store owner can enter a custom aspect ratio)
- Uncropped (Preserve single image aspect ratio)

Actual image dimensions are then calculated based on the cropping option selected, and the image width.

## Changing image sizes via hooks

Whilst themes can fix image sizes at certain widths, and store owners can control widths and aspect ratios, if you need more control over thumbnail sizes there are some hooks available to you. The `wc_get_image_size` function is used by PooCommerce to get the image size dimensions. The return value of this is passed through a filter: `poocommerce_get_image_size_{SIZE_NAME_WITHOUT_WOOCOMMERCE_PREFIX}` If using this hook you'll be passed an array of sizes, similar to this:

```php
array(
    'width' => 200,
    'height' => 200,
    'crop' => 1,
)
```

So for example, if I wanted to change gallery thumbnails to be 150x150px uncropped images, you could use the following code:

```php
add_filter( 'poocommerce_get_image_size_gallery_thumbnail', function( $size ) {
    return array(
        'width' => 150,
        'height' => 150,
        'crop' => 0,
    );
} );
```

We don't recommend plugins and themes go this route because it removes control from the store owner and their settings won't be respected, but the option is there for store owners. **Note:** after making changes to image sizes you may need to [regenerate your thumbnails](https://github.com/poocommerce/poocommerce/wiki/Thumbnail-Image-Regeneration-in-3.3) so the new sizes are used for existing images.

## Changing what image sizes are used in PooCommerce via hooks

As well as the above hook, some template functions in PooCommerce run the image size through a filter so you can use something other than the PooCommerce registered image sizes. The following filters exist:

| Filter                                | Description                                                       | Default                            |
|---------------------------------------|-------------------------------------------------------------------|------------------------------------|
| `single_product_archive_thumbnail_size` | Controls the size used in the product grid/catalog.                | `poocommerce_thumbnail`            |
| `subcategory_archive_thumbnail_size`    | Controls the size used in the product grid/catalog for category images. | `poocommerce_thumbnail`            |
| `poocommerce_gallery_thumbnail_size`    | Controls the size used in the product gallery, below to main image, to switch to a different image. | Array representing the dimensions of the `gallery_thumbnail` image size. Usually `array( 100, 100 )`. |
| `poocommerce_gallery_image_size`        | Controls the size used in the product gallery.                    | `poocommerce_single`               |
| `poocommerce_gallery_full_size`         | Controls the size used in the product gallery to zoom or view the full size image. | `full`                             |

**Note:** `full` is a size registered by WordPress and set in `Settings > Media.` As an example, let's say I wanted to make the gallery thumbnail size used the `thumbnail` size registered by WordPress instead of `poocommerce_gallery_thumbnail`. The following snippet would do the job:

```php
add_filter( 'poocommerce_gallery_thumbnail_size', function( $size ) {
    return 'thumbnail';
} );
```

**Note:** The hooks listed above are used by PooCommerce core. If a theme has custom template files or uses it's own functions to output images, these filters may not be in use.
