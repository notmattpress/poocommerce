#!/bin/bash

echo "Initializing PooCommerce E2E"

wp-env run tests-cli wp plugin activate poocommerce

wp-env run tests-cli wp user create customer customer@poocommercecoree2etestsuite.com --user_pass=password --role=subscriber --path=/var/www/html

# Installing and activating the WordPress Importer plugin to import sample products"
wp-env run tests-cli wp plugin install wordpress-importer --activate

# Adding basic PooCommerce settings"
wp-env run tests-cli wp option set poocommerce_store_address 'Example Address Line 1'
wp-env run tests-cli wp option set poocommerce_store_address_2 'Example Address Line 2'
wp-env run tests-cli wp option set poocommerce_store_city 'Example City'
wp-env run tests-cli wp option set poocommerce_default_country 'US:CA'
wp-env run tests-cli wp option set poocommerce_store_postcode '94110'
wp-env run tests-cli wp option set poocommerce_currency 'USD'
wp-env run tests-cli wp option set poocommerce_product_type 'both'
wp-env run tests-cli wp option set poocommerce_allow_tracking 'no'
wp-env run tests-cli wp option set poocommerce_enable_checkout_login_reminder 'yes'
wp-env run tests-cli wp option set --format=json poocommerce_cod_settings '{"enabled":"yes"}'
wp-env run tests-cli wp option set poocommerce_coming_soon 'no'

#  PooCommerce shop pages
wp-env run tests-cli wp wc --user=admin tool run install_pages

# Importing PooCommerce sample products"
wp-env run tests-cli wp import wp-content/plugins/poocommerce/sample-data/sample_products.xml --authors=skip

# install Storefront
wp-env run tests-cli wp theme install storefront --activate

echo "Success! Your E2E Test Environment is now ready."
