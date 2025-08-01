<?php
/**
 * FeaturesController class file
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Features;

use Automattic\PooCommerce\Internal\Admin\EmailPreview\EmailPreview;
use WC_Tracks;
use WC_Site_Tracking;
use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Internal\Admin\Analytics;
use Automattic\PooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Automattic\PooCommerce\Internal\CostOfGoodsSold\CostOfGoodsSoldController;
use Automattic\PooCommerce\Proxies\LegacyProxy;
use Automattic\PooCommerce\Utilities\ArrayUtil;
use Automattic\PooCommerce\Utilities\PluginUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Class to define the PooCommerce features that can be enabled and disabled by admin users,
 * provides also a mechanism for PooCommerce plugins to declare that they are compatible
 * (or incompatible) with a given feature.
 *
 * Note: the 'poocommerce_register_feature_definitions' hook allows registering new features
 * externally. This hook is deprecated, features should be registered from within get_feature_definitions.
 * However, in case you use it for testing purposes, keep in mind that the hook is fired from inside 'init';
 * therefore, features that need to be queried, enabled, or disabled before 'init' (e.g. during WP CLI initialization)
 * can't be registered using the hook.
 */
class FeaturesController {

	public const FEATURE_ENABLED_CHANGED_ACTION = 'poocommerce_feature_enabled_changed';

	public const PLUGINS_COMPATIBLE_BY_DEFAULT_OPTION = 'poocommerce_plugins_are_compatible_with_features_by_default';

	/**
	 * The existing feature definitions.
	 *
	 * @var array[]
	 */
	private $features = array();

	/**
	 * The registered compatibility info for PooCommerce plugins, with plugin names as keys.
	 *
	 * @var array
	 */
	private $compatibility_info_by_plugin = array();

	/**
	 * The registered compatibility info for PooCommerce plugins, with feature ids as keys.
	 *
	 * @var array
	 */
	private $compatibility_info_by_feature = array();

	/**
	 * Pending compatibility declarations. Format is [feature_id, plugin_file, positive_compatibility].
	 *
	 * @var array
	 */
	private $pending_declarations = array();

	/**
	 * The LegacyProxy instance to use.
	 *
	 * @var LegacyProxy
	 */
	private $proxy;

	/**
	 * The PluginUtil instance to use.
	 *
	 * @var PluginUtil
	 */
	private $plugin_util;

	/**
	 * Flag indicating that features will be enableable from the settings page
	 * even when they are incompatible with active plugins.
	 *
	 * @var bool
	 */
	private $force_allow_enabling_features = false;

	/**
	 * Flag indicating that plugins will be activable from the plugins page
	 * even when they are incompatible with enabled features.
	 *
	 * @var bool
	 */
	private $force_allow_enabling_plugins = false;

	/**
	 * List of plugins excluded from feature compatibility warnings in UI.
	 *
	 * @var string[]
	 */
	private $plugins_excluded_from_compatibility_ui;

	/**
	 * Flag indicating if additional features have been registered already
	 * via poocommerce_register_feature_definitions action.
	 *
	 * @var bool
	 */
	private bool $registered_additional_features_via_action = false;

	/**
	 * Flag indicating if additional features have been registered already
	 * via calls to other classes.
	 *
	 * @var bool
	 */
	private bool $registered_additional_features_via_class_calls = false;

	/**
	 * Flag indicating if we are currently delaying plugin normalization.
	 *
	 * @var bool
	 */
	private bool $lazy = true;

	/**
	 * Creates a new instance of the class.
	 */
	public function __construct() {
		// In principle, register_additional_features is triggered manually from within class-poocommerce
		// right before before_poocommerce_init is fired (this is needed for the features to be visible
		// to plugins executing declare_compatibility).
		// However we add additional checks/hookings here to support unit tests and possible overlooked/future
		// DI container/class instantiation nuances.
		if ( ! $this->registered_additional_features_via_action ) {
			if ( did_action( 'before_poocommerce_init' ) ) {
				// Needed for unit tests, where 'before_poocommerce_init' will have been fired already at this point.
				$this->register_additional_features();
			} else {
				// This needs to have a higher $priority than the 'before_poocommerce_init' hooked by plugins that declare compatibility.
				add_filter( 'before_poocommerce_init', array( $this, 'register_additional_features' ), -9999, 0 );
			}
		}

		if ( did_action( 'init' ) ) {
			// Needed for unit tests, where 'init' will have been fired already at this point.
			$this->start_listening_for_option_changes();
		} else {
			add_filter( 'init', array( $this, 'start_listening_for_option_changes' ), 10, 0 );
		}

		add_filter( 'poocommerce_get_sections_advanced', array( $this, 'add_features_section' ), 10, 1 );
		add_filter( 'poocommerce_get_settings_advanced', array( $this, 'add_feature_settings' ), 10, 2 );
		add_filter( 'deactivated_plugin', array( $this, 'handle_plugin_deactivation' ), 10, 1 );
		add_filter( 'all_plugins', array( $this, 'filter_plugins_list' ), 10, 1 );
		add_action( 'admin_notices', array( $this, 'display_notices_in_plugins_page' ), 10, 0 );
		add_action( 'load-plugins.php', array( $this, 'maybe_invalidate_cached_plugin_data' ) );
		add_action( 'after_plugin_row', array( $this, 'handle_plugin_list_rows' ), 10, 2 );
		add_action( 'current_screen', array( $this, 'enqueue_script_to_fix_plugin_list_html' ), 10, 1 );
		add_filter( 'views_plugins', array( $this, 'handle_plugins_page_views_list' ), 10, 1 );
		add_filter( 'poocommerce_admin_shared_settings', array( $this, 'set_change_feature_enable_nonce' ), 20, 1 );
		add_action( 'admin_init', array( $this, 'change_feature_enable_from_query_params' ), 20, 0 );
		add_action( self::FEATURE_ENABLED_CHANGED_ACTION, array( $this, 'display_email_improvements_feedback_notice' ), 10, 2 );
		add_filter( 'poocommerce_admin_features', array( $this, 'sync_iapi_mini_cart_feature' ) );
	}

	/**
	 * Synchronize the 'experimental-iapi-mini-cart' feature flag with the admin Features system.
	 *
	 * @param array $features The original list of features.
	 * @return array The modified list of features.
	 */
	public function sync_iapi_mini_cart_feature( $features ) {
		$option_name = 'poocommerce_feature_experimental-iapi-mini-cart_enabled';
		$is_enabled  = 'yes' === get_option( $option_name, 'no' );

		if ( $is_enabled ) {
			if ( ! in_array( 'experimental-iapi-mini-cart', $features, true ) ) {
				$features[] = 'experimental-iapi-mini-cart';
			}
		} else {
			$features = array_filter(
				$features,
				function ( $feature ) {
					return 'experimental-iapi-mini-cart' !== $feature;
				}
			);
		}
		return $features;
	}

	/**
	 * Register a feature.
	 *
	 * This used to be called during the `poocommerce_register_feature_definitions` action hook,
	 * now it's called directly from get_feature_definitions as needed.
	 *
	 * @param string $slug The ID slug of the feature.
	 * @param string $name The name of the feature that will appear on the Features screen and elsewhere.
	 * @param array  $args {
	 *     Optional. Properties that make up the feature definition. Each of these properties can also be set as a
	 *     callback function, as long as that function returns the specified type.
	 *
	 *     @type array[] $additional_settings An array of definitions for additional settings controls related to
	 *                                        the feature that will display on the Features screen. See the Settings API
	 *                                        for the schema of these props.
	 *     @type string  $description         A brief description of the feature, used as an input label if the feature
	 *                                        setting is a checkbox.
	 *     @type bool    $disabled            True to disable the setting field for this feature on the Features screen,
	 *                                        so it can't be changed.
	 *     @type bool    $disable_ui          Set to true to hide the setting field for this feature on the
	 *                                        Features screen. Defaults to false.
	 *     @type bool    $enabled_by_default  Set to true to have this feature by opt-out instead of opt-in.
	 *                                        Defaults to false.
	 *     @type bool    $is_experimental     Set to true to display this feature under the "Experimental" heading on
	 *                                        the Features screen. Features set to experimental are also omitted from
	 *                                        the features list in some cases. Defaults to true.
	 *     @type bool    $is_legacy           Set to true if this feature existed before the FeaturesController class
	 *                                        was introduced. Features set to legacy also do not produce warnings about
	 *                                        incompatible plugins. Defaults to false.
	 *     @type string  $option_key          The key name for the option that enables/disables the feature.
	 *     @type int     $order               The order that the feature will appear in the list on the Features screen.
	 *                                        Higher number = higher in the list. Defaults to 10.
	 *     @type array   $setting             The properties used by the Settings API to render the setting control on
	 *                                        the Features screen. See the Settings API for the schema of these props.
	 * }
	 *
	 * @return void
	 */
	public function add_feature_definition( $slug, $name, array $args = array() ) {
		$defaults = array(
			'disable_ui'                          => false,
			'enabled_by_default'                  => false,
			'is_experimental'                     => true,
			'is_legacy'                           => false,
			'plugins_are_incompatible_by_default' => false,
			'name'                                => $name,
			'order'                               => 10,
		);
		$args     = wp_parse_args( $args, $defaults );

		$this->features[ $slug ] = $args;
	}

