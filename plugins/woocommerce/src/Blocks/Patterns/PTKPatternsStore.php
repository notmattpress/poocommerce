<?php

namespace Automattic\PooCommerce\Blocks\Patterns;

use Automattic\PooCommerce\Admin\Features\Features;
use WP_Upgrader;

/**
 * PTKPatterns class.
 *
 * @internal
 */
class PTKPatternsStore {
	const OPTION_NAME                             = 'ptk_patterns';
	const LAST_FETCH_PATTERNS_REQUEST_OPTION_NAME = 'last_fetch_patterns_request';

	const CATEGORY_MAPPING = array(
		'testimonials' => 'reviews',
	);

	/**
	 * PatternsToolkit instance.
	 *
	 * @var PTKClient $ptk_client
	 */
	private PTKClient $ptk_client;

	/**
	 * Constructor for the class.
	 *
	 * @param PTKClient $ptk_client An instance of PatternsToolkit.
	 */
	public function __construct( PTKClient $ptk_client ) {
		$this->ptk_client = $ptk_client;

		if ( Features::is_enabled( 'pattern-toolkit-full-composability' ) ) {
			// We want to flush the cached patterns when:
			// - The PooCommerce plugin is deactivated.
			// - The `poocommerce_allow_tracking` option is disabled.
			//
			// We also want to re-fetch the patterns and update the cache when:
			// - The `poocommerce_allow_tracking` option changes to enabled.
			// - The PooCommerce plugin is activated (if `poocommerce_allow_tracking` is enabled).
			// - The PooCommerce plugin is updated.

			add_action( 'poocommerce_activated_plugin', array( $this, 'flush_or_fetch_patterns' ), 10, 2 );
			add_action( 'update_option_poocommerce_allow_tracking', array( $this, 'flush_or_fetch_patterns' ), 10, 2 );
			add_action( 'deactivated_plugin', array( $this, 'flush_cached_patterns' ), 10, 2 );
			add_action( 'upgrader_process_complete', array( $this, 'fetch_patterns_on_plugin_update' ), 10, 2 );

			// This is the scheduled action that takes care of flushing and re-fetching the patterns from the PTK API.
			add_action( 'fetch_patterns', array( $this, 'fetch_patterns' ) );
		}
	}

	/**
	 * Resets the cached patterns when the `poocommerce_allow_tracking` option is disabled.
	 * Resets and fetch the patterns from the PTK when it is enabled (if the scheduler
	 * is initialized, it's done asynchronously via a scheduled action).
	 *
	 * @return void
	 */
	public function flush_or_fetch_patterns() {
		if ( $this->allowed_tracking_is_enabled() ) {
			$this->schedule_fetch_patterns();
			return;
		}

		$this->flush_cached_patterns();
	}

	/**
	 * Schedule an async action to fetch the PTK patterns when the scheduler is initialized.
	 *
	 * @return void
	 */
	private function schedule_fetch_patterns() {
		if ( did_action( 'action_scheduler_init' ) ) {
			$this->schedule_action_if_not_pending( 'fetch_patterns' );
		} else {
			add_action(
				'action_scheduler_init',
				function () {
					$this->schedule_action_if_not_pending( 'fetch_patterns' );
				}
			);
		}
	}

	/**
	 * Check if the last request was more than one day ago.
	 *
	 * @param int $last_request The last request time.
	 * @return bool
	 */
	private function is_older_than_one_day( $last_request ) {
		$current_time = time();
		return abs( $last_request - $current_time ) > DAY_IN_SECONDS;
	}

	/**
	 * Schedule an action if it's not already pending.
	 *
	 * @param string $action The action name to schedule.
	 * @return void
	 */
	private function schedule_action_if_not_pending( $action ) {
		$last_request = get_option( self::LAST_FETCH_PATTERNS_REQUEST_OPTION_NAME );
		// The most efficient way to check for an existing action is to use `as_has_scheduled_action`, but in unusual
		// cases where another plugin has loaded a very old version of Action Scheduler, it may not be available to us.

		$has_scheduled_action = function_exists( 'as_has_scheduled_action' ) ? 'as_has_scheduled_action' : 'as_next_scheduled_action';
		if ( call_user_func( $has_scheduled_action, $action ) || ( is_numeric( $last_request ) && ! $this->is_older_than_one_day( $last_request ) ) ) {
			return;
		}

		as_schedule_single_action( time(), $action );
		update_option( self::LAST_FETCH_PATTERNS_REQUEST_OPTION_NAME, time(), false );
	}

	/**
	 * Get the patterns from the Patterns Toolkit cache.
	 *
	 * @return array
	 */
	public function get_patterns() {
		$patterns = get_option( self::OPTION_NAME );

		// Only if the transient is not set, we schedule fetching the patterns from the PTK.
		if ( false === $patterns || ! $this->ptk_client->is_valid_schema( $patterns ) ) {
			$this->schedule_fetch_patterns();
			return array();
		}

		return $patterns;
	}

