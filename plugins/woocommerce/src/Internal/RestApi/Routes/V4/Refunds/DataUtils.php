<?php
/**
 * Backward compatibility shim: keeps the old DataUtils FQCN resolving after the class
 * moved to the version-neutral Internal\RestApi\Refunds namespace.
 *
 * @deprecated 11.3.0 Use Automattic\PooCommerce\Internal\RestApi\Refunds\DataUtils instead.
 * @package Automattic\PooCommerce\Internal\RestApi\Routes\V4\Refunds
 */

declare(strict_types=1);

defined( 'ABSPATH' ) || exit;

class_alias(
	\Automattic\PooCommerce\Internal\RestApi\Refunds\DataUtils::class,
	'Automattic\PooCommerce\Internal\RestApi\Routes\V4\Refunds\DataUtils'
);
