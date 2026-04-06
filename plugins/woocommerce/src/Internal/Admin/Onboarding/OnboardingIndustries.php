<?php
/**
 * PooCommerce Onboarding Industries
 */

namespace Automattic\PooCommerce\Internal\Admin\Onboarding;

/**
 * Logic around onboarding industries.
 */
class OnboardingIndustries {
	/**
	 * Init.
	 */
	public static function init() {
		add_filter( 'poocommerce_admin_onboarding_preloaded_data', array( __CLASS__, 'preload_data' ) );
	}

	/**
	 * Get a list of allowed industries for the onboarding wizard.
	 *
	 * @return array
	 */
	public static function get_allowed_industries() {
		/* With "use_description" we turn the description input on. With "description_label" we set the input label */
		return apply_filters(
			'poocommerce_admin_onboarding_industries',
			array(
				'fashion-apparel-accessories'     => array(
					'label'             => __( 'Fashion, apparel, and accessories', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'health-beauty'                   => array(
					'label'             => __( 'Health and beauty', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'electronics-computers'           => array(
					'label'             => __( 'Electronics and computers', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'food-drink'                      => array(
					'label'             => __( 'Food and drink', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'home-furniture-garden'           => array(
					'label'             => __( 'Home, furniture, and garden', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'cbd-other-hemp-derived-products' => array(
					'label'             => __( 'CBD and other hemp-derived products', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'education-and-learning'          => array(
					'label'             => __( 'Education and learning', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'sports-and-recreation'           => array(
					'label'             => __( 'Sports and recreation', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'arts-and-crafts'                 => array(
					'label'             => __( 'Arts and crafts', 'poocommerce' ),
					'use_description'   => false,
					'description_label' => '',
				),
				'other'                           => array(
					'label'             => __( 'Other', 'poocommerce' ),
					'use_description'   => true,
					'description_label' => __( 'Description', 'poocommerce' ),
				),
			)
		);
	}

	/**
	 * Add preloaded data to onboarding.
	 *
	 * @param array $settings Component settings.
	 * @return array
	 */
	public static function preload_data( $settings ) {
		$settings['onboarding']['industries'] = self::get_allowed_industries();
		return $settings;
	}
}
