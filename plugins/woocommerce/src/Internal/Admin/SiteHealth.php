<?php
/**
 * Customize Site Health recommendations for PooCommerce.
 */

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Enums\DefaultCustomerAddress;
use Automattic\PooCommerce\Enums\ProductStatus;
use Automattic\PooCommerce\Internal\DataStores\Orders\DataSynchronizer;
use Automattic\PooCommerce\Internal\Utilities\ProductUtil;
use Automattic\PooCommerce\Utilities\OrderUtil;
use WC_Admin_Notices;
use WC_Admin_Status;
use WC_Helper_Updater;
use WC_Install;
use WC_Order_Query;
use WC_Product_Query;

defined( 'ABSPATH' ) || exit;

/**
 * SiteHealth class.
 */
class SiteHealth {
	/**
	 * Class instance.
	 *
	 * @var SiteHealth instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Hook into PooCommerce.
	 */
	public function __construct() {
		add_filter( 'site_status_should_suggest_persistent_object_cache', array( $this, 'should_suggest_persistent_object_cache' ) );
		add_filter( 'site_status_tests', array( $this, 'handle_site_status_tests' ) );
	}

	/**
	 * Register PooCommerce Site Health status tests.
	 *
	 * @internal
	 *
	 * @param array $tests Site Health tests.
	 * @return array
	 */
	public function handle_site_status_tests( $tests ) {
		$tests['direct'] = $tests['direct'] ?? array();

		foreach ( $this->get_poocommerce_site_health_tests() as $test_id => $test ) {
			$tests['direct'][ $test_id ] = array(
				'label'     => $test['label'],
				'test'      => function () use ( $test_id ) {
					return $this->run_test( $test_id );
				},
				'skip_cron' => true,
			);
		}

		return $tests;
	}

	/**
	 * Run a registered PooCommerce Site Health test by ID.
	 *
	 * @param string $test_id Site Health test ID.
	 * @return array
	 */
	public function run_test( string $test_id ): array {
		$tests = $this->get_poocommerce_site_health_tests();

		if ( ! isset( $tests[ $test_id ] ) ) {
			return array();
		}

		$test         = $tests[ $test_id ];
		$check_result = ( $test['check'] )();

		if ( is_array( $check_result ) ) {
			$context = $check_result;
			$is_good = empty( $check_result );
		} else {
			$context = null;
			$is_good = (bool) $check_result;
		}

		$data        = $is_good ? $test['good'] : $test['fail'];
		$label       = is_callable( $data['label'] )
			? ( $data['label'] )( $context )
			: $data['label'];
		$status      = $is_good ? 'good' : ( $data['status'] ?? 'recommended' );
		$status      = is_callable( $status )
			? $status( $context )
			: $status;
		$description = is_callable( $data['description'] )
			? ( $data['description'] )( $context )
			: $data['description'];

		$actions_html = '';
		if ( ! $is_good && ! empty( $data['actions'] ) ) {
			foreach ( $data['actions'] as $action ) {
				$url           = is_callable( $action['url'] ) ? ( $action['url'] )( $context ) : $action['url'];
				$actions_html .= $this->get_site_health_action( $url, $action['label'], ! empty( $action['new_tab'] ) );
			}
		}

		return array(
			'label'       => $label,
			'status'      => $status,
			'badge'       => array(
				'label' => 'security' === $test['badge'] ? __( 'Security', 'poocommerce' ) : __( 'Performance', 'poocommerce' ),
				'color' => 'blue',
			),
			'description' => '<p>' . esc_html( $description ) . '</p>',
			'actions'     => $actions_html,
			'test'        => $test_id,
		);
	}

