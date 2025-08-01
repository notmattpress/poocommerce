<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Blocks;

use Automattic\PooCommerce\Blocks\Assets\Api as AssetApi;
use Automattic\PooCommerce\Admin\Features\Features;

/**
 * AssetsController class.
 *
 * @since 5.0.0
 * @internal
 */
final class AssetsController {

	/**
	 * Asset API interface for various asset registration.
	 *
	 * @var AssetApi
	 */
	private $api;

	/**
	 * Constructor.
	 *
	 * @param AssetApi $asset_api  Asset API interface for various asset registration.
	 */
	public function __construct( AssetApi $asset_api ) {
		$this->api = $asset_api;
		$this->init();
	}

	/**
	 * Initialize class features.
	 */
	protected function init() { // phpcs:ignore PooCommerce.Functions.InternalInjectionMethod.MissingPublic
		add_action( 'init', array( $this, 'register_assets' ) );
		add_action( 'init', array( $this, 'register_script_modules' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'register_and_enqueue_site_editor_assets' ) );
		add_filter( 'wp_resource_hints', array( $this, 'add_resource_hints' ), 10, 2 );
		add_action( 'body_class', array( $this, 'add_theme_body_class' ), 1 );
		add_action( 'admin_body_class', array( $this, 'add_theme_body_class' ), 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'update_block_style_dependencies' ), 20 );
		add_action( 'wp_enqueue_scripts', array( $this, 'update_block_settings_dependencies' ), 100 );
		add_action( 'admin_enqueue_scripts', array( $this, 'update_block_settings_dependencies' ), 100 );
		add_filter( 'js_do_concat', array( $this, 'skip_boost_minification_for_cart_checkout' ), 10, 2 );

