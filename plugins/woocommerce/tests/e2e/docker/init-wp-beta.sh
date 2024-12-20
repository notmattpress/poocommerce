#!/bin/bash

echo "Initializing PooCommerce E2E"

wp plugin activate poocommerce
wp theme install twentynineteen --activate
wp user create customer customer@poocommercecoree2etestsuite.com --user_pass=password --role=customer --path=/var/www/html

# we cannot create API keys for the API, so we using basic auth, this plugin allows that.
wp plugin install https://github.com/WP-API/Basic-Auth/archive/master.zip --activate

# install the WP Mail Logging plugin to test emails
wp plugin install wp-mail-logging --activate

# initialize pretty permalinks
wp rewrite structure /%postname%/

echo "Updating to WordPress Nightly Point Release"
wp core update https://wordpress.org/nightly-builds/wordpress-latest.zip

echo "Updating the database"
wp core update-db
