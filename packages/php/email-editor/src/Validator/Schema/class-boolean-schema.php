<?php
/**
 * This file is part of the PooCommerce Email Editor package
 *
 * @package Automattic\PooCommerce\EmailEditor
 */

declare( strict_types = 1 );
namespace Automattic\PooCommerce\EmailEditor\Validator\Schema;

use Automattic\PooCommerce\EmailEditor\Validator\Schema;

/**
 * Represents a schema for a boolean.
 * See: https://developer.wordpress.org/rest-api/extending-the-rest-api/schema/#primitive-types
 */
class Boolean_Schema extends Schema {
	/**
	 * Schema definition.
	 *
	 * @var array
	 */
	protected $schema = array(
		'type' => 'boolean',
	);
}
