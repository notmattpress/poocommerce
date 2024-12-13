#!/bin/bash

echo "Initializing PooCommerce E2E"

wp plugin activate poocommerce

wp user create customer customer@poocommercecoree2etestsuite.com --user_pass=password --role=subscriber --path=/var/www/html

# we cannot create API keys for the API, so we using basic auth, this plugin allows that.
wp plugin install https://github.com/WP-API/Basic-Auth/archive/master.zip --activate

# update permalinks to `pretty` to make it easier for testing APIs with k6
wp option update permalink_structure '/%postname%'

# install the WP Mail Logging plugin to test emails
wp plugin install wp-mail-logging --activate

# Installing and activating the WordPress Importer plugin to import sample products"
wp plugin install wordpress-importer --activate

# Adding basic PooCommerce settings"
wp option set poocommerce_store_address "Example Address Line 1"
wp option set poocommerce_store_address_2 "Example Address Line 2"
wp option set poocommerce_store_city "Example City"
wp option set poocommerce_default_country "US:CA"
wp option set poocommerce_store_postcode "94110"
wp option set poocommerce_currency "USD"
wp option set poocommerce_product_type "both"
wp option set poocommerce_allow_tracking "no"
wp option set poocommerce_enable_checkout_login_reminder "yes"
wp option set --format=json poocommerce_cod_settings '{"enabled":"yes"}'

#  PooCommerce shop pages
wp wc --user=admin tool run install_pages

# Importing PooCommerce sample products"
wp import wp-content/plugins/poocommerce/sample-data/sample_products.xml --authors=skip

# install Storefront
wp theme install storefront --activate

echo "Success! Your E2E Test Environment is now ready."
