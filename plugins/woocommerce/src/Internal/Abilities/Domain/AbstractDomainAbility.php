<?php
/**
 * Domain ability base class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\Abilities\Domain;

use Automattic\PooCommerce\Internal\Abilities\Domain\Traits\DomainAbilityHelpers;

defined( 'ABSPATH' ) || exit;

/**
 * Shared helpers for PooCommerce domain ability definitions.
 */
abstract class AbstractDomainAbility {

	use DomainAbilityHelpers;
}
