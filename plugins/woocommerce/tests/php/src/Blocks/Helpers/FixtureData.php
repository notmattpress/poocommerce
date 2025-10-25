<?php
/**
 * Helper used to create fixture data for tests.
 */

namespace Automattic\PooCommerce\Tests\Blocks\Helpers;

use Automattic\PooCommerce\Enums\ProductTaxStatus;

/**
 * FixtureData class.
 */
class FixtureData {
	/**
	 * Create a simple product and return the result.
	 *
	 * @param array $props Product props.
	 * @return \WC_Product
	 */
	public function get_simple_product( $props ) {
		$product = new \WC_Product_Simple();
		$product->set_props(
			wp_parse_args(
				$props,
				array(
					'name' => 'Simple Product',
				)
			)
		);
		$product->save();

		if ( isset( $props['brand_ids'] ) ) {
			wp_set_object_terms( $product->get_id(), $props['brand_ids'], 'product_brand' );
		}

		return wc_get_product( $product->get_id() );
	}

	/**
	 * Create a variable product and return the result.
	 *
	 * @param array $props Product props.
	 * @param array $attributes Product attributes from which to create variations.
	 * @return \WC_Product
	 */
	public function get_variable_product( $props, $attributes = array() ) {
		$product = new \WC_Product_Variable();
		$product->set_props(
			wp_parse_args(
				$props,
				array(
					'name' => 'Variable Product',
				)
			)
		);
		$product->save();

		if ( $attributes ) {
			$product_attributes = array();

			foreach ( $attributes as $attribute ) {
				$product_attribute = new \WC_Product_Attribute();
				$product_attribute->set_id( $attribute['attribute_id'] );
				$product_attribute->set_name( $attribute['attribute_taxonomy'] );
				$product_attribute->set_options( $attribute['term_ids'] );
				$product_attribute->set_position( 1 );
				$product_attribute->set_visible( true );
				$product_attribute->set_variation( true );
				$product_attributes[] = $product_attribute;
			}

			$product->set_attributes( $product_attributes );
			$product->save();
		}

		return wc_get_product( $product->get_id() );
	}

	/**
	 * Create a grouped product and return the result.
	 *
	 * @param array $props Product props.
	 * @return \WC_Product
	 */
	public function get_grouped_product( $props ) {
		$product = new \WC_Product_Grouped();
		$product->set_props(
			wp_parse_args(
				$props,
				array(
					'name' => 'Grouped Product',
				)
			)
		);

		$children   = array();
		$children[] = $this->get_simple_product(
			array(
				'name'          => 'Child Product 1',
				'stock_status'  => 'instock',
				'regular_price' => 10,
			)
		)->get_id();
		$children[] = $this->get_simple_product(
			array(
				'name'          => 'Child Product 2',
				'stock_status'  => 'instock',
				'regular_price' => 9,
			)
		)->get_id();
		$children[] = $this->get_simple_product(
			array(
				'name'          => 'Child Product 3',
				'stock_status'  => 'instock',
				'regular_price' => 10,
			)
		)->get_id();

		$product->set_children( $children );
		$product->save();

		return wc_get_product( $product->get_id() );
	}

	/**
	 * Create and return a variation of a product.
	 *
	 * @param integer $parent_id Parent product ID.
	 * @param array   $attributes Variation attributes.
	 * @param array   $props Product props.
	 * @return \WC_Product_Variation
	 */
	public function get_variation_product( $parent_id, $attributes = array(), $props = array() ) {
		$variation = new \WC_Product_Variation();
		$variation->set_props(
			array_merge(
				wp_parse_args(
					$props,
					array(
						'name'          => 'Variation of ' . $parent_id,
						'regular_price' => '10',
					)
				),
				array(
					'parent_id' => $parent_id,
				)
			)
		);
		$variation->set_attributes( $attributes );
		$variation->save();
		return wc_get_product( $variation->get_id() );
	}

