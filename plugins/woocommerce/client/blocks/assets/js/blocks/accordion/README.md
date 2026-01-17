# Accordion

_Note: This block is a copy of an upstream implementation ( [PR](https://github.com/WordPress/gutenberg/pull/64119) ) Please keep changes to a minimum. This block is namespaced under PooCommerce._

## Accordion Group

A group of headers and associated expandable content. ([Source](../accordion/accordion-group/))

-   **Name:** poocommerce/accordion-group
-   **Experimental:** true
-   **Category:** design
-   **Allowed Blocks:** poocommerce/accordion-item
-   **Supports:** align (full, wide), background (backgroundImage, backgroundSize), color (background, gradient, text), interactivity, layout, shadow, spacing (blockGap, margin, padding), ~~html~~
-   **Attributes:** allowedBlocks, autoclose, iconPosition

## Accordion Header

Accordion header. ([Source](../accordion/inner-blocks/accordion-header))

-   **Name:** poocommerce/accordion-header
-   **Experimental:** true
-   **Category:** design
-   **Parent:** poocommerce/accordion-item
-   **Supports:** anchor, border, color (background, gradient, text), interactivity, layout, shadow, spacing (margin, padding), typography (fontSize, textAlign), ~~align~~
-   **Attributes:** icon, iconPosition, level, levelOptions, openByDefault, textAlignment, title

## Accordion

A single accordion that displays a header and expandable content. ([Source](../accordion/inner-blocks/accordion-item))

-   **Name:** poocommerce/accordion-item
-   **Experimental:** true
-   **Category:** design
-   **Parent:** poocommerce/accordion-group
-   **Allowed Blocks:** poocommerce/accordion-header, poocommerce/accordion-panel
-   **Supports:** align (full, wide), color (background, gradient, text), interactivity, layout, shadow, spacing (blockGap, margin)
-   **Attributes:** openByDefault

## Accordion Panel

Accordion Panel ([Source](../accordion/inner-blocks/accordion-panel))

-   **Name:** poocommerce/accordion-panel
-   **Experimental:** true
-   **Category:** design
-   **Parent:** poocommerce/accordion-item
-   **Supports:** border, color (background, gradient, text), interactivity, layout, shadow, spacing (blockGap, margin, padding), typography (fontSize, lineHeight)
-   **Attributes:** allowedBlocks, isSelected, openByDefault, templateLock
