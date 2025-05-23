<?php

namespace Automattic\PooCommerce\Internal;

use Automattic\PooCommerce\Internal\RegisterHooksInterface;
use Automattic\PooCommerce\Utilities\StringUtil;
use WP_HTTP_Response;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use InvalidArgumentException;
use Exception;

/**
 * Base class for REST API controllers defined inside the 'src' directory.
 *
 * The following must be added at the end of the 'init_hooks' method in the 'PooCommerce' class,
 * otherwise the routes won't be registered:
 * $container->get( <full class name>::class )->register();
 *
 * Minimal controller example:
 *
 * class FoobarsController extends RestApiControllerBase {
 *
 * protected function get_rest_api_namespace(): string {
 *   return 'foobars';
 * }
 *
 * public function register_routes() {
 *   register_rest_route(
 *     $this->route_namespace,
 *     '/foobars/(?P<id>[\d]+)',
 *     array(
 *       array(
 *         'methods'             => \WP_REST_Server::READABLE,
 *         'callback'            => fn( $request ) => $this->run( $request, 'get_foobar' ),
 *         'permission_callback' => fn( $request ) => $this->check_permission( $request, 'read_foobars', $request->get_param( 'id' ) ),
 *         'args'                => $this->get_args_for_get_foobar(),
 *         'schema'              => $this->get_schema_for_get_foobar(),
 *       ),
 *     )
 *   );
 * }
 *
 * protected function get_foobar( \WP_REST_Request $request ) {
 *     return array( 'message' => 'Get foobar with id ' . $request->get_param(' id' ) );
 * }
 *
 * private function get_args_for_get_foobar(): array {
 *   return array(
 *     'id' => array(
 *       'description' => __( 'Unique identifier of the foobar.', 'poocommerce' ),
 *       'type'        => 'integer',
 *       'context'     => array( 'view', 'edit' ),
 *       'readonly'    => true,
 *     ),
 *   );
 * }
 *
 * private function get_schema_for_get_foobar(): array {
 *   $schema               = $this->get_base_schema();
 *   $schema['properties'] = array(
 *     'message'     => array(
 *       'description' => __( 'A message.', 'poocommerce' ),
 *       'type'        => 'string',
 *       'context'     => array( 'view', 'edit' ),
 *       'readonly'    => true,
 *     ),
 *   );
 *   return $schema;
 * }
 *
 * }
 */
abstract class RestApiControllerBase implements RegisterHooksInterface {

	/**
	 * The root namespace for the JSON REST API endpoints.
	 *
	 * @var string
	 */
	protected string $route_namespace = 'wc/v3';

	/**
	 * Register the hooks used by the class.
	 */
	public function register() {
		add_filter( 'poocommerce_rest_api_get_rest_namespaces', array( $this, 'handle_poocommerce_rest_api_get_rest_namespaces' ) );
	}

	/**
	 * Handle the poocommerce_rest_api_get_rest_namespaces filter
	 * to add ourselves to the list of REST API controllers registered by PooCommerce.
	 *
	 * @param array $namespaces The original list of PooCommerce REST API namespaces/controllers.
	 * @return array The updated list of PooCommerce REST API namespaces/controllers.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function handle_poocommerce_rest_api_get_rest_namespaces( array $namespaces ): array {
		$namespaces['wc/v3'][ $this->get_rest_api_namespace() ] = static::class;
		return $namespaces;
	}

	/**
	 * Get the PooCommerce REST API namespace for the class. It must be unique across all other derived classes
	 * and the keys returned by the 'get_vX_controllers' methods in includes/rest-api/Server.php.
	 * Note that this value is NOT related to the route namespace.
	 *
	 * @return string
	 */
	abstract protected function get_rest_api_namespace(): string;

	/**
	 * Register the REST API endpoints handled by this controller.
	 *
	 * Use 'register_rest_route' in the usual way, it's recommended to use the 'run' method for 'callback'
	 * and the 'check_permission' method for 'permission_check', see the example in the class comment.
	 */
	abstract public function register_routes();

