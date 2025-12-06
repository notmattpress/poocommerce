---
post_title: Email editor integration
sidebar_label: Email editor integration
---

# PooCommerce email editor integration guide

This guide shows how extensions can add custom email notifications that integrate with the PooCommerce Email Editor.  
**Note:** The PooCommerce Email Editor is currently in alpha. To enable it, go to **PooCommerce > Settings > Advanced > Features** and enable **Block Email Editor (alpha)**.

## Quick start

1. **Extend `WC_Email`** – Create a custom email class for your notification by extending the core PooCommerce email class.
2. **Register with `poocommerce_email_classes`** – Add your new email class to PooCommerce so it appears in the admin email settings.
3. **Register the email with the block editor** – Register your email ID with the `poocommerce_transactional_emails_for_block_editor` filter to enable block editor support.
4. **Create a block template** – Design a block-based template to ensure your email works seamlessly with the PooCommerce Email Editor.
5. **Set up triggers** – Define when and under what conditions your custom email should be sent (for example, after a specific user action or event).

## 1. Create email class

Extend `WC_Email` and implement the required methods:

```php
class YourPlugin_Custom_Email extends WC_Email {

    public function __construct() {
        $this->id             = 'your_plugin_custom_email';
        $this->title          = __( 'Custom Email', 'your-plugin' );
        $this->customer_email = true;
        $this->email_group    = 'your-plugin';

        $this->template_html  = 'emails/your-custom-email.php';
        $this->template_plain = 'emails/plain/your-custom-email.php';
        $this->template_base  = plugin_dir_path( __FILE__ ) . 'templates/';

        parent::__construct();
    }

    public function get_default_subject() {
        return __( 'Your custom email subject', 'your-plugin' );
    }

    public function get_default_heading() {
        return __( 'Your custom email heading', 'your-plugin' );
    }

    public function trigger( $order_id ) {
        $this->setup_locale();

        if ( $order_id ) {
            $order = wc_get_order( $order_id );
            $this->object = $order;
            $this->recipient = $order->get_billing_email();
        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }

    public function get_content_html() {
        return wc_get_template_html( $this->template_html, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => false,
            'email'         => $this,
        ) );
    }

    public function get_content_plain() {
        return wc_get_template_html( $this->template_plain, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => true,
            'email'         => $this,
        ) );
    }
}
```

## 2. Register email

Add your email to PooCommerce:

```php
// Add the custom email class to the PooCommerce Emails.
function your_plugin_add_email_class( $email_classes ) {
    $email_classes['YourPlugin_Custom_Email'] = new YourPlugin_Custom_Email();
    return $email_classes;
}
add_filter( 'poocommerce_email_classes', 'your_plugin_add_email_class' );

// Add the custom email group. This is only necessary if email_group is not set on the WC_Email class.
function your_plugin_add_email_group( $email_groups ) {
    $email_groups['your-plugin'] = __( 'Your Plugin', 'your-plugin' );
    return $email_groups;
}
add_filter( 'poocommerce_email_groups', 'your_plugin_add_email_group' );
```

## 3. Register the email with the block editor

Third-party extensions need to explicitly opt their emails into block editor support. This is done by registering your email ID with the `poocommerce_transactional_emails_for_block_editor` filter:

```php
/**
 * Register custom transactional emails for the block editor.
 *
 * @param array $emails Array of email IDs.
 * @return array Modified array of email IDs.
 */
function your_plugin_register_transactional_emails_for_block_editor( $emails ) {
    $emails[] = 'your_plugin_custom_email';
    return $emails;
}
add_filter( 'poocommerce_transactional_emails_for_block_editor', 'your_plugin_register_transactional_emails_for_block_editor' );
```

**Important:** Without this step, your email may still appear in the email list, but it will not use the email editor, as explicit opt-in is required from third-party developers.

**Note:** For third-party extensions, PooCommerce will not create an email post unless you opt-in using the `poocommerce_transactional_emails_for_block_editor` filter.

**Development tip:** PooCommerce caches email post-generation with a transient. When testing or developing, delete the transient `wc_email_editor_initial_templates_generated` to force post-generation.

