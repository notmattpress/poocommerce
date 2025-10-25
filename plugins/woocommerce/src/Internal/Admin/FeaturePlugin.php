<?php
/**
 * PooCommerce Admin: Feature plugin main class.
 */

namespace Automattic\PooCommerce\Internal\Admin;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Admin\API;
use Automattic\PooCommerce\Admin\Notes\Notes;
use Automattic\PooCommerce\Internal\Admin\Notes\OrderMilestones;
use Automattic\PooCommerce\Internal\Admin\Notes\WooSubscriptionsNotes;
use Automattic\PooCommerce\Internal\Admin\Notes\TrackingOptIn;
use Automattic\PooCommerce\Internal\Admin\Notes\PooCommercePayments;
use Automattic\PooCommerce\Internal\Admin\Notes\InstallJPAndWCSPlugins;
use Automattic\PooCommerce\Internal\Admin\Notes\SellingOnlineCourses;
use Automattic\PooCommerce\Internal\Admin\Notes\MagentoMigration;
use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Admin\PluginsHelper;
use Automattic\PooCommerce\Admin\PluginsInstaller;
use Automattic\PooCommerce\Admin\ReportExporter;
use Automattic\PooCommerce\Admin\ReportsSync;
use Automattic\PooCommerce\Internal\Admin\CategoryLookup;
use Automattic\PooCommerce\Internal\Admin\Events;
use Automattic\PooCommerce\Internal\Admin\Onboarding\Onboarding;

/**
 * Feature plugin main class.
 *
 * @internal This file will not be bundled with woo core, only the feature plugin.
 * @internal Note this is not called WC_Admin due to a class already existing in core with that name.
 */
class FeaturePlugin {
	/**
	 * The single instance of the class.
	 *
	 * @var object
	 */
	protected static $instance = null;

	/**
	 * Indicates if init has been invoked already.
	 *
	 * @var bool
	 */
	private bool $initialized = false;

	/**
	 * Constructor
	 *
	 * @return void
	 */
	protected function __construct() {}

	/**
	 * Get class instance.
	 *
	 * @return object Instance.
	 */
	final public static function instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	/**
	 * Init the feature plugin, only if we can detect both Gutenberg and PooCommerce.
	 */
	public function init() {
		// Bail if WC isn't initialized (This can be called from WCAdmin's entrypoint).
		if ( ! defined( 'WC_ABSPATH' ) ) {
			return;
		}

		if ( $this->initialized ) {
			return;
		}
		$this->initialized = true;

		// Load the page controller functions file first to prevent fatal errors when disabling PooCommerce Admin.
		$this->define_constants();
		require_once WC_ADMIN_ABSPATH . '/includes/react-admin/page-controller-functions.php';
		require_once WC_ADMIN_ABSPATH . '/src/Admin/Notes/DeprecatedNotes.php';
		require_once WC_ADMIN_ABSPATH . '/includes/react-admin/core-functions.php';
		require_once WC_ADMIN_ABSPATH . '/includes/react-admin/feature-config.php';
		require_once WC_ADMIN_ABSPATH . '/includes/react-admin/wc-admin-update-functions.php';
		require_once WC_ADMIN_ABSPATH . '/includes/react-admin/class-experimental-abtest.php';

		if ( did_action( 'plugins_loaded' ) ) {
			self::on_plugins_loaded();
		} else {
			// Make sure we hook into `plugins_loaded` before core's Automattic\PooCommerce\Package::init().
			// If core is network activated but we aren't, the packaged version of PooCommerce Admin will
			// attempt to use a data store that hasn't been loaded yet - because we've defined our constants here.
			// See: https://github.com/poocommerce/poocommerce-admin/issues/3869.
			add_action( 'plugins_loaded', array( $this, 'on_plugins_loaded' ), 9 );
		}
	}

