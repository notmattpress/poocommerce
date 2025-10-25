<?php
/**
 * This file is part of the PooCommerce Email Editor package.
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare(strict_types = 1);
namespace Automattic\PooCommerce\EmailEditor\Engine;

use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\PooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\PooCommerce\EmailEditor\Engine\Logger\Email_Editor_Logger;

/**
 * Integration test for Personalizer class which validate the functionality
 * of Personalizer using Personalization_Tags_Registry.
 */
class Personalizer_Test extends \Email_Editor_Integration_Test_Case {
	/**
	 * Instance of Personalizer created before each test.
	 *
	 * @var Personalizer
	 */
	private Personalizer $personalizer;
	/**
	 * Instance of Personalization_Tags_Registry created before each test.
	 *
	 * @var Personalization_Tags_Registry
	 */
	private Personalization_Tags_Registry $tags_registry;

	/**
	 * Set up before each test.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->tags_registry = new Personalization_Tags_Registry( $this->di_container->get( Email_Editor_Logger::class ) );
		$this->personalizer  = new Personalizer( $this->tags_registry );
	}

	/**
	 * Test personalizing content with a single tag.
	 */
	public function testPersonalizeContentWithSingleTag(): void {
		// Register a tag in the registry.
		$this->tags_registry->register(
			new Personalization_Tag(
				'first_name',
				'user-firstname',
				'User',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return $context['subscriber_name'] ?? 'Default Name';
				}
			)
		);

