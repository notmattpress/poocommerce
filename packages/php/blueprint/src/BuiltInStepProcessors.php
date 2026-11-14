<?php

namespace Automattic\PooCommerce\Blueprint;

use Automattic\PooCommerce\Blueprint\Importers\ImportActivatePlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportActivateTheme;
use Automattic\PooCommerce\Blueprint\Importers\ImportInstallPlugin;
use Automattic\PooCommerce\Blueprint\Importers\ImportInstallTheme;
use Automattic\PooCommerce\Blueprint\Importers\ImportRunSql;
use Automattic\PooCommerce\Blueprint\Importers\ImportSetSiteOptions;
use Automattic\PooCommerce\Blueprint\ResourceStorages\OrgPluginResourceStorage;
use Automattic\PooCommerce\Blueprint\ResourceStorages\OrgThemeResourceStorage;

/**
 * Class BuiltInStepProcessors
 *
 * @package Automattic\PooCommerce\Blueprint
 */
class BuiltInStepProcessors {
	/**
	 * BuiltInStepProcessors constructor.
	 */
	public function __construct() {
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
			new ImportActivatePlugin(),
			new ImportActivateTheme(),
			new ImportRunSql(),
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
		return new ImportInstallTheme( $storage );
	}
}
