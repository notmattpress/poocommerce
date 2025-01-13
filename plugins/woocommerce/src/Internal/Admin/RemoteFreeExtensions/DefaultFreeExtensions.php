<?php
/**
 * Gets a list of fallback methods if remote fetching is disabled.
 */

declare( strict_types=1 );
namespace Automattic\PooCommerce\Internal\Admin\RemoteFreeExtensions;

use Automattic\PooCommerce\Admin\Features\PaymentGatewaySuggestions\DefaultPaymentGateways;
use Automattic\PooCommerce\Internal\BrandingController;

defined( 'ABSPATH' ) || exit;


/**
 * Default Free Extensions
 */
class DefaultFreeExtensions {

	/**
	 * Get Woo logo path.
	 *
	 * @return string
	 */
	private static function get_woo_logo() {
		return BrandingController::use_new_branding() ?
			plugins_url( '/assets/images/core-profiler/woo-rebrand-2.svg', WC_PLUGIN_FILE ) :
			plugins_url( '/assets/images/onboarding/woo.svg', WC_PLUGIN_FILE );
	}

	/**
	 * Get default specs.
	 *
	 * @return array Default specs.
	 */
	public static function get_all() {
		$bundles = array(
			array(
				'key'     => 'obw/basics',
				'title'   => __( 'Get the basics', 'poocommerce' ),
				'plugins' => array(
					self::get_plugin( 'poocommerce-payments' ),
					self::get_plugin( 'poocommerce-services:shipping' ),
					self::get_plugin( 'poocommerce-services:tax' ),
					self::get_plugin( 'jetpack' ),
				),
			),
			array(
				'key'     => 'obw/grow',
				'title'   => __( 'Grow your store', 'poocommerce' ),
				'plugins' => array(
					self::get_plugin( 'mailpoet' ),
					self::get_plugin( 'google-listings-and-ads' ),
					self::get_plugin( 'pinterest-for-poocommerce' ),
					self::get_plugin( 'facebook-for-poocommerce' ),
				),
			),
			array(
				'key'     => 'task-list/reach',
				'title'   => __( 'Reach out to customers', 'poocommerce' ),
				'plugins' => array(
					self::get_plugin( 'mailpoet:alt' ),
					self::get_plugin( 'mailchimp-for-poocommerce' ),
					self::get_plugin( 'klaviyo' ),
				),
			),
			array(
				'key'     => 'task-list/grow',
				'title'   => __( 'Grow your store', 'poocommerce' ),
				'plugins' => array(
					self::get_plugin( 'google-listings-and-ads:alt' ),
					self::get_plugin( 'tiktok-for-business' ),
					self::get_plugin( 'pinterest-for-poocommerce:alt' ),
					self::get_plugin( 'facebook-for-poocommerce:alt' ),
				),
			),
			array(
				'key'     => 'obw/core-profiler',
				'title'   => __( 'Grow your store', 'poocommerce' ),
				'plugins' => self::with_core_profiler_fields(
					array(
						self::get_plugin( 'poocommerce-payments' ),
						self::get_plugin( 'poocommerce-services:shipping' ),
						self::get_plugin( 'jetpack' ),
						self::get_plugin( 'pinterest-for-poocommerce' ),
						self::get_plugin( 'kliken-ads-pixel-for-meta' ),
						self::get_plugin( 'mailpoet' ),
						self::get_plugin( 'klaviyo' ),
						self::get_plugin( 'google-listings-and-ads' ),
						self::get_plugin( 'poocommerce-services:tax' ),
						self::get_plugin( 'tiktok-for-business' ),
					)
				),
			),
		);

		$bundles = wp_json_encode( $bundles );
		return json_decode( $bundles );
	}

