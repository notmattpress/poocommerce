<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTags;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\PooCommerce\Internal\EmailEditor\Integration;

/**
 * Provider for customer-related personalization tags.
 *
 * @internal
 */
class CustomerTagsProvider extends AbstractTagProvider {
	/**
	 * Register customer tags with the registry.
	 *
	 * @param Personalization_Tags_Registry $registry The personalization tags registry.
	 * @return void
	 */
	public function register_tags( Personalization_Tags_Registry $registry ): void {
		$registry->register(
			new Personalization_Tag(
				__( 'Customer Email', 'poocommerce' ),
				'poocommerce/customer-email',
				__( 'Customer', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_email() ?? '';
					}
					return $context['recipient_email'] ?? '';
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Customer First Name', 'poocommerce' ),
				'poocommerce/customer-first-name',
				__( 'Customer', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_first_name() ?? '';
					} elseif ( isset( $context['wp_user'] ) ) {
						return $context['wp_user']->first_name ?? '';
					}
					return '';
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Customer Last Name', 'poocommerce' ),
				'poocommerce/customer-last-name',
				__( 'Customer', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						return $context['order']->get_billing_last_name() ?? '';
					} elseif ( isset( $context['wp_user'] ) ) {
						return $context['wp_user']->last_name ?? '';
					}
					return '';
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Customer Full Name', 'poocommerce' ),
				'poocommerce/customer-full-name',
				__( 'Customer', 'poocommerce' ),
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
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Customer Username', 'poocommerce' ),
				'poocommerce/customer-username',
				__( 'Customer', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['wp_user'] ) ) {
						return stripslashes( $context['wp_user']->user_login ?? '' );
					}
					return '';
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);

		$registry->register(
			new Personalization_Tag(
				__( 'Customer Country', 'poocommerce' ),
				'poocommerce/customer-country',
				__( 'Customer', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) ) {
						$country_code = $context['order']->get_billing_country();
						return WC()->countries->countries[ $country_code ] ?? $country_code ?? '';
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
