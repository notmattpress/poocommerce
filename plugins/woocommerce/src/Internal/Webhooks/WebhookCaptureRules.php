<?php
/**
 * Rules for capturing specific hook arguments in webhooks.
 *
 * @package PooCommerce\Internal\Webhooks
 */

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\Webhooks;

/**
 * Checks hook arguments before they enter the webhook queue.
 *
 * @since 11.4.0
 * @internal
 */
final class WebhookCaptureRules {

	/**
	 * Hooks that pass request internals or interfere with core processing when observed by a webhook.
	 */
	private const BLOCKED_HOOKS = array(
		'poocommerce_deliver_webhook_async',
		'poocommerce_form_field',
		'poocommerce_form_field_hidden',
		'poocommerce_form_field_password',
		'poocommerce_logger_days_to_retain_logs',
		'poocommerce_login_credentials',
		'poocommerce_mail_callback_params',
		'poocommerce_mail_content',
		'poocommerce_mail_style_inline_callback',
		'poocommerce_paypal_capture_request',
		'poocommerce_paypal_refund_request',
		'poocommerce_webhook_deliver_async',
		'poocommerce_webhook_delivery',
		'poocommerce_webhook_delivery_priority',
		'poocommerce_webhook_delivery_url',
		'poocommerce_webhook_http_args',
		'poocommerce_webhook_loaded',
		'poocommerce_webhook_payload',
		'poocommerce_webhook_process_delivery',
		'poocommerce_webhook_redact_additional_fields',
		'poocommerce_webhook_secret',
		'poocommerce_webhook_should_deliver',
	);

	/**
	 * Guards that need more than the first hook argument.
	 */
	private const FILTER_GUARDS = array(
		'poocommerce_format_log_entry'   => array( 'allows_formatted_log', 2 ),
		'poocommerce_logger_log_message' => array( 'allows_log_message', 3 ),
	);

	/**
	 * Guards for the first hook argument.
	 */
	private const ARGUMENT_GUARDS = array(
		'poocommerce_mail_callback' => 'allows_mail_callback',
	);

	/**
	 * Check whether the hook can be used as a webhook topic.
	 *
	 * @since 11.4.0
	 * @param string $hook Hook name.
	 * @return bool Whether webhooks must skip the hook.
	 */
	public static function is_blocked_hook( string $hook ): bool {
		return in_array( $hook, self::BLOCKED_HOOKS, true );
	}

	/**
	 * Register a webhook callback with the arguments its guard needs.
	 *
	 * @since 11.4.0
	 *
	 * @param string   $hook             Hook to capture.
	 * @param callable $callback         Callback for the first argument.
	 * @param callable $context_callback Callback for hooks with extra arguments.
	 */
	public static function subscribe( string $hook, callable $callback, callable $context_callback ): void {
		if ( ! isset( self::FILTER_GUARDS[ $hook ] ) ) {
			add_action( $hook, $callback );
			return;
		}

		add_filter( $hook, $context_callback, 10, self::FILTER_GUARDS[ $hook ][1] );
	}

	/**
	 * Check the extra arguments before the webhook queues the first one.
	 *
	 * @since 11.4.0
	 *
	 * @param string  $hook Hook being captured.
	 * @param mixed[] $args Arguments after the first.
	 * @return bool
	 */
	public static function allows_context( string $hook, array $args ): bool {
		$guard = self::FILTER_GUARDS[ $hook ][0] ?? null;

		return null === $guard || self::$guard( ...$args );
	}

	/**
	 * Check the first argument before the webhook queues it.
	 *
	 * @since 11.4.0
	 *
	 * @param string $hook Hook being captured.
	 * @param mixed  $arg  First hook argument.
	 * @return bool
	 */
	public static function allows_argument( string $hook, $arg ): bool {
		if ( self::is_blocked_hook( $hook ) ) {
			return false;
		}

		$guard = self::ARGUMENT_GUARDS[ $hook ] ?? null;

		return null === $guard || self::$guard( $arg );
	}

	/**
	 * Read the context from the details of a formatted log entry.
	 *
	 * @param mixed $details Details of the log entry.
	 * @return bool
	 */
	private static function allows_formatted_log( $details = null ): bool {
		return self::allows_log_context( is_array( $details ) ? ( $details['context'] ?? null ) : null );
	}

	/**
	 * Read the context that the logger passes after the log level.
	 *
	 * @param mixed $level   Log level.
	 * @param mixed $context Log context.
	 * @return bool
	 */
	private static function allows_log_message( $level = null, $context = null ): bool {
		return self::allows_log_context( $context );
	}

	/**
	 * Keep logs about webhook deliveries from starting another delivery.
	 *
	 * @param mixed $context Log context.
	 * @return bool
	 */
	private static function allows_log_context( $context ): bool {
		return ! is_array( $context ) || 'webhooks-delivery' !== ( $context['source'] ?? null );
	}

	/**
	 * A webhook can capture a function name or a class and method name.
	 * A callback that contains an object is skipped, because the object would become part of the payload.
	 *
	 * @param mixed $callback Mail callback.
	 * @return bool
	 */
	private static function allows_mail_callback( $callback ): bool {
		if ( is_string( $callback ) ) {
			return true;
		}

		if ( ! is_array( $callback ) || 2 !== count( $callback ) ) {
			return false;
		}

		$class_name  = $callback[0] ?? null;
		$method_name = $callback[1] ?? null;

		return is_string( $class_name ) && is_string( $method_name );
	}
}