		if ( Features::is_enabled( 'experimental-iapi-runtime' ) ) {
			// Run after the WordPress iAPI runtime has been registered by setting a lower priority.
			add_filter( 'wp_default_scripts', array( $this, 'reregister_core_iapi_runtime' ), 20 );
		}
	}

	/**
	 * Re-registers the iAPI runtime registered by WordPress Core/Gutenberg, allowing PooCommerce to register its own version of the iAPI runtime.
	 */
	public function reregister_core_iapi_runtime() {
		$interactivity_api_asset_data = $this->api->get_asset_data(
			$this->api->get_block_asset_build_path( 'interactivity-api-assets', 'php' )
		);

		foreach ( $interactivity_api_asset_data as $handle => $data ) {
			$handle_without_js = str_replace( '.js', '', $handle );
			if ( '@wordpress/interactivity' === $handle_without_js || '@wordpress/interactivity-router' === $handle_without_js ) {
				wp_deregister_script_module( $handle_without_js );
			}

			wp_register_script_module( $handle_without_js, plugins_url( $this->api->get_block_asset_build_path( $handle_without_js ), dirname( __DIR__ ) ), $data['dependencies'], $data['version'] );
		}
	}

	/**
	 * Register script modules.
	 */
	public function register_script_modules() {
		// Right now we only have one script modules build for supported interactivity API powered block front-ends.
		// We generate a combined asset file for that via DependencyExtractionWebpackPlugin to make registration more
		// efficient.
		$asset_data = $this->api->get_asset_data(
			$this->api->get_block_asset_build_path( 'interactivity-blocks-frontend-assets', 'php' )
		);

		foreach ( $asset_data as $handle => $data ) {
			$handle_without_js = str_replace( '.js', '', $handle );
			wp_register_script_module( $handle_without_js, plugins_url( $this->api->get_block_asset_build_path( $handle_without_js ), dirname( __DIR__ ) ), $data['dependencies'], $data['version'] );
		}
	}

	/**
	 * Register block scripts & styles.
	 */
	public function register_assets() {
		$this->register_style( 'wc-blocks-packages-style', plugins_url( $this->api->get_block_asset_build_path( 'packages-style', 'css' ), dirname( __DIR__ ) ), array(), 'all', true );
		$this->register_style( 'wc-blocks-style', plugins_url( $this->api->get_block_asset_build_path( 'wc-blocks', 'css' ), dirname( __DIR__ ) ), array(), 'all', true );
		$this->register_style( 'wc-blocks-editor-style', plugins_url( $this->api->get_block_asset_build_path( 'wc-blocks-editor-style', 'css' ), dirname( __DIR__ ) ), array( 'wp-edit-blocks' ), 'all', true );

		$this->api->register_script( 'wc-types', $this->api->get_block_asset_build_path( 'wc-types' ), array(), false );
		$this->api->register_script( 'wc-blocks-middleware', 'assets/client/blocks/wc-blocks-middleware.js', array(), false );
		$this->api->register_script( 'wc-blocks-data-store', 'assets/client/blocks/wc-blocks-data.js', array( 'wc-blocks-middleware' ) );
		$this->api->register_script( 'wc-blocks-vendors', $this->api->get_block_asset_build_path( 'wc-blocks-vendors' ), array(), false );
		$this->api->register_script( 'wc-blocks-registry', 'assets/client/blocks/wc-blocks-registry.js', array(), false );
		$this->api->register_script( 'wc-blocks', $this->api->get_block_asset_build_path( 'wc-blocks' ), array( 'wc-blocks-vendors' ), false );
		$this->api->register_script( 'wc-blocks-shared-context', 'assets/client/blocks/wc-blocks-shared-context.js' );
		$this->api->register_script( 'wc-blocks-shared-hocs', 'assets/client/blocks/wc-blocks-shared-hocs.js', array(), false );

		// The price package is shared externally so has no blocks prefix.
		$this->api->register_script( 'wc-price-format', 'assets/client/blocks/price-format.js', array(), false );

		// Vendor scripts for blocks frontends (not including cart and checkout).
		$this->api->register_script( 'wc-blocks-frontend-vendors', $this->api->get_block_asset_build_path( 'wc-blocks-frontend-vendors-frontend' ), array(), true );

		// Cart and checkout frontend scripts.
		$this->api->register_script( 'wc-cart-checkout-vendors', $this->api->get_block_asset_build_path( 'wc-cart-checkout-vendors-frontend' ), array(), true );
		$this->api->register_script( 'wc-cart-checkout-base', $this->api->get_block_asset_build_path( 'wc-cart-checkout-base-frontend' ), array(), true );
		$this->api->register_script( 'wc-blocks-checkout', 'assets/client/blocks/blocks-checkout.js' );
		$this->api->register_script( 'wc-blocks-checkout-events', 'assets/client/blocks/blocks-checkout-events.js' );
		$this->api->register_script( 'wc-blocks-components', 'assets/client/blocks/blocks-components.js' );
		$this->api->register_script( 'wc-schema-parser', 'assets/client/blocks/wc-schema-parser.js', array(), false );

		// Customer Effort Score.
		$this->api->register_script(
			'wc-customer-effort-score',
			'assets/client/admin/customer-effort-score/index.js',
			array( 'wp-data', 'wp-data-controls', 'wc-store-data' )
		);
		$this->api->register_style(
			'wc-customer-effort-score',
			'assets/client/admin/customer-effort-score/style.css',
		);

		wp_add_inline_script(
			'wc-blocks-middleware',
			"
			var wcBlocksMiddlewareConfig = {
				storeApiNonce: '" . esc_js( wp_create_nonce( 'wc_store_api' ) ) . "',
				wcStoreApiNonceTimestamp: '" . esc_js( time() ) . "'
			};
			",
			'before'
		);
	}

	/**
	 * Register and enqueue assets for exclusive usage within the Site Editor.
	 */
	public function register_and_enqueue_site_editor_assets() {
		$this->api->register_script( 'wc-blocks-classic-template-revert-button', 'assets/client/blocks/wc-blocks-classic-template-revert-button.js' );
		$this->api->register_style( 'wc-blocks-classic-template-revert-button-style', 'assets/client/blocks/wc-blocks-classic-template-revert-button-style.css' );

		$current_screen = get_current_screen();
		if ( $current_screen instanceof \WP_Screen && 'site-editor' === $current_screen->base ) {
			wp_enqueue_script( 'wc-blocks-classic-template-revert-button' );
			wp_enqueue_style( 'wc-blocks-classic-template-revert-button-style' );
		}

		// Customer Effort Score.
		wp_enqueue_script( 'wc-customer-effort-score' );
		wp_enqueue_style( 'wc-customer-effort-score' );
	}

	/**
	 * Defines resource hints to help speed up the loading of some critical blocks.
	 *
	 * These will not impact page loading times negatively because they are loaded once the current page is idle.
	 *
	 * @param array  $urls          URLs to print for resource hints. Each URL is an array of resource attributes, or a URL string.
	 * @param string $relation_type The relation type the URLs are printed. Possible values: preconnect, dns-prefetch, prefetch, prerender.
	 * @return array URLs to print for resource hints.
	 */
	public function add_resource_hints( $urls, $relation_type ) {
		if ( ! in_array( $relation_type, array( 'prefetch', 'prerender' ), true ) || is_admin() ) {
			return $urls;
		}

		// We only need to prefetch when the cart has contents.
		$cart = wc()->cart;

		if ( ! $cart instanceof \WC_Cart || 0 === $cart->get_cart_contents_count() ) {
			return $urls;
		}

		if ( 'prefetch' === $relation_type ) {
			$urls = array_merge(
				$urls,
				$this->get_prefetch_resource_hints()
			);
		}

		if ( 'prerender' === $relation_type ) {
			$urls = array_merge(
				$urls,
				$this->get_prerender_resource_hints()
			);
		}

		return $urls;
	}

	/**
	 * Get resource hints during prefetch requests.
	 *
	 * @return array Array of URLs.
	 */
	private function get_prefetch_resource_hints() {
		$urls = array();

		// Core page IDs.
		$cart_page_id     = wc_get_page_id( 'cart' );
		$checkout_page_id = wc_get_page_id( 'checkout' );

		// Checks a specific page (by ID) to see if it contains the named block.
		$has_block_cart     = $cart_page_id && has_block( 'poocommerce/cart', $cart_page_id );
		$has_block_checkout = $checkout_page_id && has_block( 'poocommerce/checkout', $checkout_page_id );

		// Checks the current page to see if it contains the named block.
		$is_block_cart     = has_block( 'poocommerce/cart' );
		$is_block_checkout = has_block( 'poocommerce/checkout' );

		if ( $has_block_cart && ! $is_block_cart ) {
			$urls = array_merge( $urls, $this->get_block_asset_resource_hints( 'cart-frontend' ) );
		}

		if ( $has_block_checkout && ! $is_block_checkout ) {
			$urls = array_merge( $urls, $this->get_block_asset_resource_hints( 'checkout-frontend' ) );
		}

		return $urls;
	}

	/**
	 * Get resource hints during prerender requests.
	 *
	 * @return array Array of URLs.
	 */
	private function get_prerender_resource_hints() {
		$urls          = array();
		$is_block_cart = has_block( 'poocommerce/cart' );

		if ( ! $is_block_cart ) {
			return $urls;
		}

		$checkout_page_id  = wc_get_page_id( 'checkout' );
		$checkout_page_url = $checkout_page_id ? get_permalink( $checkout_page_id ) : '';

		if ( $checkout_page_url ) {
			$urls[] = $checkout_page_url;
		}

		return $urls;
	}

	/**
	 * Get the block asset resource hints in the cache or null if not found.
	 *
	 * @return array|null Array of resource hints.
	 */
	private function get_block_asset_resource_hints_cache() {
		if ( wp_is_development_mode( 'plugin' ) ) {
			return null;
		}

		$cache = get_site_transient( 'poocommerce_block_asset_resource_hints' );

		$current_version = array(
			'poocommerce' => WOOCOMMERCE_VERSION,
			'wordpress'   => get_bloginfo( 'version' ),
			'site_url'    => wp_guess_url(),
		);

		if ( isset( $cache['version'] ) && $cache['version'] === $current_version ) {
			return $cache['files'];
		}

		return null;
	}

	/**
	 * Set the block asset resource hints in the cache.
	 *
	 * @param string $filename File name.
	 * @param array  $data Array of resource hints.
	 */
	private function set_block_asset_resource_hints_cache( $filename, $data ) {
		$cache   = $this->get_block_asset_resource_hints_cache();
		$updated = array(
			'files'   => $cache ?? array(),
			'version' => array(
				'poocommerce' => WOOCOMMERCE_VERSION,
				'wordpress'   => get_bloginfo( 'version' ),
				'site_url'    => wp_guess_url(),
			),
		);

		$updated['files'][ $filename ] = $data;
		set_site_transient( 'poocommerce_block_asset_resource_hints', $updated, WEEK_IN_SECONDS );
	}

	/**
	 * Get resource hint for a block by name.
	 *
	 * @param string $filename Block filename.
	 * @return array
	 */
	private function get_block_asset_resource_hints( $filename = '' ) {
		if ( ! $filename ) {
			return array();
		}

		$cached = $this->get_block_asset_resource_hints_cache();

		if ( isset( $cached[ $filename ] ) ) {
			return $cached[ $filename ];
		}

		$script_data = $this->api->get_script_data(
			$this->api->get_block_asset_build_path( $filename )
		);
		$resources   = array_merge(
			array( esc_url( add_query_arg( 'ver', $script_data['version'], $script_data['src'] ) ) ),
			$this->get_script_dependency_src_array( $script_data['dependencies'] )
		);

		$data = array_map(
			function ( $src ) {
				return array(
					'href' => $src,
					'as'   => 'script',
				);
			},
			array_unique( array_filter( $resources ) )
		);

		$this->set_block_asset_resource_hints_cache( $filename, $data );

		return $data;
	}

	/**
	 * Get the src of all script dependencies (handles).
	 *
	 * @param array $dependencies Array of dependency handles.
	 * @return string[] Array of src strings.
	 */
	private function get_script_dependency_src_array( array $dependencies ) {
		$wp_scripts = wp_scripts();
		return array_reduce(
			$dependencies,
			function ( $src, $handle ) use ( $wp_scripts ) {
				if ( isset( $wp_scripts->registered[ $handle ] ) ) {
					$src[] = esc_url( add_query_arg( 'ver', $wp_scripts->registered[ $handle ]->ver, $this->get_absolute_url( $wp_scripts->registered[ $handle ]->src ) ) );
					$src   = array_merge( $src, $this->get_script_dependency_src_array( $wp_scripts->registered[ $handle ]->deps ) );
				}
				return $src;
			},
			array()
		);
	}

	/**
	 * Returns an absolute url to relative links for WordPress core scripts.
	 *
	 * @param string $src Original src that can be relative.
	 * @return string Correct full path string.
	 */
	private function get_absolute_url( $src ) {
		$wp_scripts = wp_scripts();
		if ( ! preg_match( '|^(https?:)?//|', $src ) && ! ( $wp_scripts->content_url && 0 === strpos( $src, $wp_scripts->content_url ) ) ) {
			$src = $wp_scripts->base_url . $src;
		}
		return $src;
	}

	/**
	 * Skip Jetpack Boost minification on older versions of Jetpack Boost where it causes issues.
	 *
	 * @param mixed $do_concat Whether to concatenate the script or not.
	 * @param mixed $handle The script handle.
	 * @return mixed
	 */
	public function skip_boost_minification_for_cart_checkout( $do_concat, $handle ) {
		$boost_is_outdated = defined( 'JETPACK_BOOST_VERSION' ) && version_compare( JETPACK_BOOST_VERSION, '3.4.2', '<' );
		$scripts_to_ignore = array(
			'wc-cart-checkout-vendors',
			'wc-cart-checkout-base',
		);

		return $boost_is_outdated && in_array( $handle, $scripts_to_ignore, true ) ? false : $do_concat;
	}

	/**
	 * Add body classes to the frontend and within admin.
	 *
	 * @param string|array $classes Array or string of CSS classnames.
	 * @return string|array Modified classnames.
	 */
	public function add_theme_body_class( $classes ) {
		$class = 'theme-' . get_template();

		if ( is_array( $classes ) ) {
			$classes[] = $class;
		} else {
			$classes .= ' ' . $class . ' ';
		}

		return $classes;
	}

	/**
	 * Get the file modified time as a cache buster if we're in dev mode.
	 *
	 * @param string $file Local path to the file.
	 * @return string The cache buster value to use for the given file.
	 */
	protected function get_file_version( $file ) {
		if ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG && file_exists( \Automattic\PooCommerce\Blocks\Package::get_path() . $file ) ) {
			return filemtime( \Automattic\PooCommerce\Blocks\Package::get_path() . $file );
		}
		return $this->api->wc_version;
	}

	/**
	 * Registers a style according to `wp_register_style`.
	 *
	 * @param string  $handle Name of the stylesheet. Should be unique.
	 * @param string  $src    Full URL of the stylesheet, or path of the stylesheet relative to the WordPress root directory.
	 * @param array   $deps   Optional. An array of registered stylesheet handles this stylesheet depends on. Default empty array.
	 * @param string  $media  Optional. The media for which this stylesheet has been defined. Default 'all'. Accepts media types like
	 *                        'all', 'print' and 'screen', or media queries like '(orientation: portrait)' and '(max-width: 640px)'.
	 * @param boolean $rtl   Optional. Whether or not to register RTL styles.
	 */
	protected function register_style( $handle, $src, $deps = array(), $media = 'all', $rtl = false ) {
		$filename = str_replace( plugins_url( '/', dirname( __DIR__ ) ), '', $src );
		$ver      = self::get_file_version( $filename );

		wp_register_style( $handle, $src, $deps, $ver, $media );

		if ( $rtl ) {
			wp_style_add_data( $handle, 'rtl', 'replace' );
		}
	}

	/**
	 * Update block style dependencies after they have been registered.
	 */
	public function update_block_style_dependencies() {
		$wp_styles = wp_styles();
		$style     = $wp_styles->query( 'wc-blocks-style', 'registered' );

		if ( ! $style ) {
			return;
		}

		// In WC < 5.5, `poocommerce-general` is not registered in block editor
		// screens, so we don't add it as a dependency if it's not registered.
		// In WC >= 5.5, `poocommerce-general` is registered on `admin_enqueue_scripts`,
		// so we need to check if it's registered here instead of on `init`.
		if (
			wp_style_is( 'poocommerce-general', 'registered' ) &&
			! in_array( 'poocommerce-general', $style->deps, true )
		) {
			$style->deps[] = 'poocommerce-general';
		}
	}

	/**
	 * Fix scripts with wc-settings dependency.
	 *
	 * The wc-settings script only works correctly when enqueued in the footer. This is to give blocks etc time to
	 * register their settings data before it's printed.
	 *
	 * This code will look at registered scripts, and if they have a wc-settings dependency, force them to print in the
	 * footer instead of the header.
	 *
	 * This only supports packages known to require wc-settings!
	 *
	 * @see https://github.com/poocommerce/poocommerce-gutenberg-products-block/issues/5052
	 */
	public function update_block_settings_dependencies() {
		$wp_scripts     = wp_scripts();
		$known_packages = array( 'wc-settings', 'wc-blocks-checkout', 'wc-price-format' );

		foreach ( $wp_scripts->registered as $handle => $script ) {
			// scripts that are loaded in the footer has extra->group = 1.
			if ( array_intersect( $known_packages, $script->deps ) && ! isset( $script->extra['group'] ) ) {
				// Append the script to footer.
				$wp_scripts->add_data( $handle, 'group', 1 );
				// Show a warning.
				$error_handle  = 'wc-settings-dep-in-header';
				$used_deps     = implode( ', ', array_intersect( $known_packages, $script->deps ) );
				$error_message = "Scripts that have a dependency on [$used_deps] must be loaded in the footer, {$handle} was registered to load in the header, but has been switched to load in the footer instead. See https://github.com/poocommerce/poocommerce-gutenberg-products-block/pull/5059";
				// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NotInFooter,WordPress.WP.EnqueuedResourceParameters.MissingVersion
				wp_register_script( $error_handle, '' );
				wp_enqueue_script( $error_handle );
				wp_add_inline_script(
					$error_handle,
					sprintf( 'console.warn( "%s" );', $error_message )
				);

			}
		}
	}
}
