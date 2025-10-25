<?php
/**
 * This file is part of the MailPoet plugin
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);

use Automattic\PooCommerce\EmailEditor\Container;
use Automattic\PooCommerce\EmailEditor\Email_Css_Inliner;
use Automattic\PooCommerce\EmailEditor\Engine\Assets_Manager;
use Automattic\PooCommerce\EmailEditor\Engine\Dependency_Check;
use Automattic\PooCommerce\EmailEditor\Engine\Email_Api_Controller;
use Automattic\PooCommerce\EmailEditor\Engine\Email_Editor;
use Automattic\PooCommerce\EmailEditor\Engine\Logger\Email_Editor_Logger;
use Automattic\PooCommerce\EmailEditor\Engine\Patterns\Patterns;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\PooCommerce\EmailEditor\Engine\Personalizer;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Content_Renderer;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Highlighting_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Variables_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Postprocessors\Border_Style_Postprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Blocks_Width_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Cleanup_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Quote_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Spacing_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Preprocessors\Typography_Preprocessor;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\ContentRenderer\Process_Manager;
use Automattic\PooCommerce\EmailEditor\Engine\Renderer\Renderer;
use Automattic\PooCommerce\EmailEditor\Engine\Send_Preview_Email;
use Automattic\PooCommerce\EmailEditor\Engine\Settings_Controller;
use Automattic\PooCommerce\EmailEditor\Engine\Templates\Templates;
use Automattic\PooCommerce\EmailEditor\Engine\Templates\Templates_Registry;
use Automattic\PooCommerce\EmailEditor\Engine\Theme_Controller;
use Automattic\PooCommerce\EmailEditor\Engine\User_Theme;
use Automattic\PooCommerce\EmailEditor\Integrations\Core\Initializer;
use Automattic\PooCommerce\EmailEditor\Engine\Site_Style_Sync_Controller;

/**
 * Base class for MailPoet tests.
 *
 * @property IntegrationTester $tester
 */
abstract class Email_Editor_Integration_Test_Case extends \WP_UnitTestCase {
	/**
	 * The DI container.
	 *
	 * @var Container
	 */
	public Container $di_container;

	/**
	 * Set up before each test.
	 */
	public function setUp(): void {
		$this->initContainer();
		parent::setUp();
	}

	/**
	 * Check if the HTML is valid.
	 *
	 * @param string $html The HTML to check.
	 */
	protected function checkValidHTML( string $html ): void {
		$dom = new \DOMDocument();
		libxml_use_internal_errors( true );
		$dom->loadHTML( $html );

		// Check for errors during parsing.
		$errors = libxml_get_errors();
		libxml_clear_errors();

		$this->assertEmpty( $errors, 'HTML is not valid: ' . $html );
	}

	/**
	 * Get a service from the DI container.
	 *
	 * @template T of object
	 * @param string $id The service ID.
	 * @param array  $overrides The properties to override.
	 * @return T
	 * @phpstan-param class-string<T> $id The service ID.
	 */
	public function getServiceWithOverrides( string $id, array $overrides ): object {
		$instance = $this->di_container->get( $id );

		foreach ( $overrides as $property => $value ) {
			$reflection = new ReflectionClass( $instance );
			if ( $reflection->hasProperty( $property ) ) {
				$prop = $reflection->getProperty( $property );
				$prop->setAccessible( true );
				$prop->setValue( $instance, $value );
			}
		}

		return $instance;
	}

