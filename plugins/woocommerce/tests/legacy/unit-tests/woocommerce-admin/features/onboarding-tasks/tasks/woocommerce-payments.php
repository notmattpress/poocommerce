<?php
/**
 * Test the Tasks/PooCommercePayments class.
 *
 * @package PooCommerce\Admin\Tests\OnboardingTasks/Tasks/PooCommercePayments
 */

declare(strict_types=1);

use Automattic\PooCommerce\Admin\Features\OnboardingTasks\TaskList;
use Automattic\PooCommerce\Admin\Features\OnboardingTasks\Tasks\PooCommercePayments;

/**
 * class WC_Admin_Tests_OnboardingTasks_Task_PooCommerce_Payments
 */
class WC_Admin_Tests_OnboardingTasks_Task_PooCommerce_Payments extends WC_Unit_Test_Case {

	/**
	 * Task instance.
	 *
	 * @var PooCommercePayments
	 */
	protected $task;

	/**
	 * Fake PooCommerce Payments gateway instance.
	 *
	 * @var Fake_WC_Payments_Gateway
	 */
	protected $fake_gateway;

	/**
	 * Setup test data. Called before every test.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->task         = new PooCommercePayments( new TaskList() );
		$this->fake_gateway = new Fake_WC_Payments_Gateway();
	}

	/**
	 * Teardown after each test.
	 */
	public function tearDown(): void {
		parent::tearDown();
		remove_filter( 'poocommerce_payment_gateways', array( $this, 'inject_fake_gateway' ) );
	}

	/**
	 * Test is_connected method when PooCommerce Payments is connected.
	 */
	public function test_is_connected_when_wcpay_is_connected() {
		$this->mock_wc_payments_gateway( true );
		$this->assertTrue( PooCommercePayments::is_connected() );
	}

	/**
	 * Test is_connected method when PooCommerce Payments is not connected.
	 */
	public function test_is_connected_when_wcpay_is_not_connected() {
		$this->mock_wc_payments_gateway( false );
		$this->assertFalse( PooCommercePayments::is_connected() );
	}

	/**
	 * Test is_account_partially_onboarded method when account is partially onboarded.
	 */
	public function test_is_account_partially_onboarded_when_true() {
		$this->mock_wc_payments_gateway( true, true );
		$this->assertTrue( PooCommercePayments::is_account_partially_onboarded() );
	}

	/**
	 * Test is_account_partially_onboarded method when account is fully onboarded.
	 */
	public function test_is_account_partially_onboarded_when_false() {
		$this->mock_wc_payments_gateway( true, false );
		$this->assertFalse( PooCommercePayments::is_account_partially_onboarded() );
	}

	/**
	 * Mock the WC_Payments gateway using filters.
	 *
	 * @param bool $is_connected Whether the gateway is connected.
	 * @param bool $is_partially_onboarded Whether the account is partially onboarded.
	 */
	private function mock_wc_payments_gateway( $is_connected, $is_partially_onboarded = false ) {
		$this->fake_gateway->set_connected( $is_connected );
		$this->fake_gateway->set_partially_onboarded( $is_partially_onboarded );
		add_filter( 'poocommerce_payment_gateways', array( $this, 'inject_fake_gateway' ) );
		WC()->payment_gateways()->init();
	}

	/**
	 * Inject fake gateway filter callback.
	 *
	 * @param array $gateways Existing gateways.
	 * @return array Modified gateways.
	 */
	public function inject_fake_gateway( $gateways ) {
		return array( 'poocommerce_payments' => $this->fake_gateway );
	}
}

// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound

/**
 * Fake PooCommerce Payments Gateway class for testing.
 */
class Fake_WC_Payments_Gateway extends WC_Payment_Gateway {
	/**
	 * Whether the gateway is connected.
	 *
	 * @var bool
	 */
	private $connected = false;

	/**
	 * Whether the account is partially onboarded.
	 *
	 * @var bool
	 */
	private $partially_onboarded = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id = 'poocommerce_payments';
	}

	/**
	 * Check if the gateway is connected.
	 *
	 * @return bool
	 */
	public function is_connected() {
		return $this->connected;
	}

	/**
	 * Check if the account is partially onboarded.
	 *
	 * @return bool
	 */
	public function is_account_partially_onboarded() {
		return $this->partially_onboarded;
	}

	/**
	 * Set the connected status.
	 *
	 * @param bool $connected Whether the gateway is connected.
	 */
	public function set_connected( $connected ) {
		$this->connected = $connected;
	}

	/**
	 * Set the partially onboarded status.
	 *
	 * @param bool $partially_onboarded Whether the account is partially onboarded.
	 */
	public function set_partially_onboarded( $partially_onboarded ) {
		$this->partially_onboarded = $partially_onboarded;
	}
}

if ( ! class_exists( '\WC_Payments' ) ) {
	/**
	 * Fake WooPayments main class for testing.
	 */
	class WC_Payments {}
}
