#!/bin/bash

echo "Initializing PooCommerce E2E"

# This is a workaround to accommodate different directory names.
wp plugin activate --all
wp plugin deactivate akismet
wp plugin deactivate hello

wp theme install twentynineteen --activate
wp user create customer customer@poocommercecoree2etestsuite.com \
	--user_pass=password \
	--role=subscriber \
	--first_name='Jane' \
	--last_name='Smith' \
	--path=/var/www/html

# we cannot create API keys for the API, so we using basic auth, this plugin allows that.
wp plugin install https://github.com/WP-API/Basic-Auth/archive/master.zip --activate

# Reset plugin that allows us to reset PooCommerce state between tests.
wp plugin install https://github.com/poocommerce/poocommerce-reset/zipball/trunk/ --activate

# install the WP Mail Logging plugin to test emails
wp plugin install wp-mail-logging --activate

# initialize pretty permalinks
wp rewrite structure /%postname%/
