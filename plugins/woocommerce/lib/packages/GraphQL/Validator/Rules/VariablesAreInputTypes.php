<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\VariableDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\Printer;
use Automattic\PooCommerce\Vendor\GraphQL\Type\Definition\Type;
use Automattic\PooCommerce\Vendor\GraphQL\Utils\AST;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;

class VariablesAreInputTypes extends ValidationRule
{
    public function getVisitor(QueryValidationContext $context): array
    {
        return [
            NodeKind::VARIABLE_DEFINITION => static function (VariableDefinitionNode $node) use ($context): void {
                $type = AST::typeFromAST([$context->getSchema(), 'getType'], $node->type);

                // If the variable type is not an input type, return an error.
                if ($type === null || Type::isInputType($type)) {
                    return;
                }

                $variableName = $node->variable->name->value;
                $context->reportError(new Error(
                    static::nonInputTypeOnVarMessage($variableName, Printer::doPrint($node->type)),
                    [$node->type]
                ));
            },
        ];
    }

    public static function nonInputTypeOnVarMessage(string $variableName, string $typeName): string
    {
        return "Variable \"\${$variableName}\" cannot be non-input type \"{$typeName}\".";
    }
}
