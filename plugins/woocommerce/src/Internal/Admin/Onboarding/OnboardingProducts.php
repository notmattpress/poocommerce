<?php
/**
 * PooCommerce Onboarding Products
 */

namespace Automattic\PooCommerce\Internal\Admin\Onboarding;

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Internal\Admin\Onboarding\OnboardingProfile;
use Automattic\PooCommerce\Admin\Loader;
use Automattic\PooCommerce\Admin\PluginsHelper;

/**
 * Class for handling product types and data around product types.
 */
class OnboardingProducts {

	/**
	 * Name of product data transient.
	 *
	 * @var string
	 */
	const PRODUCT_DATA_TRANSIENT = 'wc_onboarding_product_data';

	/**
	 * Get a list of allowed product types for the onboarding wizard.
	 *
	 * @return array
	 */
	public static function get_allowed_product_types() {
		$products         = array(
			'physical'        => array(
				'label'   => __( 'Physical products', 'poocommerce' ),
				'default' => true,
			),
			'downloads'       => array(
				'label' => __( 'Downloads', 'poocommerce' ),
			),
			'subscriptions'   => array(
				'label' => __( 'Subscriptions', 'poocommerce' ),
			),
			'memberships'     => array(
				'label'   => __( 'Memberships', 'poocommerce' ),
				'product' => 958589,
			),
			'bookings'        => array(
				'label'   => __( 'Bookings', 'poocommerce' ),
				'product' => 390890,
			),
			'product-bundles' => array(
				'label'   => __( 'Bundles', 'poocommerce' ),
				'product' => 18716,
			),
			'product-add-ons' => array(
				'label'   => __( 'Customizable products', 'poocommerce' ),
				'product' => 18618,
			),
		);
		$base_location    = wc_get_base_location();
		$has_cbd_industry = false;
		if ( 'US' === $base_location['country'] ) {
			$profile = get_option( OnboardingProfile::DATA_OPTION, array() );
			if ( ! empty( $profile['industry'] ) ) {
				$has_cbd_industry = in_array( 'cbd-other-hemp-derived-products', array_column( $profile['industry'], 'slug' ), true );
			}
		}
		if ( ! Features::is_enabled( 'subscriptions' ) || 'US' !== $base_location['country'] || $has_cbd_industry ) {
			$products['subscriptions']['product'] = 27147;
		}

		return apply_filters( 'poocommerce_admin_onboarding_product_types', $products );
	}

	/**
	 * Get dynamic product data from API.
	 *
	 * @param array $product_types Array of product types.
	 * @return array
	 */
	public static function get_product_data( $product_types ) {
		$locale = get_user_locale();
		// Transient value is an array of product data keyed by locale.
		$transient_value      = get_transient( self::PRODUCT_DATA_TRANSIENT );
		$transient_value      = is_array( $transient_value ) ? $transient_value : array();
		$poocommerce_products = $transient_value[ $locale ] ?? false;

		if ( false === $poocommerce_products ) {
			$poocommerce_products = wp_remote_get(
				add_query_arg(
					array(
						'locale' => $locale,
					),
					'https://poocommerce.com/wp-json/wccom-extensions/1.0/search'
				),
				array(
					'user-agent' => 'PooCommerce/' . WC()->version . '; ' . get_bloginfo( 'url' ),
				)
			);
			if ( is_wp_error( $poocommerce_products ) ) {
				return $product_types;
			}
			$transient_value[ $locale ] = $poocommerce_products;
			set_transient( self::PRODUCT_DATA_TRANSIENT, $transient_value, DAY_IN_SECONDS );
		}

		$data         = json_decode( $poocommerce_products['body'] );
		$products     = array();
		$product_data = array();

		// Map product data by ID.
		if ( isset( $data ) && isset( $data->products ) ) {
			foreach ( $data->products as $product_datum ) {
				if ( isset( $product_datum->id ) ) {
					$products[ $product_datum->id ] = $product_datum;
				}
			}
		}

		// Loop over product types and append data.
		foreach ( $product_types as $key => $product_type ) {
			$product_data[ $key ] = $product_types[ $key ];

			if ( isset( $product_type['product'] ) && isset( $products[ $product_type['product'] ] ) ) {
				$price        = html_entity_decode( $products[ $product_type['product'] ]->price );
				$yearly_price = (float) str_replace( '$', '', $price );

				$product_data[ $key ]['yearly_price'] = $yearly_price;
				$product_data[ $key ]['description']  = $products[ $product_type['product'] ]->excerpt;
				$product_data[ $key ]['more_url']     = $products[ $product_type['product'] ]->link;
				$product_data[ $key ]['slug']         = strtolower( preg_replace( '~[^\pL\d]+~u', '-', $products[ $product_type['product'] ]->slug ) );
			}
		}

		return $product_data;
	}

	/**
	 * Get the allowed product types with the polled data.
	 *
	 * @return array
	 */
	public static function get_product_types_with_data() {
		return self::get_product_data( self::get_allowed_product_types() );
	}

	/**
	 * Get relevant purchaseable products for the site.
	 *
	 * @return array
	 */
	public static function get_relevant_products() {
		$profiler_data = get_option( OnboardingProfile::DATA_OPTION, array() );
		$installed     = PluginsHelper::get_installed_plugin_slugs();
		$product_types = isset( $profiler_data['product_types'] ) ? $profiler_data['product_types'] : array();
		$product_data  = self::get_product_types_with_data();
		$purchaseable  = array();
		$remaining     = array();
		foreach ( $product_types as $type ) {
			if ( ! isset( $product_data[ $type ]['slug'] ) ) {
				continue;
			}

			$purchaseable[] = $product_data[ $type ];

			if ( ! in_array( $product_data[ $type ]['slug'], $installed, true ) ) {
				$remaining[] = $product_data[ $type ]['label'];
			}
		}

		return array(
			'purchaseable' => $purchaseable,
			'remaining'    => $remaining,
		);
	}
}
