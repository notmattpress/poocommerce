# PooCommerce Admin Page Controller

Pages rendered with React and pages that include the PooCommerce Admin header (containing the Activity Panel) need to be registered with the PooCommerce Admin Page Controller.

This is the API you will use to add your own React-powered page, or to include the PooCommerce Admin header on your plugin pages.

## Connecting a PHP-powered Page

To show the PooCommerce Admin header on existing PHP-powered admin pages (most plugin pages), use the `wc_admin_connect_page()` function.

Connecting pages uses five parameters to `wc_admin_connect_page()`:

-   `id` - Identifies the page with the controller. Required.
-   `parent` - Denotes the page as a child of `parent`. Used for breadcrumbs. Optional.
-   `screen_id` - Corresponds to [`PageController::get_current_screen_id()`](../includes/page-controller/class-wc-admin-page-controller.php#L219) to determine the current page. Required.
-   `title` - Page title. Used to build breadcrumbs. String or array of breadcrumb pieces. Required.
-   `path` - Page path (relative). Used for linking breadcrumb pieces when this page is a `parent`. Optional.

### Examples

```php
// PooCommerce > Settings > General (default tab).
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-settings',
		'screen_id' => 'poocommerce_page_wc-settings-general',
		'title'     => array(
			__( 'Settings', 'poocommerce' ),
			__( 'General', 'poocommerce' ),
		),
		'path'      => add_query_arg( 'page', 'wc-settings', 'admin.php' ),
	)
);
```

The `PooCommerce > Settings > General` example shows how to set up multiple breadcrumb pieces for a page. When building the breadcrumbs, PooCommerce will attach a link to `path` to the first piece in the `title` array. All subsequent pieces are plain text (not linked).

```php
// PooCommerce > Settings > Payments.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-settings-payments',
		'parent'    => 'poocommerce-settings',
		'screen_id' => 'poocommerce_page_wc-settings-checkout',
		'title'     => __( 'Payments', 'poocommerce' ),
		'path'      => add_query_arg(
			array(
				'page' => 'wc-settings',
				'tab'  => 'checkout',
			),
			'admin.php'
		),
	)
);

// PooCommerce > Orders.
wc_admin_connect_page(
	array(
		'id'        => 'poocommerce-orders',
		'screen_id' => 'edit-shop_order',
		'title'     => __( 'Orders', 'poocommerce' ),
		'path'      => add_query_arg( 'post_type', 'shop_order', 'edit.php' ),
	)
);
```

## Determining Screen ID

PooCommerce Admin implements it's own version of `get_current_screen()` to allow for more precise identification of admin pages.

Some screen ID formats that the function will generate are:

-   `{$current_screen->action}-{$current_screen->action}-tab-section`
-   `{$current_screen->action}-{$current_screen->action}-tab`
-   `{$current_screen->action}-{$current_screen->action}` if no tab is present
-   `{$current_screen->action}` if no action or tab is present

PooCommerce Admin can recognize PooCommerce pages that have both tabs and sub sections. For example, `poocommerce_page_wc-settings-products-inventory` is the `PooCommerce > Settings > Products > Inventory` page.

If your plugin adds new pages with tabs and sub sections, use the `wc_admin_pages_with_tabs` and `wc_admin_page_tab_sections` filters to have PooCommerce Admin generate accurate screen IDs for them.

You can also use the `wc_admin_current_screen_id` filter to make any changes necessary to the behavior.

### Registering a React-powered Page

Registering a React-powered page is similar to connecting a PHP page, but with some key differences. Registering pages will automatically create WordPress menu items for them, with the appropriate hierarchy based on `parent`.

Register pages with `wc_admin_register_page()` using these parameters:

-   `id` - Identifies the page with the controller. Required.
-   `parent` - Denotes the page as a child of `parent`. Used for breadcrumbs. Optional.
-   `title` - Page title. Used to build breadcrumbs. String or array of breadcrumb pieces. Required.
-   `path` - Page path (relative to `#wc-admin`). Used for identifying this page and for linking breadcrumb pieces when this page is a `parent`. Required.
-   `capability` - User capability needed to access this page. Optional (defaults to `manage_options`).
-   `icon` - Dashicons helper class or base64-encoded SVG. Include the entire dashicon class name, ie `dashicons-*`. This is optional and won't be included in WC Navigation.
-   `position` - Menu item position for parent pages. Optional. See: `add_menu_page()`.

### Example - Adding a New Analytics Report

Add our new report using the appropriate filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter( 'poocommerce_admin_reports_list', 'my-namespace', ( reports ) => {
	reports.push( {
		report: 'example',
		title: __( 'Example', 'my-textdomain' ),
		component: ExampleReportComponent,
	} );

	return reports;
} );
```

Register the report page with the controller:

```php
function add_report_menu_item( $report_pages ) {
	$report_pages[] = array(
		'id'     => 'example-analytics-report',
		'title'  => __( 'Example', 'my-textdomain' ),
		'parent' => 'poocommerce-analytics',
		'path'   => '/analytics/example',
	);

	return $report_pages;
}
add_filter( 'poocommerce_admin_report_menu_items', 'add_report_menu_item' );
```

### Example - Adding a New PooCommerce Admin Page

Alternatively, register a regular page with the controller.

```php
function add_extension_register_page() {
    if ( ! function_exists( 'wc_admin_register_page' ) ) {
        return;
	}

    wc_admin_register_page( array(
		'id'       => 'my-example-page',
		'title'    => __( 'My Example Page', 'my-textdomain' ),
		'parent'   => 'poocommerce',
		'path'     => '/example',
	) );
}

add_action( 'admin_menu', 'add_extension_register_page' );
```

Supply a React component on the client side.

```javascript
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const MyExamplePage = () => <h1>My Example Extension</h1>;

addFilter( 'poocommerce_admin_pages_list', 'my-namespace', ( pages ) => {
	pages.push( {
		container: MyExamplePage,
		path: '/example',
		breadcrumbs: [ __( 'My Example Page', 'my-textdomain' ) ],
		navArgs: {
			id: 'my-example-page',
		},
	} );

	return pages;
} );
```

## Further Reading

-   Check out the [`PageController`](../poocommerce/src/Admin/PageController.php) class.
-   See how we're [connecting existing PooCommerce pages](../poocommerce/includes/react-admin/page-controller-functions.php).
-   See how we're [registering Analytics Reports](../poocommerce/src/Internal/Admin/Analytics.php).
