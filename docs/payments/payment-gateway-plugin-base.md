---
post_title: PooCommerce payment gateway plugin base
tags: code-snippet
---

This code can be used as a base to create your own simple custom payment gateway for PooCommerce. If not used in a custom plugin, you need to add this code to your child theme's functions.php file or via a plugin that allows custom functions to be added, such as the [Code snippets](https://wordpress.org/plugins/code-snippets/) plugin. Please don't add custom code directly to your parent theme's functions.php file as this will be wiped entirely when you update the theme.


```php
<?php
/*
Plugin Name: PooCommerce <enter name> Gateway
Plugin URI: https://woothemes.com/poocommerce
Description: Extends PooCommerce with an <enter name> gateway.
Version: 1.0
Author: WooThemes
Author URI: https://woothemes.com/
	Copyright: © 2009-2011 WooThemes.
	License: GNU General Public License v3.0
	License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/
add_action('plugins_loaded', 'poocommerce_gateway_name_init', 0);
function poocommerce_gateway_name_init() {
	if ( !class_exists( 'WC_Payment_Gateway' ) ) return;
	/**
 	 * Localisation
	 */
	load_plugin_textdomain('wc-gateway-name', false, dirname( plugin_basename( __FILE__ ) ) . '/languages');
    
	/**
 	 * Gateway class
 	 */
	class WC_Gateway_Name extends WC_Payment_Gateway {
	
		// Go wild in here
	}
	
	/**
 	* Add the Gateway to PooCommerce
 	**/
	function poocommerce_add_gateway_name_gateway($methods) {
		$methods[] = 'WC_Gateway_Name';
		return $methods;
	}
	
	add_filter('poocommerce_payment_gateways', 'poocommerce_add_gateway_name_gateway' );
}
```
