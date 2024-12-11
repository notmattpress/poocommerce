<?php

declare( strict_types = 1);

namespace Automattic\PooCommerce\Admin\Features\Blueprint\Importers;

use Automattic\PooCommerce\Admin\Features\Blueprint\Steps\SetWCPaymentGateways;
use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ImportSetWCPaymentGateways
 *
 * This class imports PooCommerce payment gateways settings and implements the StepProcessor interface.
 *
 * @package Automattic\PooCommerce\Admin\Features\Blueprint\Importers
 */
class ImportSetWCPaymentGateways implements StepProcessor {
	use UseWPFunctions;

	/**
	 * Process the import of PooCommerce payment gateways settings.
	 *
	 * @param object $schema The schema object containing import details.
	 * @return StepProcessorResult
	 */
	public function process( $schema ): StepProcessorResult {
		$result           = StepProcessorResult::success( SetWCPaymentGateways::get_step_name() );
		$payment_gateways = $this->get_wc_payment_gateways();
		$fields           = array( 'title', 'description', 'enabled' );

		foreach ( $schema->payment_gateways as $id => $payment_gateway_data ) {
			if ( ! isset( $payment_gateways[ $id ] ) ) {
				$result->add_info( "Skipping {$id}. The payment gateway is not available" );
				continue;
			}

			$payment_gateway = $payment_gateways[ $id ];

			// Refer to https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/includes/class-wc-ajax.php#L3564.
			foreach ( $fields as $field ) {
				if ( isset( $payment_gateway_data->{$field} ) ) {
					$payment_gateway->update_option( $field, $payment_gateway_data->{$field} );
				}
			}
			$result->add_info( "{$id} has been updated." );
			$this->wp_do_action( 'poocommerce_update_options' );
		}

		return $result;
	}

	/**
	 * Return the payment gateways resgietered in PooCommerce
	 *
	 * @return string
	 */
	public function get_wc_payment_gateways() {
		return WC()->payment_gateways->payment_gateways();
	}

	/**
	 * Get the class name for the step.
	 *
	 * @return string
	 */
	public function get_step_class(): string {
		return SetWCPaymentGateways::class;
	}
}
