<?php
/**
 * Includes the composer Autoloader used for packages and classes in the src/ directory.
 */

namespace Automattic\PooCommerce;

defined( 'ABSPATH' ) || exit;

/**
 * Autoloader class.
 *
 * @since 3.7.0
 */
class Autoloader {

	/**
	 * Static-only class.
	 */
	private function __construct() {}

	/**
	 * Require the autoloader and return the result.
	 *
	 * If the autoloader is not present, let's log the failure and display a nice admin notice.
	 *
	 * @return boolean
	 */
	public static function init() {
		$autoloader = dirname( __DIR__ ) . '/vendor/autoload_packages.php';

		if ( ! is_readable( $autoloader ) ) {
			self::missing_autoloader();
			return false;
		}

		$autoloader_result = require $autoloader;
		if ( ! $autoloader_result ) {
			return false;
		}

		return $autoloader_result;
	}

	/**
	 * If the autoloader is missing, add an admin notice.
	 */
	protected static function missing_autoloader() {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// This message is not translated as at this point it's too early to load translations.
			error_log(  // phpcs:ignore
				esc_html( 'Your installation of PooCommerce is incomplete. If you installed PooCommerce from GitHub, please refer to this document to set up your development environment: https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment' )
			);
		}
		add_action(
			'admin_notices',
			function() {
				?>
				<div class="notice notice-error">
					<p>
						<?php
						printf(
							/* translators: 1: is a link to a support document. 2: closing link */
							esc_html__( 'Your installation of PooCommerce is incomplete. If you installed PooCommerce from GitHub, %1$splease refer to this document%2$s to set up your development environment.', 'poocommerce' ),
							'<a href="' . esc_url( 'https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment' ) . '" target="_blank" rel="noopener noreferrer">',
							'</a>'
						);
						?>
					</p>
				</div>
				<?php
			}
		);
	}
}
