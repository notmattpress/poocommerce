<?php
declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\Admin\Suggestions\PaymentExtensionSuggestionIncentives;
use Automattic\PooCommerce\Internal\Admin\Suggestions\PaymentExtensionSuggestions;
use Automattic\PooCommerce\Internal\DependencyManagement\AbstractServiceProvider;

/**
 * Service provider for the suggestions controller classes in the Automattic\PooCommerce\Internal\Admin\Suggestions namespace.
 */
class AdminSuggestionsServiceProvider extends AbstractServiceProvider {
	/**
	 * List services provided by this class.
	 *
	 * @var string[]
	 */
	protected $provides = array(
		PaymentExtensionSuggestions::class,
		PaymentExtensionSuggestionIncentives::class,
		// The individual incentive providers are provided by the PaymentExtensionSuggestionIncentives class.
	);

	/**
	 * Registers services provided by this class.
	 *
	 * @return void
	 */
	public function register() {
		$this->share( PaymentExtensionSuggestionIncentives::class );
		$this->share( PaymentExtensionSuggestions::class )->addArgument( PaymentExtensionSuggestionIncentives::class );
	}
}
