/*
 * Internal dependencies
 */
const {
	runActivationTest,
	runInitialStoreSettingsTest,
	runSetupOnboardingTests,
} = require( '@poocommerce/e2e-core-tests' );

runActivationTest();
runInitialStoreSettingsTest();
runSetupOnboardingTests();
