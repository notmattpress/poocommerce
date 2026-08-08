<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Type\Definition;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Error\SerializationError;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\Node;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\ValueNode;

/*
export type GraphQLLeafType =
GraphQLScalarType |
GraphQLEnumType;
*/

interface LeafType
{
    /**
     * Serializes an internal value to include in a response.
     *
     * Should throw an exception on invalid values.
     *
     * @param mixed $value
     *
     * @throws SerializationError
     *
     * @return mixed
     */
    public function serialize($value);

    /**
     * Parses an externally provided value (query variable) to use as an input.
     *
     * Should throw an exception with a client-friendly message on invalid values, @see ClientAware.
     *
     * @param mixed $value
     *
     * @throws Error
     *
     * @return mixed
     */
    public function parseValue($value);

    /**
     * Parses an externally provided literal value (hardcoded in Automattic\PooCommerce\Vendor\GraphQL query) to use as an input.
     *
     * Should throw an exception with a client-friendly message on invalid value nodes, @see ClientAware.
     *
     * @param ValueNode&Node $valueNode
     * @param array<string, mixed>|null $variables
     *
     * @throws Error
     *
     * @return mixed
     */
    public function parseLiteral(Node $valueNode, ?array $variables = null);
}
