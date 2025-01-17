<?php
/**
 * REST API Webhooks controller
 *
 * Handles requests to the /webhooks endpoint.
 *
 * @package PooCommerce\RestApi
 * @since   2.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * REST API Webhooks controller class.
 *
 * @package PooCommerce\RestApi
 * @extends WC_REST_Webhooks_V1_Controller
 */
class WC_REST_Webhooks_V2_Controller extends WC_REST_Webhooks_V1_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v2';

	/**
	 * Prepare a single webhook output for response.
	 *
	 * @param int             $id       Webhook ID.
	 * @param WP_REST_Request $request  Request object.
	 * @return WP_REST_Response $response
	 */
	public function prepare_item_for_response( $id, $request ) {
		$webhook = wc_get_webhook( $id );

		if ( empty( $webhook ) || is_null( $webhook ) ) {
			return new WP_Error( "poocommerce_rest_{$this->post_type}_invalid_id", __( 'ID is invalid.', 'poocommerce' ), array( 'status' => 404 ) );
		}

		$data = array(
			'id'                => $webhook->get_id(),
			'name'              => $webhook->get_name(),
			'status'            => $webhook->get_status(),
			'topic'             => $webhook->get_topic(),
			'resource'          => $webhook->get_resource(),
			'event'             => $webhook->get_event(),
			'hooks'             => $webhook->get_hooks(),
			'delivery_url'      => $webhook->get_delivery_url(),
			'date_created'      => wc_rest_prepare_date_response( $webhook->get_date_created(), false ),
			'date_created_gmt'  => wc_rest_prepare_date_response( $webhook->get_date_created() ),
			'date_modified'     => wc_rest_prepare_date_response( $webhook->get_date_modified(), false ),
			'date_modified_gmt' => wc_rest_prepare_date_response( $webhook->get_date_modified() ),
		);

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $data, $request );
		$data    = $this->filter_response_by_context( $data, $context );

		// Wrap the data in a response object.
		$response = rest_ensure_response( $data );

		$response->add_links( $this->prepare_links( $webhook->get_id(), $request ) );

		/**
		 * Filter webhook object returned from the REST API.
		 *
		 * @param WP_REST_Response $response The response object.
		 * @param WC_Webhook       $webhook  Webhook object used to create response.
		 * @param WP_REST_Request  $request  Request object.
		 */
		return apply_filters( "poocommerce_rest_prepare_{$this->post_type}", $response, $webhook, $request );
	}

	/**
	 * Get the default REST API version.
	 *
	 * @since  3.0.0
	 * @return string
	 */
	protected function get_default_api_version() {
		return 'wp_api_v2';
	}

	/**
	 * Get the Webhook's schema, conforming to JSON Schema.
	 *
	 * @return array
	 */
	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'webhook',
			'type'       => 'object',
			'properties' => array(
				'id'                => array(
					'description' => __( 'Unique identifier for the resource.', 'poocommerce' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'name'              => array(
					'description' => __( 'A friendly name for the webhook.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'status'            => array(
					'description' => __( 'Webhook status.', 'poocommerce' ),
					'type'        => 'string',
					'default'     => 'active',
					'enum'        => array_keys( wc_get_webhook_statuses() ),
					'context'     => array( 'view', 'edit' ),
				),
				'topic'             => array(
					'description' => __( 'Webhook topic.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
				),
				'resource'          => array(
					'description' => __( 'Webhook resource.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'event'             => array(
					'description' => __( 'Webhook event.', 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'hooks'             => array(
					'description' => __( 'PooCommerce action names associated with the webhook.', 'poocommerce' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
					'items'       => array(
						'type' => 'string',
					),
				),
				'delivery_url'      => array(
					'description' => __( 'The URL where the webhook payload is delivered.', 'poocommerce' ),
					'type'        => 'string',
					'format'      => 'uri',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'secret'            => array(
					'description' => __( "Secret key used to generate a hash of the delivered webhook and provided in the request headers. This will default to a MD5 hash from the current user's ID|username if not provided.", 'poocommerce' ),
					'type'        => 'string',
					'context'     => array( 'edit' ),
				),
				'date_created'      => array(
					'description' => __( "The date the webhook was created, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_created_gmt'  => array(
					'description' => __( 'The date the webhook was created, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_modified'     => array(
					'description' => __( "The date the webhook was last modified, in the site's timezone.", 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_modified_gmt' => array(
					'description' => __( 'The date the webhook was last modified, as GMT.', 'poocommerce' ),
					'type'        => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}
}
