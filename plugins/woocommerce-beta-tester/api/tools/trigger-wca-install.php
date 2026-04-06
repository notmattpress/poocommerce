<?php

defined( 'ABSPATH' ) || exit;

register_poocommerce_admin_test_helper_rest_route(
	'/tools/trigger-wca-install/v1',
	'tools_trigger_wca_install'
);

/**
 * A tool to trigger the PooCommerce install.
 */
function tools_trigger_wca_install() {
	\WC_Install::install();

	return true;
}
