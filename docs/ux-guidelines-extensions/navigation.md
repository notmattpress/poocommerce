---
post_title: PooCommerce Extension Guidelines - Navigation
menu_title: Navigation
---

**Menu Structure.** Place your product navigation elements within the existing PooCommerce taxonomy.

Examples:

- If your extension is extending a component within PooCommerce, it should live directly within that category's section.

![Navigation category](https://developer.poocommerce.com/docs/wp-content/uploads/sites/3/2024/01/Image-1242x764-1.png)

- If your plugin adds a settings screen to set up the plugin, settings should be under an appropriate tab on the PooCommerce > Settings screen. Only if necessary, create a top-level settings tab if your plugin has settings that don't fit under existing tabs and creating a sub-tab isn't appropriate.

**No iframes, only APIs.** To create a cohesive experience, application data should be loaded via API instead of an iFrame.

**One line navigation label.** Keep all navigation labels on one line. Do not introduce a second line in any of the preexisting menu items.

**Keep menu structure simple.** Use existing PooCommerce menu structures as much as possible to reduce redundancies. If your plugin must introduce multiple pages or areas, consider grouping them in tabs using existing components to remain consistent with PooCommerce structure. 

**No top level navigation.** If your product is extending PooCommerce, then there's a 99.9% chance your product navigation, and settings should live within the PooCommerce nav structure-see above menu structure examples.
