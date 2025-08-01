<?php
namespace Automattic\PooCommerce\Blocks\Domain;

use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Blocks\Assets\Api as AssetApi;
use Automattic\PooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\PooCommerce\Blocks\AssetsController;
use Automattic\PooCommerce\Blocks\BlockPatterns;
use Automattic\PooCommerce\Blocks\BlockTemplatesRegistry;
use Automattic\PooCommerce\Blocks\BlockTemplatesController;
use Automattic\PooCommerce\Blocks\BlockTypesController;
use Automattic\PooCommerce\Blocks\Patterns\AIPatterns;
use Automattic\PooCommerce\Blocks\Patterns\PatternRegistry;
use Automattic\PooCommerce\Blocks\Patterns\PTKClient;
use Automattic\PooCommerce\Blocks\Patterns\PTKPatternsStore;
use Automattic\PooCommerce\Blocks\QueryFilters;
use Automattic\PooCommerce\Blocks\Domain\Services\Notices;
use Automattic\PooCommerce\Blocks\Domain\Services\DraftOrders;
use Automattic\PooCommerce\Blocks\Domain\Services\GoogleAnalytics;
use Automattic\PooCommerce\Blocks\Domain\Services\Hydration;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutFields;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutFieldsAdmin;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutFieldsFrontend;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutLink;
use Automattic\PooCommerce\Blocks\InboxNotifications;
use Automattic\PooCommerce\Blocks\Installer;
use Automattic\PooCommerce\Blocks\Payments\Api as PaymentsApi;
use Automattic\PooCommerce\Blocks\Payments\Integrations\BankTransfer;
use Automattic\PooCommerce\Blocks\Payments\Integrations\CashOnDelivery;
use Automattic\PooCommerce\Blocks\Payments\Integrations\Cheque;
use Automattic\PooCommerce\Blocks\Payments\Integrations\PayPal;
use Automattic\PooCommerce\Blocks\Payments\PaymentMethodRegistry;
use Automattic\PooCommerce\Blocks\Registry\Container;
use Automattic\PooCommerce\Blocks\Templates\ClassicTemplatesCompatibility;
use Automattic\PooCommerce\StoreApi\RoutesController;
use Automattic\PooCommerce\StoreApi\SchemaController;
use Automattic\PooCommerce\StoreApi\StoreApi;
use Automattic\PooCommerce\Blocks\Shipping\ShippingController;
use Automattic\PooCommerce\Blocks\TemplateOptions;


/**
 * Takes care of bootstrapping the plugin.
 *
 * @since 2.5.0
 */
class Bootstrap {

	/**
	 * Holds the Dependency Injection Container
	 *
	 * @var Container
	 */
	private $container;

	/**
	 * Holds the Package instance
	 *
	 * @var Package
	 */
	private $package;

	/**
	 * Constructor
	 *
	 * @param Container $container  The Dependency Injection Container.
	 */
	public function __construct( Container $container ) {
		$this->container = $container;
		$this->package   = $container->get( Package::class );

		$this->init();
		/**
		 * Fires when the poocommerce blocks are loaded and ready to use.
		 *
		 * This hook is intended to be used as a safe event hook for when the plugin
		 * has been loaded, and all dependency requirements have been met.
		 *
		 * To ensure blocks are initialized, you must use the `poocommerce_blocks_loaded`
		 * hook instead of the `plugins_loaded` hook. This is because the functions
		 * hooked into plugins_loaded on the same priority load in an inconsistent and unpredictable manner.
		 *
		 * @since 2.5.0
		 */
		do_action( 'poocommerce_blocks_loaded' );
	}

