<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\DocumentNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\ExecutableDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\SchemaDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\SchemaExtensionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\TypeDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\TypeExtensionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor;
use Automattic\PooCommerce\Vendor\GraphQL\Language\VisitorOperation;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;

/**
 * Executable definitions.
 *
 * A Automattic\PooCommerce\Vendor\GraphQL document is only valid for execution if all definitions are either
 * operation or fragment definitions.
 */
class ExecutableDefinitions extends ValidationRule
{
    public function getVisitor(QueryValidationContext $context): array
    {
        return [
            NodeKind::DOCUMENT => static function (DocumentNode $node) use ($context): VisitorOperation {
                foreach ($node->definitions as $definition) {
                    if (! $definition instanceof ExecutableDefinitionNode) {
                        if ($definition instanceof SchemaDefinitionNode || $definition instanceof SchemaExtensionNode) {
                            $defName = 'schema';
                        } else {
                            assert(
                                $definition instanceof TypeDefinitionNode || $definition instanceof TypeExtensionNode,
                                'only other option'
                            );
                            $defName = "\"{$definition->getName()->value}\"";
                        }

                        $context->reportError(new Error(
                            static::nonExecutableDefinitionMessage($defName),
                            [$definition]
                        ));
                    }
                }

                return Visitor::skipNode();
            },
        ];
    }

    public static function nonExecutableDefinitionMessage(string $defName): string
    {
        return "The {$defName} definition is not executable.";
    }
}
