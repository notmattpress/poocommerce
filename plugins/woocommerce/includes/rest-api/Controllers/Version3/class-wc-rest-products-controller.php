<?php
/**
 * REST API Products controller
 *
 * Handles requests to the /products endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   2.6.0
 */

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Enums\ProductStatus;
use Automattic\PooCommerce\Enums\ProductStockStatus;
use Automattic\PooCommerce\Enums\ProductTaxStatus;
use Automattic\PooCommerce\Enums\ProductType;
use Automattic\PooCommerce\Enums\CatalogVisibility;
use Automattic\PooCommerce\Internal\CostOfGoodsSold\CogsAwareRestControllerTrait;
use Automattic\PooCommerce\Utilities\I18nUtil;

defined( 'ABSPATH' ) || exit;

/**
 * REST API Products controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Products_V2_Controller
 */
class WC_REST_Products_Controller extends WC_REST_Products_V2_Controller {

	use CogsAwareRestControllerTrait;

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';

	/**
	 * The value of the 'search_sku' argument if present.
	 *
	 * See prepare_objects_query()
	 *
	 * @var string
	 */
	private $search_sku_arg_value = '';

	/**
	 * If the 'search_name_or_sku' argument is present this will be set
	 * to an array of the (space-separated) tokens that form the argument value.
	 *
	 * @var array|null
	 */
	private $search_name_or_sku_tokens = null;

	/**
	 * If the 'search_fields' argument is present with 'search' this will be set
	 * to an array containing the fields to search and tokenized search terms.
	 *
	 * @var array|null
	 */
	private $search_fields_tokens = null;

	/**
	 * Suggested product ids.
	 *
	 * @var array
	 */
	private $suggested_products_ids = array();

	/**
	 * Product statuses to exclude from the query.
	 *
	 * @var array
	 */
	private $exclude_status = array();

	/**
	 * Stores attachment IDs processed during the current request for potential cleanup.
	 *
	 * @var array
	 */
	private $processed_attachment_ids_for_request = array();

