---
post_title: Classic theme development handbook
sidebar_label: Classic theme development
---

# Classic theme development handbook

---

**Note:** this document is geared toward the development of classic themes. Check this other document for [block theme development](../block-theme-development/theming-woo-blocks.md).

---

PooCommerce looks great with all WordPress themes as of version 3.3, even if they are not PooCommerce-specific themes and do not formally declare support. Templates render inside the content, and this keeps everything looking natural on your site.

Non-PooCommerce themes, by default, also include:

- Zoom feature enabled - ability to zoom in/out on a product image
- Lightbox feature enabled - product gallery images pop up to examine closer
- Comments enabled, not Reviews - visitors/buyers can leave comments as opposed to product ratings or reviews

If you want more control over the layout of PooCommerce elements or full reviews support your theme will need to integrate with PooCommerce. There are a few different ways you can do this, and they are outlined below.

## Theme Integration

There are three possible ways to integrate PooCommerce with a theme. If you are using PooCommerce 3.2 or below (**strongly discouraged**) you will need to use one of these methods to ensure PooCommerce shop and product pages are rendered correctly in your theme. If you are using a version of PooCommerce 3.3 or above you only need to do a theme integration if the automatic one doesn't meet your needs.

### Using `poocommerce_content()`

This solution allows you to create a new template page within your theme that is used for **all PooCommerce taxonomy and post type displays**. While an easy catch-all solution, it does have a drawback in that this template is used for **all PooCommerce taxonomies** (product categories, etc.) and **post types** (product archives, single product pages). Developers are encouraged to use the hooks instead (see below).

To set up this template page:

