<?php
/**
 * Gets a list of fallback methods if remote fetching is disabled.
 */

namespace Automattic\PooCommerce\Admin\Features\MarketingRecommendations;

defined( 'ABSPATH' ) || exit;

/**
 * Default Marketing Recommendations
 */
class DefaultMarketingRecommendations {
	/**
	 * Get default specs.
	 *
	 * @return array Default specs.
	 */
	public static function get_all() {
		// Icon directory URL.
		$icon_dir_url = WC_ADMIN_IMAGES_FOLDER_URL . '/marketing';

		$utm_string = '?utm_source=marketingtab&utm_medium=product&utm_campaign=wcaddons';

		// Categories. Note that these are keys used in code, not texts to be displayed in the UI.
		$marketing = 'marketing';
		$coupons   = 'coupons';

		// Subcategories.
		$sales_channels = array(
			'slug' => 'sales-channels',
			'name' => __( 'Sales channels', 'poocommerce' ),
		);
		$email          = array(
			'slug' => 'email',
			'name' => __( 'Email', 'poocommerce' ),
		);
		$automations    = array(
			'slug' => 'automations',
			'name' => __( 'Automations', 'poocommerce' ),
		);
		$conversion     = array(
			'slug' => 'conversion',
			'name' => __( 'Conversion', 'poocommerce' ),
		);
		$crm            = array(
			'slug' => 'crm',
			'name' => __( 'CRM', 'poocommerce' ),
		);

		// Tags.
		$built_by_poocommerce = array(
			'slug' => 'built-by-poocommerce',
			'name' => __( 'Built by PooCommerce', 'poocommerce' ),
		);

		return array(
			array(
				'title'          => 'Google for PooCommerce',
				'description'    => __( 'Get in front of shoppers and drive traffic so you can grow your business with Smart Shopping Campaigns and free listings.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/google-listings-and-ads/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/google.svg",
				'product'        => 'google-listings-and-ads',
				'plugin'         => 'google-listings-and-ads/google-listings-and-ads.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$sales_channels,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'Pinterest for PooCommerce',
				'description'    => __( 'Grow your business on Pinterest! Use this official plugin to allow shoppers to Pin products while browsing your store, track conversions, and advertise on Pinterest.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/pinterest-for-poocommerce/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/pinterest.svg",
				'product'        => 'pinterest-for-poocommerce',
				'plugin'         => 'pinterest-for-poocommerce/pinterest-for-poocommerce.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$sales_channels,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'TikTok for PooCommerce',
				'description'    => __( 'Create advertising campaigns and reach one billion global users with TikTok for PooCommerce.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/tiktok-for-poocommerce/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/tiktok.jpg",
				'product'        => 'tiktok-for-business',
				'plugin'         => 'tiktok-for-business/tiktok-for-poocommerce.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$sales_channels,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Facebook for PooCommerce',
				'description'    => __( 'List products and create ads on Facebook and Instagram.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/facebook/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/facebook.svg",
				'product'        => 'facebook-for-poocommerce',
				'plugin'         => 'facebook-for-poocommerce/facebook-for-poocommerce.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$sales_channels,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'MailPoet',
				'description'    => __( 'Create and send purchase follow-up emails, newsletters, and promotional campaigns straight from your dashboard.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/mailpoet/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/mailpoet.svg",
				'product'        => 'mailpoet',
				'plugin'         => 'mailpoet/mailpoet.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$email,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'Mailchimp for PooCommerce',
				'description'    => __( 'Send targeted campaigns, recover abandoned carts and more with Mailchimp.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/mailchimp-for-poocommerce/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/mailchimp.svg",
				'product'        => 'mailchimp-for-poocommerce',
				'plugin'         => 'mailchimp-for-poocommerce/mailchimp-poocommerce.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$email,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Klaviyo for PooCommerce',
				'description'    => __( 'Grow and retain customers with intelligent, impactful email and SMS marketing automation and a consolidated view of customer interactions.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/klaviyo-for-poocommerce/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/klaviyo.png",
				'product'        => 'klaviyo',
				'plugin'         => 'klaviyo/klaviyo.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$email,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'AutomateWoo',
				'description'    => __( 'Convert and retain customers with automated marketing that does the hard work for you.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/automatewoo/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/automatewoo.svg",
				'product'        => 'automatewoo',
				'plugin'         => 'automatewoo/automatewoo.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$automations,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'AutomateWoo Refer a Friend',
				'description'    => __( 'Boost your organic sales by adding a customer referral program to your PooCommerce store.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/automatewoo-refer-a-friend/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/automatewoo.svg",
				'product'        => 'automatewoo-referrals',
				'plugin'         => 'automatewoo-referrals/automatewoo-referrals.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$automations,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'AutomateWoo Birthdays',
				'description'    => __( 'Delight customers and boost organic sales with a special PooCommerce birthday email (and coupon!) on their special day.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/automatewoo-birthdays/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/automatewoo.svg",
				'product'        => 'automatewoo-birthdays',
				'plugin'         => 'automatewoo-birthdays/automatewoo-birthdays.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$automations,
				),
				'tags'           => array(
					$built_by_poocommerce,
				),
			),
			array(
				'title'          => 'Trustpilot Reviews',
				'description'    => __( 'Collect and showcase verified reviews that consumers trust.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/trustpilot-reviews/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/trustpilot.png",
				'product'        => 'trustpilot-reviews',
				'plugin'         => 'trustpilot-reviews/wc_trustpilot.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$conversion,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Vimeo for PooCommerce',
				'description'    => __( 'Turn your product images into stunning videos that engage and convert audiences - no video experience required.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/vimeo/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/vimeo.png",
				'product'        => 'vimeo',
				'plugin'         => 'vimeo/Core.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$conversion,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Jetpack CRM for PooCommerce',
				'description'    => __( 'Harness data from PooCommerce to grow your business. Manage leads, customers, and segments, through automation, quotes, invoicing, billing, and email marketing. Power up your store with CRM.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/jetpack-crm/{$utm_string}",
				'direct_install' => true,
				'icon'           => "{$icon_dir_url}/jetpack-crm.svg",
				'product'        => 'zero-bs-crm',
				'plugin'         => 'zero-bs-crm/ZeroBSCRM.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$crm,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'PooCommerce Zapier',
				'description'    => __( 'Integrate your PooCommerce store with 5000+ cloud apps and services today. Trusted by 11,000+ users.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/poocommerce-zapier/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/zapier.png",
				'product'        => 'poocommerce-zapier',
				'plugin'         => 'poocommerce-zapier/poocommerce-zapier.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$crm,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Salesforce',
				'description'    => __( 'Sync your website\'s data like contacts, products, and orders over Salesforce CRM with Salesforce Integration for PooCommerce.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/integration-with-salesforce-for-poocommerce/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/salesforce.jpg",
				'product'        => 'integration-with-salesforce',
				'plugin'         => 'integration-with-salesforce/integration-with-salesforce.php',
				'categories'     => array(
					$marketing,
				),
				'subcategories'  => array(
					$crm,
				),
				'tags'           => array(),
			),
			array(
				'title'          => 'Personalized Coupons',
				'description'    => __( 'Generate dynamic personalized coupons for your customers that increase purchase rates.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/automatewoo/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/automatewoo-personalized-coupons.svg",
				'product'        => 'automatewoo',
				'plugin'         => 'automatewoo/automatewoo.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
			array(
				'title'          => 'Smart Coupons',
				'description'    => __( 'Powerful, "all in one" solution for gift certificates, store credits, discount coupons and vouchers.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/smart-coupons/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/poocommerce-smart-coupons.svg",
				'product'        => 'poocommerce-smart-coupons',
				'plugin'         => 'poocommerce-smart-coupons/poocommerce-smart-coupons.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
			array(
				'title'          => 'URL Coupons',
				'description'    => __( 'Create a unique URL that applies a discount and optionally adds one or more products to the customer\'s cart.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/url-coupons/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/poocommerce-url-coupons.svg",
				'product'        => 'poocommerce-url-coupons',
				'plugin'         => 'poocommerce-url-coupons/poocommerce-url-coupons.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
			array(
				'title'          => 'PooCommerce Store Credit',
				'description'    => __( 'Create "store credit" coupons for customers which are redeemable at checkout.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/store-credit/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/poocommerce-store-credit.svg",
				'product'        => 'poocommerce-store-credit',
				'plugin'         => 'poocommerce-store-credit/poocommerce-store-credit.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
			array(
				'title'          => 'Free Gift Coupons',
				'description'    => __( 'Give away a free item to any customer with the coupon code.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/free-gift-coupons/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/poocommerce-free-gift-coupons.svg",
				'product'        => 'poocommerce-free-gift-coupons',
				'plugin'         => 'poocommerce-free-gift-coupons/poocommerce-free-gift-coupons.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
			array(
				'title'          => 'Group Coupons',
				'description'    => __( 'Coupons for groups. Provides the option to have coupons that are restricted to group members or roles. Works with the free Groups plugin.', 'poocommerce' ),
				'url'            => "https://poocommerce.com/products/group-coupons/{$utm_string}",
				'direct_install' => false,
				'icon'           => "{$icon_dir_url}/poocommerce-group-coupons.svg",
				'product'        => 'poocommerce-group-coupons',
				'plugin'         => 'poocommerce-group-coupons/poocommerce-group-coupons.php',
				'categories'     => array(
					$coupons,
				),
				'subcategories'  => array(),
				'tags'           => array(),
			),
		);
	}
}
