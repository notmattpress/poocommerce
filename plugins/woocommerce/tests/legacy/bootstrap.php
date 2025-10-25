<?php
/**
 * PooCommerce Unit Tests Bootstrap
 *
 * @since 2.2
 * @package PooCommerce Tests
 */

use Automattic\PooCommerce\Internal\Admin\FeaturePlugin;
use Automattic\PooCommerce\Testing\Tools\CodeHacking\CodeHacker;
use Automattic\PooCommerce\Testing\Tools\CodeHacking\Hacks\StaticMockerHack;
use Automattic\PooCommerce\Testing\Tools\CodeHacking\Hacks\FunctionsMockerHack;
use Automattic\PooCommerce\Testing\Tools\CodeHacking\Hacks\BypassFinalsHack;
use Automattic\PooCommerce\Testing\Tools\TestingContainer;

/**
 * Class WC_Unit_Tests_Bootstrap
 */
class WC_Unit_Tests_Bootstrap {

	/** @var WC_Unit_Tests_Bootstrap instance */
	protected static $instance = null;

	/** @var string directory where wordpress-tests-lib is installed */
	public $wp_tests_dir;

	/** @var string testing directory */
	public $tests_dir;

	/** @var string plugin directory */
	public $plugin_dir;

	/**
	 * Setup the unit testing environment.
	 *
	 * @since 2.2
	 */
	public function __construct() {
		$this->tests_dir  = __DIR__;
		$this->plugin_dir = dirname( dirname( $this->tests_dir ) );

		$this->register_autoloader_for_testing_tools();

		$this->initialize_code_hacker();

		ini_set( 'display_errors', 'on' ); // phpcs:ignore WordPress.PHP.IniSet.display_errors_Blacklisted
		error_reporting( E_ALL ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_error_reporting

		// Ensure server variable is set for WP email functions.
		// phpcs:disable WordPress.VIP.SuperGlobalInputUsage.AccessDetected
		if ( ! isset( $_SERVER['SERVER_NAME'] ) ) {
			$_SERVER['SERVER_NAME'] = 'localhost';
		}
		// phpcs:enable WordPress.VIP.SuperGlobalInputUsage.AccessDetected

		$this->wp_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : sys_get_temp_dir() . '/wordpress-tests-lib';

		// load test function so tests_add_filter() is available.
		require_once $this->wp_tests_dir . '/includes/functions.php';

		// load WC.
		tests_add_filter( 'muplugins_loaded', array( $this, 'load_wc' ) );

		// Load admin features.
		tests_add_filter( 'poocommerce_admin_should_load_features', '__return_true' );

		// install WC.
		tests_add_filter( 'setup_theme', array( $this, 'install_wc' ) );

		// Set up WC-Admin config.
		tests_add_filter( 'poocommerce_admin_get_feature_config', array( $this, 'add_development_features' ) );

		// Speed things up by turning down the password hashing cost.
		tests_add_filter(
			'wp_hash_password_options',
			function ( $options ) {
				$options['cost'] = 4;
				return $options;
			}
		);

		/*
		* Load PHPUnit Polyfills for the WP testing suite.
		* @see https://github.com/WordPress/wordpress-develop/pull/1563/
		*/
		define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', __DIR__ . '/../../vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php' );

		// load the WP testing environment.
		require_once $this->wp_tests_dir . '/includes/bootstrap.php';

		// Ensure theme install tests use direct filesystem method.
		if ( ! defined( 'FS_METHOD' ) ) {
			define( 'FS_METHOD', 'direct' );
		}

		// load WC testing framework.
		$this->includes();

		// re-initialize dependency injection, this needs to be the last operation after everything else is in place.
		$this->initialize_dependency_injection();

		$this->maybe_initialize_hpos();

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions, WordPress.PHP.DiscouragedPHPFunctions
		error_reporting( error_reporting() & ~E_DEPRECATED );
	}

	/**
	 * Register autoloader for the files in the 'tests/tools' directory, for the root namespace 'Automattic\PooCommerce\Testing\Tools'.
	 */
	protected static function register_autoloader_for_testing_tools() {
		spl_autoload_register(
			function ( $class ) {
				$tests_directory   = dirname( __DIR__, 1 );
				$helpers_directory = $tests_directory . '/php/helpers';

				// Support loading top-level classes from the `php/helpers` directory.
				if ( false === strpos( $class, '\\' ) ) {
					$helper_path = realpath( "$helpers_directory/$class.php" );

					if ( dirname( $helper_path ) === $helpers_directory && file_exists( $helper_path ) ) {
						require $helper_path;
						return;
					}
				}

				// Otherwise, check if this might relate to an Automattic\PooCommerce\Testing\Tools class.
				$prefix   = 'Automattic\\PooCommerce\\Testing\\Tools\\';
				$base_dir = $tests_directory . '/Tools/';
				$len      = strlen( $prefix );
				if ( strncmp( $prefix, $class, $len ) !== 0 ) {
					// no, move to the next registered autoloader.
					return;
				}
				$relative_class = substr( $class, $len );
				$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';
				if ( ! file_exists( $file ) ) {
					throw new \Exception( 'Autoloader for unit tests: file not found: ' . $file );
				}
				require $file;
			}
		);
	}

	/**
	 * Initialize the code hacker.
	 *
	 * @throws Exception Error when initializing one of the hacks.
	 */
	private function initialize_code_hacker() {
		CodeHacker::initialize( array( __DIR__ . '/../../includes/' ) );

		$replaceable_functions = include_once __DIR__ . '/mockable-functions.php';
		if ( ! empty( $replaceable_functions ) ) {
			FunctionsMockerHack::initialize( $replaceable_functions );
			CodeHacker::add_hack( FunctionsMockerHack::get_hack_instance() );
		}

		$mockable_static_classes = include_once __DIR__ . '/classes-with-mockable-static-methods.php';
		if ( ! empty( $mockable_static_classes ) ) {
			StaticMockerHack::initialize( $mockable_static_classes );
			CodeHacker::add_hack( StaticMockerHack::get_hack_instance() );
		}

		CodeHacker::add_hack( new BypassFinalsHack() );

		CodeHacker::enable();
	}

	/**
	 * Configure the order datastore based on the DISABLE_HPOS environment variable.
	 *
	 * @return void
	 */
	private function maybe_initialize_hpos() {
		$disable_hpos = ! empty( getenv( 'DISABLE_HPOS' ) );
		\Automattic\PooCommerce\RestApi\UnitTests\Helpers\OrderHelper::toggle_cot_feature_and_usage( ! $disable_hpos );
	}

	/**
	 * Re-initialize the dependency injection engine.
	 *
	 * The dependency injection engine has been already initialized as part of the Woo initialization, but we need
	 * to replace the registered runtime container with one with extra capabilities for testing.
	 * To this end we hack a bit and use reflection to grab the underlying container that the read-only one stores
	 * in a private property.
	 *
	 * Note also that TestingContainer replaces the instance of LegacyProxy with an instance of MockableLegacyProxy.
	 *
	 * @throws \Exception The Container class doesn't have a 'container' property.
	 */
	private function initialize_dependency_injection() {
		try {
			$inner_container_property = new \ReflectionProperty( \Automattic\PooCommerce\Container::class, 'container' );
		} catch ( ReflectionException $ex ) {
			throw new \Exception( "Error when trying to get the private 'container' property from the " . \Automattic\PooCommerce\Container::class . ' class using reflection during unit testing bootstrap, has the property been removed or renamed?' );
		}

		$inner_container_property->setAccessible( true );

		$container       = wc_get_container();
		$inner_container = $inner_container_property->getValue( $container );
		$inner_container = new TestingContainer( $inner_container );
		$inner_container_property->setValue( $container, $inner_container );

		$GLOBALS['wc_container'] = $inner_container;
	}

	/**
	 * Load PooCommerce.
	 *
	 * @since 2.2
	 */
	public function load_wc() {
		define( 'WC_TAX_ROUNDING_MODE', 'auto' );
		define( 'WC_USE_TRANSACTIONS', false );

		// Enable Back In Stock alpha during tests.
		define( 'WOOCOMMERCE_BIS_ALPHA_ENABLED', true );

		update_option( 'poocommerce_enable_coupons', 'yes' );
		update_option( 'poocommerce_calc_taxes', 'yes' );
		update_option( 'poocommerce_onboarding_opt_in', 'yes' );

		require_once $this->plugin_dir . '/poocommerce.php';
		FeaturePlugin::instance()->init();
	}

	/**
	 * Install PooCommerce after the test environment and WC have been loaded.
	 *
	 * @since 2.2
	 */
	public function install_wc() {
		// Clean existing install first.
		define( 'WP_UNINSTALL_PLUGIN', true );
		define( 'WC_REMOVE_ALL_DATA', true );
		include $this->plugin_dir . '/uninstall.php';

		// Always load PayPal Standard for unit tests.
		$paypal = class_exists( 'WC_Gateway_Paypal' ) ? WC_Gateway_Paypal::get_instance() : null;
		if ( $paypal ) {
			$paypal->update_option( '_should_load', wc_bool_to_string( true ) );
		}

		WC_Install::install();

		// Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374.
		if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
			$GLOBALS['wp_roles']->reinit();
		} else {
			$GLOBALS['wp_roles'] = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			wp_roles();
		}

		echo esc_html( 'Installing PooCommerce...' . PHP_EOL );
	}

