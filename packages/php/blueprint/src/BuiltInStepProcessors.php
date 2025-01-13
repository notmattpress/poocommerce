<?php

namespace Automattic\PooCommerce\Blueprint;

use Automattic\PooCommerce\Blueprint\Importers\ImportActivatePlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportActivateTheme;
use Automattic\PooCommerce\Blueprint\Importers\ImportDeactivatePlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportDeletePlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportInstallPlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportInstallTheme;
use Automattic\PooCommerce\Blueprint\Importers\ImportSetSiteOptions;
use Automattic\PooCommerce\Blueprint\ResourceStorages\LocalPluginResourceStorage;
use Automattic\PooCommerce\Blueprint\ResourceStorages\LocalThemeResourceStorage;
use Automattic\PooCommerce\Blueprint\ResourceStorages\OrgPluginResourceStorage;
use Automattic\PooCommerce\Blueprint\ResourceStorages\OrgThemeResourceStorage;
use Automattic\PooCommerce\Blueprint\Schemas\JsonSchema;
use Automattic\PooCommerce\Blueprint\Schemas\ZipSchema;

/**
 * Class BuiltInStepProcessors
 *
 * @package Automattic\PooCommerce\Blueprint
 */
class BuiltInStepProcessors {
	/**
	 * The schema used for validation and processing.
	 *
	 * @var JsonSchema The schema used for validation and processing.
	 */
	private JsonSchema $schema;

	/**
	 * BuiltInStepProcessors constructor.
	 *
	 * @param JsonSchema $schema The schema used for validation and processing.
	 */
	public function __construct( JsonSchema $schema ) {
		$this->schema = $schema;
	}

	/**
	 * Returns an array of all step processors.
	 *
	 * @return array The array of step processors.
	 */
	public function get_all() {
		return array(
			$this->create_install_plugins_processor(),
			$this->create_install_themes_processor(),
			new ImportSetSiteOptions(),
			new ImportDeletePlugin(),
			new ImportActivatePlugin(),
			new ImportActivateTheme(),
			new ImportDeactivatePlugin(),
		);
	}

	/**
	 * Creates the processor for installing plugins.
	 *
	 * @return ImportInstallPlugin The processor for installing plugins.
	 */
	private function create_install_plugins_processor() {
		$storages = new ResourceStorages();
		$storages->add_storage( new OrgPluginResourceStorage() );

		if ( $this->schema instanceof ZipSchema ) {
			$storages->add_storage( new LocalPluginResourceStorage( $this->schema->get_unzipped_path() ) );
		}

		return new ImportInstallPlugin( $storages );
	}

	/**
	 * Creates the processor for installing themes.
	 *
	 * @return ImportInstallTheme The processor for installing themes.
	 */
	private function create_install_themes_processor() {
		$storage = new ResourceStorages();
		$storage->add_storage( new OrgThemeResourceStorage() );
		if ( $this->schema instanceof ZipSchema ) {
			$storage->add_storage( new LocalThemeResourceStorage( $this->schema->get_unzipped_path() ) );
		}

		return new ImportInstallTheme( $storage );
	}
}
