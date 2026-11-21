# The internal namespace

All the code in this directory (and hence in the `Automattic\PooCommerce\Internal` namespace) is internal PooCommerce infrastructure code and not intended to be used by extensions. The important thing that this implies is that **backwards compatibility of the public surface for classes in this namespace is not guaranteed in future releases of PooCommerce**.

Therefore **extensions developers should never use classes in this namespace directly in their code**. See [the README file for the src folder](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/README.md#the-internal-namespace) for more detailed guidance.

Note that this applies to all the code entities in this namespace, even those not having an `@internal` annotation.