	/**
	 * Get the plugin arguments by slug.
	 *
	 * @param string $slug Slug.
	 * @return array
	 */
	public static function get_plugin( $slug ) {
		$plugins = array(
			'google-listings-and-ads'       => array(
				'min_php_version' => '7.4',
				'name'            => __( 'Google for PooCommerce', 'poocommerce' ),
				'description'     => sprintf(
					/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Drive sales with %1$sGoogle for PooCommerce%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/google-listings-and-ads" target="_blank">',
					'</a>'
				),
				'image_url'       => plugins_url( '/assets/images/onboarding/google.svg', WC_PLUGIN_FILE ),
				'manage_url'      => 'admin.php?page=wc-admin&path=%2Fgoogle%2Fstart',
				'is_built_by_wc'  => true,
				'is_visible'      => array(
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'google-listings-and-ads' ),
							),
						),
					),
				),
			),
			'google-listings-and-ads:alt'   => array(
				'name'           => __( 'Google for PooCommerce', 'poocommerce' ),
				'description'    => __( 'Reach more shoppers and drive sales for your store. Integrate with Google to list your products for free and launch paid ad campaigns.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/google.svg', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=wc-admin&path=%2Fgoogle%2Fstart',
				'is_built_by_wc' => true,
			),
			'facebook-for-poocommerce'      => array(
				'name'           => __( 'Facebook for PooCommerce', 'poocommerce' ),
				'description'    => __( 'List products and create ads on Facebook and Instagram with <a href="https://poocommerce.com/products/facebook/">Facebook for PooCommerce</a>', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/facebook.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=wc-facebook',
				'is_visible'     => false,
				'is_built_by_wc' => false,
			),
			'facebook-for-poocommerce:alt'  => array(
				'name'           => __( 'Facebook for PooCommerce', 'poocommerce' ),
				'description'    => __( 'List products and create ads on Facebook and Instagram.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/facebook.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=wc-facebook',
				'is_visible'     => false,
				'is_built_by_wc' => false,
			),
			'pinterest-for-poocommerce'     => array(
				'name'            => __( 'Pinterest for PooCommerce', 'poocommerce' ),
				'description'     => __( 'Get your products in front of Pinners searching for ideas and things to buy.', 'poocommerce' ),
				'image_url'       => plugins_url( '/assets/images/onboarding/pinterest.png', WC_PLUGIN_FILE ),
				'manage_url'      => 'admin.php?page=wc-admin&path=%2Fpinterest%2Flanding',
				'is_visible'      => array(
					array(
						'type'        => 'option',
						'option_name' => 'poocommerce_remote_variant_assignment',
						'value'       => array( 1, 60 ), // 50% segment
						'default'     => false,
						'operation'   => 'range',
					),
				),
				'is_built_by_wc'  => true,
				'min_php_version' => '7.3',
			),
			'pinterest-for-poocommerce:alt' => array(
				'name'           => __( 'Pinterest for PooCommerce', 'poocommerce' ),
				'description'    => __( 'Get your products in front of Pinterest users searching for ideas and things to buy. Get started with Pinterest and make your entire product catalog browsable.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/pinterest.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=wc-admin&path=%2Fpinterest%2Flanding',
				'is_built_by_wc' => true,
			),
			'mailpoet'                      => array(
				'name'           => __( 'MailPoet', 'poocommerce' ),
				'description'    => __( 'Create and send purchase follow-up emails, newsletters, and promotional campaigns straight from your dashboard.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/mailpoet.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=mailpoet-newsletters',
				'is_visible'     => array(
					array(
						'type'        => 'option',
						'option_name' => 'poocommerce_remote_variant_assignment',
						'value'       => array( 1, 84 ), // 70% segment with klaviyo
						'default'     => false,
						'operation'   => 'range',
					),
				),
				'is_built_by_wc' => true,
			),
			// Shared 50% segment with pinterest-for-poocommerce.
			'kliken-ads-pixel-for-meta'     => array(
				'name'        => __( 'Meta Ads & Pixel for PooCommerce', 'poocommerce' ),
				'description' => __( 'Sync your store catalog, set up pixel tracking, and run targeted ad campaigns.', 'poocommerce' ),
				'image_url'   => plugins_url( '/assets/images/onboarding/kliken-ads-pixel-for-meta.svg', WC_PLUGIN_FILE ),
				'manage_url'  => 'admin.php?page=kliken-ads-pixel-for-meta',
				'is_visible'  => array(
					array(
						'type'        => 'option',
						'option_name' => 'poocommerce_remote_variant_assignment',
						'value'       => array( 61, 120 ), // 50% segment
						'default'     => false,
						'operation'   => 'range',
					),
				),
			),
			'mailchimp-for-poocommerce'     => array(
				'name'           => __( 'Mailchimp', 'poocommerce' ),
				'description'    => __( 'Send targeted campaigns, recover abandoned carts and much more with Mailchimp.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/mailchimp-for-poocommerce.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=mailchimp-poocommerce',
				'is_built_by_wc' => false,
			),
			'klaviyo'                       => array(
				'name'           => __( 'Klaviyo', 'poocommerce' ),
				'description'    => __( 'Grow and retain customers with email, SMS, automations, and a consolidated view of customer interactions.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/klaviyo.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=klaviyo_settings',
				'is_visible'     => array(
					array(
						'type'        => 'option',
						'option_name' => 'poocommerce_remote_variant_assignment',
						'value'       => array( 85, 120 ), // 30% segment with mailpoet
						'default'     => false,
						'operation'   => 'range',
					),
				),
				'is_built_by_wc' => false,
			),
			'poocommerce-payments'          => array(
				'name'           => __( 'WooPayments', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/wcpay.svg', WC_PLUGIN_FILE ),
				'description'    => sprintf(
					/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Accept credit cards and other popular payment methods with %1$sWooPayments%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/poocommerce-payments" target="_blank">',
					'</a>'
				),
				'is_visible'     => array(
					array(
						'type'      => 'base_location_country',
						'value'     => array(
							'US',
							'PR',
							'AU',
							'CA',
							'DE',
							'ES',
							'FR',
							'GB',
							'IE',
							'IT',
							'NZ',
							'AT',
							'BE',
							'NL',
							'PL',
							'PT',
							'CH',
							'HK',
							'SG',
							'CY',
							'DK',
							'EE',
							'FI',
							'GR',
							'LU',
							'LT',
							'LV',
							'NO',
							'MT',
							'SI',
							'SK',
							'BG',
							'CZ',
							'HR',
							'HU',
							'RO',
							'SE',
							'JP',
							'AE',
						),
						'operation' => 'in',
					),
					DefaultPaymentGateways::get_rules_for_cbd( false ),
				),
				'is_built_by_wc' => true,
				'min_wp_version' => '5.9',
			),
			'poocommerce-services:shipping' => array(
				'name'           => __( 'PooCommerce Shipping', 'poocommerce' ),
				'image_url'      => self::get_woo_logo(),
				'description'    => sprintf(
				/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Print shipping labels with %1$sPooCommerce Shipping%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/shipping" target="_blank">',
					'</a>'
				),
				'is_visible'     => array(
					array(
						'type'      => 'base_location_country',
						'value'     => 'US',
						'operation' => '=',
					),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-services' ),
							),
						),
					),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-shipping' ),
							),
						),
					),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-tax' ),
							),
						),
					),
					array(
						'type'     => 'or',
						'operands' => array(
							array(
								array(
									'type'         => 'option',
									'transformers' => array(
										array(
											'use'       => 'dot_notation',
											'arguments' => array(
												'path' => 'product_types',
											),
										),
										array(
											'use' => 'count',
										),
									),
									'option_name'  => 'poocommerce_onboarding_profile',
									'value'        => 1,
									'default'      => array(),
									'operation'    => '!=',
								),
							),
							array(
								array(
									'type'         => 'option',
									'transformers' => array(
										array(
											'use'       => 'dot_notation',
											'arguments' => array(
												'path' => 'product_types.0',
											),
										),
									),
									'option_name'  => 'poocommerce_onboarding_profile',
									'value'        => 'downloads',
									'default'      => '',
									'operation'    => '!=',
								),
							),
						),
					),
				),
				'is_built_by_wc' => true,
			),
			'poocommerce-services:tax'      => array(
				'name'           => __( 'PooCommerce Tax', 'poocommerce' ),
				'image_url'      => self::get_woo_logo(),
				'description'    => sprintf(
					/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Get automated sales tax with %1$sPooCommerce Tax%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/tax" target="_blank">',
					'</a>'
				),
				'is_visible'     => array(
					self::get_rules_for_wcservices_tax_countries(),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-services' ),
							),
						),
					),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-shipping' ),
							),
						),
					),
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'poocommerce-tax' ),
							),
						),
					),
				),
				'is_built_by_wc' => true,
			),
			'jetpack'                       => array(
				'name'           => __( 'Jetpack', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/jetpack.svg', WC_PLUGIN_FILE ),
				'description'    => sprintf(
					/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Enhance speed and security with %1$sJetpack%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/jetpack" target="_blank">',
					'</a>'
				),
				'is_visible'     => array(
					array(
						'type'    => 'not',
						'operand' => array(
							array(
								'type'    => 'plugins_activated',
								'plugins' => array( 'jetpack' ),
							),
						),
					),
				),
				'is_built_by_wc' => false,
				'min_wp_version' => '6.0',
			),
			'mailpoet:alt'                  => array(
				'name'           => __( 'MailPoet', 'poocommerce' ),
				'description'    => __( 'Create and send purchase follow-up emails, newsletters, and promotional campaigns straight from your dashboard.', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/mailpoet.png', WC_PLUGIN_FILE ),
				'manage_url'     => 'admin.php?page=mailpoet-newsletters',
				'is_built_by_wc' => true,
			),
			'tiktok-for-business'           => array(
				'name'           => __( 'TikTok for PooCommerce', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/tiktok.svg', WC_PLUGIN_FILE ),
				'description'    =>
					__( 'Grow your online sales by promoting your products on TikTok to over one billion monthly active users around the world.', 'poocommerce' ),
				'manage_url'     => 'admin.php?page=tiktok',
				'is_visible'     => array(
					array(
						'type'      => 'base_location_country',
						'value'     => array(
							'US',
							'CA',
							'MX',
							'AT',
							'BE',
							'CZ',
							'DK',
							'FI',
							'FR',
							'DE',
							'GR',
							'HU',
							'IE',
							'IT',
							'NL',
							'PL',
							'PT',
							'RO',
							'ES',
							'SE',
							'GB',
							'CH',
							'NO',
							'AU',
							'NZ',
							'SG',
							'MY',
							'PH',
							'ID',
							'VN',
							'TH',
							'KR',
							'IL',
							'AE',
							'RU',
							'UA',
							'TR',
							'SA',
							'BR',
							'JP',
						),
						'operation' => 'in',
					),
				),
				'is_built_by_wc' => false,
			),
			'tiktok-for-business:alt'       => array(
				'name'           => __( 'TikTok for PooCommerce', 'poocommerce' ),
				'image_url'      => plugins_url( '/assets/images/onboarding/tiktok.svg', WC_PLUGIN_FILE ),
				'description'    => sprintf(
					/* translators: 1: opening product link tag. 2: closing link tag */
					__( 'Create ad campaigns and reach one billion global users with %1$sTikTok for PooCommerce%2$s', 'poocommerce' ),
					'<a href="https://poocommerce.com/products/tiktok-for-poocommerce" target="_blank">',
					'</a>'
				),
				'manage_url'     => 'admin.php?page=tiktok',
				'is_built_by_wc' => false,
				'is_visible'     => false,
			),
		);

		$plugin        = $plugins[ $slug ];
		$plugin['key'] = $slug;

		return $plugin;
	}

	/**
	 * Decorate plugin data with core profiler fields.
	 *
	 * - Updated description for the core-profiler.
	 * - Adds learn_more_link and label.
	 * - Adds install_priority, which is used to sort the plugins. The value is determined by the plugin size. Lower = smaller.
	 *
	 * @param array $plugins Array of plugins.
	 *
	 * @return array
	 */
	public static function with_core_profiler_fields( array $plugins ) {
		$_plugins = array(
			'poocommerce-payments'          => array(
				'label'            => __( 'Get paid with WooPayments', 'poocommerce' ),
				'image_url'        => self::get_woo_logo(),
				'description'      => __( "Securely accept payments and manage payment activity straight from your store's dashboard", 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/poocommerce-payments?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 5,
				'requires_jpc'     => true,
			),
			'poocommerce-services:shipping' => array(
				'label'            => __( 'Print shipping labels with PooCommerce Shipping', 'poocommerce' ),
				'image_url'        => self::get_woo_logo(),
				'description'      => __( 'Print USPS and DHL labels directly from your dashboard and save on shipping.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/poocommerce-shipping?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 3,
			),
			'jetpack'                       => array(
				'label'            => __( 'Boost content creation with Jetpack AI Assistant', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/logo-jetpack.svg', WC_PLUGIN_FILE ),
				'description'      => __( 'Save time on content creation — unlock high-quality blog posts and pages using AI.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/jetpack?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 8,
				'requires_jpc'     => true,
			),
			'pinterest-for-poocommerce'     => array(
				'label'            => __( 'Showcase your products with Pinterest', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/logo-pinterest.svg', WC_PLUGIN_FILE ),
				'description'      => __( 'Get your products in front of a highly engaged audience.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/pinterest-for-poocommerce?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 2,
			),
			'kliken-ads-pixel-for-meta'     => array(
				'label'            => __( 'Grow your business with Facebook and Instagram', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/kliken-ads-pixel-for-meta.svg', WC_PLUGIN_FILE ),
				'description'      => __( 'Sync your store catalog, set up pixel tracking, and run targeted ad campaigns.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/meta-ads-and-pixel?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 2,
			),
			'mailpoet'                      => array(
				'label'            => __( 'Reach your customers with MailPoet', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/logo-mailpoet.svg', WC_PLUGIN_FILE ),
				'description'      => __( 'Send purchase follow-up emails, newsletters, and promotional campaigns.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/mailpoet?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 7,
			),
			'klaviyo'                       => array(
				'label'            => __( 'Klaviyo', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/onboarding/klaviyo.png', WC_PLUGIN_FILE ),
				'description'      => __( 'Grow and retain customers with email, SMS, automations, and a consolidated view of customer interactions.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/klaviyo-for-poocommerce?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 7,
			),
			'tiktok-for-business'           => array(
				'label'            => __( 'Create ad campaigns with TikTok', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/logo-tiktok.png', WC_PLUGIN_FILE ),
				'description'      => __( 'Create advertising campaigns and reach one billion global users.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/tiktok-for-poocommerce?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 1,
			),
			'google-listings-and-ads'       => array(
				'label'            => __( 'Drive sales with Google for PooCommerce', 'poocommerce' ),
				'image_url'        => plugins_url( '/assets/images/core-profiler/logo-google.svg', WC_PLUGIN_FILE ),
				'description'      => __( 'Reach millions of active shoppers across Google with free product listings and ads.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/google-listings-and-ads?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 6,
			),
			'poocommerce-services:tax'      => array(
				'label'            => __( 'Get automated tax rates with PooCommerce Tax', 'poocommerce' ),
				'image_url'        => self::get_woo_logo(),
				'description'      => __( 'Automatically calculate how much sales tax should be collected – by city, country, or state.', 'poocommerce' ),
				'learn_more_link'  => 'https://poocommerce.com/products/tax?utm_source=storeprofiler&utm_medium=product&utm_campaign=freefeatures',
				'install_priority' => 4,
			),
		);

		/*
		 * Overwrite the is_visible conditions to just the country restriction
		 * and the requirement for PooCommerce Shipping and PooCommerce Tax
		 * to not be active.
		 */
		$_plugins['poocommerce-services:shipping']['is_visible'] = array(
			array(
				'type'      => 'base_location_country',
				'value'     => 'US',
				'operation' => '=',
			),
			array(
				'type'    => 'not',
				'operand' => array(
					array(
						'type'    => 'plugins_activated',
						'plugins' => array( 'poocommerce-shipping' ),
					),
				),
			),
			array(
				'type'    => 'not',
				'operand' => array(
					array(
						'type'    => 'plugins_activated',
						'plugins' => array( 'poocommerce-tax' ),
					),
				),
			),
		);

		$_plugins['poocommerce-services:tax']['is_visible'] = array(
			self::get_rules_for_wcservices_tax_countries(),
			array(
				'type'    => 'not',
				'operand' => array(
					array(
						'type'    => 'plugins_activated',
						'plugins' => array( 'poocommerce-shipping' ),
					),
				),
			),
			array(
				'type'    => 'not',
				'operand' => array(
					array(
						'type'    => 'plugins_activated',
						'plugins' => array( 'poocommerce-tax' ),
					),
				),
			),
		);

		$remove_plugins_activated_rule = function ( $is_visible ) {
			$is_visible = array_filter(
				array_map(
					function ( $rule ) {
						if ( is_object( $rule ) || ! isset( $rule['operand'] ) ) {
							return $rule;
						}

						return array_filter(
							$rule['operand'],
							function ( $operand ) {
								return 'plugins_activated' !== $operand['type'];
							}
						);
					},
					$is_visible
				)
			);

			return empty( $is_visible ) ? true : $is_visible;
		};

		foreach ( $plugins as &$plugin ) {
			if ( isset( $_plugins[ $plugin['key'] ] ) ) {
				$plugin = array_merge( $plugin, $_plugins[ $plugin['key'] ] );

				/*
				 * Removes the "not plugins_activated" rules from the "is_visible"
				 * ruleset except for the PooCommerce Services plugin.
				 *
				 * WC Services is a plugin that provides shipping and tax features.
				 * WC Services is sometimes labelled as "PooCommerce Shipping" or
				 * "PooCommerce Tax", depending on which functionality of the plugin
				 * is advertised.
				 *
				 * We have two new upcoming, standalone plugins: "PooCommerce Shipping" and
				 * "PooCommerce Tax" (same names as sometimes used for WC Services).
				 * The new plugins are incompatible with the old WC Services plugin.
				 * In order to prevent merchants from running into this plugin conflict,
				 * we want to keep the "not plugins_activated" rules for recommending
				 * WC Services.
				 *
				 * If WC Services and the new plugins are installed together,
				 * a notice is displayed and the plugin functionality is not registered
				 * by either WC Services or WC Shipping and WC Tax.
				 */
				if (
					isset( $plugin['is_visible'] ) &&
					is_array( $plugin['is_visible'] ) &&
					! in_array( $plugin['key'], array( 'poocommerce-services:shipping', 'poocommerce-services:tax' ), true )
				) {
					$plugin['is_visible'] = $remove_plugins_activated_rule( $plugin['is_visible'] );
				}
			}
		}

		return $plugins;
	}

	/**
	 * Returns the country restrictions for use in the `is_visible` key for
	 * recommending the tax functionality of PooCommerce Shipping & Tax.
	 *
	 * @return array
	 */
	private static function get_rules_for_wcservices_tax_countries() {
		return array(
			'type'      => 'base_location_country',
			'operation' => 'in',
			'value'     => array(
				'US',
				'FR',
				'GB',
				'DE',
				'CA',
				'AU',
				'GR',
				'BE',
				'PT',
				'DK',
				'SE',
			),
		);
	}
}