	/**
	 * Generate and cache the feature definitions.
	 *
	 * @return array[]
	 */
	private function get_feature_definitions() {
		if ( empty( $this->features ) ) {
			$this->init_feature_definitions();
		}

		if ( ! $this->registered_additional_features_via_class_calls ) {
			// This needs to be set to true *before* additional feature definition calls are made,
			// to prevent infinite loops in case one of these calls ends up calling here again.
			$this->registered_additional_features_via_class_calls = true;

			// Additional feature definitions.
			// These used to be tied to the now deprecated poocommerce_register_feature_definitions action,
			// and aren't processed in init_feature_definitions to avoid circular calls in the dependency injection container.
			$container = wc_get_container();
			$container->get( CustomOrdersTableController::class )->add_feature_definition( $this );
			$container->get( CostOfGoodsSoldController::class )->add_feature_definition( $this );

			$this->init_compatibility_info_by_feature();
		}

		return $this->features;
	}

	/**
	 * Initialize the hardcoded feature definitions array.
	 * This doesn't include:
	 * - Features that get initialized via the (deprecated) poocommerce_register_feature_definitions.
	 * - Features whose definition comes from another class. These are initialized directly in get_feature_definitions
	 *   to avoid circular calls in the dependency injection container.
	 */
	private function init_feature_definitions(): void {
		$alpha_feature_testing_is_enabled = Constants::is_true( 'WOOCOMMERCE_ENABLE_ALPHA_FEATURE_TESTING' );
		$tracking_enabled                 = WC_Site_Tracking::is_tracking_enabled();

		$legacy_features = array(
			'analytics'                   => array(
				'name'               => __( 'Analytics', 'poocommerce' ),
				'description'        => __( 'Enable PooCommerce Analytics', 'poocommerce' ),
				'option_key'         => Analytics::TOGGLE_OPTION_NAME,
				'is_experimental'    => false,
				'enabled_by_default' => true,
				'disable_ui'         => false,
				'is_legacy'          => true,
			),
			'product_block_editor'        => array(
				'name'            => __( 'New product editor', 'poocommerce' ),
				'description'     => __( 'Try the new product editor (Beta)', 'poocommerce' ),
				'is_experimental' => true,
				'disable_ui'      => false,
				'is_legacy'       => true,
				'disabled'        => function () {
					return version_compare( get_bloginfo( 'version' ), '6.2', '<' );
				},
				'desc_tip'        => function () {
					$string = '';
					if ( version_compare( get_bloginfo( 'version' ), '6.2', '<' ) ) {
						$string = __(
							'⚠ This feature is compatible with WordPress version 6.2 or higher.',
							'poocommerce'
						);
					}

					return $string;
				},
			),
			'cart_checkout_blocks'        => array(
				'name'            => __( 'Cart & Checkout Blocks', 'poocommerce' ),
				'description'     => __( 'Optimize for faster checkout', 'poocommerce' ),
				'is_experimental' => false,
				'disable_ui'      => true,
			),
			'rate_limit_checkout'         => array(
				'name'               => __( 'Rate limit Checkout', 'poocommerce' ),
				'description'        => sprintf(
					// translators: %s is the URL to the rate limiting documentation.
					__( 'Enables rate limiting for Checkout place order and Store API /checkout endpoint. To further control this, refer to <a href="%s" target="_blank">rate limiting documentation</a>.', 'poocommerce' ),
					'https://developer.poocommerce.com/docs/apis/store-api/rate-limiting/'
				),
				'is_experimental'    => false,
				'disable_ui'         => false,
				'enabled_by_default' => false,
				'is_legacy'          => true,
			),
			'marketplace'                 => array(
				'name'               => __( 'Marketplace', 'poocommerce' ),
				'description'        => __(
					'New, faster way to find extensions and themes for your PooCommerce store',
					'poocommerce'
				),
				'is_experimental'    => false,
				'enabled_by_default' => true,
				'disable_ui'         => true,
				'is_legacy'          => true,
			),
			// Marked as a legacy feature to avoid compatibility checks, which aren't really relevant to this feature.
			// https://github.com/poocommerce/poocommerce/pull/39701#discussion_r1376976959.
			'order_attribution'           => array(
				'name'               => __( 'Order Attribution', 'poocommerce' ),
				'description'        => __(
					'Enable this feature to track and credit channels and campaigns that contribute to orders on your site',
					'poocommerce'
				),
				'enabled_by_default' => true,
				'disable_ui'         => false,
				'is_legacy'          => true,
				'is_experimental'    => false,
			),
			'site_visibility_badge'       => array(
				'name'               => __( 'Site visibility badge', 'poocommerce' ),
				'description'        => __(
					'Enable the site visibility badge in the WordPress admin bar',
					'poocommerce'
				),
				'enabled_by_default' => true,
				'disable_ui'         => false,
				'is_legacy'          => true,
				'is_experimental'    => false,
				'disabled'           => false,
			),
			'hpos_fts_indexes'            => array(
				'name'               => __( 'HPOS Full text search indexes', 'poocommerce' ),
				'description'        => __(
					'Create and use full text search indexes for orders. This feature only works with high-performance order storage.',
					'poocommerce'
				),
				'is_experimental'    => true,
				'enabled_by_default' => false,
				'is_legacy'          => true,
				'option_key'         => CustomOrdersTableController::HPOS_FTS_INDEX_OPTION,
			),
			'hpos_datastore_caching'      => array(
				'name'               => __( 'HPOS Data Caching', 'poocommerce' ),
				'description'        => __(
					'Enable order data caching in the datastore. This feature only works with high-performance order storage.',
					'poocommerce'
				),
				'is_experimental'    => true,
				'enabled_by_default' => false,
				'is_legacy'          => true,
				'disable_ui'         => false,
				'option_key'         => CustomOrdersTableController::HPOS_DATASTORE_CACHING_ENABLED_OPTION,
			),
			'remote_logging'              => array(
				'name'               => __( 'Remote Logging', 'poocommerce' ),
				'description'        => sprintf(
					/* translators: %1$s: opening link tag, %2$s: closing link tag */
					__( 'Allow PooCommerce to send error logs and non-sensitive diagnostic data to help improve PooCommerce. This feature requires %1$susage tracking%2$s to be enabled.', 'poocommerce' ),
					'<a href="' . admin_url( 'admin.php?page=wc-settings&tab=advanced&section=poocommerce_com' ) . '">',
					'</a>'
				),
				'enabled_by_default' => true,
				'disable_ui'         => false,

				/*
				 * This is not truly a legacy feature (it is not a feature that pre-dates the FeaturesController),
				 * but we wish to handle compatibility checking in a similar fashion to legacy features. The
				 * rational for setting legacy to true is therefore similar to that of the 'order_attribution'
				 * feature.
				 *
				 * @see https://github.com/poocommerce/poocommerce/pull/39701#discussion_r1376976959
				 */
				'is_legacy'          => true,
				'is_experimental'    => false,
				'setting'            => array(
					'disabled' => function () use ( $tracking_enabled ) {
						return ! $tracking_enabled;
					},
					'desc_tip' => function () use ( $tracking_enabled ) {
						if ( ! $tracking_enabled ) {
							return __( '⚠ Usage tracking must be enabled to use remote logging.', 'poocommerce' );
						}
						return '';
					},
				),
			),
			'email_improvements'          => array(
				'name'            => __( 'Email improvements', 'poocommerce' ),
				'description'     => __(
					'Enable modern email design for transactional emails',
					'poocommerce'
				),

				/*
				 * This is not truly a legacy feature (it is not a feature that pre-dates the FeaturesController),
				 * but as this feature doesn't affect all extensions, and the rollout is fairly short,
				 * we'll skip the compatibility check by marking this as legacy. This is a workaround until
				 * we can implement a more sophisticated compatibility checking system.
				 *
				 * @see https://github.com/poocommerce/poocommerce/issues/39147
				 * @see https://github.com/poocommerce/poocommerce/issues/55540
				 */
				'is_legacy'       => true,
				'is_experimental' => false,
			),
			'blueprint'                   => array(
				'name'               => __( 'Blueprint (beta)', 'poocommerce' ),
				'description'        => __(
					'Enable blueprint to import and export settings in bulk',
					'poocommerce'
				),
				'enabled_by_default' => true,
				'disable_ui'         => false,

				/*
				* This is not truly a legacy feature (it is not a feature that pre-dates the FeaturesController),
				* but we wish to handle compatibility checking in a similar fashion to legacy features. The
				* rational for setting legacy to true is therefore similar to that of the 'order_attribution'
				* feature.
				*
				* @see https://github.com/poocommerce/poocommerce/pull/39701#discussion_r1376976959
				*/
				'is_legacy'          => true,
				'is_experimental'    => false,
			),
			'block_email_editor'          => array(
				'name'               => __( 'Block Email Editor (alpha)', 'poocommerce' ),
				'description'        => __(
					'Enable the block-based email editor for transactional emails. <a href="https://github.com/poocommerce/poocommerce/discussions/52897#discussioncomment-11630256" target="_blank">Learn more</a>',
					'poocommerce'
				),

				/*
				* This is not truly a legacy feature (it is not a feature that pre-dates the FeaturesController),
				* but we wish to handle compatibility checking in a similar fashion to legacy features. The
				* rational for setting legacy to true is therefore similar to that of the 'order_attribution'
				* feature.
				*
				* @see https://github.com/poocommerce/poocommerce/pull/39701#discussion_r1376976959
				*/
				'is_legacy'          => true,
				'enabled_by_default' => false,
			),
			'point_of_sale'               => array(
				'name'               => __( 'Point of Sale', 'poocommerce' ),
				'description'        => __(
					'Enable Point of Sale functionality in the PooCommerce mobile apps.',
					'poocommerce'
				),
				'enabled_by_default' => true,
				'disable_ui'         => false,

				/*
				* This is not truly a legacy feature (it is not a feature that pre-dates the FeaturesController),
				* but we wish to handle compatibility checking in a similar fashion to legacy features. The
				* rational for setting legacy to true is therefore similar to that of the 'order_attribution'
				* feature.
				*
				* @see https://github.com/poocommerce/poocommerce/pull/39701#discussion_r1376976959
				*/
				'is_legacy'          => true,
				'is_experimental'    => true,
			),
			'fulfillments'                => array(
				'name'               => __( 'Order Fulfillments', 'poocommerce' ),
				'description'        => __(
					'Enable the Order Fulfillments feature to manage order fulfillment and shipping.',
					'poocommerce'
				),
				'enabled_by_default' => false,
				'disable_ui'         => true,
				'is_experimental'    => false,
			),
			'experimental-iapi-mini-cart' => array(
				'name'            => __( 'Interactivity API powered Mini Cart', 'poocommerce' ),
				'description'     => __( 'Enable the new version of the Mini Cart that uses the Interactivity API instead of React in the frontend.', 'poocommerce' ),
				'is_experimental' => true,
			),
		);

		if ( ! $tracking_enabled ) {
			// Uncheck the remote logging feature when usage tracking is disabled.
			$legacy_features['remote_logging']['setting']['value'] = 'no';
		}

		foreach ( $legacy_features as $slug => $definition ) {
			$this->add_feature_definition( $slug, $definition['name'], $definition );
		}

		$this->init_compatibility_info_by_feature();
	}