## 4. Create the initial block template

Create `templates/emails/block/your-custom-email.php`:

**Template base property:** Make sure to set the `$template_base` property in your email class constructor to point to your plugin's template directory. This allows PooCommerce to properly locate and load your block template files. The block template filename is expected to match the plain template, but using the `block` directory instead of `plain`.

```php
<?php
use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;
defined( 'ABSPATH' ) || exit;
?>

<!-- wp:heading -->
<h2 class="wp-block-heading"><?php printf( esc_html__( 'Hello %s!', 'your-plugin' ), '<!--[poocommerce/customer-first-name]-->' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php printf( esc_html__( 'Thank you for your order #%s.', 'your-plugin' ), '<!--[poocommerce/order-number]-->' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"><?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?></div>
<!-- /wp:poocommerce/email-content -->
```

Pro tip: If you use a custom path for your email templates, set the block template path using the `template_block` property on the email class.

**Email content placeholder:**

The `BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER` is a special placeholder that gets replaced with the main email content when the email is rendered. This placeholder is essential for integrating with PooCommerce's email system and allows the email editor to inject the core email content (like order details, customer information, etc.) into your custom template.

By default, PooCommerce uses the [general block email template](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/templates/emails/block/general-block-email.php) to generate the content that replaces this placeholder. When PooCommerce processes your email template, it replaces this placeholder with the appropriate email content based on the email type and context.

If your email needs to use different content, you have two options:

**Using custom block content template:**

1. **Set a custom template**: Set the `$template_block_content` property in your email class constructor to point to a custom template for the block content:

    ```php
    $this->template_block_content = 'emails/block/custom-content.php';
    ```

2. **Implement custom logic**: Implement the `get_block_editor_email_template_content` method in your email class to provide custom logic for generating the content:

    ```php
    public function get_block_editor_email_template_content() {
        return '<!-- wp:paragraph -->
    <p>Your custom block template content here</p>
    <!-- /wp:paragraph -->';
    }
    ```

**Using action hook:**
You can use the action hook `poocommerce_email_general_block_email` to execute additional actions within the content template. 

## 5. Set Up Triggers

**Set up when your email should be sent** by hooking into WordPress actions. You can trigger emails on PooCommerce events or your own custom actions:

```php
function your_plugin_trigger_custom_email( $order_id ) {
    $emails = WC()->mailer()->get_emails();
    $email  = $emails['YourPlugin_Custom_Email'];

    $email->trigger( $order_id );
}

// Trigger on PooCommerce order completion
add_action( 'poocommerce_order_status_completed', 'your_plugin_trigger_custom_email' );

// Trigger on your custom plugin action
add_action( 'your_plugin_custom_action', 'your_plugin_trigger_custom_email' );
```

**Common PooCommerce hooks you can use:**

-   `poocommerce_order_status_completed` - When order is completed
-   `poocommerce_order_status_processing` - When order is processing
-   `poocommerce_new_order` - When new order is created
-   `poocommerce_customer_created` - When new customer registers

## Personalization tags

**Personalization tags** allow you to insert dynamic content into your emails. They appear as `<!--[tag-name]-->` in your templates and get replaced with actual values when the email is sent.

### Built-in tags

PooCommerce provides many built-in personalization tags organized by category:

#### Customer tags

-   `<!--[poocommerce/customer-email]-->` - Customer's email address
-   `<!--[poocommerce/customer-first-name]-->` - Customer's first name
-   `<!--[poocommerce/customer-last-name]-->` - Customer's last name
-   `<!--[poocommerce/customer-full-name]-->` - Customer's full name
-   `<!--[poocommerce/customer-username]-->` - Customer's username
-   `<!--[poocommerce/customer-country]-->` - Customer's country

#### Order tags