	/**
	 * Create a product attribute.
	 *
	 * @param string $raw_name Name of attribute to create.
	 * @param array  $terms Terms to create for the attribute.
	 * @return array Attribute data and created terms.
	 */
	public static function get_product_attribute( $raw_name = 'size', $terms = array( 'small' ) ) {
		global $wpdb, $wc_product_attributes;

		// Make sure caches are clean.
		delete_transient( 'wc_attribute_taxonomies' );
		\WC_Cache_Helper::invalidate_cache_group( 'poocommerce-attributes' );

		// These are exported as labels, so convert the label to a name if possible first.
		$attribute_labels = wp_list_pluck( wc_get_attribute_taxonomies(), 'attribute_label', 'attribute_name' );
		$attribute_name   = array_search( $raw_name, $attribute_labels, true );

		if ( ! $attribute_name ) {
			$attribute_name = wc_sanitize_taxonomy_name( $raw_name );
		}

		$attribute_id = wc_attribute_taxonomy_id_by_name( $attribute_name );

		if ( ! $attribute_id ) {
			$taxonomy_name = wc_attribute_taxonomy_name( $attribute_name );

			// Unregister taxonomy which other tests may have created...
			unregister_taxonomy( $taxonomy_name );

			$attribute_id = wc_create_attribute(
				array(
					'name'         => $raw_name,
					'slug'         => $attribute_name,
					'type'         => 'select',
					'order_by'     => 'menu_order',
					'has_archives' => 0,
				)
			);

			// Register as taxonomy.
			register_taxonomy(
				$taxonomy_name,
				apply_filters( 'poocommerce_taxonomy_objects_' . $taxonomy_name, array( 'product' ) ),
				apply_filters(
					'poocommerce_taxonomy_args_' . $taxonomy_name,
					array(
						'labels'       => array(
							'name' => $raw_name,
						),
						'hierarchical' => false,
						'show_ui'      => false,
						'query_var'    => true,
						'rewrite'      => false,
					)
				)
			);

			// Set product attributes global.
			$wc_product_attributes = array();

			foreach ( wc_get_attribute_taxonomies() as $taxonomy ) {
				$wc_product_attributes[ wc_attribute_taxonomy_name( $taxonomy->attribute_name ) ] = $taxonomy;
			}
		}

		$attribute = wc_get_attribute( $attribute_id );
		$return    = array(
			'attribute_name'     => $attribute->name,
			'attribute_taxonomy' => $attribute->slug,
			'attribute_id'       => $attribute_id,
			'term_ids'           => array(),
		);

		foreach ( $terms as $term ) {
			$result = term_exists( $term, $attribute->slug );

			if ( ! $result ) {
				$result               = wp_insert_term(
					$term,
					$attribute->slug,
					array(
						'slug'        => $term . '-slug',
						'description' => 'Description of ' . $term,
					)
				);
				$return['term_ids'][] = intval( $result['term_id'] );
			} else {
				$return['term_ids'][] = intval( $result['term_id'] );
			}
		}

		return $return;
	}

	/**
	 * Create a product category and return the result.
	 *
	 * @param array $props Category props.
	 * @return array
	 */
	public function get_product_category( $props ) {
		$category_name = $props['name'] ?? 'Test Category';

		return wp_insert_term(
			$category_name,
			'product_cat',
			$props
		);
	}

	/**
	 * Create a product tag and return the result.
	 *
	 * @param array $props Tag props.
	 * @return array
	 */
	public function get_product_tag( $props ) {
		$tag_name = $props['name'] ?? 'Test Tag';

		return wp_insert_term(
			$tag_name,
			'product_tag',
			$props
		);
	}

	/**
	 * Create a product brand and return the result.
	 *
	 * @param array $props Product props.
	 * @return array
	 */
	public function get_product_brand( $props ) {
		return wp_insert_term(
			$props['name'],
			'product_brand',
			$props
		);
	}