	/**
	 * Init the package - load the blocks library and define constants.
	 */
	protected function init() {
		$this->register_dependencies();
		$this->register_payment_methods();

		add_action(
			'admin_init',
			function () {
				// Delete this notification because the blocks are included in WC Core now. This will handle any sites
				// with lingering notices.
				InboxNotifications::delete_surface_cart_checkout_blocks_notification();
			},
			10,
			0
		);

		// We need to initialize BlockTemplatesController and BlockTemplatesRegistry at the end of `after_setup_theme`
		// so themes had the opportunity to declare support for template parts.
		add_action(
			'after_setup_theme',
			function () {
				$is_store_api_request = wc()->is_store_api_request();

				if ( ! $is_store_api_request && ( wp_is_block_theme() || current_theme_supports( 'block-template-parts' ) ) ) {
					$this->container->get( BlockTemplatesRegistry::class )->init();
					$this->container->get( BlockTemplatesController::class )->init();
				}
			},
			999
		);

		$is_rest              = wc()->is_rest_api_request();
		$is_store_api_request = wc()->is_store_api_request();

		// Initialize Store API in non-admin context.
		if ( ! is_admin() ) {
			$this->container->get( StoreApi::class )->init();
		}

		// Load and init assets.
		$this->container->get( PaymentsApi::class )->init();
		$this->container->get( DraftOrders::class )->init();
		$this->container->get( ShippingController::class )->init();
		$this->container->get( CheckoutFields::class )->init();
		$this->container->get( CheckoutLink::class )->init();

		// Load assets in admin and on the frontend.
		if ( ! $is_rest ) {
			$this->add_build_notice();
			$this->container->get( AssetDataRegistry::class );
			$this->container->get( AssetsController::class );
			$this->container->get( Installer::class )->init();
			$this->container->get( GoogleAnalytics::class )->init();
			$this->container->get( is_admin() ? CheckoutFieldsAdmin::class : CheckoutFieldsFrontend::class )->init();
		}

		// Load assets unless this is a request specifically for the store API.
		if ( ! $is_store_api_request ) {
			// Template related functionality. These won't be loaded for store API requests, but may be loaded for
			// regular rest requests to maintain compatibility with the store editor.
			$this->container->get( BlockPatterns::class );
			$this->container->get( BlockTypesController::class );
			$this->container->get( ClassicTemplatesCompatibility::class );
			$this->container->get( Notices::class )->init();

			if ( is_admin() || $is_rest ) {
				$this->container->get( AIPatterns::class );
				$this->container->get( PTKPatternsStore::class );
			}

			if ( is_admin() ) {
				$this->container->get( TemplateOptions::class )->init();
			}
		}

		$this->container->get( QueryFilters::class )->init();
	}

	/**
	 * See if files have been built or not.
	 *
	 * @return bool
	 */
	protected function is_built() {
		return file_exists(
			$this->package->get_path( 'assets/client/blocks/featured-product.js' )
		);
	}

	/**
	 * Add a notice stating that the build has not been done yet.
	 */
	protected function add_build_notice() {
		if ( $this->is_built() ) {
			return;
		}
		add_action(
			'admin_notices',
			function () {
				echo '<div class="error"><p>';
				printf(
					/* translators: %1$s is the node install command, %2$s is the install command, %3$s is the build command, %4$s is the watch command. */
					esc_html__( 'PooCommerce Blocks development mode requires files to be built. From the root directory, run %1$s to ensure your node version is aligned, run %2$s to install dependencies, %3$s to build the files or %4$s to build the files and watch for changes.', 'poocommerce' ),
					'<code>nvm use</code>',
					'<code>pnpm install</code>',
					'<code>pnpm --filter="@poocommerce/plugin-poocommerce" build</code>',
					'<code>pnpm --filter="@poocommerce/plugin-poocommerce" watch:build</code>'
				);
				echo '</p></div>';
			}
		);
	}