	/**
	 * Initialize the compatibility_info_by_feature property after all the features have been added.
	 */
	private function init_compatibility_info_by_feature() {
		foreach ( array_keys( $this->features ) as $feature_id ) {
			if ( ! isset( $this->compatibility_info_by_feature[ $feature_id ] ) ) {
				$this->compatibility_info_by_feature[ $feature_id ] = array(
					'compatible'   => array(),
					'incompatible' => array(),
				);
			}
		}
	}

	/**
	 * Function to trigger the (now deprecated) 'poocommerce_register_feature_definitions' hook.
	 *
	 * This function must execute immediately before the 'before_poocommerce_init'
	 * action is fired, so that feature compatibility declarations happening
	 * in that action find all the features properly declared already.
	 *
	 * @internal
	 */
	public function register_additional_features() {
		if ( $this->registered_additional_features_via_action ) {
			return;
		}

		if ( empty( $this->features ) ) {
			$this->init_feature_definitions();
		}

		/**
		 * The action for registering features.
		 *
		 * @since 8.3.0
		 *
		 * @param FeaturesController $features_controller The instance of FeaturesController.
		 *
		 * @deprecated 9.9.0 Features should be defined directly in get_feature_definitions.
		 */
		do_action( 'poocommerce_register_feature_definitions', $this );

		$this->init_compatibility_info_by_feature();

		$this->registered_additional_features_via_action = true;
	}

	/**
	 * Initialize the class instance.
	 *
	 * @internal
	 *
	 * @param LegacyProxy $proxy The instance of LegacyProxy to use.
	 * @param PluginUtil  $plugin_util The instance of PluginUtil to use.
	 */
	final public function init( LegacyProxy $proxy, PluginUtil $plugin_util ) {
		$this->proxy       = $proxy;
		$this->plugin_util = $plugin_util;

		$this->plugins_excluded_from_compatibility_ui = $plugin_util->get_plugins_excluded_from_compatibility_ui();
	}

	/**
	 * Get all the existing PooCommerce features.
	 *
	 * Returns an associative array where keys are unique feature ids
	 * and values are arrays with these keys:
	 *
	 * - name (string)
	 * - description (string)
	 * - is_experimental (bool)
	 * - is_enabled (bool) (only if $include_enabled_info is passed as true)
	 *
	 * @param bool $include_experimental Include also experimental/work in progress features in the list.
	 * @param bool $include_enabled_info True to include the 'is_enabled' field in the returned features info.
	 * @returns array An array of information about existing features.
	 */
	public function get_features( bool $include_experimental = false, bool $include_enabled_info = false ): array {
		$features = $this->get_feature_definitions();

		if ( ! $include_experimental ) {
			$features = array_filter(
				$features,
				function ( $feature ) {
					return ! $feature['is_experimental'];
				}
			);
		}

		if ( $include_enabled_info ) {
			foreach ( array_keys( $features ) as $feature_id ) {
				$is_enabled                            = $this->feature_is_enabled( $feature_id );
				$features[ $feature_id ]['is_enabled'] = $is_enabled;
			}
		}

		// We're deprecating the product block editor feature in favor of a v3 coming out.
		// We want to hide this setting in the UI for users that don't have it enabled.
		// If users have it enabled, we won't hide it until they explicitly disable it.
		if ( isset( $features['product_block_editor'] )
			&& ! $this->feature_is_enabled( 'product_block_editor' ) ) {
			$features['product_block_editor']['disable_ui'] = true;
		}

		return $features;
	}

	/**
	 * Check if plugins that don't declare compatibility nor incompatibility with a given feature
	 * are to be considered incompatible with that feature.
	 *
	 * @param string $feature_id Feature id to check.
	 * @return bool True if plugins that don't declare compatibility nor incompatibility with the feature will be considered incompatible with the feature.
	 * @throws \InvalidArgumentException The feature doesn't exist.
	 */
	public function get_plugins_are_incompatible_by_default( string $feature_id ): bool {
		$feature_definition = $this->get_feature_definitions()[ $feature_id ] ?? null;
		if ( is_null( $feature_definition ) ) {
			throw new \InvalidArgumentException( esc_html( "The PooCommerce feature '$feature_id' doesn't exist" ) );
		}

		$incompatible_by_default = $feature_definition['plugins_are_incompatible_by_default'] ?? false;

		/**
		 * Filter to determine if plugins that don't declare compatibility nor incompatibility with a given feature
		 * are to be considered incompatible with that feature.
		 *
		 * @param bool $incompatible_by_default Default value, true if plugins are to be considered incompatible by default with the feature.
		 * @param string $feature_id The feature to check.
		 *
		 * @since 9.2.0
		 */
		return (bool) apply_filters( 'poocommerce_plugins_are_incompatible_with_feature_by_default', $incompatible_by_default, $feature_id );
	}

	/**
	 * Check if a given feature is currently enabled.
	 *
	 * @param  string $feature_id Unique feature id.
	 * @return bool True if the feature is enabled, false if not or if the feature doesn't exist.
	 */
	public function feature_is_enabled( string $feature_id ): bool {
		if ( ! $this->feature_exists( $feature_id ) ) {
			return false;
		}

		if ( $this->is_preview_email_improvements_enabled( $feature_id ) ) {
			return true;
		}

		$default_value = $this->feature_is_enabled_by_default( $feature_id ) ? 'yes' : 'no';
		$value         = 'yes' === get_option( $this->feature_enable_option_name( $feature_id ), $default_value );
		return $value;
	}

	/**
	 * Check if a given feature is enabled by default.
	 *
	 * @param string $feature_id Unique feature id.
	 * @return boolean TRUE if the feature is enabled by default, FALSE otherwise.
	 */
	private function feature_is_enabled_by_default( string $feature_id ): bool {
		$features = $this->get_feature_definitions();

		return ! empty( $features[ $feature_id ]['enabled_by_default'] );
	}

