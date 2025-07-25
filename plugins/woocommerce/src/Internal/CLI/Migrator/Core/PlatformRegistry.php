<?php
declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\CLI\Migrator\Core;

use InvalidArgumentException;
use Automattic\PooCommerce\Internal\CLI\Migrator\Interfaces\PlatformFetcherInterface;
use Automattic\PooCommerce\Internal\CLI\Migrator\Interfaces\PlatformMapperInterface;
use WP_CLI;

/**
 * PlatformRegistry class.
 *
 * This class is responsible for loading and providing access to registered migration platforms.
 */
class PlatformRegistry {

	/**
	 * An array to hold the configuration for all registered platforms.
	 *
	 * @var array
	 */
	private array $platforms = array();

	/**
	 * Constructor to load platforms when the service is instantiated.
	 */
	public function __construct() {
		$this->load_platforms();
	}

	/**
	 * Loads platforms discovered via a filter.
	 *
	 * It also validates that each registered platform provides both a fetcher and a mapper class.
	 */
	private function load_platforms(): void {
		/**
		 * Filters the list of registered migration platforms.
		 *
		 * External platform plugins should hook into this filter to register themselves.
		 * Each platform plugin is responsible for its own autoloading and initialization.
		 *
		 * @param array $platforms An associative array of platform configurations.
		 *                         Each key is a unique platform ID (e.g., 'shopify'), and the value
		 *                         is another array containing 'name', 'fetcher', and 'mapper' class names.
		 * @since 1.0.0
		 */
		$platforms = apply_filters( 'poocommerce_migrator_platforms', array() );

		if ( ! is_array( $platforms ) ) {
			return;
		}

		foreach ( $platforms as $platform_id => $config ) {
			if ( isset( $config['fetcher'], $config['mapper'] ) ) {
				$this->platforms[ $platform_id ] = $config;
			}
		}
	}

	/**
	 * Returns the entire array of registered platform configurations.
	 *
	 * @return array
	 */
	public function get_platforms(): array {
		return $this->platforms;
	}

	/**
	 * Returns the configuration array for a single, specified platform ID.
	 *
	 * @param string $platform_id The ID of the platform (e.g., 'shopify').
	 *
	 * @return array|null The platform configuration or null if not found.
	 */
	public function get_platform( string $platform_id ): ?array {
		return $this->platforms[ $platform_id ] ?? null;
	}

	/**
	 * Retrieves and instantiates the fetcher class for a given platform.
	 *
	 * @param string $platform_id The ID of the platform.
	 *
	 * @return PlatformFetcherInterface An instance of the platform's fetcher class.
	 *
	 * @throws InvalidArgumentException If the platform is not found or the fetcher class is invalid.
	 */
	public function get_fetcher( string $platform_id ): PlatformFetcherInterface {
		$platform = $this->get_platform( $platform_id );

		if ( ! $platform ) {
			throw new InvalidArgumentException(
				sprintf(
					/* translators: %s: Platform ID */
					esc_html__( 'Platform %s not found.', 'poocommerce' ),
					esc_html( $platform_id )
				)
			);
		}

		$fetcher_class = $platform['fetcher'];

		if ( ! class_exists( $fetcher_class ) || ! in_array( PlatformFetcherInterface::class, class_implements( $fetcher_class ), true ) ) {
			throw new InvalidArgumentException(
				sprintf(
					/* translators: %s: Platform ID */
					esc_html__( 'Invalid fetcher class for platform %s.', 'poocommerce' ),
					esc_html( $platform_id )
				)
			);
		}

		return new $fetcher_class();
	}

	/**
	 * Retrieves and instantiates the mapper class for a given platform.
	 *
	 * @param string $platform_id The ID of the platform.
	 *
	 * @return PlatformMapperInterface An instance of the platform's mapper class.
	 *
	 * @throws InvalidArgumentException If the platform is not found or the mapper class is invalid.
	 */
	public function get_mapper( string $platform_id ): PlatformMapperInterface {
		$platform = $this->get_platform( $platform_id );

		if ( ! $platform ) {
			throw new InvalidArgumentException(
				sprintf(
					/* translators: %s: Platform ID */
					esc_html__( 'Platform %s not found.', 'poocommerce' ),
					esc_html( $platform_id )
				)
			);
		}

		$mapper_class = $platform['mapper'];

		if ( ! class_exists( $mapper_class ) || ! in_array( PlatformMapperInterface::class, class_implements( $mapper_class ), true ) ) {
			throw new InvalidArgumentException(
				sprintf(
					/* translators: %s: Platform ID */
					esc_html__( 'Invalid mapper class for platform %s.', 'poocommerce' ),
					esc_html( $platform_id )
				)
			);
		}

		return new $mapper_class();
	}

	/**
	 * Determines the platform to use from command arguments, with validation and fallback.
	 *
	 * @param array  $assoc_args     Associative arguments from the command.
	 * @param string $default_platform The default platform to use if none specified.
	 *
	 * @return string The validated platform slug.
	 */
	public function resolve_platform( array $assoc_args, string $default_platform = 'shopify' ): string {
		$platform = $assoc_args['platform'] ?? null;

		if ( empty( $platform ) ) {
			$platform = $default_platform;
			WP_CLI::log( "Platform not specified, using default: '{$platform}'." );
		}

		// Validate the platform exists.
		if ( ! $this->get_platform( $platform ) ) {
			$available_platforms = array_keys( $this->get_platforms() );
			if ( empty( $available_platforms ) ) {
				WP_CLI::error( 'No platforms are currently registered. Please ensure platform plugins are installed and activated.' );
			} else {
				WP_CLI::error(
					sprintf(
						"Platform '%s' is not registered. Available platforms: %s",
						$platform,
						implode( ', ', $available_platforms )
					)
				);
			}
		}

		return $platform;
	}

	/**
	 * Get platform-specific credential fields for setup prompts.
	 *
	 * @param string $platform_slug The platform identifier.
	 *
	 * @return array Array of field_name => prompt_text pairs.
	 */
	public function get_platform_credential_fields( string $platform_slug ): array {

		// Default field mappings for known platforms.
		$default_fields = array(
			'shopify' => array(
				'shop_url'     => 'Enter shop URL (e.g., mystore.myshopify.com):',
				'access_token' => 'Enter access token:',
			),
		);

		return $default_fields[ $platform_slug ] ?? array();
	}
}