	/**
	 * Register core dependencies with the container.
	 */
	protected function register_dependencies() {
		$this->container->register(
			AssetApi::class,
			function ( Container $container ) {
				return new AssetApi( $container->get( Package::class ) );
			}
		);
		$this->container->register(
			AssetDataRegistry::class,
			function ( Container $container ) {
				return new AssetDataRegistry( $container->get( AssetApi::class ) );
			}
		);
		$this->container->register(
			AssetsController::class,
			function ( Container $container ) {
				return new AssetsController( $container->get( AssetApi::class ) );
			}
		);
		$this->container->register(
			PaymentMethodRegistry::class,
			function () {
				return new PaymentMethodRegistry();
			}
		);
		$this->container->register(
			Installer::class,
			function () {
				return new Installer();
			}
		);
		$this->container->register(
			BlockTypesController::class,
			function ( Container $container ) {
				$asset_api           = $container->get( AssetApi::class );
				$asset_data_registry = $container->get( AssetDataRegistry::class );
				return new BlockTypesController( $asset_api, $asset_data_registry );
			}
		);
		$this->container->register(
			ClassicTemplatesCompatibility::class,
			function ( Container $container ) {
				$asset_data_registry = $container->get( AssetDataRegistry::class );
				return new ClassicTemplatesCompatibility( $asset_data_registry );
			}
		);
		$this->container->register(
			DraftOrders::class,
			function ( Container $container ) {
				return new DraftOrders( $container->get( Package::class ) );
			}
		);
		$this->container->register(
			GoogleAnalytics::class,
			function ( Container $container ) {
				$asset_api = $container->get( AssetApi::class );
				return new GoogleAnalytics( $asset_api );
			}
		);
		$this->container->register(
			Notices::class,
			function ( Container $container ) {
				return new Notices( $container->get( Package::class ) );
			}
		);
		$this->container->register(
			Hydration::class,
			function ( Container $container ) {
				return new Hydration( $container->get( AssetDataRegistry::class ) );
			}
		);
		$this->container->register(
			CheckoutFields::class,
			function ( Container $container ) {
				return new CheckoutFields( $container->get( AssetDataRegistry::class ) );
			}
		);
		$this->container->register(
			CheckoutFieldsAdmin::class,
			function ( Container $container ) {
				$checkout_fields_controller = $container->get( CheckoutFields::class );
				return new CheckoutFieldsAdmin( $checkout_fields_controller );
			}
		);
		$this->container->register(
			CheckoutFieldsFrontend::class,
			function ( Container $container ) {
				$checkout_fields_controller = $container->get( CheckoutFields::class );
				return new CheckoutFieldsFrontend( $checkout_fields_controller );
			}
		);
		$this->container->register(
			PaymentsApi::class,
			function ( Container $container ) {
				$payment_method_registry = $container->get( PaymentMethodRegistry::class );
				$asset_data_registry     = $container->get( AssetDataRegistry::class );
				return new PaymentsApi( $payment_method_registry, $asset_data_registry );
			}
		);
		$this->container->register(
			CheckoutLink::class,
			function () {
				return new CheckoutLink();
			}
		);
		$this->container->register(
			StoreApi::class,
			function () {
				return new StoreApi();
			}
		);
		$this->container->register(
			TemplateOptions::class,
			function () {
				return new TemplateOptions();
			}
		);
		// Maintains backwards compatibility with previous Store API namespace.
		$this->container->register(
			'Automattic\PooCommerce\Blocks\StoreApi\Formatters',
			function ( Container $container ) {
				$this->deprecated_dependency( 'Automattic\PooCommerce\Blocks\StoreApi\Formatters', '6.4.0', 'Automattic\PooCommerce\StoreApi\Formatters', '6.5.0' );
				return $container->get( StoreApi::class )->container()->get( \Automattic\PooCommerce\StoreApi\Formatters::class );
			}
		);
		$this->container->register(
			'Automattic\PooCommerce\Blocks\Domain\Services\ExtendRestApi',
			function ( Container $container ) {
				$this->deprecated_dependency( 'Automattic\PooCommerce\Blocks\Domain\Services\ExtendRestApi', '6.4.0', 'Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema', '6.5.0' );
				return $container->get( StoreApi::class )->container()->get( \Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema::class );
			}
		);
		$this->container->register(
			'Automattic\PooCommerce\Blocks\StoreApi\SchemaController',
			function ( Container $container ) {
				$this->deprecated_dependency( 'Automattic\PooCommerce\Blocks\StoreApi\SchemaController', '6.4.0', 'Automattic\PooCommerce\StoreApi\SchemaController', '6.5.0' );
				return $container->get( StoreApi::class )->container()->get( SchemaController::class );
			}
		);
		$this->container->register(
			'Automattic\PooCommerce\Blocks\StoreApi\RoutesController',
			function ( Container $container ) {
				$this->deprecated_dependency( 'Automattic\PooCommerce\Blocks\StoreApi\RoutesController', '6.4.0', 'Automattic\PooCommerce\StoreApi\RoutesController', '6.5.0' );
				return $container->get( StoreApi::class )->container()->get( RoutesController::class );
			}
		);
		$this->container->register(
			PTKClient::class,
			function () {
				return new PTKClient();
			}
		);
		$this->container->register(
			PTKPatternsStore::class,
			function () {
				return new PTKPatternsStore( $this->container->get( PTKClient::class ) );
			}
		);
		$this->container->register(
			BlockPatterns::class,
			function () {
				return new BlockPatterns(
					$this->package,
					new PatternRegistry(),
					$this->container->get( PTKPatternsStore::class )
				);
			}
		);
		$this->container->register(
			AIPatterns::class,
			function () {
				return new AIPatterns();
			}
		);
		$this->container->register(
			ShippingController::class,
			function ( $container ) {
				$asset_api           = $container->get( AssetApi::class );
				$asset_data_registry = $container->get( AssetDataRegistry::class );
				return new ShippingController( $asset_api, $asset_data_registry );
			}
		);
		$this->container->register(
			QueryFilters::class,
			function () {
				return new QueryFilters();
			}
		);
		$this->container->register(
			BlockTemplatesRegistry::class,
			function () {
				return new BlockTemplatesRegistry();
			}
		);
		$this->container->register(
			BlockTemplatesController::class,
			function () {
				return new BlockTemplatesController();
			}
		);
	}

