<?php
/**
 * PaymentGatewaySettingsSchema class.
 *
 * @package PooCommerce\RestApi
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\RestApi\Routes\V4\Settings\PaymentGateways\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * PaymentGatewaySettingsSchema class.
 *
 * Generic payment gateway settings schema for gateways without special requirements.
 * Extends AbstractPaymentGatewaySettingsSchema with default implementations.
 */
class PaymentGatewaySettingsSchema extends AbstractPaymentGatewaySettingsSchema {
	// All functionality inherited from abstract base class.
}
