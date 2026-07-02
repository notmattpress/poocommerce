<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\Api;

use Automattic\PooCommerce\Api\Infrastructure\GraphQLControllerBase;
use Automattic\PooCommerce\Api\Infrastructure\Main;

/**
 * Settings handling for the GraphQL API.
 *
 * Registers the "GraphQL" section under PooCommerce - Settings - Advanced.
 * Only active when Main::is_enabled() returns true (feature flag on and
 * PHP 8.1+), so the section is hidden when the feature is disabled.
 */
class Settings {
	/**
	 * Identifier for the GraphQL section under the Advanced settings tab.
	 */
	public const SECTION_ID = 'graphql';

	/**
	 * Register the filter hooks that expose the GraphQL settings section.
	 */
	public function register(): void {
		add_filter( 'poocommerce_get_sections_advanced', array( $this, 'add_section' ) );
		add_filter( 'poocommerce_get_settings_advanced', array( $this, 'add_settings' ), 10, 2 );
		add_filter(
			'poocommerce_admin_settings_sanitize_option_' . Main::OPTION_ENDPOINT_URL,
			array( $this, 'sanitize_endpoint_url' ),
			10,
			3
		);
	}

	/**
	 * Append the GraphQL section to the Advanced settings tab.
	 *
	 * @param array $sections Existing sections keyed by id.
	 * @return array
	 */
	public function add_section( array $sections ): array {
		if ( Main::is_enabled() ) {
			$sections[ self::SECTION_ID ] = __( 'GraphQL', 'poocommerce' );
		}
		return $sections;
	}

	/**
	 * Provide the settings fields for the GraphQL section.
	 *
	 * @param array  $settings   Existing settings for the current section.
	 * @param string $section_id Current section id.
	 * @return array
	 */
	public function add_settings( array $settings, string $section_id ): array {
		if ( self::SECTION_ID !== $section_id || ! Main::is_enabled() ) {
			return $settings;
		}

		return array(
			array(
				'title' => __( 'GraphQL', 'poocommerce' ),
				'desc'  => __( 'Configure the PooCommerce GraphQL API.', 'poocommerce' ),
				'type'  => 'title',
				'id'    => 'poocommerce_graphql_options',
			),
			array(
				'title'    => __( 'Endpoint URL', 'poocommerce' ),
				'desc'     => __( 'Path relative to /wp-json/ where the GraphQL endpoint is exposed. Needs at least two segments (namespace/route), e.g. wc/graphql.', 'poocommerce' ),
				'desc_tip' => true,
				'id'       => Main::OPTION_ENDPOINT_URL,
				'default'  => GraphQLControllerBase::DEFAULT_ENDPOINT_URL,
				'type'     => 'text',
			),
			array(
				'title'   => __( 'Enable GET endpoint', 'poocommerce' ),
				'desc'    => __( 'Allow GraphQL queries over GET in addition to POST', 'poocommerce' ),
				'id'      => Main::OPTION_GET_ENDPOINT_ENABLED,
				'default' => 'yes',
				'type'    => 'checkbox',
			),
			array(
				'title'             => __( 'Maximum query depth', 'poocommerce' ),
				'desc'              => __( 'Reject queries whose selection nesting exceeds this depth.', 'poocommerce' ),
				'id'                => Main::OPTION_MAX_QUERY_DEPTH,
				'default'           => (string) GraphQLControllerBase::DEFAULT_MAX_QUERY_DEPTH,
				'type'              => 'number',
				'custom_attributes' => array( 'min' => '1' ),
			),
			array(
				'title'             => __( 'Maximum query complexity', 'poocommerce' ),
				'desc'              => __( 'Reject queries whose computed complexity score exceeds this value.', 'poocommerce' ),
				'id'                => Main::OPTION_MAX_QUERY_COMPLEXITY,
				'default'           => (string) GraphQLControllerBase::DEFAULT_MAX_QUERY_COMPLEXITY,
				'type'              => 'number',
				'custom_attributes' => array( 'min' => '1' ),
			),
			array(
				'title'   => __( 'Enable OPcache-based caching', 'poocommerce' ),
				'desc'    => __( 'Cache parsed queries on disk as PHP files so OPcache can serve them from shared memory. Falls back to the object cache when the filesystem is not writable.', 'poocommerce' ),
				'id'      => Main::OPTION_OPCACHE_ENABLED,
				'default' => 'yes',
				'type'    => 'checkbox',
			),
			array(
				'title'   => __( 'Enable ObjectCache-based caching', 'poocommerce' ),
				'desc'    => __( 'Cache parsed queries in the WP object cache', 'poocommerce' ),
				'id'      => Main::OPTION_OBJECT_CACHE_ENABLED,
				'default' => 'yes',
				'type'    => 'checkbox',
			),
			array(
				'title'   => __( 'Enable APQ caching', 'poocommerce' ),
				'desc'    => __( 'Cache parsed queries using the Apollo Automatic Persisted Queries protocol', 'poocommerce' ),
				'id'      => Main::OPTION_APQ_ENABLED,
				'default' => 'yes',
				'type'    => 'checkbox',
			),
			array(
				'title'             => __( 'Parsed query cache TTL', 'poocommerce' ),
				'desc'              => __( 'Time in seconds before cached parsed queries expire.', 'poocommerce' ),
				'id'                => Main::OPTION_QUERY_CACHE_TTL,
				'default'           => (string) QueryCache::DEFAULT_CACHE_TTL,
				'type'              => 'number',
				'custom_attributes' => array( 'min' => '1' ),
			),
			array(
				'type' => 'sectionend',
				'id'   => 'poocommerce_graphql_options',
			),
		);
	}