	/**
	 * Filter the patterns that have external dependencies.
	 *
	 * @param array $patterns The patterns to filter.
	 * @return array
	 */
	private function filter_patterns( array $patterns ) {
		return array_values(
			array_filter(
				$patterns,
				function ( $pattern ) {
					if ( ! isset( $pattern['ID'] ) ) {
						return true;
					}

					if ( isset( $pattern['post_type'] ) && 'wp_block' !== $pattern['post_type'] ) {
						return false;
					}

					if ( $this->has_external_dependencies( $pattern ) ) {
						return false;
					}

					return true;
				}
			)
		);
	}

	/**
	 * Re-fetch the patterns when the PooCommerce plugin is updated.
	 *
	 * @param WP_Upgrader $upgrader_object WP_Upgrader instance.
	 * @param array       $options Array of bulk item update data.
	 *
	 * @return void
	 */
	public function fetch_patterns_on_plugin_update( $upgrader_object, $options ) {
		if ( 'update' === $options['action'] && 'plugin' === $options['type'] && isset( $options['plugins'] ) ) {
			foreach ( $options['plugins'] as $plugin ) {
				if ( str_contains( $plugin, 'poocommerce.php' ) ) {
					$this->schedule_fetch_patterns();
				}
			}
		}
	}

	/**
	 * Reset the cached patterns to fetch them again from the PTK.
	 *
	 * @return void
	 */
	public function flush_cached_patterns() {
		delete_option( self::OPTION_NAME );
		delete_option( self::LAST_FETCH_PATTERNS_REQUEST_OPTION_NAME );
	}

	/**
	 * Reset the cached patterns and fetch them again from the PTK API.
	 *
	 * @return void
	 */
	public function fetch_patterns() {
		if ( ! $this->allowed_tracking_is_enabled() ) {
			return;
		}

		$this->flush_cached_patterns();

		$patterns = $this->ptk_client->fetch_patterns(
			array(
				// This is the site where the patterns are stored. Despite the 'wpcomstaging.com' domain suggesting a staging environment, this URL points to the production environment where stable versions of the patterns are maintained.
				'site'       => 'wooblockpatterns.wpcomstaging.com',
				'categories' => array(
					'_woo_intro',
					'_woo_featured_selling',
					'_woo_about',
					'_woo_reviews',
					'_woo_social_media',
					'_woo_poocommerce',
					'_dotcom_imported_intro',
					'_dotcom_imported_about',
					'_dotcom_imported_services',
					'_dotcom_imported_reviews',
				),
			)
		);

		if ( is_wp_error( $patterns ) ) {
			wc_get_logger()->warning(
				sprintf(
				// translators: %s is a generated error message.
					__( 'Failed to get PooCommerce patterns from the PTK: "%s"', 'poocommerce' ),
					$patterns->get_error_message()
				),
			);
			return;
		}

		$patterns = $this->filter_patterns( $patterns );
		$patterns = $this->map_categories( $patterns );

		update_option( self::OPTION_NAME, $patterns, false );
	}

	/**
	 * Check if the user allowed tracking.
	 *
	 * @return bool
	 */
	private function allowed_tracking_is_enabled(): bool {
		return 'yes' === get_option( 'poocommerce_allow_tracking' );
	}

	/**
	 * Change the categories of the patterns to match the ones used in the CYS flow
	 *
	 * @param array $patterns The patterns to map categories for.
	 * @return array The patterns with the categories mapped.
	 */
	private function map_categories( array $patterns ) {
		return array_map(
			function ( $pattern ) {
				if ( isset( $pattern['categories'] ) ) {
					foreach ( $pattern['categories'] as $key => $category ) {
						if ( isset( $category['slug'] ) && isset( self::CATEGORY_MAPPING[ $key ] ) ) {
							$new_category = self::CATEGORY_MAPPING[ $key ];
							unset( $pattern['categories'][ $key ] );
							$pattern['categories'][ $new_category ]['slug']  = $new_category;
							$pattern['categories'][ $new_category ]['title'] = ucfirst( $new_category );
						}
					}
				}

				return $pattern;
			},
			$patterns
		);
	}

	/**
	 * Check if the pattern has external dependencies.
	 *
	 * @param array $pattern The pattern to check.
	 *
	 * @return bool
	 */
	private function has_external_dependencies( $pattern ) {
		if ( ! isset( $pattern['dependencies'] ) || ! is_array( $pattern['dependencies'] ) ) {
			return false;
		}

		foreach ( $pattern['dependencies'] as $dependency ) {
			if ( 'poocommerce' !== $dependency ) {
				return true;
			}
		}

		return false;
	}
}
