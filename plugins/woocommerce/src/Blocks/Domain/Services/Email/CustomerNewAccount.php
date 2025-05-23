<?php
declare( strict_types=1 );

namespace Automattic\PooCommerce\Blocks\Domain\Services\Email;

use Automattic\PooCommerce\Blocks\Domain\Package;

/**
 * Customer New Account. Previously used for blocks, but now replaced by the core email.
 *
 * @deprecated This class can't be removed due to https://github.com/poocommerce/poocommerce/issues/52311.
 */
class CustomerNewAccount extends \WC_Email {
	/**
	 * Constructor.
	 *
	 * @param Package $package An instance of (Woo Blocks) Package.
	 */
	public function __construct( Package $package ) {
		parent::__construct();
	}
}