	/**
	 * Validate and normalize the endpoint URL on save.
	 *
	 * Rejects empty input and inputs without at least two path segments, since
	 * register_rest_route() needs both a namespace and a route. Rejects any
	 * character outside of what WordPress REST routes accept (alphanumerics,
	 * underscores, hyphens). On rejection, adds a settings error message and
	 * returns the previously stored value so the option is not overwritten.
	 *
	 * @param mixed $value     The sanitized value passed by earlier filters.
	 * @param array $option    The option config from add_settings().
	 * @param mixed $raw_value The raw value submitted by the form. Typed as mixed because POST data can be null or an array (e.g. when the field name is submitted as `name[]`).
	 * @return string
	 */
	public function sanitize_endpoint_url( $value, array $option, $raw_value ): string {
		unset( $value, $option );

		$fallback = (string) get_option( Main::OPTION_ENDPOINT_URL, GraphQLControllerBase::DEFAULT_ENDPOINT_URL );

		if ( ! is_string( $raw_value ) ) {
			return $fallback;
		}

		$normalized = trim( $raw_value, '/' );

		if ( '' === $normalized ) {
			\WC_Admin_Settings::add_error( __( 'GraphQL endpoint URL cannot be empty.', 'poocommerce' ) );
			return $fallback;
		}

		$parts = explode( '/', $normalized );
		if ( count( $parts ) < 2 ) {
			\WC_Admin_Settings::add_error( __( 'GraphQL endpoint URL needs at least two segments, e.g. wc/graphql.', 'poocommerce' ) );
			return $fallback;
		}

		foreach ( $parts as $part ) {
			if ( '' === $part || ! preg_match( GraphQLControllerBase::ENDPOINT_URL_SEGMENT_PATTERN, $part ) ) {
				\WC_Admin_Settings::add_error(
					sprintf(
						/* translators: %s: the invalid path segment */
						__( 'GraphQL endpoint URL segment "%s" contains invalid characters. Use letters, digits, underscores, and hyphens only.', 'poocommerce' ),
						$part
					)
				);
				return $fallback;
			}
		}

		return $normalized;
	}
}
