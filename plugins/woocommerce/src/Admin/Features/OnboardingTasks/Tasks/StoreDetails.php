<?php

namespace Automattic\PooCommerce\Admin\Features\OnboardingTasks\Tasks;

use Automattic\PooCommerce\Internal\Admin\Onboarding\OnboardingProfile;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Task;

/**
 * Store Details Task
 */
class StoreDetails extends Task {
	/**
	 * ID.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'store_details';
	}

	/**
	 * Title.
	 *
	 * @return string
	 */
	public function get_title() {
		if ( true === $this->get_parent_option( 'use_completed_title' ) ) {
			if ( $this->is_complete() ) {
				return __( 'You added store details', 'poocommerce' );
			}
			return __( 'Add store details', 'poocommerce' );
		}
		return __( 'Store details', 'poocommerce' );
	}

	/**
	 * Content.
	 *
	 * @return string
	 */
	public function get_content() {
		return __(
			'Your store address is required to set the origin country for shipping, currencies, and payment options.',
			'poocommerce'
		);
	}

	/**
	 * Time.
	 *
	 * @return string
	 */
	public function get_time() {
		return __( '4 minutes', 'poocommerce' );
	}

	/**
	 * Time.
	 *
	 * @return string
	 */
	public function get_action_url() {
		return ! $this->is_complete() ? admin_url( 'admin.php?page=wc-settings&tab=general&tutorial=true' ) : admin_url( 'admin.php?page=wc-settings&tab=general' );
	}

	/**
	 * Task completion.
	 *
	 * @return bool
	 */
	public function is_complete() {
		$country        = WC()->countries->get_base_country();
		$country_locale = WC()->countries->get_country_locale();
		$locale         = $country_locale[ $country ] ?? array();

		$hide_postcode = $locale['postcode']['hidden'] ?? false;
		// If postcode is hidden, just check that the store address and city are set.
		if ( $hide_postcode ) {
			return get_option( 'poocommerce_store_address', '' ) !== '' && get_option( 'poocommerce_store_city', '' ) !== '';
		}

		// Mark as completed if the store address, city and postcode are set. We don't need to check the country because it's set by default.
		return get_option( 'poocommerce_store_address', '' ) !== '' && get_option( 'poocommerce_store_city', '' ) !== '' &&
		get_option( 'poocommerce_store_postcode', '' ) !== '';
	}
}
