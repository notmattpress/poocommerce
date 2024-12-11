const {
	testAdminOnboardingWizard,
	testSelectiveBundleWCPay,
	testDifferentStoreCurrenciesWCPay,
	testSubscriptionsInclusion,
	testBusinessDetailsForm,
	testAdminHomescreen,
} = require( '@poocommerce/admin-e2e-tests' );
const { withRestApi, IS_RETEST_MODE } = require( '@poocommerce/e2e-utils' );

// Reset onboarding profile when re-running tests on a site
if ( IS_RETEST_MODE ) {
	withRestApi.resetOnboarding();
}

testAdminOnboardingWizard();
testSelectiveBundleWCPay();
testDifferentStoreCurrenciesWCPay();
testSubscriptionsInclusion();
testBusinessDetailsForm();
testAdminHomescreen();
