<?php
declare(strict_types=1);
namespace Automattic\PooCommerce\StoreApi\Routes\V1\Agentic;

use Automattic\PooCommerce\StoreApi\Routes\V1\Agentic\Messages\Messages;
use WC_Cart;

/**
 * AgenticCheckoutSession class.
 *
 * Wrapper for all things, associated with an agentic checkout session.
 * This class manages the cart and error handling for agentic checkout processes.
 */
final class AgenticCheckoutSession {
	/**
	 * The PooCommerce cart instance.
	 *
	 * @var WC_Cart
	 */
	private $cart;

	/**
	 * Error messages handler for the checkout session.
	 *
	 * @var Messages
	 */
	private $messages;

	/**
	 * Constructor.
	 *
	 * @param WC_Cart $cart The PooCommerce cart instance.
	 */
	public function __construct( WC_Cart $cart ) {
		$this->cart     = $cart;
		$this->messages = new Messages();
	}

	/**
	 * Gets the cart instance.
	 *
	 * @return WC_Cart The PooCommerce cart instance.
	 */
	public function get_cart(): WC_Cart {
		return $this->cart;
	}

	/**
	 * Gets the messages collection.
	 *
	 * @return Messages The messages handler instance.
	 */
	public function get_messages(): Messages {
		return $this->messages;
	}
}
