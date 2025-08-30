<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTags;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\PooCommerce\Internal\EmailEditor\Integration;

/**
 * Provider for store-related personalization tags.
 *
 * @internal
 */
class StoreTagsProvider extends AbstractTagProvider {
	/**
	 * Register store tags with the registry.
	 *
	 * @param Personalization_Tags_Registry $registry The personalization tags registry.
	 * @return void
	 */
	public function register_tags( Personalization_Tags_Registry $registry ): void {
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
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Store URL', 'poocommerce' ),
				'poocommerce/store-url',
				__( 'Store', 'poocommerce' ),
				function (): string {
					return esc_attr( wc_get_page_permalink( 'shop' ) );
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Store Name', 'poocommerce' ),
				'poocommerce/store-name',
				__( 'Store', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['wc_email'] ) && ! empty( $context['wc_email']->get_from_name() ) ) {
						return $context['wc_email']->get_from_name();
					}

					return wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Store Address', 'poocommerce' ),
				'poocommerce/store-address',
				__( 'Store', 'poocommerce' ),
				function (): string {
					return WC()->mailer->get_store_address() ?? '';
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
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
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

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
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);
	}
}