	/**
	 * Register the routes for products.
	 */
	public function register_routes() {
		parent::register_routes();

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/suggested-products',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_suggested_products' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_suggested_products_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/duplicate',
			array(
				'args'   => array(
					'id' => array(
						'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'duplicate_product' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Duplicate a product and returns the duplicated product.
	 * The product status is set to "draft" and the name includes a "(copy)" at the end by default.
	 *
	 * @param WP_REST_Request $request Request data.
	 * @return WP_REST_Response|WP_Error
	 */
	public function duplicate_product( $request ) {
		$product_id = $request->get_param( 'id' );
		$product    = wc_get_product( $product_id );

		if ( ! $product ) {
			return new WP_Error( 'poocommerce_rest_product_invalid_id', __( 'Invalid product ID.', 'poocommerce' ), array( 'status' => 404 ) );
		}

		// Creating product object from request data in preparation for copying.
		$updated_product    = $this->prepare_object_for_database( $request );
		$duplicated_product = ( new WC_Admin_Duplicate_Product() )->product_duplicate( $updated_product );

		if ( is_wp_error( $duplicated_product ) ) {
			return new WP_Error( 'poocommerce_rest_product_duplicate_error', $duplicated_product->get_error_message(), array( 'status' => 400 ) );
		}

		$response_data = $duplicated_product->get_data();

		return new WP_REST_Response( $response_data, 200 );
	}

	/**
	 * Get the images for a product or product variation.
	 *
	 * @param WC_Product|WC_Product_Variation $product Product instance.
	 * @return array
	 */
	protected function get_images( $product ) {
		$images         = array();
		$attachment_ids = array();

		// Add featured image.
		if ( $product->get_image_id() ) {
			$attachment_ids[] = $product->get_image_id();
		}

		// Add gallery images.
		$attachment_ids = array_merge( $attachment_ids, $product->get_gallery_image_ids() );

		// Build image data.
		foreach ( $attachment_ids as $attachment_id ) {
			$attachment_post = get_post( $attachment_id );
			if ( is_null( $attachment_post ) ) {
				continue;
			}

			$attachment = wp_get_attachment_image_src( $attachment_id, 'full' );

			if ( ! is_array( $attachment ) ) {
				continue;
			}
			$thumbnail = wp_get_attachment_image_src( $attachment_id, 'poocommerce_thumbnail' );

			$images[] = array(
				'id'                => (int) $attachment_id,
				'date_created'      => wc_rest_prepare_date_response( $attachment_post->post_date, false ),
				'date_created_gmt'  => wc_rest_prepare_date_response( strtotime( $attachment_post->post_date_gmt ) ),
				'date_modified'     => wc_rest_prepare_date_response( $attachment_post->post_modified, false ),
				'date_modified_gmt' => wc_rest_prepare_date_response( strtotime( $attachment_post->post_modified_gmt ) ),
				'src'               => current( $attachment ),
				'name'              => get_the_title( $attachment_id ),
				'alt'               => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
				'srcset'            => (string) wp_get_attachment_image_srcset( $attachment_id, 'full' ),
				'sizes'             => (string) wp_get_attachment_image_sizes( $attachment_id, 'full' ),
				'thumbnail'         => current( $thumbnail ),
			);
		}

		return $images;
	}

	/**
	 * Make extra product orderby features supported by PooCommerce available to the WC API.
	 * This includes 'price', 'popularity', and 'rating'.
	 *
	 * @param WP_REST_Request $request Request data.
	 * @return array
	 */
	protected function prepare_objects_query( $request ) {
		$args = WC_REST_CRUD_Controller::prepare_objects_query( $request );

		// Set post_status.
		$args['post_status'] = $request['status'];

		// Filter by a list of product statuses.
		if ( ! empty( $request['include_status'] ) ) {
			$args['post_status'] = $request['include_status'];
		}

		if ( ! empty( $request['exclude_status'] ) ) {
			$this->exclude_status = $request['exclude_status'];
		} else {
			$this->exclude_status = array();
		}

		// Filter downloadable products.
		if ( isset( $request['downloadable'] ) ) {
			$args['meta_query'] = $this->add_meta_query( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				$args,
				array(
					'key'   => '_downloadable',
					'value' => wc_bool_to_string( $request['downloadable'] ),
				)
			);
		}

		// Filter virtual products.
		if ( isset( $request['virtual'] ) ) {
			$args['meta_query'] = $this->add_meta_query( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				$args,
				array(
					'key'   => '_virtual',
					'value' => wc_bool_to_string( $request['virtual'] ),
				)
			);
		}

		// Taxonomy query to filter products by type, category,
		// tag, shipping class, and attribute.
		$tax_query = array();

		// Map between taxonomy name and arg's key.
		$taxonomies = array(
			'product_cat'            => 'category',
			'product_tag'            => 'tag',
			'product_shipping_class' => 'shipping_class',
		);

		// Set tax_query for each passed arg.
		foreach ( $taxonomies as $taxonomy => $key ) {
			if ( ! empty( $request[ $key ] ) ) {
				$tax_query[] = array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $request[ $key ],
				);
			}
		}

		// Filter product type by slug.
		$terms = array();
		if ( ! empty( $request['include_types'] ) ) {
			$terms = $request['include_types'];
		} elseif ( ! empty( $request['type'] ) ) {
			$terms[] = $request['type'];
		}

		if ( ! empty( $terms ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_type',
				'field'    => 'slug',
				'terms'    => $terms,
			);
		}

		// Add exclude types filter.
		if ( ! empty( $request['exclude_types'] ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_type',
				'field'    => 'slug',
				'terms'    => $request['exclude_types'],
				'operator' => 'NOT IN',
			);
		}

		// Filter by attribute and term.
		if ( ! empty( $request['attribute'] ) && ! empty( $request['attribute_term'] ) ) {
			if ( in_array( $request['attribute'], wc_get_attribute_taxonomy_names(), true ) ) {
				$tax_query[] = array(
					'taxonomy' => $request['attribute'],
					'field'    => 'term_id',
					'terms'    => $request['attribute_term'],
				);
			}
		}

		// Build tax_query if taxonomies are set.
		if ( ! empty( $tax_query ) ) {
			if ( ! empty( $args['tax_query'] ) ) {
				$args['tax_query'] = array_merge( $tax_query, $args['tax_query'] ); // WPCS: slow query ok.
			} else {
				$args['tax_query'] = $tax_query; // WPCS: slow query ok.
			}
		}

		// Filter featured.
		if ( is_bool( $request['featured'] ) ) {
			$args['tax_query'][] = array(
				'taxonomy' => 'product_visibility',
				'field'    => 'name',
				'terms'    => 'featured',
				'operator' => true === $request['featured'] ? 'IN' : 'NOT IN',
			);
		}

		// Search parameter precedence: search_fields > search_name_or_sku > search_sku > sku.
		$search_fields = $request['search_fields'] ?? array();
		$search_arg    = trim( $request['search'] ?? '' );

		if ( $search_fields && $search_arg ) {
			$tokens = array_filter( array_map( 'trim', explode( ' ', $search_arg ) ) );

			$this->search_fields_tokens = array(
				'fields' => $search_fields,
				'tokens' => $tokens,
			);

			unset( $request['search'], $request['search_sku'], $request['sku'], $request['search_name_or_sku'], $args['s'] );
		}

		$search_name_or_sku_arg = $request['search_name_or_sku'] ?? '';

		if ( '' !== $search_name_or_sku_arg ) {
			// Do a tokenized search for name or SKU. Supersedes the 'search', 'search_sku' and 'sku' arguments.
			$tokens                          = array_filter( array_map( 'trim', explode( ' ', $search_name_or_sku_arg ) ) );
			$this->search_name_or_sku_tokens = $tokens;

			unset( $request['search'] );
			unset( $args['s'] );
			unset( $request['search_sku'] );
			unset( $request['sku'] );
		} elseif ( wc_product_sku_enabled() ) {
			// Do a partial match for a sku. Supersedes the 'sku' argument, that does exact matching.
			if ( ! empty( $request['search_sku'] ) ) {
				// Store this for use in the query clause filters.
				$this->search_sku_arg_value = $request['search_sku'];

				unset( $request['sku'] );
			}

			// Filter by sku.
			if ( ! empty( $request['sku'] ) ) {
				$skus = explode( ',', $request['sku'] );
				// Include the current string as a SKU too.
				if ( 1 < count( $skus ) ) {
					$skus[] = $request['sku'];
				}

				$args['meta_query'] = $this->add_meta_query( // WPCS: slow query ok.
					$args,
					array(
						'key'     => '_sku',
						'value'   => $skus,
						'compare' => 'IN',
					)
				);
			}
		}

		if ( ! empty( $request['global_unique_id'] ) ) {
			$global_unique_ids  = array_map( 'trim', explode( ',', $request['global_unique_id'] ) );
			$args['meta_query'] = $this->add_meta_query( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				$args,
				array(
					'key'     => '_global_unique_id',
					'value'   => $global_unique_ids,
					'compare' => 'IN',
				)
			);
		}

		// Filter by tax class.
		if ( ! empty( $request['tax_class'] ) ) {
			$args['meta_query'] = $this->add_meta_query( // WPCS: slow query ok.
				$args,
				array(
					'key'   => '_tax_class',
					'value' => 'standard' !== $request['tax_class'] ? $request['tax_class'] : '',
				)
			);
		}

		// Price filter.
		if ( ! empty( $request['min_price'] ) || ! empty( $request['max_price'] ) ) {
			$args['meta_query'] = $this->add_meta_query( $args, wc_get_min_max_price_meta_query( $request ) );  // WPCS: slow query ok.
		}

		// Filter product by stock_status.
		if ( ! empty( $request['stock_status'] ) ) {
			$args['meta_query'] = $this->add_meta_query( // WPCS: slow query ok.
				$args,
				array(
					'key'   => '_stock_status',
					'value' => $request['stock_status'],
				)
			);
		}

		// Filter by on sale products.
		if ( is_bool( $request['on_sale'] ) ) {
			$on_sale_key = $request['on_sale'] ? 'post__in' : 'post__not_in';
			$on_sale_ids = wc_get_product_ids_on_sale();

			// Use 0 when there's no on sale products to avoid return all products.
			$on_sale_ids = empty( $on_sale_ids ) ? array( 0 ) : $on_sale_ids;

			$args[ $on_sale_key ] += $on_sale_ids;
		}

		// Force the post_type argument, since it's not a user input variable.
		if ( ! empty( $request['sku'] ) || ! empty( $request['search_sku'] ) || $this->search_name_or_sku_tokens || $this->search_fields_tokens ) {
			$args['post_type'] = array( 'product', 'product_variation' );
		} else {
			$args['post_type'] = $this->post_type;
		}

		$ordering_args   = WC()->query->get_catalog_ordering_args( $args['orderby'], $args['order'] );
		$args['orderby'] = $ordering_args['orderby'];
		$args['order']   = $ordering_args['order'];
		if ( $ordering_args['meta_key'] ) {
			$args['meta_key'] = $ordering_args['meta_key']; // WPCS: slow query ok.
		}

		/*
		 * When the suggested products ids is not empty,
		 * filter the query to return only the suggested products,
		 * overwriting the post__in parameter.
		 */
		if ( ! empty( $this->suggested_products_ids ) ) {
			$args['post__in'] = $this->suggested_products_ids;
		}

		// Force the post_type argument, since it's not a user input variable.
		if ( ! empty( $request['global_unique_id'] ) ) {
			$args['post_type'] = array( 'product', 'product_variation' );
		}

		return $args;
	}

	/**
	 * Get objects.
	 *
	 * @param array $query_args Query args.
	 * @return array
	 */
	protected function get_objects( $query_args ) {
		$add_search_criteria = $this->search_sku_arg_value || $this->search_name_or_sku_tokens || $this->search_fields_tokens;

		// Add filters for search criteria in product postmeta via the lookup table.
		if ( $add_search_criteria ) {
			add_filter( 'posts_join', array( $this, 'add_search_criteria_to_wp_query_join' ) );
			add_filter( 'posts_where', array( $this, 'add_search_criteria_to_wp_query_where' ) );
		}

		// Add filters for excluding product statuses.
		if ( ! empty( $this->exclude_status ) ) {
			add_filter( 'posts_where', array( $this, 'exclude_product_statuses' ) );
		}

		$result = parent::get_objects( $query_args );

		// Remove filters for search criteria in product postmeta via the lookup table.
		if ( $add_search_criteria ) {
			remove_filter( 'posts_join', array( $this, 'add_search_criteria_to_wp_query_join' ) );
			remove_filter( 'posts_where', array( $this, 'add_search_criteria_to_wp_query_where' ) );

			$this->search_sku_arg_value      = '';
			$this->search_name_or_sku_tokens = null;
			$this->search_fields_tokens      = null;
		}

		// Remove filters for excluding product statuses.
		if ( ! empty( $this->exclude_status ) ) {
			remove_filter( 'posts_where', array( $this, 'exclude_product_statuses' ) );

			$this->exclude_status = array();
		}

		return $result;
	}

	/**
	 * Join `wc_product_meta_lookup` table when SKU search query is present.
	 *
	 * @param string $join Join clause used to search posts.
	 * @return string
	 */
	public function add_search_criteria_to_wp_query_join( $join ) {
		// Check if already joined to avoid duplicate joins.
		if ( strstr( $join, 'wc_product_meta_lookup' ) ) {
			return $join;
		}

		// Only join if we need meta table search.
		if ( ! $this->search_fields_tokens &&
			! $this->search_sku_arg_value &&
			! ( $this->search_name_or_sku_tokens && wc_product_sku_enabled() ) ) {
			return $join;
		}

		global $wpdb;

		$join .= " LEFT JOIN $wpdb->wc_product_meta_lookup wc_product_meta_lookup
						ON $wpdb->posts.ID = wc_product_meta_lookup.product_id ";

		return $join;
	}

	/**
	 * Add a where clause for matching the SKU field.
	 *
	 * @param string $where Where clause used to search posts.
	 * @return string
	 */
	public function add_search_criteria_to_wp_query_where( $where ) {
		global $wpdb;

		if ( $this->search_fields_tokens ) {
			$where .= $this->build_dynamic_search_clauses(
				$this->search_fields_tokens['tokens'],
				$this->search_fields_tokens['fields']
			);
		} elseif ( $this->search_name_or_sku_tokens ) {
			$searchable_fields = wc_product_sku_enabled() ? array( 'name', 'sku' ) : array( 'name' );
			$where            .= $this->build_dynamic_search_clauses(
				$this->search_name_or_sku_tokens,
				$searchable_fields
			);
		} elseif ( ! empty( $this->search_sku_arg_value ) ) {
			$like_search = '%' . $wpdb->esc_like( $this->search_sku_arg_value ) . '%';
			$where      .= ' AND ' . $wpdb->prepare( '(wc_product_meta_lookup.sku LIKE %s)', $like_search );
		}
		return $where;
	}

	/**
	 * Build search clauses for dynamic product search.
	 *
	 * @param array $tokens Search tokens.
	 * @param array $fields Fields to search in.
	 * @return string
	 */
	private function build_dynamic_search_clauses( $tokens, $fields ) {
		global $wpdb;

		if ( empty( $fields ) || empty( $tokens ) ) {
			return '';
		}

		$column_map = array(
			'name'              => "{$wpdb->posts}.post_title",
			'sku'               => 'wc_product_meta_lookup.sku',
			'global_unique_id'  => 'wc_product_meta_lookup.global_unique_id',
			'description'       => "{$wpdb->posts}.post_content",
			'short_description' => "{$wpdb->posts}.post_excerpt",
		);

		$field_clauses = array();

		foreach ( $tokens as $token ) {
			$like_search         = '%' . $wpdb->esc_like( $token ) . '%';
			$field_token_clauses = array();

			foreach ( $fields as $field ) {
				if ( ! isset( $column_map[ $field ] ) ) {
					continue;
				}

				$db_column             = $column_map[ $field ];
				$field_token_clauses[] = $wpdb->prepare( "({$db_column} LIKE %s)", $like_search ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			}

			if ( $field_token_clauses ) {
				$field_clauses[] = '(' . implode( ' OR ', $field_token_clauses ) . ')';
			}
		}

		return $field_clauses ? ' AND (' . implode( ' AND ', $field_clauses ) . ')' : '';
	}

	/**
	 * Exclude product statuses from the query.
	 *
	 * @param string $where Where clause used to search posts.
	 * @return string
	 */
	public function exclude_product_statuses( $where ) {
		if ( ! empty( $this->exclude_status ) && is_array( $this->exclude_status ) ) {
			global $wpdb;

			$not_in = array();
			foreach ( $this->exclude_status as $status_to_exclude ) {
				$not_in[] = $wpdb->prepare( '%s', $status_to_exclude );
			}

			$not_in = join( ', ', $not_in );
			return $where . " AND $wpdb->posts.post_status NOT IN ( $not_in )";
		}

		return $where;
	}

	/**
	 * Set product images.
	 *
	 * @throws WC_REST_Exception REST API exceptions.
	 * @param WC_Product $product Product instance.
	 * @param array      $images  Images data.
	 * @return WC_Product
	 */
	protected function set_product_images( $product, $images ) {
		$images = is_array( $images ) ? array_filter( $images ) : array();

		if ( ! empty( $images ) ) {
			$gallery = array();

			foreach ( $images as $index => $image ) {
				$attachment_id = isset( $image['id'] ) ? absint( $image['id'] ) : 0;
				// The request can contain an attachment ID, if it doesn't, it's a new upload.
				$is_new_upload = false;

				if ( 0 === $attachment_id && isset( $image['src'] ) ) {
					$upload = wc_rest_upload_image_from_url( esc_url_raw( $image['src'] ) );

					if ( is_wp_error( $upload ) ) {
						if ( ! apply_filters( 'poocommerce_rest_suppress_image_upload_error', false, $upload, $product->get_id(), $images ) ) {
							throw new WC_REST_Exception( 'poocommerce_product_image_upload_error', $upload->get_error_message(), 400 );
						} else {
							continue;
						}
					}

					$attachment_id = wc_rest_set_uploaded_image_as_attachment( $upload, $product->get_id() );
					$is_new_upload = true;
				}

				if ( ! wp_attachment_is_image( $attachment_id ) ) {
					/* translators: %s: image ID */
					throw new WC_REST_Exception( 'poocommerce_product_invalid_image_id', sprintf( __( '#%s is an invalid image ID.', 'poocommerce' ), $attachment_id ), 400 );
				}

				if ( $is_new_upload && $attachment_id > 0 ) {
					// Tracking this for rollback purposes.
					$this->processed_attachment_ids_for_request[] = $attachment_id;
				}

				$featured_image = $product->get_image_id();

				if ( 0 === $index ) {
					$product->set_image_id( $attachment_id );
					wc_product_attach_featured_image( $attachment_id, $product, false );
				} else {
					$gallery[] = $attachment_id;
				}

				// Set the image alt if present.
				if ( ! empty( $image['alt'] ) ) {
					update_post_meta( $attachment_id, '_wp_attachment_image_alt', wc_clean( $image['alt'] ) );
				}

				// Set the image name if present.
				if ( ! empty( $image['name'] ) ) {
					wp_update_post(
						array(
							'ID'         => $attachment_id,
							'post_title' => $image['name'],
						)
					);
				}
			}

			$product->set_gallery_image_ids( $gallery );
		} else {
			$product->set_image_id( '' );
			$product->set_gallery_image_ids( array() );
		}

		return $product;
	}

	/**
	 * Prepare a single product for create or update.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @param  bool            $creating If is creating a new object.
	 * @return WP_Error|WC_Data
	 */
	protected function prepare_object_for_database( $request, $creating = false ) {
		$id = isset( $request['id'] ) ? absint( $request['id'] ) : 0;

		// Type is the most important part here because we need to be using the correct class and methods.
		if ( isset( $request['type'] ) ) {
			$classname = WC_Product_Factory::get_classname_from_product_type( $request['type'] );

			if ( ! class_exists( $classname ) ) {
				$classname = 'WC_Product_Simple';
			}

			$product = new $classname( $id );
		} elseif ( isset( $request['id'] ) ) {
			$product = wc_get_product( $id );
		} else {
			$product = new WC_Product_Simple();
		}

		if ( ProductType::VARIATION === $product->get_type() ) {
			return new WP_Error(
				"poocommerce_rest_invalid_{$this->post_type}_id",
				__( 'To manipulate product variations you should use the /products/&lt;product_id&gt;/variations/&lt;id&gt; endpoint.', 'poocommerce' ),
				array(
					'status' => 404,
				)
			);
		}

		// Post title.
		if ( isset( $request['name'] ) ) {
			$product->set_name( wp_filter_post_kses( $request['name'] ) );
		}

		// Post content.
		if ( isset( $request['description'] ) ) {
			$product->set_description( wp_filter_post_kses( $request['description'] ) );
		}

		// Post excerpt.
		if ( isset( $request['short_description'] ) ) {
			$product->set_short_description( wp_filter_post_kses( $request['short_description'] ) );
		}

		// Post status.
		if ( isset( $request['status'] ) ) {
			$product->set_status( get_post_status_object( $request['status'] ) ? $request['status'] : ProductStatus::DRAFT );
		}

		// Post slug.
		if ( isset( $request['slug'] ) ) {
			$product->set_slug( $request['slug'] );
		}

		// Menu order.
		if ( isset( $request['menu_order'] ) ) {
			$product->set_menu_order( $request['menu_order'] );
		}

		// Comment status.
		if ( isset( $request['reviews_allowed'] ) ) {
			$product->set_reviews_allowed( $request['reviews_allowed'] );
		}

		// Post password.
		if ( isset( $request['post_password'] ) ) {
			$product->set_post_password( $request['post_password'] );
		}

		// Virtual.
		if ( isset( $request['virtual'] ) ) {
			$product->set_virtual( $request['virtual'] );
		}

		// Tax status.
		if ( isset( $request['tax_status'] ) ) {
			$product->set_tax_status( $request['tax_status'] );
		}

		// Tax Class.
		if ( isset( $request['tax_class'] ) ) {
			$product->set_tax_class( $request['tax_class'] );
		}

		// Catalog Visibility.
		if ( isset( $request['catalog_visibility'] ) ) {
			$product->set_catalog_visibility( $request['catalog_visibility'] );
		}

		// Purchase Note.
		if ( isset( $request['purchase_note'] ) ) {
			$product->set_purchase_note( wp_kses_post( wp_unslash( $request['purchase_note'] ) ) );
		}

		// Featured Product.
		if ( isset( $request['featured'] ) ) {
			$product->set_featured( $request['featured'] );
		}

		// Shipping data.
		$product = $this->save_product_shipping_data( $product, $request );

		// SKU.
		if ( isset( $request['sku'] ) ) {
			$product->set_sku( wc_clean( $request['sku'] ) );
		}

		// Unique ID.
		if ( isset( $request['global_unique_id'] ) ) {
			$product->set_global_unique_id( wc_clean( $request['global_unique_id'] ) );
		}

		// Attributes.
		if ( isset( $request['attributes'] ) ) {
			$attributes = array();

			foreach ( $request['attributes'] as $attribute ) {
				$attribute_id   = 0;
				$attribute_name = '';

				// Check ID for global attributes or name for product attributes.
				if ( ! empty( $attribute['id'] ) ) {
					$attribute_id   = absint( $attribute['id'] );
					$attribute_name = wc_attribute_taxonomy_name_by_id( $attribute_id );
				} elseif ( ! empty( $attribute['name'] ) ) {
					$attribute_name = wc_clean( $attribute['name'] );
				}

				if ( ! $attribute_id && ! $attribute_name ) {
					continue;
				}

				if ( $attribute_id ) {

					if ( isset( $attribute['options'] ) ) {
						$options = $attribute['options'];

						if ( ! is_array( $attribute['options'] ) ) {
							// Text based attributes - Posted values are term names.
							$options = explode( WC_DELIMITER, $options );
						}

						$values = array_map( 'wc_sanitize_term_text_based', $options );
						$values = array_filter( $values, 'strlen' );
					} else {
						$values = array();
					}

					if ( ! empty( $values ) ) {
						// Add attribute to array, but don't set values.
						$attribute_object = new WC_Product_Attribute();
						$attribute_object->set_id( $attribute_id );
						$attribute_object->set_name( $attribute_name );
						$attribute_object->set_options( $values );
						$attribute_object->set_position( isset( $attribute['position'] ) ? (string) absint( $attribute['position'] ) : '0' );
						$attribute_object->set_visible( ( isset( $attribute['visible'] ) && $attribute['visible'] ) ? 1 : 0 );
						$attribute_object->set_variation( ( isset( $attribute['variation'] ) && $attribute['variation'] ) ? 1 : 0 );
						$attributes[] = $attribute_object;
					}
				} elseif ( isset( $attribute['options'] ) ) {
					// Custom attribute - Add attribute to array and set the values.
					if ( is_array( $attribute['options'] ) ) {
						$values = $attribute['options'];
					} else {
						$values = explode( WC_DELIMITER, $attribute['options'] );
					}
					$attribute_object = new WC_Product_Attribute();
					$attribute_object->set_name( $attribute_name );
					$attribute_object->set_options( $values );
					$attribute_object->set_position( isset( $attribute['position'] ) ? (string) absint( $attribute['position'] ) : '0' );
					$attribute_object->set_visible( ( isset( $attribute['visible'] ) && $attribute['visible'] ) ? 1 : 0 );
					$attribute_object->set_variation( ( isset( $attribute['variation'] ) && $attribute['variation'] ) ? 1 : 0 );
					$attributes[] = $attribute_object;
				}
			}
			$product->set_attributes( $attributes );
		}

		// Sales and prices.
		if ( in_array( $product->get_type(), array( ProductType::VARIABLE, ProductType::GROUPED ), true ) ) {
			$product->set_regular_price( '' );
			$product->set_sale_price( '' );
			$product->set_date_on_sale_to( '' );
			$product->set_date_on_sale_from( '' );
			$product->set_price( '' );
		} else {
			// Regular Price.
			if ( isset( $request['regular_price'] ) ) {
				$product->set_regular_price( $request['regular_price'] );
			}

			// Sale Price.
			if ( isset( $request['sale_price'] ) ) {
				$product->set_sale_price( $request['sale_price'] );
			}

			if ( isset( $request['date_on_sale_from'] ) ) {
				$product->set_date_on_sale_from( $request['date_on_sale_from'] );
			}

			if ( isset( $request['date_on_sale_from_gmt'] ) ) {
				$product->set_date_on_sale_from( $request['date_on_sale_from_gmt'] ? strtotime( $request['date_on_sale_from_gmt'] ) : null );
			}

			if ( isset( $request['date_on_sale_to'] ) ) {
				$product->set_date_on_sale_to( $request['date_on_sale_to'] );
			}

			if ( isset( $request['date_on_sale_to_gmt'] ) ) {
				$product->set_date_on_sale_to( $request['date_on_sale_to_gmt'] ? strtotime( $request['date_on_sale_to_gmt'] ) : null );
			}
		}

		// Product parent ID.
		if ( isset( $request['parent_id'] ) ) {
			$product->set_parent_id( $request['parent_id'] );
		}

		// Sold individually.
		if ( isset( $request['sold_individually'] ) ) {
			$product->set_sold_individually( $request['sold_individually'] );
		}

		// Stock status; stock_status has priority over in_stock.
		if ( isset( $request['stock_status'] ) ) {
			$stock_status = $request['stock_status'];
		} else {
			$stock_status = $product->get_stock_status();
		}

		// Stock data.
		if ( 'yes' === get_option( 'poocommerce_manage_stock' ) ) {
			// Manage stock.
			if ( isset( $request['manage_stock'] ) ) {
				$product->set_manage_stock( $request['manage_stock'] );
			}

			// Backorders.
			if ( isset( $request['backorders'] ) ) {
				$product->set_backorders( $request['backorders'] );
			}

			if ( $product->is_type( ProductType::GROUPED ) ) {
				$product->set_manage_stock( 'no' );
				$product->set_backorders( 'no' );
				$product->set_stock_quantity( '' );
				$product->set_stock_status( $stock_status );
			} elseif ( $product->is_type( ProductType::EXTERNAL ) ) {
				$product->set_manage_stock( 'no' );
				$product->set_backorders( 'no' );
				$product->set_stock_quantity( '' );
				$product->set_stock_status( ProductStockStatus::IN_STOCK );
			} elseif ( $product->get_manage_stock() ) {
				// Stock status is always determined by children so sync later.
				if ( ! $product->is_type( ProductType::VARIABLE ) ) {
					$product->set_stock_status( $stock_status );
				}

				// Stock quantity.
				if ( isset( $request['stock_quantity'] ) ) {
					$product->set_stock_quantity( wc_stock_amount( $request['stock_quantity'] ) );
				} elseif ( isset( $request['inventory_delta'] ) ) {
					$stock_quantity  = wc_stock_amount( $product->get_stock_quantity() );
					$stock_quantity += wc_stock_amount( $request['inventory_delta'] );
					$product->set_stock_quantity( wc_stock_amount( $stock_quantity ) );
				}

				// Low stock amount.
				// isset() returns false for value null, thus we need to check whether the value has been sent by the request.
				if ( array_key_exists( 'low_stock_amount', $request->get_params() ) ) {
					if ( null === $request['low_stock_amount'] ) {
						$product->set_low_stock_amount( '' );
					} else {
						$product->set_low_stock_amount( wc_stock_amount( $request['low_stock_amount'] ) );
					}
				}
			} else {
				// Don't manage stock.
				$product->set_manage_stock( 'no' );
				$product->set_stock_quantity( '' );
				$product->set_stock_status( $stock_status );
				$product->set_low_stock_amount( '' );
			}
		} elseif ( ! $product->is_type( ProductType::VARIABLE ) ) {
			$product->set_stock_status( $stock_status );
		}

		// Upsells.
		if ( isset( $request['upsell_ids'] ) ) {
			$upsells = array();
			$ids     = $request['upsell_ids'];

			if ( ! empty( $ids ) ) {
				foreach ( $ids as $id ) {
					if ( $id && $id > 0 ) {
						$upsells[] = $id;
					}
				}
			}

			$product->set_upsell_ids( $upsells );
		}

		// Cross sells.
		if ( isset( $request['cross_sell_ids'] ) ) {
			$crosssells = array();
			$ids        = $request['cross_sell_ids'];

			if ( ! empty( $ids ) ) {
				foreach ( $ids as $id ) {
					if ( $id && $id > 0 ) {
						$crosssells[] = $id;
					}
				}
			}

			$product->set_cross_sell_ids( $crosssells );
		}

		// Product categories.
		if ( isset( $request['categories'] ) && is_array( $request['categories'] ) ) {
			$product = $this->save_taxonomy_terms( $product, $request['categories'] );
		}

		// Product tags.
		if ( isset( $request['tags'] ) && is_array( $request['tags'] ) ) {
			$new_tags = array();

			foreach ( $request['tags'] as $tag ) {
				if ( ! isset( $tag['name'] ) ) {
					$new_tags[] = $tag;
					continue;
				}

				if ( ! term_exists( $tag['name'], 'product_tag' ) ) {
					// Create the tag if it doesn't exist.
					$term = wp_insert_term( $tag['name'], 'product_tag' );

					if ( ! is_wp_error( $term ) ) {
						$new_tags[] = array(
							'id' => $term['term_id'],
						);

						continue;
					}
				} else {
					// Tag exists, assume user wants to set the product with this tag.
					$new_tags[] = array(
						'id' => get_term_by( 'name', $tag['name'], 'product_tag' )->term_id,
					);
				}
			}

			$product = $this->save_taxonomy_terms( $product, $new_tags, 'tag' );
		}

		// Downloadable.
		if ( isset( $request['downloadable'] ) ) {
			$product->set_downloadable( $request['downloadable'] );
		}

		// Downloadable options.
		if ( $product->get_downloadable() ) {

			// Downloadable files.
			if ( isset( $request['downloads'] ) && is_array( $request['downloads'] ) ) {
				$product = $this->save_downloadable_files( $product, $request['downloads'] );
			}

			// Download limit.
			if ( isset( $request['download_limit'] ) ) {
				$product->set_download_limit( $request['download_limit'] );
			}

			// Download expiry.
			if ( isset( $request['download_expiry'] ) ) {
				$product->set_download_expiry( $request['download_expiry'] );
			}
		}

		// Product url and button text for external products.
		if ( $product->is_type( ProductType::EXTERNAL ) ) {
			if ( isset( $request['external_url'] ) ) {
				$product->set_product_url( $request['external_url'] );
			}

			if ( isset( $request['button_text'] ) ) {
				$product->set_button_text( $request['button_text'] );
			}
		}

		// Save default attributes for variable products.
		if ( $product->is_type( ProductType::VARIABLE ) ) {
			$product = $this->save_default_attributes( $product, $request );
		}

		// Set children for a grouped product.
		if ( $product->is_type( ProductType::GROUPED ) && isset( $request['grouped_products'] ) ) {
			$product->set_children( $request['grouped_products'] );
		}

		// Check for featured/gallery images, upload it and set it.
		if ( isset( $request['images'] ) ) {
			$product = $this->set_product_images( $product, $request['images'] );
		}

		// Allow set meta_data.
		if ( is_array( $request['meta_data'] ) ) {
			foreach ( $request['meta_data'] as $meta ) {
				$product->update_meta_data( $meta['key'], $meta['value'], isset( $meta['id'] ) ? $meta['id'] : '' );
			}
		}

		if ( ! empty( $request['date_created'] ) ) {
			$date = rest_parse_date( $request['date_created'] );

			if ( $date ) {
				$product->set_date_created( $date );
			}
		}

		if ( ! empty( $request['date_created_gmt'] ) ) {
			$date = rest_parse_date( $request['date_created_gmt'], true );

			if ( $date ) {
				$product->set_date_created( $date );
			}
		}

		if ( $this->cogs_is_enabled() ) {
			$this->set_cogs_info_in_product_object( $request, $product );
		}

		/**
		 * Filters an object before it is inserted via the REST API.
		 *
		 * The dynamic portion of the hook name, `$this->post_type`,
		 * refers to the object type slug.
		 *
		 * @param WC_Data         $product  Object object.
		 * @param WP_REST_Request $request  Request object.
		 * @param bool            $creating If is creating a new object.
		 */
		return apply_filters( "poocommerce_rest_pre_insert_{$this->post_type}_object", $product, $request, $creating );
	}

	/**
	 * Get the Product's schema, conforming to JSON Schema.
	 *
	 * @return array
	 */
	public function get_item_schema() {
		$weight_unit_label    = I18nUtil::get_weight_unit_label( get_option( 'poocommerce_weight_unit', 'kg' ) );
		$dimension_unit_label = I18nUtil::get_dimensions_unit_label( get_option( 'poocommerce_dimension_unit', 'cm' ) );
		$schema               = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => $this->post_type,
			'type'       => 'object',
			'properties' => array(
				'id'                    => array(
					'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'name'                  => array(
					'description' => __( 'Product name.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'slug'                  => array(
					'description' => __( 'Product slug.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'permalink'             => array(
					'description' => __( 'Product URL.', 'poocommerce' ),
					'type'        => 'string',
					'format'      => 'uri',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_created'          => array(
					'description' => __( "The date the product was created, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'date_created_gmt'      => array(
					'description' => __( 'The date the product was created, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'date_modified'         => array(
					'description' => __( "The date the product was last modified, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_modified_gmt'     => array(
					'description' => __( 'The date the product was last modified, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'type'                  => array(
					'description' => __( 'Product type.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => ProductType::SIMPLE,
					'enum'        => array_keys( wc_get_product_types() ),
					'context'     => array( 'view', 'edit' ),
				),
				'status'                => array(
					'description' => __( 'Product status (post status).', 'poocommerce' ),
					'type'        => 'string',
					'default'     => ProductStatus::PUBLISH,
					'enum'        => array_merge( array_keys( get_post_statuses() ), array( ProductStatus::FUTURE, ProductStatus::AUTO_DRAFT, ProductStatus::TRASH ) ),
					'context'     => array( 'view', 'edit' ),
				),
				'featured'              => array(
					'description' => __( 'Featured product.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => false,
					'context'     => array( 'view', 'edit' ),
				),
				'catalog_visibility'    => array(
					'description' => __( 'Catalog visibility.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => CatalogVisibility::VISIBLE,
					'enum'        => array( CatalogVisibility::VISIBLE, CatalogVisibility::CATALOG, CatalogVisibility::SEARCH, CatalogVisibility::HIDDEN ),
					'context'     => array( 'view', 'edit' ),
				),
				'description'           => array(
					'description' => __( 'Product description.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'short_description'     => array(
					'description' => __( 'Product short description.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'sku'                   => array(
					'description' => __( 'Stock Keeping Unit.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'global_unique_id'      => array(
					'description' => __( 'GTIN, UPC, EAN or ISBN.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'price'                 => array(
					'description' => __( 'Current product price.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'regular_price'         => array(
					'description' => __( 'Product regular price.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'sale_price'            => array(
					'description' => __( 'Product sale price.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'date_on_sale_from'     => array(
					'description' => __( "Start date of sale price, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'date_on_sale_from_gmt' => array(
					'description' => __( 'Start date of sale price, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'date_on_sale_to'       => array(
					'description' => __( "End date of sale price, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'date_on_sale_to_gmt'   => array(
					'description' => __( "End date of sale price, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
				),
				'price_html'            => array(
					'description' => __( 'Price formatted in HTML.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'on_sale'               => array(
					'description' => __( 'Shows if the product is on sale.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'purchasable'           => array(
					'description' => __( 'Shows if the product can be bought.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'total_sales'           => array(
					'description' => __( 'Amount of sales.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'virtual'               => array(
					'description' => __( 'If the product is virtual.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => false,
					'context'     => array( 'view', 'edit' ),
				),
				'downloadable'          => array(
					'description' => __( 'If the product is downloadable.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => false,
					'context'     => array( 'view', 'edit' ),
				),
				'downloads'             => array(
					'description' => __( 'List of downloadable files.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'   => array(
								'description' => __( 'File ID.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'name' => array(
								'description' => __( 'File name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'file' => array(
								'description' => __( 'File URL.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
						),
					),
				),
				'download_limit'        => array(
					'description' => __( 'Number of times downloadable files can be downloaded after purchase.', 'poocommerce' ),
					'type'        => 'integer',
					'default'     => -1,
					'context'     => array( 'view', 'edit' ),
				),
				'download_expiry'       => array(
					'description' => __( 'Number of days until access to downloadable files expires.', 'poocommerce' ),
					'type'        => 'integer',
					'default'     => -1,
					'context'     => array( 'view', 'edit' ),
				),
				'external_url'          => array(
					'description' => __( 'Product external URL. Only for external products.', 'poocommerce' ),
					'type'        => 'string',
					'format'      => 'uri',
					'context'     => array( 'view', 'edit' ),
				),
				'button_text'           => array(
					'description' => __( 'Product external button text. Only for external products.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'tax_status'            => array(
					'description' => __( 'Tax status.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => ProductTaxStatus::TAXABLE,
					'enum'        => array( ProductTaxStatus::TAXABLE, ProductTaxStatus::SHIPPING, ProductTaxStatus::NONE ),
					'context'     => array( 'view', 'edit' ),
				),
				'tax_class'             => array(
					'description' => __( 'Tax class.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'manage_stock'          => array(
					'description' => __( 'Stock management at product level.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => false,
					'context'     => array( 'view', 'edit' ),
				),
				'stock_quantity'        => array(
					'description' => __( 'Stock quantity.', 'poocommerce' ),
					'type'        => wc_is_stock_amount_integer() ? 'integer' : 'number',
					'context'     => array( 'view', 'edit' ),
				),
				'stock_status'          => array(
					'description' => __( 'Controls the stock status of the product.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => ProductStockStatus::IN_STOCK,
					'enum'        => array_keys( wc_get_product_stock_status_options() ),
					'context'     => array( 'view', 'edit' ),
				),
				'backorders'            => array(
					'description' => __( 'If managing stock, this controls if backorders are allowed.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => 'no',
					'enum'        => array( 'no', 'notify', 'yes' ),
					'context'     => array( 'view', 'edit' ),
				),
				'backorders_allowed'    => array(
					'description' => __( 'Shows if backorders are allowed.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'backordered'           => array(
					'description' => __( 'Shows if the product is on backordered.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'low_stock_amount'      => array(
					'description' => __( 'Low Stock amount for the product.', 'poocommerce' ),
					'type'        => array( 'integer', 'null' ),
					'context'     => array( 'view', 'edit' ),
				),
				'sold_individually'     => array(
					'description' => __( 'Allow one item to be bought in a single order.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => false,
					'context'     => array( 'view', 'edit' ),
				),
				'weight'                => array(
					/* translators: %s: weight unit */
					'description' => sprintf( __( 'Product weight (%s).', 'poocommerce' ), $weight_unit_label ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'dimensions'            => array(
					'description' => __( 'Product dimensions.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'properties'  => array(
						'length' => array(
							/* translators: %s: dimension unit */
							'description' => sprintf( __( 'Product length (%s).', 'poocommerce' ), $dimension_unit_label ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'width'  => array(
							/* translators: %s: dimension unit */
							'description' => sprintf( __( 'Product width (%s).', 'poocommerce' ), $dimension_unit_label ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'height' => array(
							/* translators: %s: dimension unit */
							'description' => sprintf( __( 'Product height (%s).', 'poocommerce' ), $dimension_unit_label ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
					),
				),
				'shipping_required'     => array(
					'description' => __( 'Shows if the product need to be shipped.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'shipping_taxable'      => array(
					'description' => __( 'Shows whether or not the product shipping is taxable.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'shipping_class'        => array(
					'description' => __( 'Shipping class slug.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'shipping_class_id'     => array(
					'description' => __( 'Shipping class ID.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'reviews_allowed'       => array(
					'description' => __( 'Allow reviews.', 'poocommerce' ),
					'type'        => 'boolean',
					'default'     => true,
					'context'     => array( 'view', 'edit' ),
				),
				'post_password'         => array(
					'description' => __( 'Post password.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'average_rating'        => array(
					'description' => __( 'Reviews average rating.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'rating_count'          => array(
					'description' => __( 'Amount of reviews that the product have.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'related_ids'           => array(
					'description' => __( 'List of related products IDs.', 'poocommerce' ),
					'type'        => 'array',
					'items'       => array(
						'type' => 'integer',
					),
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'upsell_ids'            => array(
					'description' => __( 'List of up-sell products IDs.', 'poocommerce' ),
					'type'        => 'array',
					'items'       => array(
						'type' => 'integer',
					),
					'context'     => array( 'view', 'edit' ),
				),
				'cross_sell_ids'        => array(
					'description' => __( 'List of cross-sell products IDs.', 'poocommerce' ),
					'type'        => 'array',
					'items'       => array(
						'type' => 'integer',
					),
					'context'     => array( 'view', 'edit' ),
				),
				'parent_id'             => array(
					'description' => __( 'Product parent ID.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
				),
				'purchase_note'         => array(
					'description' => __( 'Optional note to send the customer after purchase.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'categories'            => array(
					'description' => __( 'List of categories.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'   => array(
								'description' => __( 'Category ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'name' => array(
								'description' => __( 'Category name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'slug' => array(
								'description' => __( 'Category slug.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
						),
					),
				),
				'brands'                => array(
					'description' => __( 'List of brands.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'   => array(
								'description' => __( 'Brand ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'name' => array(
								'description' => __( 'Brand name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'slug' => array(
								'description' => __( 'Brand slug.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
						),
					),
				),
				'tags'                  => array(
					'description' => __( 'List of tags.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'   => array(
								'description' => __( 'Tag ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'name' => array(
								'description' => __( 'Tag name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'slug' => array(
								'description' => __( 'Tag slug.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
						),
					),
				),
				'images'                => array(
					'description' => __( 'List of images.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'                => array(
								'description' => __( 'Image ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'date_created'      => array(
								'description' => __( "The date the image was created, in the site's timezone.", 'poocommerce' ),
								'type'        => 'date-time',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'date_created_gmt'  => array(
								'description' => __( 'The date the image was created, as GMT.', 'poocommerce' ),
								'type'        => 'date-time',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'date_modified'     => array(
								'description' => __( "The date the image was last modified, in the site's timezone.", 'poocommerce' ),
								'type'        => 'date-time',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'date_modified_gmt' => array(
								'description' => __( 'The date the image was last modified, as GMT.', 'poocommerce' ),
								'type'        => 'date-time',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'src'               => array(
								'description' => __( 'Image URL.', 'poocommerce' ),
								'type'        => 'string',
								'format'      => 'uri',
								'context'     => array( 'view', 'edit' ),
							),
							'name'              => array(
								'description' => __( 'Image name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'alt'               => array(
								'description' => __( 'Image alternative text.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
						),
					),
				),
				'has_options'           => array(
					'description' => __( 'Shows if the product needs to be configured before it can be bought.', 'poocommerce' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'attributes'            => array(
					'description' => __( 'List of attributes.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'        => array(
								'description' => __( 'Attribute ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'name'      => array(
								'description' => __( 'Attribute name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'position'  => array(
								'description' => __( 'Attribute position.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'visible'   => array(
								'description' => __( "Define if the attribute is visible on the \"Additional information\" tab in the product's page.", 'poocommerce' ),
								'type'        => 'boolean',
								'default'     => false,
								'context'     => array( 'view', 'edit' ),
							),
							'variation' => array(
								'description' => __( 'Define if the attribute can be used as variation.', 'poocommerce' ),
								'type'        => 'boolean',
								'default'     => false,
								'context'     => array( 'view', 'edit' ),
							),
							'options'   => array(
								'description' => __( 'List of available term names of the attribute.', 'poocommerce' ),
								'type'        => 'array',
								'items'       => array(
									'type' => 'string',
								),
								'context'     => array( 'view', 'edit' ),
							),
						),
					),
				),
				'default_attributes'    => array(
					'description' => __( 'Defaults variation attributes.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'     => array(
								'description' => __( 'Attribute ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
							),
							'name'   => array(
								'description' => __( 'Attribute name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'option' => array(
								'description' => __( 'Selected attribute term name.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
						),
					),
				),
				'variations'            => array(
					'description' => __( 'List of variations IDs.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type' => 'integer',
					),
					'readonly'    => true,
				),
				'grouped_products'      => array(
					'description' => __( 'List of grouped products ID.', 'poocommerce' ),
					'type'        => 'array',
					'items'       => array(
						'type' => 'integer',
					),
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'menu_order'            => array(
					'description' => __( 'Menu order, used to custom sort products.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
				),
				'meta_data'             => array(
					'description' => __( 'Meta data.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'id'    => array(
								'description' => __( 'Meta ID.', 'poocommerce' ),
								'type'        => 'integer',
								'context'     => array( 'view', 'edit' ),
								'readonly'    => true,
							),
							'key'   => array(
								'description' => __( 'Meta key.', 'poocommerce' ),
								'type'        => 'string',
								'context'     => array( 'view', 'edit' ),
							),
							'value' => array(
								'description' => __( 'Meta value.', 'poocommerce' ),
								'type'        => 'mixed',
								'context'     => array( 'view', 'edit' ),
							),
						),
					),
				),
			),
		);

		$post_type_obj = get_post_type_object( $this->post_type );
		if ( is_post_type_viewable( $post_type_obj ) && $post_type_obj->public ) {
			$schema['properties']['permalink_template'] = array(
				'description' => __( 'Permalink template for the product.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'edit' ),
				'readonly'    => true,
			);

			$schema['properties']['generated_slug'] = array(
				'description' => __( 'Slug automatically generated from the product name.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'edit' ),
				'readonly'    => true,
			);
		}

		if ( $this->cogs_is_enabled() ) {
			$schema = $this->add_cogs_related_product_schema( $schema, false );
		}

		if ( Features::is_enabled( 'experimental-wc-rest-api' ) ) {
			$schema['properties']['__experimental_min_price'] = array(
				'description' => __( 'Product minimum price.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			);

			$schema['properties']['__experimental_max_price'] = array(
				'description' => __( 'Product maximum price.', 'poocommerce' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			);
		}

		return $this->add_additional_fields_schema( $schema );
	}

	/**
	 * Add new options for 'orderby' to the collection params.
	 *
	 * @return array
	 */
	public function get_collection_params() {
		$params                    = parent::get_collection_params();
		$params['orderby']['enum'] = array_merge( $params['orderby']['enum'], array( 'price', 'popularity', 'rating' ) );

		unset( $params['in_stock'] );
		$params['stock_status'] = array(
			'description'       => __( 'Limit result set to products with specified stock status.', 'poocommerce' ),
			'type'              => 'string',
			'enum'              => array_keys( wc_get_product_stock_status_options() ),
			'sanitize_callback' => 'sanitize_text_field',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['search_sku'] = array(
			'description'       => __( "Limit results to those with a SKU that partial matches a string. This argument takes precedence over 'sku'.", 'poocommerce' ),
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['search_name_or_sku'] = array(
			'description'       => __( "Limit results to those with a name or SKU that partial matches a string. This argument takes precedence over 'search', 'sku' and 'search_sku'.", 'poocommerce' ),
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$search_fields_enum = array( 'name', 'global_unique_id', 'description', 'short_description' );
		if ( wc_product_sku_enabled() ) {
			$search_fields_enum[] = 'sku';
		}

		$params['search_fields'] = array(
			'description'       => __( 'Limit search to specific fields when used with search parameter. Available fields: name, sku, global_unique_id, description, short_description. This argument takes precedence over all other search parameters.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => $search_fields_enum,
			),
			'default'           => array(),
			'sanitize_callback' => 'wp_parse_slug_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['include_status'] = array(
			'description'       => __( 'Limit result set to products with any of the statuses.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => array_merge( array( 'any', ProductStatus::FUTURE, ProductStatus::TRASH ), array_keys( get_post_statuses() ) ),
			),
			'sanitize_callback' => 'wp_parse_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['exclude_status'] = array(
			'description'       => __( 'Exclude products with any of the statuses from result set.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => array_merge( array( ProductStatus::FUTURE, ProductStatus::TRASH ), array_keys( get_post_statuses() ) ),
			),
			'sanitize_callback' => 'wp_parse_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['include_types'] = array(
			'description'       => __( 'Limit result set to products with any of the types.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => array_keys( wc_get_product_types() ),
			),
			'sanitize_callback' => 'wp_parse_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['exclude_types'] = array(
			'description'       => __( 'Exclude products with any of the types from result set.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'string',
				'enum' => array_keys( wc_get_product_types() ),
			),
			'sanitize_callback' => 'wp_parse_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['downloadable'] = array(
			'description'       => __( 'Limit result set to downloadable products.', 'poocommerce' ),
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['virtual'] = array(
			'description'       => __( 'Limit result set to virtual products.', 'poocommerce' ),
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'validate_callback' => 'rest_validate_request_arg',
		);

		return $params;
	}

	/**
	 * Add new options for the suggested-products endpoint.
	 *
	 * @return array
	 */
	public function get_suggested_products_collection_params() {
		$params = parent::get_collection_params();

		$params['categories'] = array(
			'description'       => __( 'Limit result set to specific product categorie ids.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'integer',
			),
			'default'           => array(),
			'sanitize_callback' => 'wp_parse_id_list',
			'validate_callback' => 'rest_validate_request_arg',
		);

		$params['tags'] = array(
			'description'       => __( 'Limit result set to specific product tag ids.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type' => 'integer',
			),
			'default'           => array(),
			'validate_callback' => 'rest_validate_request_arg',
			'sanitize_callback' => 'wp_parse_id_list',
		);

		$params['limit'] = array(
			'description'       => __( 'Limit result set to specific amount of suggested products.', 'poocommerce' ),
			'type'              => 'integer',
			'default'           => 5,
			'validate_callback' => 'rest_validate_request_arg',
			'sanitize_callback' => 'absint',
		);

		return $params;
	}

	/**
	 * Get the downloads for a product.
	 *
	 * @param WC_Product $product Product instance.
	 *
	 * @return array
	 */
	protected function get_downloads( $product ) {
		$downloads = array();

		$context = isset( $this->request ) && isset( $this->request['context'] ) ? $this->request['context'] : 'view';

		if ( $product->is_downloadable() || 'edit' === $context ) {
			foreach ( $product->get_downloads() as $file_id => $file ) {
				$downloads[] = array(
					'id'   => $file_id, // MD5 hash.
					'name' => $file['name'],
					'file' => $file['file'],
				);
			}
		}

		return $downloads;
	}

	/**
	 * Get product data.
	 *
	 * @param WC_Product $product Product instance.
	 * @param string     $context Request context. Options: 'view' and 'edit'.
	 *
	 * @return array
	 */
	protected function get_product_data( $product, $context = 'view' ) {
		$data = parent::get_product_data( ...func_get_args() );

		if ( isset( $this->request ) ) {
			$fields = $this->get_fields_for_response( $this->request );

			// Add stock_status if needed.
			if ( in_array( 'stock_status', $fields, true ) ) {
				$data['stock_status'] = $product->get_stock_status( $context );
			}

			// Add has_options if needed.
			if ( in_array( 'has_options', $fields, true ) ) {
				$data['has_options'] = $product->has_options( $context );
			}

			if ( in_array( 'post_password', $fields, true ) ) {
				$data['post_password'] = $product->get_post_password( $context );
			}

			if ( in_array( 'global_unique_id', $fields, true ) ) {
				$data['global_unique_id'] = $product->get_global_unique_id( $context );
			}

			if ( in_array( '__experimental_min_price', $fields, true ) ) {
				$data['__experimental_min_price'] = method_exists( $product, 'get_min_price' ) ? $product->get_min_price() : '';
			}

			if ( in_array( '__experimental_max_price', $fields, true ) ) {
				$data['__experimental_max_price'] = method_exists( $product, 'get_max_price' ) ? $product->get_max_price() : '';
			}

			$post_type_obj = get_post_type_object( $this->post_type );
			if ( is_post_type_viewable( $post_type_obj ) && $post_type_obj->public ) {
				$permalink_template_requested = in_array( 'permalink_template', $fields, true );
				$generated_slug_requested     = in_array( 'generated_slug', $fields, true );

				if ( $permalink_template_requested || $generated_slug_requested ) {
					if ( ! function_exists( 'get_sample_permalink' ) ) {
						require_once ABSPATH . 'wp-admin/includes/post.php';
					}

					$sample_permalink = get_sample_permalink( $product->get_id(), $product->get_name(), '' );

					// Add permalink_template if needed.
					if ( $permalink_template_requested ) {
						$data['permalink_template'] = $sample_permalink[0];
					}

					// Add generated_slug if needed.
					if ( $generated_slug_requested ) {
						$data['generated_slug'] = $sample_permalink[1];
					}
				}
			}
		}

		return $data;
	}

	/**
	 * Get the suggested products.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return object
	 */
	public function get_suggested_products( $request ) {
		$categories  = $request->get_param( 'categories' );
		$tags        = $request->get_param( 'tags' );
		$exclude_ids = $request->get_param( 'exclude' );
		$limit       = $request->get_param( 'limit' ) ? $request->get_param( 'limit' ) : 5;

		$data_store                   = WC_Data_Store::load( 'product' );
		$this->suggested_products_ids = $data_store->get_related_products(
			$categories,
			$tags,
			$exclude_ids,
			$limit,
			null // No need to pass the product ID.
		);

		// When no suggested products are found, return an empty array.
		if ( empty( $this->suggested_products_ids ) ) {
			return array();
		}

		// Ensure to respect the limit, since the data store may return more than the limit.
		$this->suggested_products_ids = array_slice( $this->suggested_products_ids, 0, $limit );

		return parent::get_items( $request );
	}

	/**
	 * Core function to prepare a single product output for response
	 * (doesn't fire hooks, ensure_response, or add links).
	 *
	 * @param WC_Data         $object_data Object data.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $context Request context.
	 * @return array Product data to be included in the response.
	 */
	protected function prepare_object_for_response_core( $object_data, $request, $context ): array {
		$data = parent::prepare_object_for_response_core( $object_data, $request, $context );

		if ( $this->cogs_is_enabled() ) {
			$this->add_cogs_info_to_returned_product_data( $data, $object_data );
		}

		return $data;
	}

	/**
	 * Create a single item.
	 * Handles cleanup of orphaned images if product creation fails.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ) {
		$this->processed_attachment_ids_for_request = array();

		$response = parent::create_item( $request );

		if ( is_wp_error( $response ) ) {
			if ( ! empty( $this->processed_attachment_ids_for_request ) ) {
				// Handle deletion of orphaned images.
				foreach ( $this->processed_attachment_ids_for_request as $attachment_id ) {
					wp_delete_attachment( (int) $attachment_id, true );
				}
			}
		}

		$this->processed_attachment_ids_for_request = array();

		return $response;
	}
}
