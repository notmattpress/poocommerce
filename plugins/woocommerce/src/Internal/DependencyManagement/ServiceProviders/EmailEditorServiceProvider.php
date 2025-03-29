<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\PooCommerce\Internal\EmailEditor\Integration;
use Automattic\PooCommerce\Internal\EmailEditor\PageRenderer;
use Automattic\PooCommerce\Internal\EmailEditor\PersonalizationTagManager;
use Automattic\PooCommerce\Internal\EmailEditor\EmailPatterns\PatternsController;
use Automattic\PooCommerce\Internal\EmailEditor\EmailTemplates\TemplatesController;
use Automattic\PooCommerce\Internal\EmailEditor\BlockEmailRenderer;
use Automattic\PooCommerce\Internal\EmailEditor\WooContentProcessor;
use Automattic\PooCommerce\Internal\EmailEditor\WCTransactionalEmails\WCTransactionalEmails;

/**
 * Service provider for the EmailEditor namespace.
 */
class EmailEditorServiceProvider extends AbstractInterfaceServiceProvider {

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		Integration::class,
		PageRenderer::class,
		PersonalizationTagManager::class,
		PatternsController::class,
		TemplatesController::class,
		WooContentProcessor::class,
		BlockEmailRenderer::class,
		WCTransactionalEmails::class,
	);

	/**
	 * Register the classes.
	 */
	public function register() {
		$this->share( Integration::class );
		$this->share( PageRenderer::class );
		$this->share( PersonalizationTagManager::class );
		$this->share( PatternsController::class );
		$this->share( TemplatesController::class );
		$this->share( WooContentProcessor::class );
		$this->share( BlockEmailRenderer::class )->addArgument( WooContentProcessor::class );
		$this->share( WCTransactionalEmails::class );
	}
}
