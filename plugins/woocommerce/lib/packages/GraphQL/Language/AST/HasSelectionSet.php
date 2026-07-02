<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Language\AST;

/**
 * export type DefinitionNode = OperationDefinitionNode
 *                        | FragmentDefinitionNode.
 */
interface HasSelectionSet
{
    public function getSelectionSet(): SelectionSetNode;
}
