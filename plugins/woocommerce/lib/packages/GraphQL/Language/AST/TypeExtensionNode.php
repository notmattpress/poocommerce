<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Language\AST;

/**
 * export type TypeExtensionNode =
 * | ScalarTypeExtensionNode
 * | ObjectTypeExtensionNode
 * | InterfaceTypeExtensionNode
 * | UnionTypeExtensionNode
 * | EnumTypeExtensionNode
 * | InputObjectTypeExtensionNode;.
 */
interface TypeExtensionNode extends TypeSystemExtensionNode
{
    public function getName(): NameNode;
}