1. **Duplicate page.php:** Duplicate your theme's `page.php` file, and name it `poocommerce.php`. This path to the file should follow this pattern: `wp-content/themes/YOURTHEME/poocommerce.php`.
2. **Edit your page (poocommerce.php)**: Open up your newly created `poocommerce.php` in a text editor.
3. **Replace the loop:** Next you need to find the loop (see [The_Loop](https://codex.wordpress.org/The_Loop)). The loop usually starts with code like this:

```php
<?php if ( have_posts() ) :
```

It usually ends with this:

```php
<?php endif; ?>
```

This varies between themes. Once you have found it, **delete it**. In its place, put:

```php
<?php poocommerce_content(); ?>
```

This will make it use **PooCommerce's loop instead**. Save the file. You're done.

**Note:** When creating `poocommerce.php` in your theme's folder, you will not be able to override the `poocommerce/archive-product.php` custom template as `poocommerce.php` has priority over `archive-product.php`. This is intended to prevent display issues.

### Using hooks

The hook method is more involved, but it is also more flexible. This is similar to the method we use when creating themes. It's also the method we use to integrate nicely with WordPress default themes.

Insert a few lines in your theme's `functions.php` file.

First unhook the PooCommerce wrappers:

```php
remove_action( 'poocommerce_before_main_content', 'poocommerce_output_content_wrapper', 10);
remove_action( 'poocommerce_after_main_content', 'poocommerce_output_content_wrapper_end', 10);
```

Then hook in your own functions to display the wrappers your theme requires:

```php
add_action('poocommerce_before_main_content', 'my_theme_wrapper_start', 10);
add_action('poocommerce_after_main_content', 'my_theme_wrapper_end', 10);

function my_theme_wrapper_start() {
    echo '<section id="main">';
}

function my_theme_wrapper_end() {
    echo '</section>';
}
```

Make sure that the markup matches that of your theme. If you're unsure of which classes or IDs to use, take a look at your theme's `page.php` for guidance.

**Whenever possible use the hooks to add or remove content. This method is more robust than overriding the templates.** If you have overridden a template, you have to update the template any time the file changes. If you are using the hooks, you will only have to update if the hooks change, which happens much less frequently.

### Using template overrides

For information about overriding the PooCommerce templates with your own custom templates read the **Template Structure** section below. This method requires more maintenance than the hook-based method, as templates will need to be kept up-to-date with the PooCommerce core templates.

## Declaring PooCommerce Support

If you are using custom PooCommerce template overrides in your theme you need to declare PooCommerce support using the `add_theme_support` function. PooCommerce template overrides are only enabled on themes that declare PooCommerce support. If you do not declare PooCommerce support in your theme, PooCommerce will assume the theme is not designed for PooCommerce compatibility and will use shortcode-based unsupported theme rendering to display the shop.

Declaring PooCommerce support is straightforward and involves adding one function in your theme's `functions.php` file.

### Basic Usage

```php
function mytheme_add_poocommerce_support() {
    add_theme_support( 'poocommerce' );
}

add_action( 'after_setup_theme', 'mytheme_add_poocommerce_support' );
```

Make sure you are using the `after_setup_theme` hook and not the `init` hook. Read more about this in [the documentation for `add_theme_support`](https://developer.wordpress.org/reference/functions/add_theme_support/).

### Usage with Settings

```php
function mytheme_add_poocommerce_support() {
    add_theme_support( 'poocommerce', array(
        'thumbnail_image_width' => 150,
        'single_image_width'    => 300,

        'product_grid'          => array(
            'default_rows'    => 3,
            'min_rows'        => 2,
            'max_rows'        => 8,
            'default_columns' => 4,
            'min_columns'     => 2,
            'max_columns'     => 5,
        ),
    ) );
}

add_action( 'after_setup_theme', 'mytheme_add_poocommerce_support' );
```

These are optional theme settings that you can set when declaring PooCommerce support.

`thumbnail_image_width` and `single_image_width` will set the image sizes for the shop. If these are not declared when adding theme support, the user can set image sizes in the Customizer under the **PooCommerce > Product Images** section.

The `product_grid` settings let theme developers set default, minimum, and maximum column and row settings for the Shop. Users can set the rows and columns in the Customizer under the **PooCommerce > Product Catalog** section.

### Product gallery features (zoom, swipe, lightbox)

The product gallery introduced in 3.0.0 ([read here for more information](https://developer.poocommerce.com/2016/10/19/new-product-gallery-merged-in-to-core-for-2-7/)) uses Flexslider, Photoswipe, and the jQuery Zoom plugin to offer swiping, lightboxes, and other neat features.

In versions `3.0`, `3.1`, and `3.2`, the new gallery is off by default and needs to be enabled using a snippet (below) or by using a compatible theme. This is because it's common for themes to disable the PooCommerce gallery and replace it with their own scripts.

In versions `3.3+`, the gallery is off by default for PooCommerce compatible themes unless they declare support for it (below). 3rd party themes with no PooCommerce support will have the gallery enabled by default.

To enable the gallery in your theme, you can declare support like this:

```php
add_theme_support( 'wc-product-gallery-zoom' );
add_theme_support( 'wc-product-gallery-lightbox' );
add_theme_support( 'wc-product-gallery-slider' );
```

You do not have to support all three parts of the gallery; you can pick and choose features. If a feature is not enabled, the scripts will not be loaded and the gallery code will not execute on product pages.

If gallery features are enabled (e.g., you have a theme that enabled them, or you are running a theme that is not compatible with PooCommerce), you can disable them with `remove_theme_support`:

```php
remove_theme_support( 'wc-product-gallery-zoom' );
remove_theme_support( 'wc-product-gallery-lightbox' );
remove_theme_support( 'wc-product-gallery-slider' );
```

You can disable any parts; you do not need to disable all features.

## Template Structure

PooCommerce template files contain the **markup** and **template structure** for **the frontend and the HTML emails** of your store. If some structural change in HTML is necessary, you should override a template.

When you open these files, you will notice they all contain **hooks** that allow you to add or move content without needing to edit the template files themselves. This method protects against upgrade issues, as the template files can be left completely untouched.

Template files can be found within the `**/poocommerce/templates/**` directory.

### How to Edit Files

Edit files in an **upgrade-safe way** using *overrides*. Copy them into a directory within your theme named `/poocommerce`, keeping the same file structure but removing the `/templates/` subdirectory.

Example: To override the admin order notification, copy `wp-content/plugins/poocommerce/templates/emails/admin-new-order.php` to `wp-content/themes/yourtheme/poocommerce/emails/admin-new-order.php`.

The copied file will now override the PooCommerce default template file.

**Warning:** Do not delete any PooCommerce hooks when overriding a template. This would prevent plugins hooking in to add content.

**Warning:** Do not edit these files within the core plugin itselfe as they are overwritten during the upgrade process and any customizations will be lost.

## CSS Structure

Inside the `assets/css/` directory, you will find the stylesheets responsible for the default PooCommerce layout styles.

Files to look for are `poocommerce.scss` and `poocommerce.css`.

- `poocommerce.css` is the minified stylesheet - it's the CSS without any of the spaces, indents, etc. This makes the file very fast to load. This file is referenced by the plugin and declares all PooCommerce styles.
- `poocommerce.scss` is not directly used by the plugin, but by the team developing PooCommerce. We use [SASS](http://sass-lang.com/) in this file to generate the CSS in the first file.

The CSS is written to make the default layout compatible with as many themes as possible by using percentage-based widths for all layout styles. It is, however, likely that you'll want to make your own adjustments.

### Modifications

To avoid upgrade issues, we advise not editing these files but rather using them as a point of reference.

If you just want to make changes, we recommend adding some overriding styles to your theme stylesheet. For example, add the following to your theme stylesheet to make PooCommerce buttons black instead of the default color:

```css
a.button, 
button.button, 
input.button, 
#review_form #submit {
    background:black; 
}
```

PooCommerce also outputs the theme name (plus other useful information, such as which type of page is being viewed) as a class on the body tag, which can be useful for overriding styles.

### Disabling PooCommerce styles

If you plan to make major changes, or create a theme from scratch, then you may prefer your theme not reference the PooCommerce stylesheet at all. You can tell PooCommerce to not use the default `poocommerce.css` by adding the following code to your theme's `functions.php` file:

```php
add_filter( 'poocommerce_enqueue_styles', '__return_false' );
```

With this definition in place, your theme will no longer use the PooCommerce stylesheet and give you a blank canvas upon which you can build your own desired layout and styles.

Styling a PooCommerce theme from scratch for the first time is no easy task. There are many different pages and elements that need to be styled, and if you're new to PooCommerce, you are probably not familiar with many of them. A non-exhaustive list of PooCommerce elements to style can be found in this [PooCommerce Theme Testing Checklist](https://developer.files.wordpress.com/2017/12/poocommerce-theme-testing-checklist.pdf).
