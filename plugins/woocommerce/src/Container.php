<?php
/**
 * Container class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce;

use Automattic\PooCommerce\Internal\DependencyManagement\ContainerException;
use Automattic\PooCommerce\Internal\DependencyManagement\ExtendedContainer;
use Automattic\PooCommerce\Internal\DependencyManagement\RuntimeContainer;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\AdminSettingsServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\CostOfGoodsSoldServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\COTMigrationServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\DownloadPermissionsAdjusterServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\AssignDefaultCategoryServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\EmailPreviewServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\EnginesServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\FeaturesServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\LoggingServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\MarketingServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\MarketplaceServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OrdersControllersServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OrderAdminServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OrderMetaBoxServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ObjectCacheServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OrdersDataStoreServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OptionSanitizerServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\OrderAttributionServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ProductAttributesLookupServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ProductDownloadsServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ProductImageBySKUServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ProductReviewsServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ProxiesServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\RestockRefundedItemsAdjusterServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\AdminSuggestionsServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\UtilsClassesServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\BatchProcessingServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\LayoutTemplatesServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ComingSoonServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\StatsServiceProvider;
use Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders\ImportExportServiceProvider;

/**
 * PSR11 compliant dependency injection container for PooCommerce.
 *
 * Classes in the `src` directory should specify dependencies from that directory via an 'init' method having arguments
 * with type hints. If an instance of the container itself is needed, the type hint to use is \Psr\Container\ContainerInterface.
 *
 * Classes in the `src` directory should interact with anything outside (especially code in the `includes` directory
 * and WordPress functions) by using the classes in the `Proxies` directory. The exception is idempotent
 * functions (e.g. `wp_parse_url`), those can be used directly.
 *
 * Classes in the `includes` directory should use the `wc_get_container` function to get the instance of the container when
 * they need to get an instance of a class from the `src` directory.
 *
 * Class registration should be done via service providers that inherit from Automattic\PooCommerce\Internal\DependencyManagement
 * and those should go in the `src\Internal\DependencyManagement\ServiceProviders` folder unless there's a good reason
 * to put them elsewhere. All the service provider class names must be in the `SERVICE_PROVIDERS` constant.
 *
 * IMPORTANT NOTE: By default an instance of RuntimeContainer will be used as the underlying container,
 * but it's possible to use the old ExtendedContainer (backed by the PHP League's container package) instead,
 * see RuntimeContainer::should_use() for configuration instructions.
 * The League's container, the ExtendedContainer class and the related support code will be removed in PooCommerce 10.0.
 */
final class Container {
	/**
	 * The underlying container.
	 *
	 * @var RuntimeContainer
	 */
	private $container;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		if ( RuntimeContainer::should_use() ) {
			// When the League container was in use we allowed to retrieve the container itself
			// by using 'Psr\Container\ContainerInterface' as the class identifier,
			// we continue allowing that for compatibility.
			$this->container = new RuntimeContainer(
				array(
					__CLASS__                          => $this,
					'Psr\Container\ContainerInterface' => $this,
				)
			);
			return;
		}

		$this->container = new ExtendedContainer();

		// Add ourselves as the shared instance of ContainerInterface,
		// register everything else using service providers.

		$this->container->share( __CLASS__, $this );

		foreach ( $this->get_service_providers() as $service_provider_class ) {
			$this->container->addServiceProvider( $service_provider_class );
		}
	}

	/**
	 * Finds an entry of the container by its identifier and returns it.
	 * See the comment about ContainerException in RuntimeContainer::get.
	 *
	 * @param string $id Identifier of the entry to look for.
	 *
	 * @return mixed Resolved entry.
	 *
	 * @throws NotFoundExceptionInterface No entry was found for the supplied identifier (only when using ExtendedContainer).
	 * @throws Psr\Container\ContainerExceptionInterface Error while retrieving the entry.
	 * @throws ContainerException Error when resolving the class to an object instance, or (when using RuntimeContainer) class not found.
	 * @throws \Exception Exception thrown in the constructor or in the 'init' method of one of the resolved classes.
	 */
	public function get( string $id ) {
		return $this->container->get( $id );
	}

	/**
	 * Returns true if the container can return an entry for the given identifier.
	 * Returns false otherwise.
	 *
	 * `has($id)` returning true does not mean that `get($id)` will not throw an exception.
	 * It does however mean that `get($id)` will not throw a `NotFoundExceptionInterface`.
	 *
	 * @param string $id Identifier of the entry to look for.
	 *
	 * @return bool
	 */
	public function has( string $id ): bool {
		return $this->container->has( $id );
	}

	/**
	 * The list of service provider classes to register.
	 *
	 * @var string[]
	 */
	private function get_service_providers(): array {
		return array(
			AssignDefaultCategoryServiceProvider::class,
			DownloadPermissionsAdjusterServiceProvider::class,
			EmailPreviewServiceProvider::class,
			OptionSanitizerServiceProvider::class,
			OrdersDataStoreServiceProvider::class,
			ProductAttributesLookupServiceProvider::class,
			ProductDownloadsServiceProvider::class,
			ProductImageBySKUServiceProvider::class,
			ProductReviewsServiceProvider::class,
			ProxiesServiceProvider::class,
			RestockRefundedItemsAdjusterServiceProvider::class,
			UtilsClassesServiceProvider::class,
			COTMigrationServiceProvider::class,
			OrdersControllersServiceProvider::class,
			OrderAttributionServiceProvider::class,
			ObjectCacheServiceProvider::class,
			BatchProcessingServiceProvider::class,
			OrderMetaBoxServiceProvider::class,
			OrderAdminServiceProvider::class,
			FeaturesServiceProvider::class,
			MarketingServiceProvider::class,
			MarketplaceServiceProvider::class,
			LayoutTemplatesServiceProvider::class,
			LoggingServiceProvider::class,
			EnginesServiceProvider::class,
			ComingSoonServiceProvider::class,
			StatsServiceProvider::class,
			ImportExportServiceProvider::class,
			CostOfGoodsSoldServiceProvider::class,
			AdminSettingsServiceProvider::class,
			AdminSuggestionsServiceProvider::class,
		);
	}
}