	/**
	 * Get the registry of PooCommerce Site Health tests.
	 *
	 * Each entry describes one test:
	 *   - label: visible test name in Site Health.
	 *   - badge: 'security' or 'performance'.
	 *   - check: callable returning bool (true = good) or array (empty = good, otherwise context for description/actions).
	 *   - good: result data when the check passes (label, description).
	 *   - fail: result data when the check fails (status defaults to 'recommended', label, description, optional actions).
	 *     Label, status, and description may be callables that receive the check context.
	 *
	 * @return array<string, array>
	 */
	protected function get_poocommerce_site_health_tests(): array {
		return array(
			'poocommerce_secure_connection'            => array(
				'label' => __( 'PooCommerce secure connection', 'poocommerce' ),
				'badge' => 'security',
				'check' => array( $this, 'is_store_using_secure_connection' ),
				'good'  => array(
					'label'       => __( 'PooCommerce store uses a secure connection', 'poocommerce' ),
					'description' => __( 'Customer data is protected by HTTPS on your store pages.', 'poocommerce' ),
				),
				'fail'  => array(
					'status'      => 'critical',
					'label'       => __( 'PooCommerce store is not using a secure connection', 'poocommerce' ),
					'description' => __( 'PooCommerce strongly recommends serving your entire store over HTTPS to help keep customer data secure.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'     => 'https://poocommerce.com/document/ssl-and-https/',
							'label'   => __( 'Learn more about HTTPS', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_uploads_directory_protection' => array(
				'label' => __( 'PooCommerce uploads directory protection', 'poocommerce' ),
				'badge' => 'security',
				'check' => array( $this, 'is_uploads_directory_protected' ),
				'good'  => array(
					'label'       => __( 'PooCommerce uploads directory is protected', 'poocommerce' ),
					'description' => __( 'The directory used for downloadable product files is not browsable from the web.', 'poocommerce' ),
				),
				'fail'  => array(
					'status'      => function ( ?array $context ) {
						return ! empty( $context['unverified'] ) ? 'recommended' : 'critical';
					},
					'label'       => function ( ?array $context ) {
						return ! empty( $context['unverified'] )
							? __( 'PooCommerce could not verify uploads directory protection', 'poocommerce' )
							: __( 'PooCommerce uploads directory is browsable from the web', 'poocommerce' );
					},
					'description' => function ( ?array $context ) {
						return ! empty( $context['unverified'] )
							? __( 'A loopback request to the PooCommerce uploads directory failed, so PooCommerce could not confirm whether directory browsing is disabled. Check your server configuration or try again later.', 'poocommerce' )
							: __( 'Directory browsing can expose downloadable product files. Configure your web server to prevent directory indexing for the PooCommerce uploads directory.', 'poocommerce' );
					},
					'actions'     => array(
						array(
							'url'     => 'https://poocommerce.com/document/digital-downloadable-product-handling/#protecting-your-uploads-directory',
							'label'   => __( 'Learn how to protect downloads', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_template_overrides'           => array(
				'label' => __( 'PooCommerce template overrides', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => ! $this->has_outdated_template_overrides(),
				'good'  => array(
					'label'       => __( 'PooCommerce template overrides are up to date', 'poocommerce' ),
					'description' => __( 'The active theme does not contain outdated PooCommerce template overrides.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'Your theme contains outdated PooCommerce template overrides', 'poocommerce' ),
					'description' => __( 'Outdated template overrides may not be compatible with the current version of PooCommerce.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-status#status-table-templates' ),
							'label' => __( 'View affected templates', 'poocommerce' ),
						),
						array(
							'url'     => 'https://poocommerce.com/document/template-structure/',
							'label'   => __( 'Learn more about templates', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_maxmind_geolocation'          => array(
				'label' => __( 'PooCommerce MaxMind geolocation', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => ! $this->needs_maxmind_license_key(),
				'good'  => array(
					'label'       => __( 'PooCommerce geolocation is configured', 'poocommerce' ),
					'description' => __( 'Your store does not require further MaxMind geolocation configuration.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce geolocation needs a MaxMind license key', 'poocommerce' ),
					'description' => __( 'A MaxMind license key is required when the default customer location uses geolocation.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=integration&section=maxmind_geolocation' ),
							'label' => __( 'Configure MaxMind geolocation', 'poocommerce' ),
						),
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=general' ),
							'label' => __( 'Change default customer location', 'poocommerce' ),
						),
					),
				),
			),
			'poocommerce_download_method'              => array(
				'label' => __( 'PooCommerce download method', 'poocommerce' ),
				'badge' => 'security',
				'check' => fn() => 'redirect' !== get_option( 'poocommerce_file_download_method' ),
				'good'  => array(
					'label'       => __( 'PooCommerce uses a supported download method', 'poocommerce' ),
					'description' => __( 'Your store is not configured to use the deprecated Redirect only download method.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce is using the deprecated Redirect only download method', 'poocommerce' ),
					'description' => __( 'Redirect only is deprecated for downloadable products. Choose a different download method, or allow redirects only as a fallback.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=products&section=downloadable' ),
							'label' => __( 'Review download settings', 'poocommerce' ),
						),
					),
				),
			),
			'poocommerce_database_tables'              => array(
				'label' => __( 'PooCommerce database tables', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => WC_Install::get_missing_base_tables(),
				'good'  => array(
					'label'       => __( 'PooCommerce database tables are present', 'poocommerce' ),
					'description' => __( 'All required PooCommerce database tables exist.', 'poocommerce' ),
				),
				'fail'  => array(
					'status'      => 'critical',
					'label'       => __( 'PooCommerce database tables are missing', 'poocommerce' ),
					'description' => fn( array $missing_tables ) => sprintf(
						/* translators: %s: Comma-separated list of missing database tables. */
						__( 'One or more tables required for PooCommerce to function are missing: %s.', 'poocommerce' ),
						implode( ', ', $missing_tables )
					),
					'actions'     => array(
						array(
							'url'   => wp_nonce_url( admin_url( 'admin.php?page=wc-status&tab=tools&action=verify_db_tables' ), 'debug_action' ),
							'label' => __( 'Check database tables again', 'poocommerce' ),
						),
					),
				),
			),
			'poocommerce_hpos_sync_on_read'            => array(
				'label' => __( 'PooCommerce HPOS sync on read', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => ! $this->should_show_hpos_sync_on_read_status(),
				'good'  => array(
					'label'       => __( 'PooCommerce HPOS sync on read does not require attention', 'poocommerce' ),
					'description' => __( 'Your current order storage configuration is not affected by the HPOS sync-on-read change.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce HPOS sync on read is disabled', 'poocommerce' ),
					'description' => __( 'Compatibility mode for HPOS no longer pulls order changes made to the posts database back into orders automatically. Review this if custom code modifies orders outside PooCommerce.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=advanced&section=features' ),
							'label' => __( 'Review order storage settings', 'poocommerce' ),
						),
						array(
							'url'     => 'https://developer.poocommerce.com/2026/02/16/hpos-sync-on-read-to-be-disabled-by-default-in-poocommerce-10-7/',
							'label'   => __( 'Learn more about this change', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_legacy_shipping_methods'      => array(
				'label' => __( 'PooCommerce legacy shipping methods', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => ! $this->has_legacy_shipping_methods_enabled(),
				'good'  => array(
					'label'       => __( 'PooCommerce legacy shipping methods are not enabled', 'poocommerce' ),
					'description' => __( 'Your store is not using deprecated legacy shipping methods.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce legacy shipping methods are enabled', 'poocommerce' ),
					'description' => __( 'Legacy shipping methods are deprecated. Set up rates with shipping zones instead.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
							'label' => __( 'Review shipping zones', 'poocommerce' ),
						),
						array(
							'url'     => 'https://poocommerce.com/document/setting-up-shipping-zones/',
							'label'   => __( 'Learn more about shipping zones', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_shipping_methods'             => array(
				'label' => __( 'PooCommerce shipping methods', 'poocommerce' ),
				'badge' => 'performance',
				'check' => fn() => ! $this->needs_shipping_methods(),
				'good'  => array(
					'label'       => __( 'PooCommerce shipping methods are configured', 'poocommerce' ),
					'description' => __( 'Your store does not need additional shipping method setup.', 'poocommerce' ),
				),
				'fail'  => array(
					'status'      => 'critical',
					'label'       => __( 'PooCommerce shipping is enabled but no shipping methods are configured', 'poocommerce' ),
					'description' => __( 'Customers cannot purchase physical goods until at least one shipping method is available.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
							'label' => __( 'Set up shipping methods', 'poocommerce' ),
						),
						array(
							'url'     => 'https://poocommerce.com/document/setting-up-shipping-zones/',
							'label'   => __( 'Learn more about shipping zones', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_approved_download_directories_sync' => array(
				'label' => __( 'PooCommerce approved download directories', 'poocommerce' ),
				'badge' => 'security',
				'check' => fn() => ! WC_Admin_Notices::has_notice( 'download_directories_sync_complete' ),
				'good'  => array(
					'label'       => __( 'PooCommerce approved download directories do not require review', 'poocommerce' ),
					'description' => __( 'There is no completed approved download directories sync waiting for review.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce approved download directories need review', 'poocommerce' ),
					'description' => __( 'The approved product download directories list was updated. Review it to confirm downloadable product files remain protected.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => admin_url( 'admin.php?page=wc-settings&tab=products&section=download_urls' ),
							'label' => __( 'Review approved directories', 'poocommerce' ),
						),
						array(
							'url'   => wp_nonce_url(
								add_query_arg( 'wc-hide-notice', 'download_directories_sync_complete', admin_url( 'site-health.php' ) ),
								'poocommerce_hide_notices_nonce',
								'_wc_notice_nonce'
							),
							'label' => __( 'Mark as reviewed', 'poocommerce' ),
						),
						array(
							'url'     => 'https://poocommerce.com/document/approved-download-directories',
							'label'   => __( 'Learn more about approved directories', 'poocommerce' ),
							'new_tab' => true,
						),
					),
				),
			),
			'poocommerce_com_extension_updates'        => array(
				'label' => __( 'PooCommerce.com plugin updates', 'poocommerce' ),
				'badge' => 'security',
				'check' => fn() => ! $this->has_outdated_poocommerce_com_plugins(),
				'good'  => array(
					'label'       => __( 'PooCommerce.com plugin updates do not require attention', 'poocommerce' ),
					'description' => __( 'Your store can receive PooCommerce.com plugin updates, or no outdated PooCommerce.com plugins were found.', 'poocommerce' ),
				),
				'fail'  => array(
					'label'       => __( 'PooCommerce.com plugin updates require attention', 'poocommerce' ),
					'description' => __( 'Your store might be at risk because it is running old versions of PooCommerce plugins. Connect your store to PooCommerce.com to get updates and streamlined support for your subscriptions.', 'poocommerce' ),
					'actions'     => array(
						array(
							'url'   => $this->get_poocommerce_com_extensions_url(),
							'label' => __( 'Connect your store', 'poocommerce' ),
						),
					),
				),
			),
		);
	}

	/**
	 * Counts specific types of PooCommerce entities to determine if a persistent object cache would be beneficial.
	 *
	 * Note that if all measured PooCommerce entities are below their thresholds, this will return null so that the
	 * other normal WordPress checks will still be run.
	 *
	 * @param true|null $check A non-null value will short-circuit WP's normal tests for this.
	 *
	 * @return true|null True if the store would benefit from a persistent object cache. Otherwise null.
	 */
	public function should_suggest_persistent_object_cache( $check ) {
		// Skip this if some other filter has already determined yes.
		if ( true === $check ) {
			return $check;
		}

		$thresholds = array(
			'orders'   => 100,
			'products' => 100,
		);

		foreach ( $thresholds as $key => $threshold ) {
			try {
				switch ( $key ) {
					case 'orders':
						$orders_query   = new WC_Order_Query(
							array(
								'status'   => 'any',
								'limit'    => 1,
								'paginate' => true,
								'return'   => 'ids',
							)
						);
						$orders_results = $orders_query->get_orders();
						if ( $orders_results->total >= $threshold ) {
							$check = true;
						}
						break;

					case 'products':
						$products_query   = new WC_Product_Query(
							array(
								'status'   => 'any',
								'limit'    => 1,
								'paginate' => true,
								'return'   => 'ids',
							)
						);
						$products_results = $products_query->get_products();
						if ( $products_results->total >= $threshold ) {
							$check = true;
						}
						break;
				}
			} catch ( \Exception $exception ) {
				break;
			}

			if ( ! is_null( $check ) ) {
				break;
			}
		}

		return $check;
	}

	/**
	 * Create a Site Health action link.
	 *
	 * @param string $url              URL.
	 * @param string $label            Link label.
	 * @param bool   $opens_in_new_tab Whether the link opens in a new tab.
	 * @return string
	 */
	private function get_site_health_action( $url, $label, $opens_in_new_tab = false ) {
		if ( $opens_in_new_tab ) {
			return sprintf(
				'<p><a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s' .
					'<span class="screen-reader-text"> %3$s</span><span aria-hidden="true" class="dashicons dashicons-external"></span></a></p>',
				esc_url( $url ),
				esc_html( $label ),
				esc_html__( '(opens in a new tab)', 'poocommerce' )
			);
		}

		return sprintf(
			'<p><a href="%1$s">%2$s</a></p>',
			esc_url( $url ),
			esc_html( $label )
		);
	}

	/**
	 * Determine whether the store is using HTTPS for PooCommerce pages.
	 *
	 * @return bool
	 */
	private function is_store_using_secure_connection() {
		$shop_page = wc_get_page_permalink( 'shop' );

		return is_ssl() && 'https' === substr( $shop_page, 0, 5 );
	}

	/**
	 * Check if the PooCommerce uploads directory is protected from directory browsing.
	 *
	 * @return bool|array{unverified: true}
	 */
	private function is_uploads_directory_protected() {
		$cache_key = '_poocommerce_upload_directory_status';
		$status    = get_transient( $cache_key );

		if ( false !== $status ) {
			if ( 'unverified' === $status ) {
				return array( 'unverified' => true );
			}

			return 'protected' === $status;
		}

		$uploads  = wp_get_upload_dir();
		$response = wp_safe_remote_get(
			esc_url_raw( $uploads['baseurl'] . '/poocommerce_uploads/' ),
			array(
				'redirection' => 0,
			)
		);

		if ( is_wp_error( $response ) ) {
			set_transient( $cache_key, 'unverified', HOUR_IN_SECONDS );
			return array( 'unverified' => true );
		}

		$response_code = intval( wp_remote_retrieve_response_code( $response ) );

		if ( 0 === $response_code ) {
			set_transient( $cache_key, 'unverified', HOUR_IN_SECONDS );
			return array( 'unverified' => true );
		}

		$response_content = wp_remote_retrieve_body( $response );
		$is_protected     = ( 200 === $response_code && empty( $response_content ) ) || ( 200 !== $response_code );

		set_transient( $cache_key, $is_protected ? 'protected' : 'unprotected', DAY_IN_SECONDS );

		return $is_protected;
	}

	/**
	 * Determine whether the active theme has outdated PooCommerce template overrides.
	 *
	 * @return bool
	 */
	private function has_outdated_template_overrides() {
		$core_templates = WC_Admin_Status::scan_template_files( WC()->plugin_path() . '/templates' );

		foreach ( $core_templates as $file ) {
			$theme_file = $this->get_theme_template_override_path( $file );

			if ( ! $theme_file ) {
				continue;
			}

			$core_version  = WC_Admin_Status::get_file_version( WC()->plugin_path() . '/templates/' . $file );
			$theme_version = WC_Admin_Status::get_file_version( $theme_file );

			if ( $core_version && $theme_version && version_compare( $theme_version, $core_version, '<' ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the path to a theme template override, if one exists.
	 *
	 * @param string $file Template file.
	 * @return string|false
	 */
	private function get_theme_template_override_path( $file ) {
		$paths = array(
			get_stylesheet_directory() . '/' . $file,
			get_stylesheet_directory() . '/' . WC()->template_path() . $file,
			get_template_directory() . '/' . $file,
			get_template_directory() . '/' . WC()->template_path() . $file,
		);

		foreach ( $paths as $path ) {
			if ( file_exists( $path ) ) {
				return $path;
			}
		}

		return false;
	}

	/**
	 * Determine whether MaxMind geolocation requires a license key.
	 *
	 * @return bool
	 */
	private function needs_maxmind_license_key() {
		/**
		 * Filter whether MaxMind geolocation notices should be displayed.
		 *
		 * Previously used to suppress the MaxMind license key admin notice. Honoured
		 * here so the equivalent Site Health warning can be suppressed the same way.
		 *
		 * @since 3.9.0
		 *
		 * @param bool $display Whether to display MaxMind geolocation notices.
		 */
		if ( ! apply_filters( 'poocommerce_maxmind_geolocation_display_notices', true ) ) {
			return false;
		}

		$default_address = get_option( 'poocommerce_default_customer_address' );

		if ( ! in_array( $default_address, array( DefaultCustomerAddress::GEOLOCATION, DefaultCustomerAddress::GEOLOCATION_AJAX ), true ) ) {
			return false;
		}

		$integration_options = get_option( 'poocommerce_maxmind_geolocation_settings' );

		return empty( $integration_options['license_key'] );
	}

	/**
	 * Determine whether the HPOS sync-on-read status should be shown.
	 *
	 * @return bool
	 */
	private function should_show_hpos_sync_on_read_status() {
		return OrderUtil::custom_orders_table_usage_is_enabled()
			&& wc_get_container()->get( DataSynchronizer::class )->data_sync_is_enabled();
	}

	/**
	 * Determine whether any legacy shipping methods are enabled.
	 *
	 * @return bool
	 */
	private function has_legacy_shipping_methods_enabled() {
		$legacy_methods = array( 'flat_rate', 'free_shipping', 'international_delivery', 'local_delivery', 'local_pickup' );

		foreach ( $legacy_methods as $method ) {
			$options = get_option( 'poocommerce_' . $method . '_settings' );

			if ( $options && isset( $options['enabled'] ) && 'yes' === $options['enabled'] ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether shipping is enabled but no methods are configured.
	 *
	 * @return bool
	 */
	private function needs_shipping_methods() {
		if ( ! wc_shipping_enabled() ) {
			return false;
		}

		$product_count = wc_get_container()->get( ProductUtil::class )->get_counts_for_type( 'product' );

		return ( $product_count[ ProductStatus::PUBLISH ] ?? 0 ) > 0 && 0 === wc_get_shipping_method_count();
	}

	/**
	 * Determine whether the store has outdated PooCommerce.com plugins that need connection to update.
	 *
	 * @return bool
	 */
	private function has_outdated_poocommerce_com_plugins() {
		if ( ! class_exists( WC_Helper_Updater::class ) ) {
			return false;
		}

		return 'long' === WC_Helper_Updater::get_woo_connect_notice_type();
	}

	/**
	 * Get the PooCommerce.com extensions admin URL.
	 *
	 * @return string
	 */
	private function get_poocommerce_com_extensions_url() {
		return add_query_arg(
			array(
				'page'         => 'wc-admin',
				'tab'          => 'my-subscriptions',
				'path'         => rawurlencode( '/extensions' ),
				'utm_source'   => 'site-health',
				'utm_campaign' => 'woo_extension_updates',
			),
			admin_url( 'admin.php' )
		);
	}
}
