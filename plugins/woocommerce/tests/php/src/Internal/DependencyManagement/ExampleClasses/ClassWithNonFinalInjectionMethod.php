<?php
/**
 * ClassWithNonFinalInjectionMethod class file.
 *
 * @package Automattic\PooCommerce\Tests\Internal\DependencyManagement\ExampleClasses
 */

namespace Automattic\PooCommerce\Tests\Internal\DependencyManagement\ExampleClasses;

/**
 * An example of a class with a private injection method.
 */
class ClassWithNonFinalInjectionMethod {

	// phpcs:disable PooCommerce.Functions.InternalInjectionMethod.MissingFinal

	/**
	 * Initialize the class instance.
	 *
	 * @internal
	 */
	public function init() {
	}
}
