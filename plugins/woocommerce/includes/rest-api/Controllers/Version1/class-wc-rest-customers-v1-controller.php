<?php
/**
 * REST API Customers controller
 *
 * Handles requests to the /customers endpoint.
 *
 * @author   WooThemes
 * @category API
 * @package PooCommerce\RestApi
 * @since    3.0.0
 */

use Automattic\PooCommerce\Internal\Utilities\Users;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API Customers controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Controller
 */
class WC_REST_Customers_V1_Controller extends WC_REST_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'customers';

	/**
	 * Register the routes for customers.
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => $this->get_collection_params(),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'create_item_permissions_check' ),
				'args'                => array_merge( $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ), array(
					'email' => array(
						'required' => true,
						'type'     => 'string',
						'description' => __( 'New user email address.', 'poocommerce' ),
					),
					'username' => array(
						'required' => 'no' === get_option( 'poocommerce_registration_generate_username', 'yes' ),
						'description' => __( 'New user username.', 'poocommerce' ),
						'type'     => 'string',
					),
					'password' => array(
						'required' => 'no' === get_option( 'poocommerce_registration_generate_password', 'no' ),
						'description' => __( 'New user password.', 'poocommerce' ),
						'type'     => 'string',
					),
				) ),
			),
			'schema' => array( $this, 'get_public_item_schema' ),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			'args' => array(
				'id' => array(
					'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
					'type'        => 'integer',
				),
			),
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
				'args'                => array(
					'context' => $this->get_context_param( array( 'default' => 'view' ) ),
				),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
				'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
				'args'                => array(
					'force' => array(
						'default'     => false,
						'type'        => 'boolean',
						'description' => __( 'Required to be true, as resource does not support trashing.', 'poocommerce' ),
					),
					'reassign' => array(
						'default'     => 0,
						'type'        => 'integer',
						'description' => __( 'ID to reassign posts to.', 'poocommerce' ),
					),
				),
			),
			'schema' => array( $this, 'get_public_item_schema' ),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/batch', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'batch_items' ),
				'permission_callback' => array( $this, 'batch_items_permissions_check' ),
				'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
			),
			'schema' => array( $this, 'get_public_batch_schema' ),
		) );
	}

	/**
	 * Check whether a given request has permission to read customers.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 * @return WP_Error|boolean
	 */
	public function get_items_permissions_check( $request ) {
		if ( ! wc_rest_check_user_permissions( 'read' ) ) {
			return new WP_Error( 'poocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'poocommerce' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Returns list of allowed roles for the REST API.
	 *
	 * @return array $roles Allowed roles to be updated via the REST API.
	 */
	private function allowed_roles(): array {
		/**
		 * Filter the allowed roles for the REST API.
		 *
		 * Danger: Make sure that the roles listed here cannot manage the shop.
		 *
		 * @param array $roles Array of allowed roles.
		 *
		 * @since 9.5.2
		 */
		return apply_filters( 'poocommerce_rest_customer_allowed_roles', array( 'customer', 'subscriber' ) );
	}

	/**
	 * Check if a given request has access create customers.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error
	 */
	public function create_item_permissions_check( $request ) {
		if ( ! wc_rest_check_user_permissions( 'create' ) ) {
			return new WP_Error( 'poocommerce_rest_cannot_create', __( 'Sorry, you are not allowed to create resources.', 'poocommerce' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Check if a given request has access to read a customer.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 * @return WP_Error|boolean
	 */
	public function get_item_permissions_check( $request ) {
		return $this->permissions_check(
			$request,
			'read',
			new WP_Error(
				'poocommerce_rest_cannot_view',
				__( 'Sorry, you cannot view this resource.', 'poocommerce' ),
				array( 'status' => rest_authorization_required_code() )
			)
		);
	}

	/**
	 * Check if a given request has access update a customer.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error
	 */
	public function update_item_permissions_check( $request ) {
		$permission_result = $this->permissions_check(
			$request,
			'edit',
			new WP_Error(
				'poocommerce_rest_cannot_edit',
				__( 'Sorry, you are not allowed to edit this resource.', 'poocommerce' ),
				array( 'status' => rest_authorization_required_code() )
			)
		);

		if ( ! $permission_result || is_wp_error( $permission_result ) ) {
			return $permission_result;
		}

		$allowed_roles = $this->allowed_roles();

		$id = (int) $request['id'];

		$customer = new WC_Customer( $id );

		if ( $customer && ! in_array( $customer->get_role(), $allowed_roles, true ) ) {
			// Check against existing props to be compatible with clients that will send the entire user object. Password shouldn't be sent anyway.
			$non_editable_props = array( 'email', 'password' );
			$customer_prop      = array( 'email' => $customer->get_email() );
			foreach ( $non_editable_props as $prop ) {
				if ( isset( $request[ $prop ] ) && ( 'password' === $prop || $request[ $prop ] !== $customer_prop[ $prop ] ) ) {
					return new WP_Error(
						'poocommerce_rest_cannot_edit',
						sprintf(
							/* translators: 1s: name of the property (email, role), 2: Role of the user (administrator, customer). */
							__( 'Sorry, %1$s cannot be updated via this endpoint for a user with role %2$s.', 'poocommerce' ),
							$prop,
							$customer->get_role()
						),
						array( 'status' => rest_authorization_required_code() )
					);
				}
			}
		}

		return true;
	}

	/**
	 * Check if a given request has access delete a customer.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error
	 */
	public function delete_item_permissions_check( $request ) {
		$permission_result = $this->permissions_check(
			$request,
			'delete',
			new WP_Error(
				'poocommerce_rest_cannot_delete',
				__( 'Sorry, you are not allowed to delete this resource.', 'poocommerce' ),
				array( 'status' => rest_authorization_required_code() )
			)
		);

		if ( ! $permission_result || is_wp_error( $permission_result ) ) {
			return $permission_result;
		}

		$id = (int) $request['id'];

		$allowed_roles = $this->allowed_roles();
		$customer      = new WC_Customer( $id );

		if ( ! in_array( $customer->get_role(), $allowed_roles, true ) ) {
			return new WP_Error(
				'poocommerce_rest_cannot_delete',
				sprintf(
					/* translators: 1: Role of the user (administrator, customer), 2: comma separated list of allowed roles. egs customer, subscriber */
					__( 'Sorry, users with %1$s role cannot be deleted via this endpoint. Allowed roles: %2$s', 'poocommerce' ),
					$customer->get_role(),
					implode( ', ', $allowed_roles )
				),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Check if a given request has access batch create, update and delete items.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error
	 */
	public function batch_items_permissions_check( $request ) {
		if ( ! wc_rest_check_user_permissions( 'batch' ) ) {
			return new WP_Error( 'poocommerce_rest_cannot_batch', __( 'Sorry, you are not allowed to batch manipulate this resource.', 'poocommerce' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Check if the necessary permissions to view or act on a customer are in place.
	 *
	 * @internal Use of this method by third parties is discouraged.
	 *
	 * @param WP_REST_Request $request          Full details about the request.
	 * @param string          $context          The context of the check.
	 * @param WP_Error        $error_on_failure The specific error to return if permissions are missing.
	 *
	 * @return bool|WP_Error
	 */
	protected function permissions_check( $request, string $context, WP_Error $error_on_failure ) {
		$user = Users::get_user_in_current_site( $request['id'] );

		if ( is_wp_error( $user ) ) {
			$user->add_data( array( 'status' => 404 ) );
			return $user;
		}

		if ( ! wc_rest_check_user_permissions( $context, $user->ID ) ) {
			return $error_on_failure;
		}

		return true;
	}

	/**
	 * Get all customers.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_items( $request ) {
		$prepared_args = array();
		$prepared_args['exclude'] = $request['exclude'];
		$prepared_args['include'] = $request['include'];
		$prepared_args['order']   = $request['order'];
		$prepared_args['number']  = $request['per_page'];
		if ( ! empty( $request['offset'] ) ) {
			$prepared_args['offset'] = $request['offset'];
		} else {
			$prepared_args['offset'] = ( $request['page'] - 1 ) * $prepared_args['number'];
		}
		$orderby_possibles = array(
			'id'              => 'ID',
			'include'         => 'include',
			'name'            => 'display_name',
			'registered_date' => 'registered',
		);
		$prepared_args['orderby'] = $orderby_possibles[ $request['orderby'] ];
		$prepared_args['search']  = $request['search'];

		if ( ! empty( $prepared_args['search'] ) ) {
			$prepared_args['search'] = '*' . $prepared_args['search'] . '*';
		}

		// Filter by email.
		if ( ! empty( $request['email'] ) ) {
			$prepared_args['search']         = $request['email'];
			$prepared_args['search_columns'] = array( 'user_email' );
		}

		// Filter by role.
		if ( 'all' !== $request['role'] ) {
			$prepared_args['role'] = $request['role'];
		}

		/**
		 * Filter arguments, before passing to WP_User_Query, when querying users via the REST API.
		 *
		 * @see https://developer.wordpress.org/reference/classes/wp_user_query/
		 *
		 * @param array           $prepared_args Array of arguments for WP_User_Query.
		 * @param WP_REST_Request $request       The current request.
		 */
		$prepared_args = apply_filters( 'poocommerce_rest_customer_query', $prepared_args, $request );

		$query = new WP_User_Query( $prepared_args );

		$users = array();
		foreach ( $query->results as $user ) {
			$data = $this->prepare_item_for_response( $user, $request );
			$users[] = $this->prepare_response_for_collection( $data );
		}

		$response = rest_ensure_response( $users );

		// Store pagination values for headers then unset for count query.
		$per_page = (int) $prepared_args['number'];
		$page = ceil( ( ( (int) $prepared_args['offset'] ) / $per_page ) + 1 );

		$prepared_args['fields'] = 'ID';

		$total_users = $query->get_total();
		if ( $total_users < 1 ) {
			// Out-of-bounds, run the query again without LIMIT for total count.
			unset( $prepared_args['number'] );
			unset( $prepared_args['offset'] );
			$count_query = new WP_User_Query( $prepared_args );
			$total_users = $count_query->get_total();
		}
		$response->header( 'X-WP-Total', (int) $total_users );
		$max_pages = ceil( $total_users / $per_page );
		$response->header( 'X-WP-TotalPages', (int) $max_pages );

		$base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ) );
		if ( $page > 1 ) {
			$prev_page = $page - 1;
			if ( $prev_page > $max_pages ) {
				$prev_page = $max_pages;
			}
			$prev_link = add_query_arg( 'page', $prev_page, $base );
			$response->link_header( 'prev', $prev_link );
		}
		if ( $max_pages > $page ) {
			$next_page = $page + 1;
			$next_link = add_query_arg( 'page', $next_page, $base );
			$response->link_header( 'next', $next_link );
		}

		return $response;
	}

	/**
	 * Create a single customer.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function create_item( $request ) {
		try {
			if ( ! empty( $request['id'] ) ) {
				throw new WC_REST_Exception( 'poocommerce_rest_customer_exists', __( 'Cannot create existing resource.', 'poocommerce' ), 400 );
			}

			// Sets the username.
			$request['username'] = ! empty( $request['username'] ) ? $request['username'] : '';

			// Sets the password.
			$request['password'] = ! empty( $request['password'] ) ? $request['password'] : '';

			// Create customer.
			$customer = new WC_Customer;
			$customer->set_username( $request['username'] );
			$customer->set_password( $request['password'] );
			$customer->set_email( $request['email'] );
			$this->update_customer_meta_fields( $customer, $request );
			$customer->save();

			if ( ! $customer->get_id() ) {
				throw new WC_REST_Exception( 'poocommerce_rest_cannot_create', __( 'This resource cannot be created.', 'poocommerce' ), 400 );
			}

			$user_data = get_userdata( $customer->get_id() );
			$this->update_additional_fields_for_object( $user_data, $request );

			/**
			 * Fires after a customer is created or updated via the REST API.
			 *
			 * @param WP_User         $user_data Data used to create the customer.
			 * @param WP_REST_Request $request   Request object.
			 * @param boolean         $creating  True when creating customer, false when updating customer.
			 */
			do_action( 'poocommerce_rest_insert_customer', $user_data, $request, true );

			$request->set_param( 'context', 'edit' );
			$response = $this->prepare_item_for_response( $user_data, $request );
			$response = rest_ensure_response( $response );
			$response->set_status( 201 );
			$response->header( 'Location', rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $customer->get_id() ) ) );

			return $response;
		} catch ( Exception $e ) {
			return new WP_Error( $e->getErrorCode(), $e->getMessage(), array( 'status' => $e->getCode() ) );
		}
	}

	/**
	 * Get a single customer.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_item( $request ) {
		$user = \Automattic\PooCommerce\Internal\Utilities\Users::get_user_in_current_site( $request['id'] );
		if ( is_wp_error( $user ) ) {
			$user->add_data( array( 'status' => 404 ) );
			return $user;
		}

		$customer = $this->prepare_item_for_response( $user, $request );
		$response = rest_ensure_response( $customer );

		return $response;
	}

	/**
	 * Update a single user.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function update_item( $request ) {
		try {
			$user = \Automattic\PooCommerce\Internal\Utilities\Users::get_user_in_current_site( $request['id'] );
			if ( is_wp_error( $user ) ) {
				$id = 0;
			} else {
				$id = $user->ID;
			}

			$customer = new WC_Customer( $id );

			if ( ! $customer->get_id() ) {
				throw new WC_REST_Exception( 'poocommerce_rest_invalid_id', __( 'Invalid resource ID.', 'poocommerce' ), 400 );
			}

			if ( ! empty( $request['email'] ) && email_exists( $request['email'] ) && $request['email'] !== $customer->get_email() ) {
				throw new WC_REST_Exception( 'poocommerce_rest_customer_invalid_email', __( 'Email address is invalid.', 'poocommerce' ), 400 );
			}

			if ( ! empty( $request['username'] ) && $request['username'] !== $customer->get_username() ) {
				throw new WC_REST_Exception( 'poocommerce_rest_customer_invalid_argument', __( "Username isn't editable.", 'poocommerce' ), 400 );
			}

			// Customer email.
			if ( isset( $request['email'] ) ) {
				$customer->set_email( sanitize_email( $request['email'] ) );
			}

			// Customer password.
			if ( isset( $request['password'] ) ) {
				$customer->set_password( $request['password'] );
			}

			$this->update_customer_meta_fields( $customer, $request );
			$customer->save();

			$user_data = get_userdata( $customer->get_id() );
			$this->update_additional_fields_for_object( $user_data, $request );

			if ( ! is_user_member_of_blog( $user_data->ID ) ) {
				$user_data->add_role( 'customer' );
			}

			/**
			 * Fires after a customer is created or updated via the REST API.
			 *
			 * @param WP_User         $customer  Data used to create the customer.
			 * @param WP_REST_Request $request   Request object.
			 * @param boolean         $creating  True when creating customer, false when updating customer.
			 */
			do_action( 'poocommerce_rest_insert_customer', $user_data, $request, false );

			$request->set_param( 'context', 'edit' );
			$response = $this->prepare_item_for_response( $user_data, $request );
			$response = rest_ensure_response( $response );
			return $response;
		} catch ( Exception $e ) {
			return new WP_Error( $e->getErrorCode(), $e->getMessage(), array( 'status' => $e->getCode() ) );
		}
	}

	/**
	 * Delete a single customer.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function delete_item( $request ) {
		$id       = (int) $request['id'];
		$reassign = isset( $request['reassign'] ) ? absint( $request['reassign'] ) : null;
		$force    = isset( $request['force'] ) ? (bool) $request['force'] : false;

		// We don't support trashing for this type, error out.
		if ( ! $force ) {
			return new WP_Error( 'poocommerce_rest_trash_not_supported', __( 'Customers do not support trashing.', 'poocommerce' ), array( 'status' => 501 ) );
		}

		$user_data = \Automattic\PooCommerce\Internal\Utilities\Users::get_user_in_current_site( $id );
		if ( is_wp_error( $user_data ) ) {
			$user_data->add_data( array( 'status' => 404 ) );
			return $user_data;
		}

		if ( ! empty( $reassign ) ) {
			$reassign_user = \Automattic\PooCommerce\Internal\Utilities\Users::get_user_in_current_site( $reassign );

			if ( $reassign === $id || is_wp_error( $reassign_user ) ) {
				return new WP_Error( 'poocommerce_rest_customer_invalid_reassign', __( 'Invalid resource id for reassignment.', 'poocommerce' ), array( 'status' => 400 ) );
			}
		}

		$request->set_param( 'context', 'edit' );
		$response = $this->prepare_item_for_response( $user_data, $request );

		/** Include admin customer functions to get access to wp_delete_user() */
		require_once ABSPATH . 'wp-admin/includes/user.php';

		$customer = new WC_Customer( $id );

		if ( ! is_null( $reassign ) ) {
			$result = $customer->delete_and_reassign( $reassign );
		} else {
			$result = $customer->delete();
		}

		if ( ! $result ) {
			return new WP_Error( 'poocommerce_rest_cannot_delete', __( 'The resource cannot be deleted.', 'poocommerce' ), array( 'status' => 500 ) );
		}

		/**
		 * Fires after a customer is deleted via the REST API.
		 *
		 * @param WP_User          $user_data User data.
		 * @param WP_REST_Response $response  The response returned from the API.
		 * @param WP_REST_Request  $request   The request sent to the API.
		 */
		do_action( 'poocommerce_rest_delete_customer', $user_data, $response, $request );

		return $response;
	}

	/**
	 * Prepare a single customer output for response.
	 *
	 * @param  WP_User          $user_data User object.
	 * @param  WP_REST_Request  $request Request object.
	 * @return WP_REST_Response $response Response data.
	 */
	public function prepare_item_for_response( $user_data, $request ) {
		$customer    = new WC_Customer( $user_data->ID );
		$_data       = $customer->get_data();
		$last_order  = wc_get_customer_last_order( $customer->get_id() );
		$format_date = array( 'date_created', 'date_modified' );

		// Format date values.
		foreach ( $format_date as $key ) {
			$_data[ $key ] = $_data[ $key ] ? wc_rest_prepare_date_response( $_data[ $key ] ) : null; // v1 API used UTC.
		}

		$data = array(
			'id'            => $_data['id'],
			'date_created'  => $_data['date_created'],
			'date_modified' => $_data['date_modified'],
			'email'         => $_data['email'],
			'first_name'    => $_data['first_name'],
			'last_name'     => $_data['last_name'],
			'username'      => $_data['username'],
			'last_order'    => array(
				'id'   => is_object( $last_order ) ? $last_order->get_id() : null,
				'date' => is_object( $last_order ) ? wc_rest_prepare_date_response( $last_order->get_date_created() ) : null, // v1 API used UTC.
			),
			'orders_count'  => $customer->get_order_count(),
			'total_spent'   => $customer->get_total_spent(),
			'avatar_url'    => $customer->get_avatar_url(),
			'billing'       => $_data['billing'],
			'shipping'      => $_data['shipping'],
		);

		$context  = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data     = $this->add_additional_fields_to_object( $data, $request );
		$data     = $this->filter_response_by_context( $data, $context );
		$response = rest_ensure_response( $data );
		$response->add_links( $this->prepare_links( $user_data ) );

		/**
		 * Filter customer data returned from the REST API.
		 *
		 * @param WP_REST_Response $response   The response object.
		 * @param WP_User          $user_data  User object used to create response.
		 * @param WP_REST_Request  $request    Request object.
		 */
		return apply_filters( 'poocommerce_rest_prepare_customer', $response, $user_data, $request );
	}

	/**
	 * Update customer meta fields.
	 *
	 * @param WC_Customer $customer
	 * @param WP_REST_Request $request
	 */
	protected function update_customer_meta_fields( $customer, $request ) {
		$schema = $this->get_item_schema();

		// Customer first name.
		if ( isset( $request['first_name'] ) ) {
			$customer->set_first_name( wc_clean( $request['first_name'] ) );
		}

		// Customer last name.
		if ( isset( $request['last_name'] ) ) {
			$customer->set_last_name( wc_clean( $request['last_name'] ) );
		}

		// Customer billing address.
		if ( isset( $request['billing'] ) ) {
			foreach ( array_keys( $schema['properties']['billing']['properties'] ) as $field ) {
				if ( isset( $request['billing'][ $field ] ) && is_callable( array( $customer, "set_billing_{$field}" ) ) ) {
					$customer->{"set_billing_{$field}"}( $request['billing'][ $field ] );
				}
			}
		}

		// Customer shipping address.
		if ( isset( $request['shipping'] ) ) {
			foreach ( array_keys( $schema['properties']['shipping']['properties'] ) as $field ) {
				if ( isset( $request['shipping'][ $field ] ) && is_callable( array( $customer, "set_shipping_{$field}" ) ) ) {
					$customer->{"set_shipping_{$field}"}( $request['shipping'][ $field ] );
				}
			}
		}
	}

	/**
	 * Prepare links for the request.
	 *
	 * @param WP_User $customer Customer object.
	 * @return array Links for the given customer.
	 */
	protected function prepare_links( $customer ) {
		$links = array(
			'self' => array(
				'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->rest_base, $customer->ID ) ),
			),
			'collection' => array(
				'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
			),
		);

		return $links;
	}

	/**
	 * Get the Customer's schema, conforming to JSON Schema.
	 *
	 * @return array
	 */
	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'customer',
			'type'       => 'object',
			'properties' => array(
				'id' => array(
					'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_created' => array(
					'description' => __( 'The date the customer was created, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_modified' => array(
					'description' => __( 'The date the customer was last modified, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'email' => array(
					'description' => __( 'The email address for the customer.', 'poocommerce' ),
					'type'        => 'string',
					'format'      => 'email',
					'context'     => array( 'view', 'edit' ),
				),
				'first_name' => array(
					'description' => __( 'Customer first name.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'last_name' => array(
					'description' => __( 'Customer last name.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'username' => array(
					'description' => __( 'Customer login name.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_user',
					),
				),
				'password' => array(
					'description' => __( 'Customer password.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'edit' ),
				),
				'last_order' => array(
					'description' => __( 'Last order data.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
					'properties'  => array(
						'id' => array(
							'description' => __( 'Last order ID.', 'poocommerce' ),
							'type'        => 'integer',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
						'date' => array(
							'description' => __( 'The date of the customer last order, as GMT.', 'poocommerce' ),
							'type'        => 'date-time',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
					),
				),
				'orders_count' => array(
					'description' => __( 'Quantity of orders made by the customer.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'total_spent' => array(
					'description' => __( 'Total amount spent.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'avatar_url' => array(
					'description' => __( 'Avatar URL.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'billing' => array(
					'description' => __( 'List of billing address data.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'properties' => array(
						'first_name' => array(
							'description' => __( 'First name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'last_name' => array(
							'description' => __( 'Last name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'company' => array(
							'description' => __( 'Company name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'address_1' => array(
							'description' => __( 'Address line 1.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'address_2' => array(
							'description' => __( 'Address line 2.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'city' => array(
							'description' => __( 'City name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'state' => array(
							'description' => __( 'ISO code or name of the state, province or district.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'postcode' => array(
							'description' => __( 'Postal code.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'country' => array(
							'description' => __( 'ISO code of the country.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'email' => array(
							'description' => __( 'Email address.', 'poocommerce' ),
							'type'        => 'string',
							'format'      => 'email',
							'context'     => array( 'view', 'edit' ),
						),
						'phone' => array(
							'description' => __( 'Phone number.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
					),
				),
				'shipping' => array(
					'description' => __( 'List of shipping address data.', 'poocommerce' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'properties' => array(
						'first_name' => array(
							'description' => __( 'First name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'last_name' => array(
							'description' => __( 'Last name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'company' => array(
							'description' => __( 'Company name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'address_1' => array(
							'description' => __( 'Address line 1.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'address_2' => array(
							'description' => __( 'Address line 2.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'city' => array(
							'description' => __( 'City name.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'state' => array(
							'description' => __( 'ISO code or name of the state, province or district.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'postcode' => array(
							'description' => __( 'Postal code.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
						'country' => array(
							'description' => __( 'ISO code of the country.', 'poocommerce' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
						),
					),
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}

	/**
	 * Get role names.
	 *
	 * @return array
	 */
	protected function get_role_names() {
		global $wp_roles;

		return array_keys( $wp_roles->role_names );
	}

	/**
	 * Get the query params for collections.
	 *
	 * @return array
	 */
	public function get_collection_params() {
		$params = parent::get_collection_params();

		$params['context']['default'] = 'view';

		$params['exclude'] = array(
			'description'       => __( 'Ensure result set excludes specific IDs.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type'          => 'integer',
			),
			'default'           => array(),
			'sanitize_callback' => 'wp_parse_id_list',
		);
		$params['include'] = array(
			'description'       => __( 'Limit result set to specific IDs.', 'poocommerce' ),
			'type'              => 'array',
			'items'             => array(
				'type'          => 'integer',
			),
			'default'           => array(),
			'sanitize_callback' => 'wp_parse_id_list',
		);
		$params['offset'] = array(
			'description'        => __( 'Offset the result set by a specific number of items.', 'poocommerce' ),
			'type'               => 'integer',
			'sanitize_callback'  => 'absint',
			'validate_callback'  => 'rest_validate_request_arg',
		);
		$params['order'] = array(
			'default'            => 'asc',
			'description'        => __( 'Order sort attribute ascending or descending.', 'poocommerce' ),
			'enum'               => array( 'asc', 'desc' ),
			'sanitize_callback'  => 'sanitize_key',
			'type'               => 'string',
			'validate_callback'  => 'rest_validate_request_arg',
		);
		$params['orderby'] = array(
			'default'            => 'name',
			'description'        => __( 'Sort collection by object attribute.', 'poocommerce' ),
			'enum'               => array(
				'id',
				'include',
				'name',
				'registered_date',
			),
			'sanitize_callback'  => 'sanitize_key',
			'type'               => 'string',
			'validate_callback'  => 'rest_validate_request_arg',
		);
		$params['email'] = array(
			'description'        => __( 'Limit result set to resources with a specific email.', 'poocommerce' ),
			'type'               => 'string',
			'format'             => 'email',
			'validate_callback'  => 'rest_validate_request_arg',
		);
		$params['role'] = array(
			'description'        => __( 'Limit result set to resources with a specific role.', 'poocommerce' ),
			'type'               => 'string',
			'default'            => 'customer',
			'enum'               => array_merge( array( 'all' ), $this->get_role_names() ),
			'validate_callback'  => 'rest_validate_request_arg',
		);
		return $params;
	}
}