	/**
	 * Setup plugin once all other plugins are loaded.
	 *
	 * @return void
	 */
	public function on_plugins_loaded() {
		$this->hooks();
		$this->includes();
	}

	/**
	 * Define Constants.
	 */
	protected function define_constants() {
		$this->define( 'WC_ADMIN_APP', 'wc-admin-app' );
		$this->define( 'WC_ADMIN_ABSPATH', WC_ABSPATH );
		$this->define( 'WC_ADMIN_DIST_JS_FOLDER', 'assets/client/admin/' );
		$this->define( 'WC_ADMIN_DIST_CSS_FOLDER', 'assets/client/admin/' );
		$this->define( 'WC_ADMIN_PLUGIN_FILE', WC_PLUGIN_FILE );

		/**
		 * Define the WC Admin Images Folder URL.
		 *
		 * @deprecated 6.7.0
		 * @var string
		 */
		if ( ! defined( 'WC_ADMIN_IMAGES_FOLDER_URL' ) ) {
			/**
			 * Define the WC Admin Images Folder URL.
			 *
			 * @deprecated 6.7.0
			 * @var string
			 */
			define( 'WC_ADMIN_IMAGES_FOLDER_URL', plugins_url( 'assets/images', WC_PLUGIN_FILE ) );
		}

		/**
		 * Define the current WC Admin version.
		 *
		 * @deprecated 6.4.0
		 * @var string
		 */
		if ( ! defined( 'WC_ADMIN_VERSION_NUMBER' ) ) {
			/**
			 * Define the current WC Admin version.
			 *
			 * @deprecated 6.4.0
			 * @var string
			 */
			define( 'WC_ADMIN_VERSION_NUMBER', '3.3.0' );
		}
	}

	/**
	 * Include WC Admin classes.
	 */
	public function includes() {
		// Initialize Database updates, option migrations, and Notes.
		Events::instance()->init();
		Notes::init();

		// Initialize Plugins Installer.
		PluginsInstaller::init();
		PluginsHelper::init();

		// Initialize API.
		API\Init::instance();

		if ( Features::is_enabled( 'onboarding' ) ) {
			Onboarding::init();
		}

		if ( Features::is_enabled( 'analytics' ) ) {
			// Initialize Reports syncing.
			ReportsSync::init();
			CategoryLookup::instance()->init();

			// Initialize Reports exporter.
			ReportExporter::init();
		}

		// Admin note providers.
		// @todo These should be bundled in the features/ folder, but loading them from there currently has a load order issue.
		new WooSubscriptionsNotes();
		new OrderMilestones();
		new TrackingOptIn();
		new PooCommercePayments();
		new InstallJPAndWCSPlugins();
		new SellingOnlineCourses();
		new MagentoMigration();
	}

	/**
	 * Set up our admin hooks and plugin loader.
	 */
	protected function hooks() {
		add_filter( 'poocommerce_admin_features', array( $this, 'replace_supported_features' ), 0 );

		Loader::get_instance();
		WCAdminAssets::get_instance();
	}


	/**
	 * Overwrites the allowed features array using a local `feature-config.php` file.
	 *
	 * @param array $features Array of feature slugs.
	 */
	public function replace_supported_features( $features ) {
		/**
		 * Get additional feature config
		 *
		 * @since 6.5.0
		 */
		$feature_config = apply_filters( 'poocommerce_admin_get_feature_config', wc_admin_get_feature_config() );
		$features       = array_keys( array_filter( $feature_config ) );
		return $features;
	}

	/**
	 * Define constant if not already set.
	 *
	 * @param string      $name  Constant name.
	 * @param string|bool $value Constant value.
	 */
	protected function define( $name, $value ) {
		if ( ! defined( $name ) ) {
			define( $name, $value );
		}
	}

	/**
	 * Prevent cloning.
	 */
	private function __clone() {}

	/**
	 * Prevent unserializing.
	 */
	public function __wakeup() {
		die();
	}
}
