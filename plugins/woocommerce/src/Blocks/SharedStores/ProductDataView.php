<?php
declare(strict_types=1);

namespace Automattic\PooCommerce\Blocks\SharedStores;

/**
 * Read-only, by-ID view of one member (`products` or `productVariations`) of the
 * `poocommerce/products` server state, placed in the `poocommerce` server state.
 *
 * Each read returns what `poocommerce/products` holds under that ID at that moment,
 * and the view serializes as an empty object, so the page carries each record once.
 *
 * Temporary: once every block reads product data from the `poocommerce` store, the
 * loaders write the data there directly and this class is deleted. Code that reads
 * it by ID doesn't change.
 *
 * @internal
 *
 * @implements \ArrayAccess<int|string, array|null>
 */
final class ProductDataView implements \ArrayAccess, \JsonSerializable {

	/**
	 * The `poocommerce/products` state member this view reads.
	 *
	 * @var string
	 */
	private string $member;

	/**
	 * Constructor.
	 *
	 * @param string $member The `poocommerce/products` state member to read: `products` or `productVariations`.
	 */
	public function __construct( string $member ) {
		$this->member = $member;
	}

	/**
	 * Whether `poocommerce/products` holds a record under this ID.
	 *
	 * @param mixed $offset The product or variation ID.
	 * @return bool
	 */
	public function offsetExists( $offset ): bool {
		return null !== $this->offsetGet( $offset );
	}

	/**
	 * The record `poocommerce/products` holds under this ID.
	 *
	 * @param mixed $offset The product or variation ID.
	 * @return array|null The record in Store API shape, or null when there is none.
	 */
	public function offsetGet( $offset ): ?array {
		$state = wp_interactivity_state( 'poocommerce/products' );

		return $state[ $this->member ][ $offset ] ?? null;
	}

	/**
	 * Writing through the view is not supported: product data is put in `poocommerce/products`.
	 *
	 * @param mixed $offset The product or variation ID.
	 * @param mixed $value  The record.
	 * @return void
	 * @throws \LogicException Always.
	 */
	public function offsetSet( $offset, $value ): void {
		throw new \LogicException( 'Product data is read-only in the poocommerce store. Load it into poocommerce/products instead.' );
	}

	/**
	 * Removing through the view is not supported: product data is put in `poocommerce/products`.
	 *
	 * @param mixed $offset The product or variation ID.
	 * @return void
	 * @throws \LogicException Always.
	 */
	public function offsetUnset( $offset ): void {
		throw new \LogicException( 'Product data is read-only in the poocommerce store. Load it into poocommerce/products instead.' );
	}

	/**
	 * Serialize as an empty object, so the records are sent to the page only under `poocommerce/products`.
	 *
	 * @return object
	 */
	public function jsonSerialize(): object {
		return new \stdClass();
	}
}
