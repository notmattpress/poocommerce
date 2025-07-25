<?php
declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Admin\Settings\PaymentsProviders;

use Automattic\PooCommerce\Internal\Logging\SafeGlobalFunctionProxy;
use WC_Payment_Gateway;

defined( 'ABSPATH' ) || exit;

/**
 * PayPal payment gateway provider class.
 *
 * This class handles all the custom logic for the PayPal payment gateway provider.
 */
class PayPal extends PaymentGateway {

	/**
	 * Try to determine if the payment gateway is in test mode.
	 *
	 * This is a best-effort attempt, as there is no standard way to determine this.
	 * Trust the true value, but don't consider a false value as definitive.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return bool True if the payment gateway is in test mode, false otherwise.
	 */
	public function is_in_test_mode( WC_Payment_Gateway $payment_gateway ): bool {
		return $this->is_paypal_in_sandbox_mode( $payment_gateway ) ?? parent::is_in_test_mode( $payment_gateway );
	}

	/**
	 * Try to determine if the payment gateway is in dev mode.
	 *
	 * This is a best-effort attempt, as there is no standard way to determine this.
	 * Trust the true value, but don't consider a false value as definitive.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return bool True if the payment gateway is in dev mode, false otherwise.
	 */
	public function is_in_dev_mode( WC_Payment_Gateway $payment_gateway ): bool {
		return $this->is_paypal_in_sandbox_mode( $payment_gateway ) ?? parent::is_in_dev_mode( $payment_gateway );
	}

	/**
	 * Check if the payment gateway has a payments processor account connected.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return bool True if the payment gateway account is connected, false otherwise.
	 *              If the payment gateway does not provide the information, it will return true.
	 */
	public function is_account_connected( WC_Payment_Gateway $payment_gateway ): bool {
		return $this->is_paypal_onboarded( $payment_gateway ) ?? parent::is_account_connected( $payment_gateway );
	}

	/**
	 * Check if the payment gateway has completed the onboarding process.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return bool True if the payment gateway has completed the onboarding process, false otherwise.
	 *              If the payment gateway does not provide the information,
	 *              it will infer it from having a connected account.
	 */
	public function is_onboarding_completed( WC_Payment_Gateway $payment_gateway ): bool {
		return $this->is_paypal_onboarded( $payment_gateway ) ?? parent::is_onboarding_completed( $payment_gateway );
	}

	/**
	 * Try to determine if the payment gateway is in test mode onboarding (aka sandbox or test-drive).
	 *
	 * This is a best-effort attempt, as there is no standard way to determine this.
	 * Trust the true value, but don't consider a false value as definitive.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return bool True if the payment gateway is in test mode onboarding, false otherwise.
	 */
	public function is_in_test_mode_onboarding( WC_Payment_Gateway $payment_gateway ): bool {
		return $this->is_paypal_in_sandbox_mode( $payment_gateway ) ?? parent::is_in_test_mode_onboarding( $payment_gateway );
	}

	/**
	 * Check if the PayPal payment gateway is in sandbox mode.
	 *
	 * For PayPal, there are two different environments: sandbox and production.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return ?bool True if the payment gateway is in sandbox mode, false otherwise.
	 *               Null if the environment could not be determined.
	 */
	private function is_paypal_in_sandbox_mode( WC_Payment_Gateway $payment_gateway ): ?bool {
		if ( class_exists( '\PooCommerce\PayPalCommerce\PPCP' ) &&
			is_callable( '\PooCommerce\PayPalCommerce\PPCP::container' ) ) {
			try {
				$container = \PooCommerce\PayPalCommerce\PPCP::container();

				if ( $container->has( 'settings.connection-state' ) ) {
					$state = $container->get( 'settings.connection-state' );

					return $state->is_sandbox();
				}

				// Backwards compatibility with pre 3.0.0 (deprecated).
				if ( $container->has( 'onboarding.environment' ) &&
					defined( '\PooCommerce\PayPalCommerce\Onboarding\Environment::SANDBOX' ) ) {
					$environment         = $container->get( 'onboarding.environment' );
					$current_environment = $environment->current_environment();

					return \PooCommerce\PayPalCommerce\Onboarding\Environment::SANDBOX === $current_environment;
				}
			} catch ( \Throwable $e ) {
				// Do nothing but log so we can investigate.
				SafeGlobalFunctionProxy::wc_get_logger()->debug(
					'Failed to determine if gateway is in sandbox mode: ' . $e->getMessage(),
					array(
						'gateway'   => $payment_gateway->id,
						'source'    => 'settings-payments',
						'exception' => $e,
					)
				);
			}
		}

		// Let the caller know that we couldn't determine the environment.
		return null;
	}

	/**
	 * Check if the PayPal payment gateway is onboarded.
	 *
	 * @param WC_Payment_Gateway $payment_gateway The payment gateway object.
	 *
	 * @return ?bool True if the payment gateway is onboarded, false otherwise.
	 *               Null if we failed to determine the onboarding status.
	 */
	private function is_paypal_onboarded( WC_Payment_Gateway $payment_gateway ): ?bool {
		if ( class_exists( '\PooCommerce\PayPalCommerce\PPCP' ) &&
			is_callable( '\PooCommerce\PayPalCommerce\PPCP::container' ) ) {
			try {
				$container = \PooCommerce\PayPalCommerce\PPCP::container();

				if ( $container->has( 'settings.connection-state' ) ) {
					$state = $container->get( 'settings.connection-state' );

					return $state->is_connected();
				}

				// Backwards compatibility with pre 3.0.0 (deprecated).
				if ( $container->has( 'onboarding.state' ) &&
					defined( '\PooCommerce\PayPalCommerce\Onboarding\State::STATE_ONBOARDED' ) ) {
					$state = $container->get( 'onboarding.state' );

					return $state->current_state() >= \PooCommerce\PayPalCommerce\Onboarding\State::STATE_ONBOARDED;
				}
			} catch ( \Throwable $e ) {
				// Do nothing but log so we can investigate.
				SafeGlobalFunctionProxy::wc_get_logger()->debug(
					'Failed to determine if gateway is onboarded: ' . $e->getMessage(),
					array(
						'gateway'   => $payment_gateway->id,
						'source'    => 'settings-payments',
						'exception' => $e,
					)
				);
			}
		}

		// Let the caller know that we couldn't determine the onboarding status.
		return null;
	}
}