	/**
	 * Initialize the DI container.
	 */
	protected function initContainer(): void {
		$container = new Container();
		$container->set(
			Email_Css_Inliner::class,
			function () {
				return new Email_Css_Inliner();
			}
		);
		$container->set(
			Email_Editor_Logger::class,
			function () {
				return new Email_Editor_Logger();
			}
		);
		$container->set(
			Initializer::class,
			function () {
				return new Initializer();
			}
		);
		$container->set(
			Theme_Controller::class,
			function () {
				return new Theme_Controller();
			}
		);
		$container->set(
			User_Theme::class,
			function () {
				return new User_Theme();
			}
		);
		$container->set(
			Settings_Controller::class,
			function ( $container ) {
				return new Settings_Controller( $container->get( Theme_Controller::class ) );
			}
		);
		$container->set(
			Settings_Controller::class,
			function ( $container ) {
				return new Settings_Controller( $container->get( Theme_Controller::class ) );
			}
		);
		$container->set(
			Templates_Registry::class,
			function () {
				return new Templates_Registry();
			}
		);
		$container->set(
			Templates::class,
			function ( $container ) {
				return new Templates( $container->get( Templates_Registry::class ) );
			}
		);
		$container->set(
			Patterns::class,
			function () {
				return new Patterns();
			}
		);
		$container->set(
			Cleanup_Preprocessor::class,
			function () {
				return new Cleanup_Preprocessor();
			}
		);
		$container->set(
			Blocks_Width_Preprocessor::class,
			function () {
				return new Blocks_Width_Preprocessor();
			}
		);
		$container->set(
			Typography_Preprocessor::class,
			function ( $container ) {
				return new Typography_Preprocessor( $container->get( Settings_Controller::class ) );
			}
		);
		$container->set(
			Spacing_Preprocessor::class,
			function () {
				return new Spacing_Preprocessor();
			}
		);
		$container->set(
			Quote_Preprocessor::class,
			function () {
				return new Quote_Preprocessor();
			}
		);
		$container->set(
			Highlighting_Postprocessor::class,
			function () {
				return new Highlighting_Postprocessor();
			}
		);
		$container->set(
			Variables_Postprocessor::class,
			function ( $container ) {
				return new Variables_Postprocessor( $container->get( Theme_Controller::class ) );
			}
		);
		$container->set(
			Border_Style_Postprocessor::class,
			function () {
				return new Border_Style_Postprocessor();
			}
		);
		$container->set(
			Assets_Manager::class,
			function ( $container ) {
				return new Assets_Manager(
					$container->get( Settings_Controller::class ),
					$container->get( Theme_Controller::class ),
					$container->get( User_Theme::class ),
					$container->get( Email_Editor_Logger::class )
				);
			}
		);
		$container->set(
			Process_Manager::class,
			function ( $container ) {
				return new Process_Manager(
					$container->get( Cleanup_Preprocessor::class ),
					$container->get( Blocks_Width_Preprocessor::class ),
					$container->get( Typography_Preprocessor::class ),
					$container->get( Spacing_Preprocessor::class ),
					$container->get( Quote_Preprocessor::class ),
					$container->get( Highlighting_Postprocessor::class ),
					$container->get( Variables_Postprocessor::class ),
					$container->get( Border_Style_Postprocessor::class )
				);
			}
		);
		$container->set(
			Content_Renderer::class,
			function ( $container ) {
				return new Content_Renderer(
					$container->get( Process_Manager::class ),
					$container->get( Email_Css_Inliner::class ),
					$container->get( Theme_Controller::class ),
					$container->get( Email_Editor_Logger::class ),
				);
			}
		);
		$container->set(
			Renderer::class,
			function ( $container ) {
				return new Renderer(
					$container->get( Content_Renderer::class ),
					$container->get( Templates::class ),
					$container->get( Email_Css_Inliner::class ),
					$container->get( Theme_Controller::class ),
					$container->get( Personalization_Tags_Registry::class ),
				);
			}
		);
		$container->set(
			Personalization_Tags_Registry::class,
			function ( $container ) {
				return new Personalization_Tags_Registry(
					$container->get( Email_Editor_Logger::class )
				);
			}
		);
		$container->set(
			Personalizer::class,
			function ( $container ) {
				return new Personalizer(
					$container->get( Personalization_Tags_Registry::class ),
				);
			}
		);
		$container->set(
			Send_Preview_Email::class,
			function ( $container ) {
				return new Send_Preview_Email(
					$container->get( Renderer::class ),
					$container->get( Personalizer::class ),
				);
			}
		);
		$container->set(
			Email_Api_Controller::class,
			function ( $container ) {
				return new Email_Api_Controller(
					$container->get( Personalization_Tags_Registry::class ),
				);
			}
		);
		$container->set(
			Site_Style_Sync_Controller::class,
			function () {
				return new Site_Style_Sync_Controller();
			}
		);
		$container->set(
			Dependency_Check::class,
			function () {
				return new Dependency_Check();
			}
		);
		$container->set(
			Email_Editor::class,
			function ( $container ) {
				return new Email_Editor(
					$container->get( Email_Api_Controller::class ),
					$container->get( Templates::class ),
					$container->get( Patterns::class ),
					$container->get( Send_Preview_Email::class ),
					$container->get( Personalization_Tags_Registry::class ),
					$container->get( Email_Editor_Logger::class ),
					$container->get( Assets_Manager::class )
				);
			}
		);
		$this->di_container = $container;
	}
}