	/**
	 * Create a coupon and return the result.
	 *
	 * @param array $props Product props.
	 * @return \WC_Coupon
	 */
	public function get_coupon( $props ) {
		$coupon = new \WC_Coupon();
		$coupon->set_props( $props );
		$coupon->save();

		return new \WC_Coupon( $coupon->get_id() );
	}

	/**
	 * Create a new product taxonomy and term.
	 *
	 * @param  \WC_Product $product  The product to add the term to.
	 * @param  string      $taxonomy_name  The name of the taxonomy.
	 * @param  string      $term_name  The name of the term.
	 * @param  string      $term_slug  The slug of the term.
	 * @param  int         $term_parent  The parent of the term.
	 * @param  string      $term_description  The description of the term.
	 *
	 * @return array|int[]|\WP_Error|\WP_Taxonomy
	 */
	public function get_taxonomy_and_term( \WC_Product $product, $taxonomy_name, $term_name, $term_slug = '', $term_parent = 0, $term_description = '' ) {
		$taxonomy = register_taxonomy( $taxonomy_name, array( 'product' ), array( 'hierarchical' => true ) );

		if ( is_wp_error( $taxonomy ) ) {
			return $taxonomy;
		}

		$term = wp_insert_term(
			$term_name,
			$taxonomy_name,
			array(
				'slug'        => $term_slug,
				'parent'      => $term_parent,
				'description' => $term_description,
			)
		);

		if ( ! is_wp_error( $term ) && ! empty( $term['term_id'] ) ) {
			global $wpdb;
			$wpdb->insert(
				$wpdb->prefix . 'wc_product_attributes_lookup',
				array(
					'product_id'             => $product->get_id(),
					'product_or_parent_id'   => $product->get_parent_id(),
					'taxonomy'               => $taxonomy_name,
					'term_id'                => $term['term_id'],
					'is_variation_attribute' => true,
				),
				array( '%d', '%d', '%s', '%d', '%d' )
			);
		}

		return $term;
	}

	/**
	 * Upload a sample image and return it's ID.
	 *
	 * @param integer $product_id
	 * @return void
	 */
	public function sideload_image( $product_id = 0 ) {
		global $wpdb;
		$image_url = media_sideload_image( 'http://cldup.com/Dr1Bczxq4q.png', $product_id, '', 'src' );
		return $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE guid = %s", $image_url ) )[0];
	}

	/**
	 * Add a review to a product and flush cache.
	 *
	 * @param integer $product_id Product ID.
	 * @param integer $rating Review rating.
	 * @param string  $content Review content.
	 * @param array   $props Review props.
	 * @return void
	 */
	public function add_product_review( $product_id, $rating = 5, $content = 'Product review.', $props = array() ) {
		wp_insert_comment(
			array_merge(
				wp_parse_args(
					$props,
					array(
						'comment_author'       => 'admin',
						'comment_author_email' => 'woo@woo.local',
						'comment_author_url'   => '',
						'comment_approved'     => 1,
						'comment_type'         => 'review',
					)
				),
				array(
					'comment_post_ID' => $product_id,
					'comment_content' => $content,
					'comment_meta'    => array(
						'rating' => $rating,
					),
				)
			)
		);
		\WC_Comments::clear_transients( $product_id );
	}

	/**
	 * Create a simple flat rate at the cost of 10.
	 *
	 * @param float $cost Optional. Cost of flat rate method.
	 */
	public function shipping_add_flat_rate( $cost = 10 ) {
		$flat_rate_settings = array(
			'enabled'      => 'yes',
			'title'        => 'Flat rate',
			'availability' => 'all',
			'countries'    => '',
			'tax_status'   => ProductTaxStatus::TAXABLE,
			'cost'         => $cost,
		);
		update_option( 'poocommerce_flat_rate_settings', $flat_rate_settings );
		update_option( 'poocommerce_flat_rate', array() );
		\WC_Cache_Helper::get_transient_version( 'shipping', true );
		WC()->shipping()->load_shipping_methods();
	}

