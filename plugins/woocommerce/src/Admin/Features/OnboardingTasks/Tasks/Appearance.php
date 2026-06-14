<?php

namespace Automattic\PooCommerce\Admin\Features\OnboardingTasks\Tasks;

use Automattic\PooCommerce\Admin\PageController;
use Automattic\PooCommerce\Internal\Admin\Loader;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Task;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Tasks\Products;
use Automattic\PooCommerce\Internal\Admin\WCAdminAssets;

/**
 * Appearance Task
 */
class Appearance extends Task {

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( ! $this->is_complete() ) {
			add_action( 'load-theme-install.php', array( $this, 'mark_actioned' ) );
		}
	}

	/**
	 * ID.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'appearance';
	}

	/**
	 * Title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Choose your theme', 'poocommerce' );
	}

	/**
	 * Content.
	 *
	 * @return string
	 */
	public function get_content() {
		return __(
			"Choose a theme that best fits your brand's look and feel, then make it your own. Change the colors, add your logo, and create pages.",
			'poocommerce'
		);
	}

	/**
	 * Time.
	 *
	 * @return string
	 */
	public function get_time() {
		return __( '2 minutes', 'poocommerce' );
	}

	/**
	 * Action label.
	 *
	 * @return string
	 */
	public function get_action_label() {
		return __( 'Choose theme', 'poocommerce' );
	}
}