-   `<!--[poocommerce/order-number]-->` - Order number
-   `<!--[poocommerce/order-date]-->` - Order date (supports format parameter)
-   `<!--[poocommerce/order-items]-->` - List of order items
-   `<!--[poocommerce/order-subtotal]-->` - Order subtotal
-   `<!--[poocommerce/order-tax]-->` - Order tax amount
-   `<!--[poocommerce/order-discount]-->` - Order discount amount
-   `<!--[poocommerce/order-shipping]-->` - Order shipping cost
-   `<!--[poocommerce/order-total]-->` - Order total amount
-   `<!--[poocommerce/order-payment-method]-->` - Payment method used
-   `<!--[poocommerce/order-payment-url]-->` - Payment URL for order
-   `<!--[poocommerce/order-transaction-id]-->` - Transaction ID
-   `<!--[poocommerce/order-shipping-method]-->` - Shipping method used
-   `<!--[poocommerce/order-shipping-address]-->` - Formatted shipping address
-   `<!--[poocommerce/order-billing-address]-->` - Formatted billing address
-   `<!--[poocommerce/order-view-url]-->` - Customer order view URL
-   `<!--[poocommerce/order-admin-url]-->` - Admin order edit URL
-   `<!--[poocommerce/order-custom-field]-->` - Custom order field (requires key parameter)

#### Site tags

-   `<!--[poocommerce/site-title]-->` - Site title
-   `<!--[poocommerce/site-homepage-url]-->` - Homepage URL

#### Store tags

-   `<!--[poocommerce/store-email]-->` - Store email address
-   `<!--[poocommerce/store-url]-->` - Store URL
-   `<!--[poocommerce/store-name]-->` - Store name
-   `<!--[poocommerce/store-address]-->` - Store address
-   `<!--[poocommerce/my-account-url]-->` - My Account page URL
-   `<!--[poocommerce/admin-order-note]-->` - Admin order note

### Custom personalization tags

**Create your own tags** for plugin-specific data using the proper PooCommerce hook:

```php
/**
 * Register custom personalization tags for the email editor.
 *
 * @param \Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry $registry The registry.
 * @return \Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry
 */
function your_plugin_register_personalization_tags( $registry ) {
    // Register custom field tag
    $custom_field_tag = new \Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag(
        // Display name in editor
        __( 'Custom Field', 'your-plugin' ),
        // Token (unique identifier)
        'your-plugin/custom-field',
        // Category for grouping
        __( 'Your Plugin Group', 'your-plugin' ),
        // Callback function
        'your_plugin_get_custom_field_value',
        // Attributes (optional)
        array(),
        // Value to insert (optional - defaults to token)
        null,
        // Post types this tag works with
        array( 'woo_email' )
    );
    $registry->register( $custom_field_tag );

    return $registry;
}

// Callback function that returns the custom field value
function your_plugin_get_custom_field_value( $context, $args = array() ) {
    $order_id = $context['order']->get_id() ?? 0;
    return get_post_meta( $order_id, '_custom_field', true );
}

// Register with the proper PooCommerce hook
add_filter( 'poocommerce_email_editor_register_personalization_tags', 'your_plugin_register_personalization_tags' );
```

**Usage in templates:** Use `<!--[your-plugin/custom-field]-->` in your block template, and it will be replaced with the value returned by your callback function.

