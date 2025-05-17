<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTags;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;

/**
 * Provider for order-related personalization tags.
 *
 * @internal
 */
class OrderTagsProvider extends AbstractTagProvider {
	/**
	 * Register order tags with the registry.
	 *
	 * @param Personalization_Tags_Registry $registry The personalization tags registry.
	 * @return void
	 */
	public function register_tags( Personalization_Tags_Registry $registry ): void {
		$registry->register(
			new Personalization_Tag(
				__( 'Order Number', 'poocommerce' ),
				'poocommerce/order-number',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return $context['order']->get_order_number() ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Order Date', 'poocommerce' ),
				'poocommerce/order-date',
				__( 'Order', 'poocommerce' ),
				function ( array $context, array $parameters = array() ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					$format       = isset( $parameters['format'] ) && is_string( $parameters['format'] ) ? $parameters['format'] : wc_date_format();
					$date_created = $context['order']->get_date_created();
					if ( ! $date_created ) {
						return '';
					}
					return wc_format_datetime( $date_created, $format );
				},
				array(
					'format' => wc_date_format(),
				),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Order Items', 'poocommerce' ),
				'poocommerce/order-items',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					$items = array();
					foreach ( $context['order']->get_items() as $item ) {
						$items[] = $item->get_name();
					}
					return implode( ', ', $items );
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Order Subtotal', 'poocommerce' ),
				'poocommerce/order-subtotal',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return (string) $context['order']->get_subtotal() ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Order Tax', 'poocommerce' ),
				'poocommerce/order-tax',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return (string) $context['order']->get_total_tax() ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Order Total', 'poocommerce' ),
				'poocommerce/order-total',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return (string) $context['order']->get_total() ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Payment Method', 'poocommerce' ),
				'poocommerce/order-payment-method',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return $context['order']->get_payment_method_title() ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Payment URL', 'poocommerce' ),
				'poocommerce/order-payment-url',
				__( 'Order', 'poocommerce' ),
				function ( array $context ): string {
					if ( ! isset( $context['order'] ) ) {
						return '';
					}
					return $context['order']->get_checkout_payment_url() ?? '';
				},
			)
		);
	}
}