		$this->personalizer->set_context( array( 'subscriber_name' => 'John' ) );
		$html_content = '<p>Hello, <!--[user-firstname]-->!</p>';
		$this->assertSame( '<p>Hello, John!</p>', $this->personalizer->personalize_content( $html_content ) );
	}

	/**
	 * Test personalizing content with multiple tags.
	 */
	public function testPersonalizeContentWithMultipleTags(): void {
		// Register multiple tags in the registry.
		$this->tags_registry->register(
			new Personalization_Tag(
				'first_name',
				'[user/firstname]',
				'Subscriber Info',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return $context['subscriber_name'] ?? 'Default Name';
				}
			)
		);

		$this->tags_registry->register(
			new Personalization_Tag(
				'email',
				'user/email',
				'Subscriber Info',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return $context['subscriber_email'] ?? 'unknown@example.com';
				}
			)
		);

		// Set the context for personalization.
		$this->personalizer->set_context(
			array(
				'subscriber_name'  => 'John',
				'subscriber_email' => 'john@example.com',
			)
		);

		$html_content = '
			<div>
				<h1>Hello, <!--[user/firstname]-->!</h1>
				<p>Your email is <!--[user/email]-->.</p>
			</div>
		';

		$personalized_content = $this->personalizer->personalize_content( $html_content );
		$this->assertSame(
			'
			<div>
				<h1>Hello, John!</h1>
				<p>Your email is john@example.com.</p>
			</div>
		',
			$personalized_content
		);
	}

	/**
	 * Test a missing tag in the registry.
	 */
	public function testMissingTagInRegistry(): void {
		$html_content         = '<p>Hello, <!--[mailpoet/unknown-tag]-->!</p>';
		$personalized_content = $this->personalizer->personalize_content( $html_content );
		$this->assertSame( '<p>Hello, <!--[mailpoet/unknown-tag]-->!</p>', $personalized_content );
	}

	/**
	 * Test a callback arguments.
	 */
	public function testTagWithArguments(): void {
		$this->tags_registry->register(
			new Personalization_Tag(
				'default_name',
				'[user/firstname]',
				'Subscriber Info',
				function ( $context, $args ) {
					return $args['default'] ?? 'Default Name';
				}
			)
		);

		$html_content = '<p>Hello, <!--[user/firstname default="Guest"]-->!</p>';
		$this->assertSame( '<p>Hello, Guest!</p>', $this->personalizer->personalize_content( $html_content ) );
	}

	/**
	 * Test a callback arguments.
	 */
	public function testPersonalizationInTitle(): void {
		$this->tags_registry->register(
			new Personalization_Tag(
				'default_name',
				'[user/firstname]',
				'Subscriber Info',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return $context['user_name'] ?? 'Default Name';
				}
			)
		);

		$html_content = '
			<html>
				<head>
					<title>Welcome, <!--[user/firstname default="Guest"]-->!</title>
			</head>
			<body>
				<p>Hello, <!--[user/firstname default="Guest"]-->!</p>
			</html>
		';
		$this->personalizer->set_context( array( 'user_name' => 'John' ) );
		$this->assertSame(
			'
			<html>
				<head>
					<title>Welcome, John!</title>
			</head>
			<body>
				<p>Hello, John!</p>
			</html>
		',
			$this->personalizer->personalize_content( $html_content )
		);
	}

	/**
	 * Test personalizing content with a tag in href attribute.
	 */
	public function testPersonalizeContentWithHrefTag(): void {
		// Register a tag in the registry.
		$this->tags_registry->register(
			new Personalization_Tag(
				'Store URL',
				'poocommerce/store-url',
				'Store',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return 'https://example.com';
				}
			)
		);

		$html_content = '<a href="http://[poocommerce/store-url]">Click here</a>';
		$this->assertSame( '<a href="https://example.com">Click here</a>', $this->personalizer->personalize_content( $html_content ) );
	}

	/**
	 * Test personalizing content with a tag in href attribute with URL encoding.
	 */
	public function testPersonalizeContentWithEncodedHrefTag(): void {
		// Register a tag in the registry.
		$this->tags_registry->register(
			new Personalization_Tag(
				'Store URL',
				'poocommerce/store-url',
				'Store',
				function ( $context, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The $args parameter is not used in this test.
					return 'https://example.com';
				}
			)
		);

		$html_content = '<a href="http://%5Bpoocommerce/store-url%5D">Click here</a>';
		$this->assertSame( '<a href="https://example.com">Click here</a>', $this->personalizer->personalize_content( $html_content ) );
	}

	/**
	 * Test personalizing content with a non-existent tag in href attribute.
	 */
	public function testPersonalizeContentWithNonExistentHrefTag(): void {
		$html_content = '<a href="http://[poocommerce/non-existent-tag]">Click here</a>';
		$this->assertSame( '<a href="http://[poocommerce/non-existent-tag]">Click here</a>', $this->personalizer->personalize_content( $html_content ) );
	}

	/**
	 * Test parsing tokens with various formats.
	 */
	public function testParsingPersonalizationTagAttributes(): void {
		// Use reflection to access the private method.
		$reflection = new \ReflectionClass( $this->personalizer );
		$method     = $reflection->getMethod( 'parse_token' );
		$method->setAccessible( true );

		// Test case 1: Simple token without attributes.
		$result = $method->invoke( $this->personalizer, '[user/firstname]' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '[user/firstname]', $result['token'] );
		$this->assertEmpty( $result['arguments'] );

		// Test case 2: Token with a single attribute.
		$result = $method->invoke( $this->personalizer, '[user/firstname default="Guest"]' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '[user/firstname]', $result['token'] );
		$this->assertSame( array( 'default' => 'Guest' ), $result['arguments'] );

		// Test case 3: Token with multiple attributes.
		$result = $method->invoke( $this->personalizer, '[user/firstname default="Guest" fallback="Unknown" max_length="10"]' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '[user/firstname]', $result['token'] );
		$this->assertSame(
			array(
				'default'    => 'Guest',
				'fallback'   => 'Unknown',
				'max_length' => '10',
			),
			$result['arguments']
		);

		// Test case 4: Token with spaces and different quote types.
		$result = $method->invoke( $this->personalizer, '[user/firstname  default="Guest"  fallback=\'Unknown\' ]' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '[user/firstname]', $result['token'] );
		$this->assertSame(
			array(
				'default'  => 'Guest',
				'fallback' => 'Unknown',
			),
			$result['arguments']
		);

		// Test case 5: Token with empty attribute value.
		$result = $method->invoke( $this->personalizer, '[user/firstname  default=""]' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '[user/firstname]', $result['token'] );
		$this->assertSame(
			array(
				'default' => '',
			),
			$result['arguments']
		);

		// Test case 6 Invalid token format.
		$result = $method->invoke( $this->personalizer, 'invalid-token' );
		/**
		 * Typehint needed by PHPStan.
		 *
		 * @var array{token: string, arguments: array<string, string>} $result
		 */
		$this->assertSame( '', $result['token'] );
		$this->assertEmpty( $result['arguments'] );
	}
}