	/**
	 * Change the enabled/disabled status of a feature.
	 *
	 * @param string $feature_id Unique feature id.
	 * @param bool   $enable True to enable the feature, false to disable it.
	 * @return bool True on success, false if feature doesn't exist or the new value is the same as the old value.
	 */
	public function change_feature_enable( string $feature_id, bool $enable ): bool {
		if ( ! $this->feature_exists( $feature_id ) ) {
			return false;
		}

		return update_option( $this->feature_enable_option_name( $feature_id ), $enable ? 'yes' : 'no' );
	}

	/**
	 * Declare (in)compatibility with a given feature for a given plugin.
	 *
	 * This method MUST be executed from inside a handler for the 'before_poocommerce_init' hook.
	 *
	 * The plugin name is expected to be in the form 'directory/file.php' and be one of the keys
	 * of the array returned by 'get_plugins', but this won't be checked. Plugins are expected to use
	 * FeaturesUtil::declare_compatibility instead, passing the full plugin file path instead of the plugin name.
	 *
	 * @param string $feature_id Unique feature id.
	 * @param string $plugin_file Plugin file path, either full or in the form 'directory/file.php'.
	 * @param bool   $positive_compatibility True if the plugin declares being compatible with the feature, false if it declares being incompatible.
	 * @return bool True on success, false on error (feature doesn't exist or not inside the required hook).
	 * @throws \Exception A plugin attempted to declare itself as compatible and incompatible with a given feature at the same time.
	 */
	public function declare_compatibility( string $feature_id, string $plugin_file, bool $positive_compatibility = true ): bool {
		if ( ! $this->proxy->call_function( 'doing_action', 'before_poocommerce_init' ) ) {
			$class_and_method = ( new \ReflectionClass( $this ) )->getShortName() . '::' . __FUNCTION__;
			/* translators: 1: class::method 2: before_poocommerce_init */
			$this->proxy->call_function( 'wc_doing_it_wrong', $class_and_method, sprintf( __( '%1$s should be called inside the %2$s action.', 'poocommerce' ), $class_and_method, 'before_poocommerce_init' ), '7.0' );
			return false;
		}
		if ( ! $this->feature_exists( $feature_id ) ) {
			return false;
		}

		if ( $this->lazy ) {
			// Lazy mode: Queue to be normalized later.
			$this->pending_declarations[] = array( $feature_id, $plugin_file, $positive_compatibility );
			return true;
		}

		// Late call: Normalize and register immediately.
		return $this->register_compatibility_internal( $feature_id, $plugin_file, $positive_compatibility );
	}

	/**
	 * Registers compatibility information internally for a given feature and plugin file.
	 *
	 * This method normalizes the plugin file path to a plugin ID, handles validation and logging for invalid plugins,
	 * and registers the compatibility data if valid.
	 * It updates the internal compatibility arrays, checks for conflicts (e.g., a plugin declaring both
	 * compatible and incompatible with the same feature), and throws an exception if a conflict is detected.
	 * Duplicate declarations (same compatibility type) are ignored.
	 *
	 * This is an internal helper method and should not be called directly.
	 *
	 * @internal For usage by PooCommerce core only. Backwards compatibility not guaranteed.
	 * @since 10.1.0
	 *
	 * @param string $feature_id Unique feature ID.
	 * @param string $plugin_file Raw plugin file path (full or 'directory/file.php').
	 * @param bool   $positive_compatibility True if declaring compatibility, false if declaring incompatibility.
	 * @return bool True on successful registration, false if the feature does not exist.
	 * @throws \Exception If the plugin attempts to declare both compatibility and incompatibility for the same feature.
	 */
	private function register_compatibility_internal( string $feature_id, string $plugin_file, bool $positive_compatibility ): bool {
		if ( ! $this->feature_exists( $feature_id ) ) {
			return false;
		}

		// Normalize and validate plugin file.
		$plugin_id = $this->plugin_util->get_wp_plugin_id( $plugin_file );
		if ( ! $plugin_id ) {
			$logger = $this->proxy->call_function( 'wc_get_logger' );
			$logger->error( "FeaturesController: Invalid plugin file '{$plugin_file}' for feature '{$feature_id}'." );
			return false;
		}

		// Register compatibility by plugin.
		ArrayUtil::ensure_key_is_array( $this->compatibility_info_by_plugin, $plugin_id );

		$key          = $positive_compatibility ? 'compatible' : 'incompatible';
		$opposite_key = $positive_compatibility ? 'incompatible' : 'compatible';
		ArrayUtil::ensure_key_is_array( $this->compatibility_info_by_plugin[ $plugin_id ], $key );
		ArrayUtil::ensure_key_is_array( $this->compatibility_info_by_plugin[ $plugin_id ], $opposite_key );

		if ( in_array( $feature_id, $this->compatibility_info_by_plugin[ $plugin_id ][ $opposite_key ], true ) ) {
			throw new \Exception( esc_html( "Plugin $plugin_id is trying to declare itself as $key with the '$feature_id' feature, but it already declared itself as $opposite_key" ) );
		}

		if ( ! in_array( $feature_id, $this->compatibility_info_by_plugin[ $plugin_id ][ $key ], true ) ) {
			$this->compatibility_info_by_plugin[ $plugin_id ][ $key ][] = $feature_id;
		}

		// Register compatibility by feature.

		$key = $positive_compatibility ? 'compatible' : 'incompatible';

		if ( ! in_array( $plugin_id, $this->compatibility_info_by_feature[ $feature_id ][ $key ], true ) ) {
			$this->compatibility_info_by_feature[ $feature_id ][ $key ][] = $plugin_id;
		}

		return true;
	}

	/**
	 * Processes any pending compatibility declarations by normalizing plugin file paths
	 * and registering them internally.
	 *
	 * This method is called lazily when compatibility information is queried (via
	 * get_compatible_features_for_plugin() or get_compatible_plugins_for_feature()).
	 * It resolves plugin IDs using PluginUtil and logs errors for unrecognized plugins.
	 * Pending declarations are cleared after processing to avoid redundant work.
	 *
	 * @internal For usage by PooCommerce core only. Backwards compatibility not guaranteed.
	 * @since 10.1.0
	 * @return void
	 */
	private function process_pending_declarations(): void {
		if ( empty( $this->pending_declarations ) ) {
			return;
		}

		foreach ( $this->pending_declarations as $declaration ) {
			[ $feature_id, $plugin_file, $positive_compatibility ] = $declaration;

			// Register internally.
			$this->register_compatibility_internal( $feature_id, $plugin_file, $positive_compatibility );
		}

		$this->pending_declarations = array();
		$this->lazy                 = false;
	}

	/**
	 * Check whether a feature exists with a given id.
	 *
	 * @param string $feature_id The feature id to check.
	 * @return bool True if the feature exists.
	 */
	private function feature_exists( string $feature_id ): bool {
		$features = $this->get_feature_definitions();

		return isset( $features[ $feature_id ] );
	}

	/**
	 * Get the ids of the features that a certain plugin has declared compatibility for.
	 *
	 * This method can't be called before the 'poocommerce_init' hook is fired.
	 *
	 * @param string $plugin_name Plugin name, in the form 'directory/file.php'.
	 * @param bool   $enabled_features_only True to return only names of enabled plugins.
	 * @return array An array having a 'compatible' and an 'incompatible' key, each holding an array of feature ids.
	 */
	public function get_compatible_features_for_plugin( string $plugin_name, bool $enabled_features_only = false ): array {
		$this->process_pending_declarations();
		$this->verify_did_poocommerce_init( __FUNCTION__ );

		$features = $this->get_feature_definitions();
		if ( $enabled_features_only ) {
			$features = array_filter(
				$features,
				array( $this, 'feature_is_enabled' ),
				ARRAY_FILTER_USE_KEY
			);
		}

		if ( ! isset( $this->compatibility_info_by_plugin[ $plugin_name ] ) ) {
			return array(
				'compatible'   => array(),
				'incompatible' => array(),
				'uncertain'    => array_keys( $features ),
			);
		}

		$info                 = $this->compatibility_info_by_plugin[ $plugin_name ];
		$info['compatible']   = array_values( array_intersect( array_keys( $features ), $info['compatible'] ) );
		$info['incompatible'] = array_values( array_intersect( array_keys( $features ), $info['incompatible'] ) );
		$info['uncertain']    = array_values( array_diff( array_keys( $features ), $info['compatible'], $info['incompatible'] ) );

		return $info;
	}

