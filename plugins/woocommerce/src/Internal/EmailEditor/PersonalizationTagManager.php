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
					return $context['recipient_email'] ?? '';
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
		return $registry;
	}
}
