<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTags;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\PooCommerce\Internal\EmailEditor\Integration;
use Automattic\PooCommerce\Internal\Orders\PointOfSaleOrderUtil;
use Automattic\PooCommerce\Internal\Settings\PointOfSaleDefaultSettings;

/**
 * Provider for site-related personalization tags.
 *
 * @internal
 */
class SiteTagsProvider extends AbstractTagProvider {
	/**
	 * Register site tags with the registry.
	 *
	 * @param Personalization_Tags_Registry $registry The personalization tags registry.
	 * @return void
	 */
	public function register_tags( Personalization_Tags_Registry $registry ): void {
		$registry->register(
			new Personalization_Tag(
				__( 'Site Title', 'poocommerce' ),
				'poocommerce/site-title',
				__( 'Site', 'poocommerce' ),
				function ( array $context ): string {
					if ( isset( $context['order'] ) && PointOfSaleOrderUtil::is_pos_order( $context['order'] ) ) {
						$store_name = get_option( 'poocommerce_pos_store_name' );
						return htmlspecialchars_decode( empty( $store_name ) ? PointOfSaleDefaultSettings::get_default_store_name() : $store_name, ENT_QUOTES );
					}
					return htmlspecialchars_decode( get_bloginfo( 'name' ) );
				},
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
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
				array(),
				null,
				array( Integration::EMAIL_POST_TYPE ),
			)
		);
	}
}
