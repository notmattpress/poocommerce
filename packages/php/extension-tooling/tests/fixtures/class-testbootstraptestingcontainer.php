<?php
/**
 * Testing container fixture.
 *
 * @package PooCommerce\ExtensionTools
 */

/**
 * Record the inner container passed to the PooCommerce testing wrapper.
 */
class TestBootstrapTestingContainer {

	/**
	 * The original inner container.
	 *
	 * @var object
	 */
	public $original;

	/**
	 * Remember the inner container.
	 *
	 * @param object $original The container to wrap.
	 */
	public function __construct( $original ) {
		$this->original = $original;
	}
}