	/**
	 * Get the names of the plugins that have been declared compatible or incompatible with a given feature.
	 *
	 * @param string $feature_id Feature id.
	 * @param bool   $active_only True to return only active plugins.
	 * @return array An array having a 'compatible', an 'incompatible' and an 'uncertain' key, each holding an array of plugin names.
	 */
	public function get_compatible_plugins_for_feature( string $feature_id, bool $active_only = false ): array {
		$this->process_pending_declarations();
		$this->verify_did_poocommerce_init( __FUNCTION__ );

		$woo_aware_plugins = $this->plugin_util->get_poocommerce_aware_plugins( $active_only );
		if ( ! $this->feature_exists( $feature_id ) ) {
			return array(
				'compatible'   => array(),
				'incompatible' => array(),
				'uncertain'    => $woo_aware_plugins,
			);
		}

		$info              = $this->compatibility_info_by_feature[ $feature_id ];
		$info['uncertain'] = array_values( array_diff( $woo_aware_plugins, $info['compatible'], $info['incompatible'] ) );

		return $info;
	}

	/**
	 * Check if the 'poocommerce_init' has run or is running, do a 'wc_doing_it_wrong' if not.
	 *
	 * @param string|null $function_name Name of the invoking method, if not null, 'wc_doing_it_wrong' will be invoked if 'poocommerce_init' has not run and is not running.
	 *
	 * @return bool True if 'poocommerce_init' has run or is running, false otherwise.
	 */
	private function verify_did_poocommerce_init( ?string $function_name = null ): bool {
		if ( ! $this->proxy->call_function( 'did_action', 'poocommerce_init' ) &&
			! $this->proxy->call_function( 'doing_action', 'poocommerce_init' ) ) {
			if ( ! is_null( $function_name ) ) {
				$class_and_method = ( new \ReflectionClass( $this ) )->getShortName() . '::' . $function_name;
				/* translators: 1: class::method 2: plugins_loaded */
				$this->proxy->call_function( 'wc_doing_it_wrong', $class_and_method, sprintf( __( '%1$s should not be called before the %2$s action.', 'poocommerce' ), $class_and_method, 'poocommerce_init' ), '7.0' );
			}
			return false;
		}

		return true;
	}

	/**
	 * Get the name of the option that enables/disables a given feature.
	 *
	 * Note that it doesn't check if the feature actually exists. Instead it
	 * defaults to "poocommerce_feature_{$feature_id}_enabled" if a different
	 * name isn't specified in the feature registration.
	 *
	 * @param  string $feature_id The id of the feature.
	 * @return string The option that enables or disables the feature.
	 */
	public function feature_enable_option_name( string $feature_id ): string {
		$features = $this->get_feature_definitions();

		if ( ! empty( $features[ $feature_id ]['option_key'] ) ) {
			return $features[ $feature_id ]['option_key'];
		}

		return "poocommerce_feature_{$feature_id}_enabled";
	}

	/**
	 * Checks whether a feature id corresponds to a legacy feature
	 * (a feature that existed prior to the implementation of the features engine).
	 *
	 * @param string $feature_id The feature id to check.
	 * @return bool True if the id corresponds to a legacy feature.
	 */
	public function is_legacy_feature( string $feature_id ): bool {
		$features = $this->get_feature_definitions();

		return ! empty( $features[ $feature_id ]['is_legacy'] );
	}

	/**
	 * Sets a flag indicating that it's allowed to enable features for which incompatible plugins are active
	 * from the PooCommerce feature settings page.
	 */
	public function allow_enabling_features_with_incompatible_plugins(): void {
		$this->force_allow_enabling_features = true;
	}

	/**
	 * Sets a flag indicating that it's allowed to activate plugins for which incompatible features are enabled
	 * from the WordPress plugins page.
	 */
	public function allow_activating_plugins_with_incompatible_features(): void {
		$this->force_allow_enabling_plugins = true;
	}