	/**
	 * Load WC-specific test cases and factories.
	 *
	 * @since 2.2
	 */
	public function includes() {
		// framework.
		require_once $this->tests_dir . '/framework/class-wc-unit-test-factory.php';
		require_once $this->tests_dir . '/framework/class-wc-mock-session-handler.php';
		require_once $this->tests_dir . '/framework/class-wc-mock-wc-data.php';
		require_once $this->tests_dir . '/framework/class-wc-mock-wc-object-query.php';
		require_once $this->tests_dir . '/framework/class-wc-mock-payment-gateway.php';
		require_once $this->tests_dir . '/framework/class-wc-mock-enhanced-payment-gateway.php';
		require_once $this->tests_dir . '/framework/class-wc-payment-token-stub.php';
		require_once $this->tests_dir . '/framework/vendor/class-wp-test-spy-rest-server.php';

		// test cases.
		require_once $this->tests_dir . '/includes/wp-http-testcase.php';
		require_once $this->tests_dir . '/framework/class-wc-unit-test-case.php';
		require_once $this->tests_dir . '/framework/class-wc-api-unit-test-case.php';
		require_once $this->tests_dir . '/framework/class-wc-rest-unit-test-case.php';

		// Helpers.
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-product.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-coupon.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-fee.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-shipping.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-customer.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-order.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-shipping-zones.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-payment-token.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-settings.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-reports.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-admin-notes.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-test-action-queue.php';
		require_once $this->tests_dir . '/framework/helpers/class-wc-helper-queue.php';

		// Traits.
		require_once $this->tests_dir . '/framework/traits/trait-wc-rest-api-complex-meta.php';
		require_once dirname( $this->tests_dir ) . '/php/helpers/HPOSToggleTrait.php';
		require_once dirname( $this->tests_dir ) . '/php/helpers/SerializingCacheTrait.php';
	}

	/**
	 * Use the `development` features for testing.
	 *
	 * @param array $flags Existing feature flags.
	 * @return array Filtered feature flags.
	 */
	public function add_development_features( $flags ) {
		$config = json_decode( file_get_contents( $this->plugin_dir . '/client/admin/config/development.json' ) ); // @codingStandardsIgnoreLine.
		foreach ( $config->features as $feature => $bool ) {
			$flags[ $feature ] = $bool;
		}
		return $flags;
	}

	/**
	 * Get the single class instance.
	 *
	 * @since 2.2
	 * @return WC_Unit_Tests_Bootstrap
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}

WC_Unit_Tests_Bootstrap::instance();
