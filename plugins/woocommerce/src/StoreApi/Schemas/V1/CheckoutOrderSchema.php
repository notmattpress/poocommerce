<?php
namespace Automattic\PooCommerce\StoreApi\Schemas\V1;

use Automattic\PooCommerce\StoreApi\SchemaController;
use Automattic\PooCommerce\StoreApi\Payments\PaymentResult;
use Automattic\PooCommerce\StoreApi\Schemas\ExtendSchema;


/**
 * CheckoutOrderSchema class.
 */
class CheckoutOrderSchema extends CheckoutSchema {
	/**
	 * The schema item name.
	 *
	 * @var string
	 */
	protected $title = 'checkout-order';

	/**
	 * The schema item identifier.
	 *
	 * @var string
	 */
	const IDENTIFIER = 'checkout-order';

	/**
	 * Checkout schema properties.
	 *
	 * @return array
	 */
	public function get_properties() {
		$parent_properties = parent::get_properties();
		unset( $parent_properties['create_account'] );
		return $parent_properties;
	}
}