	/**
	 * Adds our callbacks for the `updated_option` and `added_option` filter hooks.
	 *
	 * We delay adding these hooks until `init`, because both callbacks need to load our list of feature definitions,
	 * and building that list requires translating various strings (which should not be done earlier than `init`).
	 *
	 * @return void
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function start_listening_for_option_changes(): void {
		add_filter( 'updated_option', array( $this, 'process_updated_option' ), 999, 3 );
		add_filter( 'added_option', array( $this, 'process_added_option' ), 999, 3 );
	}

	/**
	 * Handler for the 'added_option' hook.
	 *
	 * It fires FEATURE_ENABLED_CHANGED_ACTION when a feature is enabled or disabled.
	 *
	 * @param string $option The option that has been created.
	 * @param mixed  $value The value of the option.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function process_added_option( string $option, $value ) {
		$this->process_updated_option( $option, false, $value );
	}

	/**
	 * Handler for the 'updated_option' hook.
	 *
	 * It fires FEATURE_ENABLED_CHANGED_ACTION when a feature is enabled or disabled.
	 *
	 * @param string $option    The option that has been modified.
	 * @param mixed  $old_value The old value of the option.
	 * @param mixed  $value     The new value of the option.
	 *
	 * @return void
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function process_updated_option( string $option, $old_value, $value ) {
		$matches                   = array();
		$is_default_key            = preg_match( '/^poocommerce_feature_([a-zA-Z0-9_]+)_enabled$/', $option, $matches );
		$features_with_custom_keys = array_filter(
			$this->get_feature_definitions(),
			function ( $feature ) {
				return ! empty( $feature['option_key'] );
			}
		);
		$custom_keys               = wp_list_pluck( $features_with_custom_keys, 'option_key' );

		if ( ! $is_default_key && ! in_array( $option, $custom_keys, true ) ) {
			return;
		}

		if ( $value === $old_value ) {
			return;
		}

		$feature_id = '';
		if ( $is_default_key ) {
			$feature_id = $matches[1];
		} elseif ( in_array( $option, $custom_keys, true ) ) {
			$feature_id = array_search( $option, $custom_keys, true );
		}

		if ( ! $feature_id ) {
			return;
		}

		WC_Tracks::record_event(
			self::FEATURE_ENABLED_CHANGED_ACTION,
			array(
				'feature_id' => $feature_id,
				'enabled'    => $value,
			)
		);

		/**
		 * Action triggered when a feature is enabled or disabled (the value of the corresponding setting option is changed).
		 *
		 * @param string $feature_id The id of the feature.
		 * @param bool $enabled True if the feature has been enabled, false if it has been disabled.
		 *
		 * @since 7.0.0
		 */
		do_action( self::FEATURE_ENABLED_CHANGED_ACTION, $feature_id, 'yes' === $value );
	}

	/**
	 * Handler for the 'poocommerce_get_sections_advanced' hook,
	 * it adds the "Features" section to the advanced settings page.
	 *
	 * @param array $sections The original sections array.
	 * @return array The updated sections array.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function add_features_section( $sections ) {
		if ( ! isset( $sections['features'] ) ) {
			$sections['features'] = __( 'Features', 'poocommerce' );
		}
		return $sections;
	}

	/**
	 * Handler for the 'poocommerce_get_settings_advanced' hook,
	 * it adds the settings UI for all the existing features.
	 *
	 * Note that the settings added via the 'poocommerce_settings_features' hook will be
	 * displayed in the non-experimental features section.
	 *
	 * @param array  $settings The existing settings for the corresponding settings section.
	 * @param string $current_section The section to get the settings for.
	 * @return array The updated settings array.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function add_feature_settings( $settings, $current_section ): array {
		if ( 'features' !== $current_section ) {
			return $settings;
		}

		$feature_settings = array(
			array(
				'title' => __( 'Features', 'poocommerce' ),
				'type'  => 'title',
				'desc'  => __( 'Start using new features that are being progressively rolled out to improve the store management experience.', 'poocommerce' ),
				'id'    => 'features_options',
			),
		);

		$features = $this->get_features( true );

		$feature_ids = array_keys( $features );
		usort(
			$feature_ids,
			function ( $feature_id_a, $feature_id_b ) use ( $features ) {
				return ( $features[ $feature_id_b ]['order'] ?? 0 ) <=> ( $features[ $feature_id_a ]['order'] ?? 0 );
			}
		);
		$experimental_feature_ids = array_filter(
			$feature_ids,
			function ( $feature_id ) use ( $features ) {
				return $features[ $feature_id ]['is_experimental'] ?? false;
			}
		);
		$mature_feature_ids       = array_diff( $feature_ids, $experimental_feature_ids );
		$feature_ids              = array_merge( $mature_feature_ids, array( 'mature_features_end' ), $experimental_feature_ids );

		foreach ( $feature_ids as $id ) {
			if ( 'mature_features_end' === $id ) {
				// phpcs:disable PooCommerce.Commenting.CommentHooks.MissingSinceComment
				/**
				 * Filter allowing to add additional settings to the PooCommerce Advanced - Features settings page.
				 *
				 * @param bool $disabled False.
				 */
				$feature_settings = apply_filters( 'poocommerce_settings_features', $feature_settings );
				// phpcs:enable PooCommerce.Commenting.CommentHooks.MissingSinceComment

				if ( ! empty( $experimental_feature_ids ) ) {
					$feature_settings[] = array(
						'type' => 'sectionend',
						'id'   => 'features_options',
					);

					$feature_settings[] = array(
						'title' => __( 'Experimental features', 'poocommerce' ),
						'type'  => 'title',
						'desc'  => __( 'These features are either experimental or incomplete, enable them at your own risk!', 'poocommerce' ),
						'id'    => 'experimental_features_options',
					);
				}
				continue;
			}

			if ( 'new_navigation' === $id && 'yes' !== get_option( $this->feature_enable_option_name( $id ), 'no' ) ) {
				continue;
			}

			if ( isset( $features[ $id ]['disable_ui'] ) && $features[ $id ]['disable_ui'] ) {
				continue;
			}

			$feature_settings[] = $this->get_setting_for_feature( $id, $features[ $id ] );

			$additional_settings = $features[ $id ]['additional_settings'] ?? array();
			if ( count( $additional_settings ) > 0 ) {
				$feature_settings = array_merge( $feature_settings, $additional_settings );
			}
		}

		$feature_settings[] = array(
			'type' => 'sectionend',
			'id'   => empty( $experimental_feature_ids ) ? 'features_options' : 'experimental_features_options',
		);

		if ( $this->verify_did_poocommerce_init() ) {
			// Allow feature setting properties to be determined dynamically just before being rendered.
			$feature_settings = array_map(
				function ( $feature_setting ) {
					foreach ( $feature_setting as $prop => $value ) {
						if ( is_callable( $value ) ) {
							$feature_setting[ $prop ] = call_user_func( $value );
						}
					}

					return $feature_setting;
				},
				$feature_settings
			);
		}

		return $feature_settings;
	}

	/**
	 * Get the parameters to display the setting enable/disable UI for a given feature.
	 *
	 * @param string $feature_id The feature id.
	 * @param array  $feature The feature parameters, as returned by get_features.
	 * @return array The parameters to add to the settings array.
	 */
	private function get_setting_for_feature( string $feature_id, array $feature ): array {
		$description        = $feature['description'] ?? '';
		$disabled           = false;
		$desc_tip           = '';
		$tooltip            = $feature['tooltip'] ?? '';
		$type               = $feature['type'] ?? 'checkbox';
		$setting_definition = $feature['setting'] ?? array();

		// phpcs:disable PooCommerce.Commenting.CommentHooks.MissingSinceComment
		/**
		 * Filter allowing PooCommerce Admin to be disabled.
		 *
		 * @param bool $disabled False.
		 */
		$admin_features_disabled = apply_filters( 'poocommerce_admin_disabled', false );
		// phpcs:enable PooCommerce.Commenting.CommentHooks.MissingSinceComment

		if ( ( 'analytics' === $feature_id || 'new_navigation' === $feature_id ) && $admin_features_disabled ) {
			$disabled = true;
			$desc_tip = __( 'PooCommerce Admin has been disabled', 'poocommerce' );
		} elseif ( 'new_navigation' === $feature_id ) {
			$update_text = sprintf(
				// translators: 1: line break tag.
				__(
					'%1$s This navigation will soon become unavailable while we make necessary improvements.
									If you turn it off now, you will not be able to turn it back on.',
					'poocommerce'
				),
				'<br/>'
			);

			$needs_update = version_compare( get_bloginfo( 'version' ), '5.6', '<' );
			if ( $needs_update && current_user_can( 'update_core' ) && current_user_can( 'update_php' ) ) {
				$update_text = sprintf(
					// translators: 1: line break tag, 2: open link to WordPress update link, 3: close link tag.
					__( '%1$s %2$sUpdate WordPress to enable the new navigation%3$s', 'poocommerce' ),
					'<br/>',
					'<a href="' . self_admin_url( 'update-core.php' ) . '" target="_blank">',
					'</a>'
				);
				$disabled = true;
			}

			if ( ! empty( $update_text ) ) {
				$description .= $update_text;
			}
		}

		if ( ! $this->is_legacy_feature( $feature_id ) && ! $disabled && $this->verify_did_poocommerce_init() ) {
			$plugin_info_for_feature = $this->get_compatible_plugins_for_feature( $feature_id, true );
			$desc_tip                = $this->plugin_util->generate_incompatible_plugin_feature_warning( $feature_id, $plugin_info_for_feature );
		}

		/**
		 * Filter to customize the description tip that appears under the description of each feature in the features settings page.
		 *
		 * @since 7.1.0
		 *
		 * @param string $desc_tip The original description tip.
		 * @param string $feature_id The id of the feature for which the description tip is being customized.
		 * @param bool $disabled True if the UI currently prevents changing the enable/disable status of the feature.
		 * @return string The new description tip to use.
		 */
		$desc_tip = apply_filters( 'poocommerce_feature_description_tip', $desc_tip, $feature_id, $disabled );

		$feature_setting_defaults = array(
			'title'    => $feature['name'],
			'desc'     => $description,
			'type'     => $type,
			'id'       => $this->feature_enable_option_name( $feature_id ),
			'disabled' => $disabled && ! $this->force_allow_enabling_features,
			'desc_tip' => $desc_tip,
			'tooltip'  => $tooltip,
			'default'  => $this->feature_is_enabled_by_default( $feature_id ) ? 'yes' : 'no',
		);

		$feature_setting = wp_parse_args( $setting_definition, $feature_setting_defaults );

		/**
		 * Allows to modify feature setting that will be used to render in the feature page.
		 *
		 * @param array $feature_setting The feature setting. Describes the feature:
		 *      - title: The title of the feature.
		 *      - desc: The description of the feature. Will be displayed under the title.
		 *      - type: The type of the feature. Could be any of supported settings types from `WC_Admin_Settings::output_fields`, but if it's anything other than checkbox or radio, it will need custom handling.
		 *      - id: The id of the feature. Will be used as the name of the setting.
		 *      - disabled: Whether the feature is disabled or not.
		 *      - desc_tip: The description tip of the feature. Will be displayed as a tooltip next to the description.
		 *      - tooltip: The tooltip of the feature. Will be displayed as a tooltip next to the name.
		 *      - default: The default value of the feature.
		 * @param string $feature_id The id of the feature.
		 * @since 8.0.0
		 */
		return apply_filters( 'poocommerce_feature_setting', $feature_setting, $feature_id );
	}

	/**
	 * Handle the plugin deactivation hook.
	 *
	 * @param string $plugin_name Name of the plugin that has been deactivated.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function handle_plugin_deactivation( $plugin_name ): void {
		unset( $this->compatibility_info_by_plugin[ $plugin_name ] );

		foreach ( array_keys( $this->compatibility_info_by_feature ) as $feature ) {
			$compatibles = $this->compatibility_info_by_feature[ $feature ]['compatible'];
			$this->compatibility_info_by_feature[ $feature ]['compatible'] = array_diff( $compatibles, array( $plugin_name ) );

			$incompatibles = $this->compatibility_info_by_feature[ $feature ]['incompatible'];
			$this->compatibility_info_by_feature[ $feature ]['incompatible'] = array_diff( $incompatibles, array( $plugin_name ) );
		}
	}

	/**
	 * Handler for the all_plugins filter.
	 *
	 * Returns the list of plugins incompatible with a given plugin
	 * if we are in the plugins page and the query string of the current request
	 * looks like '?plugin_status=incompatible_with_feature&feature_id=<feature id>'.
	 *
	 * @param array $plugin_list The original list of plugins.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function filter_plugins_list( $plugin_list ): array {
		if ( ! $this->verify_did_poocommerce_init() ) {
			return $plugin_list;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput
		if ( ! function_exists( 'get_current_screen' ) ||
			( get_current_screen() && 'plugins' !== get_current_screen()->id ) ||
			'incompatible_with_feature' !== ArrayUtil::get_value_or_default( $_GET, 'plugin_status' ) ) {
			return $plugin_list;
		}

		$feature_id = $_GET['feature_id'] ?? 'all';
		if ( 'all' !== $feature_id && ! $this->feature_exists( $feature_id ) ) {
			return $plugin_list;
		}

		return $this->get_incompatible_plugins( $feature_id, $plugin_list );
	}

	/**
	 * Returns the list of plugins incompatible with a given feature.
	 *
	 * @param string $feature_id ID of the feature. Can also be `all` to denote all features.
	 * @param array  $plugin_list       List of plugins to filter.
	 *
	 * @return array List of plugins incompatible with the given feature.
	 */
	public function get_incompatible_plugins( $feature_id, $plugin_list ) {
		$incompatibles         = array();
		$plugin_list           = array_diff_key( $plugin_list, array_flip( $this->plugins_excluded_from_compatibility_ui ) );
		$feature_ids           = 'all' === $feature_id ? array_keys( $this->get_feature_definitions() ) : array( $feature_id );
		$only_enabled_features = 'all' === $feature_id;

		// phpcs:enable WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
		foreach ( array_keys( $plugin_list ) as $plugin_name ) {
			if ( ! $this->plugin_util->is_poocommerce_aware_plugin( $plugin_name ) || ! $this->proxy->call_function( 'is_plugin_active', $plugin_name ) ) {
				continue;
			}

			$compatibility_info = $this->get_compatible_features_for_plugin( $plugin_name );
			foreach ( $feature_ids as $feature_id ) {
				$features_considered_incompatible = array_filter(
					$this->plugin_util->get_items_considered_incompatible( $feature_id, $compatibility_info ),
					$only_enabled_features ?
						fn( $feature_id ) => $this->feature_is_enabled( $feature_id ) && ! $this->is_legacy_feature( $feature_id ) :
						fn( $feature_id ) => ! $this->is_legacy_feature( $feature_id )
				);
				if ( in_array( $feature_id, $features_considered_incompatible, true ) ) {
					$incompatibles[] = $plugin_name;
				}
			}
		}

		return array_intersect_key( $plugin_list, array_flip( $incompatibles ) );
	}

	/**
	 * Handler for the admin_notices action.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function display_notices_in_plugins_page(): void {
		if ( ! $this->verify_did_poocommerce_init() ) {
			return;
		}

		$feature_filter_description_shown = $this->maybe_display_current_feature_filter_description();
		if ( ! $feature_filter_description_shown ) {
			$this->maybe_display_feature_incompatibility_warning();
		}
	}

	/**
	 * Shows a warning when there are any incompatibility between active plugins and enabled features.
	 * The warning is shown in on any admin screen except the plugins screen itself, since
	 * there's already a "You are viewing plugins that are incompatible" notice.
	 */
	private function maybe_display_feature_incompatibility_warning(): void {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		$incompatible_plugins = false;
		$relevant_plugins     = array_diff( $this->plugin_util->get_poocommerce_aware_plugins( true ), $this->plugins_excluded_from_compatibility_ui );

		foreach ( $relevant_plugins as $plugin ) {
			$compatibility_info = $this->get_compatible_features_for_plugin( $plugin, true );

			$incompatibles = array_filter( $compatibility_info['incompatible'], fn( $feature_id ) => ! $this->is_legacy_feature( $feature_id ) );
			if ( ! empty( $incompatibles ) ) {
				$incompatible_plugins = true;
				break;
			}

			$uncertains = array_filter( $compatibility_info['uncertain'], fn( $feature_id ) => ! $this->is_legacy_feature( $feature_id ) );
			foreach ( $uncertains as $feature_id ) {
				if ( $this->get_plugins_are_incompatible_by_default( $feature_id ) ) {
					$incompatible_plugins = true;
					break;
				}
			}

			if ( $incompatible_plugins ) {
				break;
			}
		}

		if ( ! $incompatible_plugins ) {
			return;
		}

		$message = str_replace(
			'<a>',
			'<a href="' . esc_url( add_query_arg( array( 'plugin_status' => 'incompatible_with_feature' ), admin_url( 'plugins.php' ) ) ) . '">',
			__( 'PooCommerce has detected that some of your active plugins are incompatible with currently enabled PooCommerce features. Please <a>review the details</a>.', 'poocommerce' )
		);

		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
		<div class="notice notice-error">
		<p><?php echo $message; ?></p>
		</div>
		<?php
		// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Shows a "You are viewing the plugins that are incompatible with the X feature"
	 * if we are in the plugins page and the query string of the current request
	 * looks like '?plugin_status=incompatible_with_feature&feature_id=<feature id>'.
	 */
	private function maybe_display_current_feature_filter_description(): bool {
		if ( 'plugins' !== get_current_screen()->id ) {
			return false;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput
		$plugin_status = $_GET['plugin_status'] ?? '';
		$feature_id    = $_GET['feature_id'] ?? '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput

		if ( 'incompatible_with_feature' !== $plugin_status ) {
			return false;
		}

		$feature_id = ( '' === $feature_id ) ? 'all' : $feature_id;

		if ( 'all' !== $feature_id && ! $this->feature_exists( $feature_id ) ) {
			return false;
		}

		$features          = $this->get_feature_definitions();
		$plugins_page_url  = admin_url( 'plugins.php' );
		$features_page_url = $this->get_features_page_url();

		$message =
			'all' === $feature_id
			? __( 'You are viewing active plugins that are incompatible with currently enabled PooCommerce features.', 'poocommerce' )
			: sprintf(
				/* translators: %s is a feature name. */
				__( "You are viewing the active plugins that are incompatible with the '%s' feature.", 'poocommerce' ),
				$features[ $feature_id ]['name']
			);

		$message .= '<br />';
		$message .= sprintf(
			__( "<a href='%1\$s'>View all plugins</a> - <a href='%2\$s'>Manage PooCommerce features</a>", 'poocommerce' ),
			$plugins_page_url,
			$features_page_url
		);

		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
		<div class="notice notice-info">
			<p><?php echo $message; ?></p>
		</div>
		<?php
		// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped

		return true;
	}

	/**
	 * If the 'incompatible with features' plugin list is being rendered, invalidate existing cached plugin data.
	 *
	 * This heads off a problem in which WordPress's `get_plugins()` function may be called much earlier in the request
	 * (by third party code, for example), the results of which are cached, and before PooCommerce can modify the list
	 * to inject useful information of its own.
	 *
	 * @see https://github.com/poocommerce/poocommerce/issues/37343
	 *
	 * @return void
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function maybe_invalidate_cached_plugin_data(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( ( $_GET['plugin_status'] ?? '' ) === 'incompatible_with_feature' ) {
			wp_cache_delete( 'plugins', 'plugins' );
		}
	}

	/**
	 * Handler for the 'after_plugin_row' action.
	 * Displays a "This plugin is incompatible with X features" notice if necessary.
	 *
	 * @param string $plugin_file The id of the plugin for which a row has been rendered in the plugins page.
	 * @param array  $plugin_data Plugin data, as returned by 'get_plugins'.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function handle_plugin_list_rows( $plugin_file, $plugin_data ) {
		global $wp_list_table;

		if ( in_array( $plugin_file, $this->plugins_excluded_from_compatibility_ui, true ) ) {
			return;
		}

		if ( 'incompatible_with_feature' !== ArrayUtil::get_value_or_default( $_GET, 'plugin_status' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}

		if ( is_null( $wp_list_table ) || ! $this->plugin_util->is_poocommerce_aware_plugin( $plugin_data ) ) {
			return;
		}

		if ( ! $this->proxy->call_function( 'is_plugin_active', $plugin_file ) ) {
			return;
		}

		$features                   = $this->get_feature_definitions();
		$feature_compatibility_info = $this->get_compatible_features_for_plugin( $plugin_file, true );
		$incompatible_features      = array_merge( $feature_compatibility_info['incompatible'], $feature_compatibility_info['uncertain'] );
		$incompatible_features      = array_values(
			array_filter(
				$incompatible_features,
				function ( $feature_id ) {
					return ! $this->is_legacy_feature( $feature_id );
				}
			)
		);

		$incompatible_features_count = count( $incompatible_features );
		if ( $incompatible_features_count > 0 ) {
			$columns_count      = $wp_list_table->get_column_count();
			$is_active          = true; // For now we are showing active plugins in the "Incompatible with..." view.
			$is_active_class    = $is_active ? 'active' : 'inactive';
			$is_active_td_style = $is_active ? " style='border-left: 4px solid #72aee6;'" : '';

			if ( 1 === $incompatible_features_count ) {
				$message = sprintf(
					/* translators: %s = printable plugin name */
					__( "⚠ This plugin is incompatible with the enabled PooCommerce feature '%s', it shouldn't be activated.", 'poocommerce' ),
					$features[ $incompatible_features[0] ]['name']
				);
			} elseif ( 2 === $incompatible_features_count ) {
				/* translators: %1\$s, %2\$s = printable plugin names */
				$message = sprintf(
					__( "⚠ This plugin is incompatible with the enabled PooCommerce features '%1\$s' and '%2\$s', it shouldn't be activated.", 'poocommerce' ),
					$features[ $incompatible_features[0] ]['name'],
					$features[ $incompatible_features[1] ]['name']
				);
			} else {
				/* translators: %1\$s, %2\$s = printable plugin names, %3\$d = plugins count */
				$message = sprintf(
					__( "⚠ This plugin is incompatible with the enabled PooCommerce features '%1\$s', '%2\$s' and %3\$d more, it shouldn't be activated.", 'poocommerce' ),
					$features[ $incompatible_features[0] ]['name'],
					$features[ $incompatible_features[1] ]['name'],
					$incompatible_features_count - 2
				);
			}
			$features_page_url       = $this->get_features_page_url();
			$manage_features_message = __( 'Manage PooCommerce features', 'poocommerce' );

			// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
			<tr class='plugin-update-tr update <?php echo $is_active_class; ?>' data-plugin='<?php echo $plugin_file; ?>' data-plugin-row-type='feature-incomp-warn'>
				<td colspan='<?php echo $columns_count; ?>' class='plugin-update'<?php echo $is_active_td_style; ?>>
					<div class='notice inline notice-warning notice-alt'>
						<p>
							<?php echo $message; ?>
							<a href="<?php echo $features_page_url; ?>"><?php echo $manage_features_message; ?></a>
						</p>
					</div>
				</td>
			</tr>
			<?php
			// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	/**
	 * Get the URL of the features settings page.
	 *
	 * @return string
	 */
	public function get_features_page_url(): string {
		return admin_url( 'admin.php?page=wc-settings&tab=advanced&section=features' );
	}

	/**
	 * Fix for the HTML of the plugins list when there are feature-plugin incompatibility warnings.
	 *
	 * WordPress renders the plugin information rows in the plugins page in <tr> elements as follows:
	 *
	 * - If the plugin needs update, the <tr> will have an "update" class. This will prevent the lower
	 *   border line to be drawn. Later an additional <tr> with an "update available" warning will be rendered,
	 *   it will have a "plugin-update-tr" class which will draw the missing lower border line.
	 * - Otherwise, the <tr> will be already drawn with the lower border line.
	 *
	 * This is a problem for our rendering of the "plugin is incompatible with X features" warning:
	 *
	 * - If the plugin info <tr> has "update", our <tr> will render nicely right after it; but then
	 *   our own "plugin-update-tr" class will draw an additional line before the "needs update" warning.
	 * - If not, the plugin info <tr> will render its lower border line right before our compatibility info <tr>.
	 *
	 * This small script fixes this by adding the "update" class to the plugin info <tr> if it doesn't have it
	 * (so no extra line before our <tr>), or removing 'plugin-update-tr' from our <tr> otherwise
	 * (and then some extra manual tweaking of margins is needed).
	 *
	 * @param string $current_screen The current screen object.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function enqueue_script_to_fix_plugin_list_html( $current_screen ): void {
		if ( 'plugins' !== $current_screen->id ) {
			return;
		}

		wc_enqueue_js(
			"
		const warningRows = document.querySelectorAll('tr[data-plugin-row-type=\"feature-incomp-warn\"]');
		for(const warningRow of warningRows) {
			const pluginName = warningRow.getAttribute('data-plugin');
			const pluginInfoRow = document.querySelector('tr.active[data-plugin=\"' + pluginName + '\"]:not(.plugin-update-tr), tr.inactive[data-plugin=\"' + pluginName + '\"]:not(.plugin-update-tr)');
			if(pluginInfoRow.classList.contains('update')) {
				warningRow.classList.remove('plugin-update-tr');
				warningRow.querySelector('.notice').style.margin = '5px 10px 15px 30px';
			}
			else {
				pluginInfoRow.classList.add('update');
			}
		}
		"
		);
	}

	/**
	 * Handler for the 'views_plugins' hook that shows the links to the different views in the plugins page.
	 * If we come from a "Manage incompatible plugins" in the features page we'll show just two views:
	 * "All" (so that it's easy to go back to a known state) and "Incompatible with X".
	 * We'll skip the rest of the views since the counts are wrong anyway, as we are modifying
	 * the plugins list via the 'all_plugins' filter.
	 *
	 * @param array $views An array of view ids => view links.
	 * @return string[] The actual views array to use.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function handle_plugins_page_views_list( $views ): array {
		// phpcs:disable WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
		if ( 'incompatible_with_feature' !== ArrayUtil::get_value_or_default( $_GET, 'plugin_status' ) ) {
			return $views;
		}

		$feature_id = $_GET['feature_id'] ?? 'all';
		if ( 'all' !== $feature_id && ! $this->feature_exists( $feature_id ) ) {
			return $views;
		}
		// phpcs:enable WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput

		$all_items = get_plugins();
		$features  = $this->get_feature_definitions();

		$incompatible_plugins_count = count( $this->filter_plugins_list( $all_items ) );
		$incompatible_text          =
			'all' === $feature_id
			? __( 'Incompatible with PooCommerce features', 'poocommerce' )
			/* translators: %s = name of a PooCommerce feature */
			: sprintf( __( "Incompatible with '%s'", 'poocommerce' ), $features[ $feature_id ]['name'] );
		$incompatible_link = "<a href='plugins.php?plugin_status=incompatible_with_feature&feature_id={$feature_id}' class='current' aria-current='page'>{$incompatible_text} <span class='count'>({$incompatible_plugins_count})</span></a>";

		$all_plugins_count = count( $all_items );
		$all_text          = __( 'All', 'poocommerce' );
		$all_link          = "<a href='plugins.php?plugin_status=all'>{$all_text} <span class='count'>({$all_plugins_count})</span></a>";

		return array(
			'all'                       => $all_link,
			'incompatible_with_feature' => $incompatible_link,
		);
	}

	/**
	 * Set the feature nonce to be sent from client side.
	 *
	 * @param array $settings Component settings.
	 *
	 * @return array
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function set_change_feature_enable_nonce( $settings ) {
		$settings['_feature_nonce'] = wp_create_nonce( 'change_feature_enable' );
		return $settings;
	}

	/**
	 * Changes the feature given it's id, a toggle value and nonce as a query param.
	 *
	 * `/wp-admin/post.php?product_block_editor=1&_feature_nonce=1234`, 1 for on
	 * `/wp-admin/post.php?product_block_editor=0&_feature_nonce=1234`, 0 for off
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function change_feature_enable_from_query_params(): void {
		if ( ! current_user_can( 'manage_poocommerce' ) ) {
			return;
		}

		$is_feature_nonce_invalid = ( ! isset( $_GET['_feature_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_feature_nonce'] ) ), 'change_feature_enable' ) );

		$query_params_to_remove = array( '_feature_nonce' );

		foreach ( array_keys( $this->get_feature_definitions() ) as $feature_id ) {
			if ( isset( $_GET[ $feature_id ] ) && is_numeric( $_GET[ $feature_id ] ) ) {
				$value = absint( $_GET[ $feature_id ] );

				if ( $is_feature_nonce_invalid ) {
					wp_die( esc_html__( 'Action failed. Please refresh the page and retry.', 'poocommerce' ) );
					return;
				}

				if ( 1 === $value ) {
					$this->change_feature_enable( $feature_id, true );
				} elseif ( 0 === $value ) {
					$this->change_feature_enable( $feature_id, false );
				}
				$query_params_to_remove[] = $feature_id;
			}
		}
		if ( count( $query_params_to_remove ) > 1 && isset( $_SERVER['REQUEST_URI'] ) ) {
			// phpcs:disable WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			wp_safe_redirect( remove_query_arg( $query_params_to_remove, $_SERVER['REQUEST_URI'] ) );
		}
	}

	/**
	 * Display the email improvements feedback notice to render CES modal in.
	 *
	 * @param string $feature_id The feature id.
	 * @param bool   $is_enabled Whether the feature is enabled.
	 *
	 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
	 */
	public function display_email_improvements_feedback_notice( $feature_id, $is_enabled ): void {
		if ( 'email_improvements' === $feature_id && ! $is_enabled ) {
			set_transient( 'wc_settings_email_improvements_reverted', 'yes', 15 );
			add_action(
				'admin_notices',
				function () {
					echo '<div id="wc_settings_features_email_feedback_slotfill"></div>';
				}
			);
		}
	}

	/**
	 * Check if the email improvements feature is enabled in preview mode in Settings > Emails.
	 * This is used to force the email improvements feature without affecting shoppers.
	 *
	 * @param string $feature_id The feature id.
	 * @return bool Whether the email improvements feature is enabled in preview mode.
	 */
	private function is_preview_email_improvements_enabled( string $feature_id ): bool {
		if ( 'email_improvements' !== $feature_id ) {
			return false;
		}
		/**
		 * This filter is documented in templates/emails/email-styles.php
		 *
		 * @since 9.9.0
		 * @param bool $is_email_preview Whether the email is being previewed.
		 */
		$is_email_preview = apply_filters( 'poocommerce_is_email_preview', false );
		if ( $is_email_preview ) {
			return get_transient( EmailPreview::TRANSIENT_PREVIEW_EMAIL_IMPROVEMENTS ) === 'yes';
		}
		return false;
	}
}
