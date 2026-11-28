<?php
/**
 * Suppresses webhook observers while PooCommerce processes their deliveries.
 *
 * @package PooCommerce\Internal\Webhooks
 */

declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\Webhooks;

/**
 * Keeps webhook bookkeeping from recursively scheduling webhook observers.
 *
 * @internal
 */
final class WebhookObservers {

	/**
	 * Hook names that can fire when PooCommerce reads, schedules or delivers a webhook.
	 */
	private const HOOKS = array(
		'poocommerce_format_log_entry'            => true,
		'poocommerce_logger_log_message'          => true,
		'poocommerce_valid_webhook_events'        => true,
		'poocommerce_valid_webhook_resources'     => true,
		'poocommerce_webhook_disabled_due_delivery_failures' => true,
		'poocommerce_webhook_enable_delivery_log' => true,
		'poocommerce_webhook_event'               => true,
		'poocommerce_webhook_hash_algorithm'      => true,
		'poocommerce_webhook_hooks'               => true,
		'poocommerce_webhook_name'                => true,
		'poocommerce_webhook_resource'            => true,
		'poocommerce_webhook_status'              => true,
		'poocommerce_webhook_statuses'            => true,
		'poocommerce_webhook_topic'               => true,
		'poocommerce_webhook_topic_hooks'         => true,
		'poocommerce_webhook_updated'             => true,
	);

	/**
	 * Whether observer callbacks are currently suppressed in this request.
	 *
	 * @var bool
	 */
	private static $suppressed = false;

	/**
	 * Whether a webhook callback on this hook should skip capture.
	 *
	 * @since 11.4.0
	 *
	 * @param string $hook Currently firing hook.
	 * @return bool
	 */
	public static function is_suppressed( string $hook ): bool {
		return self::$suppressed && isset( self::HOOKS[ $hook ] );
	}

	/**
	 * Whether delivery of this topic should run with observers suppressed.
	 *
	 * @since 11.4.0
	 *
	 * @param string $topic Webhook topic.
	 * @return bool
	 */
	public static function is_observer_topic( string $topic ): bool {
		$parts = explode( '.', $topic, 3 );

		return 'action' === $parts[0] && isset( self::HOOKS[ $parts[1] ?? '' ] );
	}

	/**
	 * Deliver a webhook. Suppress observers during delivery of an observer topic.
	 *
	 * @since 11.4.0
	 *
	 * @param string          $topic   Webhook topic.
	 * @param callable():void $deliver Delivery callback.
	 */
	public static function during_delivery( string $topic, callable $deliver ): void {
		if ( self::is_observer_topic( $topic ) ) {
			self::without_observers( $deliver );
			return;
		}

		$deliver();
	}

	/**
	 * Run webhook bookkeeping without admitting new observer deliveries.
	 *
	 * @since 11.4.0
	 *
	 * @template T
	 * @param callable(): T $callback Webhook bookkeeping or delivery.
	 * @return T
	 */
	public static function without_observers( callable $callback ) {
		$previous         = self::$suppressed;
		self::$suppressed = true;
		try {
			return $callback();
		} finally {
			self::$suppressed = $previous;
		}
	}
}
