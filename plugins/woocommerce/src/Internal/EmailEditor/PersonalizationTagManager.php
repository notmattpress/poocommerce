<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;

defined( 'ABSPATH' ) || exit;

/**
 * Manages personalization tags for PooCommerce emails.
 *
 * @internal
 */
class PersonalizationTagManager {

	/**
	 * Initialize the personalization tag manager.
	 *
	 * @internal
	 * @return void
	 */
	final public function init(): void {
		add_filter( 'poocommerce_email_editor_register_personalization_tags', array( $this, 'register_personalization_tags' ) );
	}

	/**
	 * Register PooCommerce personalization tags with the registry.
	 *
	 * @param Personalization_Tags_Registry $registry The personalization tags registry.
	 * @return Personalization_Tags_Registry
	 */
	public function register_personalization_tags( Personalization_Tags_Registry $registry ) {
		$registry->register(
			new Personalization_Tag(
				__( 'Shopper Email', 'poocommerce' ),
				'poocommerce/shopper-email',
				__( 'Shopper', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_email() ?? '';
					}
					return $context['recipient_email'] ?? '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Shopper First Name', 'poocommerce' ),
				'poocommerce/shopper-first-name',
				__( 'Shopper', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_first_name() ?? '';
					} elseif ( isset( $context['wp_user'] ) ) {
						return $context['wp_user']->first_name ?? '';
					}
					return '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Shopper Last Name', 'poocommerce' ),
				'poocommerce/shopper-last-name',
				__( 'Shopper', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_last_name() ?? '';
					} elseif ( isset( $context['wp_user'] ) ) {
						return $context['wp_user']->last_name ?? '';
					}
					return '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Shopper Full Name', 'poocommerce' ),
				'poocommerce/shopper-full-name',
				__( 'Shopper', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_formatted_billing_full_name() ?? '';
					} elseif ( isset( $context['wp_user'] ) ) {
						$first_name = $context['wp_user']->first_name ?? '';
						$last_name  = $context['wp_user']->last_name ?? '';
						return trim( "$first_name $last_name" );
					}
					return '';
				},
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Shopper Username', 'poocommerce' ),
				'poocommerce/shopper-username',
				__( 'Shopper', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['wp_user'] ) ) {
						return stripslashes( $context['wp_user']->user_login ?? '' );
					}
					return '';
				},
			)
		);

		// Order Personalization Tags.
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

		// Site Personalization Tags.
		$registry->register(
			new Personalization_Tag(
				__( 'Site Title', 'poocommerce' ),
				'poocommerce/site-title',
				__( 'Site', 'poocommerce' ),
				function (): string {
					return htmlspecialchars_decode( get_bloginfo( 'name' ) );
				},
			)
		);
		$registry->register(
			new Personalization_Tag(
				__( 'Homepage URL', 'poocommerce' ),
				'poocommerce/site-homepage-url',
				__( 'Site', 'poocommerce' ),
				function (): string {
					return get_bloginfo( 'url' );
				},
			)
		);

		// Store Personalization Tags.
		$registry->register(
			new Personalization_Tag(
				__( 'Store Email', 'poocommerce' ),
				'poocommerce/store-email',
				__( 'Store', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['wc_email'], $context['wc_email']->get_from_address ) ) {
						return $context['wc_email']->get_from_address();
					}
					return get_option( 'admin_email' );
				},
			)
		);
		$registry->register(
			new Personalization_Tag(
				__( 'My Account URL', 'poocommerce' ),
				'poocommerce/my-account-url',
				__( 'Store', 'poocommerce' ),
				function (): string {
					return esc_attr( wc_get_page_permalink( 'myaccount' ) );
				},
			)
		);

		// Admin Order Note.
		// This is temporary untill we create it's block.
		$registry->register(
			new Personalization_Tag(
				__( 'Admin Order Note', 'poocommerce' ),
				'poocommerce/admin-order-note',
				__( 'Store', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['wc_email'], $context['wc_email']->customer_note ) ) {
						return wptexturize( $context['wc_email']->customer_note );
					}
					return '';
				},
			)
		);
		return $registry;
	}
}