	/**
	 * Handle a request for one of the provided REST API endpoints.
	 *
	 * If an exception is thrown, the exception message will be returned as part of the response
	 * if the user has the 'manage_poocommerce' capability.
	 *
	 * Note that the method specified in $method_name must have a 'protected' visibility and accept one argument of type 'WP_REST_Request'.
	 *
	 * @param WP_REST_Request $request The incoming HTTP REST request.
	 * @param string          $method_name The name of the class method to execute. It must be protected and accept one argument of type 'WP_REST_Request'.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response The response to send back to the client.
	 */
	protected function run( WP_REST_Request $request, string $method_name ) {
		try {
			return rest_ensure_response( $this->$method_name( $request ) );
		} catch ( InvalidArgumentException $ex ) {
			$message = $ex->getMessage();
			return new WP_Error( 'poocommerce_rest_invalid_argument', $message ? $message : __( 'Internal server error', 'poocommerce' ), array( 'status' => 400 ) );
		} catch ( Exception $ex ) {
			wc_get_logger()->error( StringUtil::class_name_without_namespace( static::class ) . ": when executing method $method_name: {$ex->getMessage()}" );
			return $this->internal_wp_error( $ex );
		}
	}

	/**
	 * Return an WP_Error object for an internal server error, with exception information if the current user is an admin.
	 *
	 * @param Exception $exception The exception to maybe include information from.
	 * @return WP_Error
	 */
	protected function internal_wp_error( Exception $exception ): WP_Error {
		$data = array( 'status' => 500 );
		if ( current_user_can( 'manage_poocommerce' ) ) {
			$data['exception_class']   = get_class( $exception );
			$data['exception_message'] = $exception->getMessage();
			$data['exception_trace']   = (array) $exception->getTrace();
		}
		$data['exception_message'] = $exception->getMessage();

		return new WP_Error( 'poocommerce_rest_internal_error', __( 'Internal server error', 'poocommerce' ), $data );
	}

	/**
	 * Returns an authentication error message for a given HTTP verb.
	 *
	 * @param string $method HTTP method.
	 * @return array|null Error information on success, null otherwise.
	 */
	protected function get_authentication_error_by_method( string $method ) {
		$errors = array(
			'GET'    => array(
				'code'    => 'poocommerce_rest_cannot_view',
				'message' => __( 'Sorry, you cannot view resources.', 'poocommerce' ),
			),
			'POST'   => array(
				'code'    => 'poocommerce_rest_cannot_create',
				'message' => __( 'Sorry, you cannot create resources.', 'poocommerce' ),
			),
			'DELETE' => array(
				'code'    => 'poocommerce_rest_cannot_delete',
				'message' => __( 'Sorry, you cannot delete resources.', 'poocommerce' ),
			),
		);

		return $errors[ $method ] ?? null;
	}

	/**
	 * Permission check for REST API endpoints, given the request method.
	 *
	 * @param WP_REST_Request $request The request for which the permission is checked.
	 * @param string          $required_capability_name The name of the required capability.
	 * @param mixed           ...$extra_args Extra arguments to be used for the permission check.
	 * @return bool|WP_Error True if the current user has the capability, otherwise an "Unauthorized" error or False if no error is available for the request method.
	 */
	protected function check_permission( WP_REST_Request $request, string $required_capability_name, ...$extra_args ) {
		if ( current_user_can( $required_capability_name, ...$extra_args ) ) {
			return true;
		}

		$error_information = $this->get_authentication_error_by_method( $request->get_method() );
		if ( is_null( $error_information ) ) {
			return false;
		}

		return new WP_Error(
			$error_information['code'],
			$error_information['message'],
			array( 'status' => rest_authorization_required_code() )
		);
	}

	/**
	 * Get the base schema for the REST API endpoints.
	 *
	 * @return array
	 */
	protected function get_base_schema(): array {
		return array(
			'$schema' => 'http://json-schema.org/draft-04/schema#',
			'title'   => 'order receipts',
			'type'    => 'object',
		);
	}
}
