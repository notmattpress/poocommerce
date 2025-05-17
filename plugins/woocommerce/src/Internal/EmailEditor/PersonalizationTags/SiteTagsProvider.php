<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTags;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;

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
	}
}
