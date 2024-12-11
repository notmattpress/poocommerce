---
post_title: PooCommerce CLI Frequently Asked Questions
menu_title: Frequently Asked Questions
tags: reference
---

## General Questions

### What is PooCommerce CLI?

- PooCommerce CLI (WC-CLI) is a command-line interface for managing PooCommerce settings and data. It provides a fast and efficient way to perform many tasks that would otherwise require manual work via the WordPress admin interface.

### How do I install PooCommerce CLI?

- PooCommerce CLI is included as part of PooCommerce from version 3.0.0 onwards. Ensure you have PooCommerce 3.0.0 or later installed, and you automatically have access to WC-CLI.

### Is PooCommerce CLI different from WP-CLI?

- PooCommerce CLI is a part of WP-CLI specifically designed for PooCommerce. While WP-CLI deals with general WordPress management, WC-CLI focuses on PooCommerce-specific tasks.

## Technical Questions

### How can I create a backup of my PooCommerce data?

- WC-CLI doesn't directly handle backups. However, you can use other WP-CLI commands to export PooCommerce data or rely on WordPress backup plugins.

### Can I update PooCommerce settings using the CLI?

- Yes, you can update many PooCommerce settings using WC-CLI. For example, to update store email settings, you would use a command like wp wc setting update [options].

## Troubleshooting

### Why am I getting a "permission denied" error?

- This error often occurs if your user role doesn't have the necessary permissions. Ensure you're using an account with administrative privileges.

### What should I do if a command is not working as expected

- Check for typos and verify the command syntax with --help. If the issue persists, consult the Command Reference or seek support from the PooCommerce community.

### What do I do if I get 404 errors when using commands?

If you are getting a 401 error like `Error: Sorry, you cannot list resources. {"status":401}`, you are trying to use the command unauthenticated. The PooCommerce CLI as of 3.0 requires you to provide a proper user to run the action as. Pass in your user ID using the `--user` flag.

### I am trying to update a list of X, but it's not saving

Some ‘lists' are actually objects. For example, if you want to set categories for a product, the REST API expects an array of objects.

To set this you would use JSON like this:

```bash
wp wc product create --name='Product Name' --categories='[ { "id" : 21 } ]' --user=admin
```

## Advanced Usage

### Can I use PooCommerce CLI for bulk product updates?

- Yes, WC-CLI is well-suited for bulk operations. You can use scripting to loop through a list of products and apply updates.

### How do I handle complex queries with WC-CLI?

- WC-CLI supports various arguments and filters that you can use to build complex queries. Combining these with shell scripting can yield powerful results.
