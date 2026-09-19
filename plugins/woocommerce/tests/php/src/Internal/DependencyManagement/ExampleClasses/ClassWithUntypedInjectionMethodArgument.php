<?php

declare( strict_types=1 );

namespace Automattic\PooCommerce\Tests\Internal\DependencyManagement\ExampleClasses;

/**
 * An example class that has an injector method argument without any type hint.
 */
class ClassWithUntypedInjectionMethodArgument {
	/**
	 * Initialize the class instance.
	 *
	 * @internal
	 *
	 * @param mixed $some_argument Anything, really.
	 */
	final public function init( $some_argument ) {
	}
}
