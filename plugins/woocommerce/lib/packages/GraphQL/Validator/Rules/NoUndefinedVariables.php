<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\OperationDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\VariableDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;

/**
 * A Automattic\PooCommerce\Vendor\GraphQL operation is only valid if all variables encountered, both directly
 * and via fragment spreads, are defined by that operation.
 */
class NoUndefinedVariables extends ValidationRule
{
    public function getVisitor(QueryValidationContext $context): array
    {
        /** @var array<string, true> $variableNameDefined */
        $variableNameDefined = [];

        return [
            NodeKind::OPERATION_DEFINITION => [
                'enter' => static function () use (&$variableNameDefined): void {
                    $variableNameDefined = [];
                },
                'leave' => static function (OperationDefinitionNode $operation) use (&$variableNameDefined, $context): void {
                    $usages = $context->getRecursiveVariableUsages($operation);

                    foreach ($usages as $usage) {
                        $node = $usage['node'];
                        $varName = $node->name->value;

                        if (! isset($variableNameDefined[$varName])) {
                            $context->reportError(new Error(
                                static::undefinedVarMessage(
                                    $varName,
                                    $operation->name !== null
                                        ? $operation->name->value
                                        : null
                                ),
                                [$node, $operation]
                            ));
                        }
                    }
                },
            ],
            NodeKind::VARIABLE_DEFINITION => static function (VariableDefinitionNode $def) use (&$variableNameDefined): void {
                $variableNameDefined[$def->variable->name->value] = true;
            },
        ];
    }

    public static function undefinedVarMessage(string $varName, ?string $opName): string
    {
        return $opName === null
            ? "Variable \"\${$varName}\" is not defined by operation \"{$opName}\"."
            : "Variable \"\${$varName}\" is not defined.";
    }
}