To learn more about personalization tags, please see the [personalization tags documentation](https://github.com/poocommerce/poocommerce/blob/trunk/packages/php/email-editor/docs/personalization-tags.md) in the `poocommerce/email-editor` package.

## Complete example

Below is an example of a loyalty program welcome email implementation:

**Email Class:**

```php
class YourPlugin_Loyalty_Welcome_Email extends WC_Email {
    public function __construct() {
        $this->id             = 'loyalty_welcome_email';
        $this->title          = __( 'Loyalty Welcome Email', 'your-plugin' );
        $this->customer_email = true;
        $this->email_group    = 'loyalty';

        $this->template_html  = 'emails/loyalty-welcome.php';
        $this->template_plain = 'emails/plain/loyalty-welcome.php';
        $this->template_block = 'emails/block/loyalty-welcome.php';
        $this->template_base  = plugin_dir_path( __FILE__ ) . 'templates/';

        parent::__construct();
    }

    public function get_default_subject() {
        return __( 'Welcome to our Loyalty Program!', 'your-plugin' );
    }

    public function trigger( $customer_id, $points_earned = 0 ) {
        $this->setup_locale();
        $customer = new WC_Customer( $customer_id );
        $this->object = $customer;
        $this->recipient = $customer->get_email();

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }
        $this->restore_locale();
    }

    public function get_content_html() {
        return wc_get_template_html( $this->template_html, array(
            'customer'       => $this->object,
            'email_heading'  => $this->get_heading(),
            'sent_to_admin'  => false,
            'plain_text'     => false,
            'email'          => $this,
        ) );
    }

    public function get_content_plain() {
        return wc_get_template_html( $this->template_plain, array(
            'customer'       => $this->object,
            'email_heading'  => $this->get_heading(),
            'sent_to_admin'  => false,
            'plain_text'     => true,
            'email'          => $this,
        ) );
    }
}
```

**Block Email:**

```php
<!-- wp:heading -->
<h2 class="wp-block-heading"><?php printf( esc_html__( 'Welcome %s!', 'your-plugin' ), '<!--[poocommerce/customer-first-name]-->' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'Thank you for joining our loyalty program!', 'your-plugin' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:poocommerce/email-content {"lock":{"move":false,"remove":true}} -->
<div class="wp-block-poocommerce-email-content"><?php echo esc_html( BlockEmailRenderer::WOO_EMAIL_CONTENT_PLACEHOLDER ); ?></div>
<!-- /wp:poocommerce/email-content -->
```

**Registration and Setup:**

This code ties everything together - registering the email class, template, and trigger:

```php
// Add the custom email class to the PooCommerce Emails.
add_filter( 'poocommerce_email_classes', function( $classes ) {
    $classes['YourPlugin_Loyalty_Welcome_Email'] = new YourPlugin_Loyalty_Welcome_Email();
    return $classes;
} );

// Add the custom email group.
add_filter( 'poocommerce_email_groups', function( $email_groups ) {
    $email_groups['loyalty'] = __( 'Loyalty Program', 'your-plugin' );
    return $email_groups;
} );

// Register the email with the block editor.
add_filter( 'poocommerce_transactional_emails_for_block_editor', function( $emails ) {
    $emails[] = 'loyalty_welcome_email';
    return $emails;
} );

// Set up trigger - when to send the email
add_action( 'your_plugin_customer_joined_loyalty', function( $customer_id, $points_earned ) {
    $emails = WC()->mailer()->get_emails();
    $email  = $emails['YourPlugin_Loyalty_Welcome_Email'];

    $email->trigger( $customer_id, $points_earned );
}, 10, 2 );
```

**How it works:**

1. **Email registration** makes your email appear in **PooCommerce > Settings > Emails**
2. **Block editor registration** enables your email to work with the PooCommerce Email Editor
3. **Template registration** allows you to register additional email templates for use and editing in the block editor
4. **Trigger setup** automatically sends the email when a customer joins your loyalty program

## Best practices

-   **Sanitize inputs and escape outputs:** Always validate and sanitize any data used in your email logic, and escape outputs in your templates to prevent security issues and display problems.
-   **Test across email clients:** Email layouts can look different in various clients. Tools like Litmus or Email on Acid can help with testing your emails in popular clients (such as Gmail, Outlook, and Apple Mail) to ensure they look as intended.
-   **Use efficient queries and cache data:** When fetching data for your emails, use optimized queries and cache results if possible to avoid slowing down your site.
-   **Follow WordPress coding standards:** Write your code according to WordPress standards for better readability and compatibility.
-   **Include proper error handling:** Add checks and error handling so that issues (like missing data or failed sends) are caught and can be debugged easily.

## Troubleshooting

-   **Email not in admin?**
    Double-check that your email class is registered with the `poocommerce_email_classes` filter and that the class name is correct.
-   **Email not using the block template or email editor?**
    Ensure you have registered your email ID with the `poocommerce_transactional_emails_for_block_editor` filter.
-   **Template not loading?**
    Make sure the template file path is correct and that you have registered it with the email editor.
-   **Tags not working?**
    Confirm that your personalization tag callbacks are registered and returning the expected values.
-   **Email not sending?**
    Check that the email is enabled in PooCommerce settings and that your trigger action is firing as expected.

---

Your custom email will now be available in **PooCommerce > Settings > Emails** and can be edited using the block editor.
