<?php

namespace Automattic\PooCommerce\Blueprint\ResourceStorages;

use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class OrgPluginResourceStorage
 *
 * This class handles the storage and downloading of plugins from wordpress.org.
 *
 * @package Automattic\PooCommerce\Blueprint\ResourceStorages
 */
class OrgPluginResourceStorage implements ResourceStorage {
	use UseWPFunctions;

	/**
	 * Download the plugin from wordpress.org
	 *
	 * @param string $slug The slug of the plugin to be downloaded.
	 *
	 * @return string|false The path to the downloaded plugin file, or false on failure.
	 */
	public function download( $slug ): ?string {
		$download_link = $this->get_download_link( $slug );

		if ( ! $download_link ) {
			return false;
		}
		$result = $this->download_url( $download_link );

		if ( is_wp_error( $result ) ) {
			return false;
		}
		return $result;
	}

	/**
	 * Download the file from the given URL.
	 *
	 * @param string $url The URL to download the file from.
	 *
	 * @return string|WP_Error The path to the downloaded file, or WP_Error on failure.
	 */
	protected function download_url( $url ) {
		return $this->wp_download_url( $url );
	}

	/**
	 * Get the download link for a plugin from wordpress.org.
	 *
	 * @param string $slug The slug of the plugin.
	 *
	 * @return string|null The download link, or null if not found.
	 */
	protected function get_download_link( $slug ): ?string {
		$info = $this->wp_plugins_api(
			'plugin_information',
			array(
				'slug'   => $slug,
				'fields' => array(
					'sections' => false,
				),
			)
		);

		if ( is_wp_error( $info ) ) {
			return null;
		}

		if ( is_object( $info ) && isset( $info->download_link ) ) {
			return $info->download_link;
		}

		return null;
	}

	/**
	 * Get the supported resource type.
	 *
	 * @return string The supported resource type.
	 */
	public function get_supported_resource(): string {
		return 'wordpress.org/plugins';
	}
}