	/**
	 * Create a flat rate instance in the default zone.
	 */
	public function shipping_add_flat_rate_instance() {
		$flat_rate    = WC()->shipping()->get_shipping_methods()['flat_rate'];
		$default_zone = \WC_Shipping_Zones::get_zone( 0 );
		$default_zone->add_shipping_method( $flat_rate->id );
		$default_zone->save();
	}

	/**
	 * Create a pickup location.
	 */
	public function shipping_add_pickup_location() {
		$pickup_location_settings = array(
			'enabled'    => 'yes',
			'title'      => 'Pickup Location',
			'tax_status' => ProductTaxStatus::TAXABLE,
			'cost'       => '',
		);
		update_option( 'poocommerce_pickup_location_settings', $pickup_location_settings );
		update_option(
			'pickup_location_pickup_locations',
			array(
				array(
					'name'    => 'Pickup Location',
					'address' => array(
						'address_1' => '123 Main St',
						'city'      => 'Anytown',
						'state'     => 'CA',
						'postcode'  => '12345',
						'country'   => 'US',
					),
					'details' => 'Pickup Location Details',
					'enabled' => true,
				),
			)
		);
		add_filter( 'poocommerce_shipping_methods', array( $this, 'poocommerce_shipping_methods_pickup_location_callback' ) );
	}

	/**
	 * Add a pickup location to the shipping methods.
	 *
	 * @param array $methods The shipping methods.
	 * @return array The shipping methods.
	 */
	public function poocommerce_shipping_methods_pickup_location_callback( $methods ) {
		$methods['pickup_location'] = 'Automattic\PooCommerce\Blocks\Shipping\PickupLocation';
		return $methods;
	}

	/**
	 * Remove a pickup location.
	 */
	public function shipping_remove_pickup_location() {
		update_option( 'poocommerce_pickup_location_settings', array() );
		update_option( 'pickup_location_pickup_locations', array() );
		remove_filter( 'poocommerce_shipping_methods', array( $this, 'poocommerce_shipping_methods_pickup_location_callback' ) );
	}

	/**
	 * Remove all methods from the default zone.
	 */
	public function shipping_remove_methods_from_default_zone() {
		WC()->shipping()->unregister_shipping_methods();
		$default_zone     = \WC_Shipping_Zones::get_zone( 0 );
		$shipping_methods = $default_zone->get_shipping_methods();
		foreach ( $shipping_methods as $method ) {
			$default_zone->delete_shipping_method( $method->instance_id );
		}
	}

	/**
	 * Disables the flat rate method.
	 *
	 * @param float $cost Optional. Cost of flat rate method.
	 */
	public function shipping_disable_flat_rate( $cost = 10 ) {
		$flat_rate_settings = array(
			'enabled'      => 'no',
			'title'        => 'Flat rate',
			'availability' => 'all',
			'countries'    => '',
			'tax_status'   => ProductTaxStatus::TAXABLE,
			'cost'         => $cost,
		);
		update_option( 'poocommerce_flat_rate_settings', $flat_rate_settings );
		update_option( 'poocommerce_flat_rate', array() );
		\WC_Cache_Helper::get_transient_version( 'shipping', true );
		WC()->shipping()->load_shipping_methods();
	}

	/**
	 * Enable bacs payment method.
	 */
	public function payments_enable_bacs() {
		$bacs_settings = array(
			'enabled'         => 'yes',
			'title'           => 'Direct bank transfer',
			'description'     => 'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.',
			'instructions'    => '',
			'account_details' => '',
			'account_name'    => '',
			'account_number'  => '',
			'sort_code'       => '',
			'bank_name'       => '',
			'iban'            => '',
			'bic'             => '',
		);
		update_option( 'poocommerce_bacs_settings', $bacs_settings );
		WC()->payment_gateways()->init();
	}
}
