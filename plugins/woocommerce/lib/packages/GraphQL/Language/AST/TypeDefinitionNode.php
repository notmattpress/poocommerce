<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Language\AST;

/**
 * export type TypeDefinitionNode = ScalarTypeDefinitionNode
 * | ObjectTypeDefinitionNode
 * | InterfaceTypeDefinitionNode
 * | UnionTypeDefinitionNode
 * | EnumTypeDefinitionNode
 * | InputObjectTypeDefinitionNode.
 */
interface TypeDefinitionNode extends TypeSystemDefinitionNode
{
    public function getName(): NameNode;
}