	/**
	 * Throws a deprecation notice for a dependency without breaking requests.
	 *
	 * @param string $function Class or function being deprecated.
	 * @param string $version Version in which it was deprecated.
	 * @param string $replacement Replacement class or function, if applicable.
	 * @param string $trigger_error_version Optional version to start surfacing this as a PHP error rather than a log. Defaults to $version.
	 */
	protected function deprecated_dependency( $function, $version, $replacement = '', $trigger_error_version = '' ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		$trigger_error_version = $trigger_error_version ? $trigger_error_version : $version;
		$error_message         = $replacement ? sprintf(
			'%1$s is <strong>deprecated</strong> since version %2$s! Use %3$s instead.',
			$function,
			$version,
			$replacement
		) : sprintf(
			'%1$s is <strong>deprecated</strong> since version %2$s with no alternative available.',
			$function,
			$version
		);
		/**
		 * Fires when a deprecated function is called.
		 *
		 * @since 7.3.0
		 */
		do_action( 'deprecated_function_run', $function, $replacement, $version );

		$log_error = false;

		// If headers have not been sent yet, log to avoid breaking the request.
		if ( ! headers_sent() ) {
			$log_error = true;
		}

		// If the $trigger_error_version was not yet reached, only log the error.
		if ( version_compare( Constants::get_constant( 'WC_VERSION' ), $trigger_error_version, '<' ) ) {
			$log_error = true;
		}

		/**
		 * Filters whether to trigger an error for deprecated functions. (Same as WP core)
		 *
		 * @since 7.3.0
		 *
		 * @param bool $trigger Whether to trigger the error for deprecated functions. Default true.
		 */
		if ( ! apply_filters( 'deprecated_function_trigger_error', true ) ) {
			$log_error = true;
		}

		if ( $log_error ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $error_message );
		} else {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
			trigger_error( $error_message, E_USER_DEPRECATED );
		}
	}

	/**
	 * Register payment method integrations with the container.
	 */
	protected function register_payment_methods() {
		$this->container->register(
			Cheque::class,
			function ( Container $container ) {
				$asset_api = $container->get( AssetApi::class );
				return new Cheque( $asset_api );
			}
		);
		$this->container->register(
			PayPal::class,
			function ( Container $container ) {
				$asset_api = $container->get( AssetApi::class );
				return new PayPal( $asset_api );
			}
		);
		$this->container->register(
			BankTransfer::class,
			function ( Container $container ) {
				$asset_api = $container->get( AssetApi::class );
				return new BankTransfer( $asset_api );
			}
		);
		$this->container->register(
			CashOnDelivery::class,
			function ( Container $container ) {
				$asset_api = $container->get( AssetApi::class );
				return new CashOnDelivery( $asset_api );
			}
		);
	}
}
