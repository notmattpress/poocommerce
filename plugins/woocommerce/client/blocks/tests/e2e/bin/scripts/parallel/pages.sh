#!/usr/bin/env bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../../pages && pwd)"

post_id=$(wp post create \
	--porcelain \
	--menu_order=1 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Shop' \
)
wp option update poocommerce_shop_page_id $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=2 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Cart' \
	${script_dir}/cart.html
)
wp option update poocommerce_cart_page_id $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=3 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Checkout' \
	${script_dir}/checkout.html
)
wp option update poocommerce_checkout_page_id $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=4 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='My Account' \
	${script_dir}/my-account.html
)
wp option update poocommerce_myaccount_page_id $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=5 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Terms')
wp option update poocommerce_terms_page_id $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=6 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Privacy'
)
wp option update wp_page_for_privacy_policy $post_id

post_id=$(wp post create \
	--porcelain \
	--menu_order=7 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Mini Cart' \
	${script_dir}/mini-cart.html
)

post_id=$(wp post create \
	--porcelain \
	--menu_order=8 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Cart Shortcode' \
	${script_dir}/cart-shortcode.html
)

post_id=$(wp post create \
	--porcelain \
	--menu_order=8 \
	--post_type=page \
	--post_status=publish \
	--post_author=1 \
	--post_title='Checkout Shortcode' \
	${script_dir}/checkout-shortcode.html
)

# Create renaming PooCommerce pages using tool
wp wc tool run install_pages --user=1
