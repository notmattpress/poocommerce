<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\FragmentDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\OperationDefinitionNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor;
use Automattic\PooCommerce\Vendor\GraphQL\Language\VisitorOperation;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;

class NoUnusedFragments extends ValidationRule
{
    /** @var array<int, OperationDefinitionNode> */
    protected array $operationDefs;

    /** @var array<int, FragmentDefinitionNode> */
    protected array $fragmentDefs;

    public function getVisitor(QueryValidationContext $context): array
    {
        $this->operationDefs = [];
        $this->fragmentDefs = [];

        return [
            NodeKind::OPERATION_DEFINITION => function ($node): VisitorOperation {
                $this->operationDefs[] = $node;

                return Visitor::skipNode();
            },
            NodeKind::FRAGMENT_DEFINITION => function (FragmentDefinitionNode $def): VisitorOperation {
                $this->fragmentDefs[] = $def;

                return Visitor::skipNode();
            },
            NodeKind::DOCUMENT => [
                'leave' => function () use ($context): void {
                    $fragmentNameUsed = [];

                    foreach ($this->operationDefs as $operation) {
                        foreach ($context->getRecursivelyReferencedFragments($operation) as $fragment) {
                            $fragmentNameUsed[$fragment->name->value] = true;
                        }
                    }

                    foreach ($this->fragmentDefs as $fragmentDef) {
                        $fragName = $fragmentDef->name->value;

                        if (! isset($fragmentNameUsed[$fragName])) {
                            $context->reportError(new Error(
                                static::unusedFragMessage($fragName),
                                [$fragmentDef]
                            ));
                        }
                    }
                },
            ],
        ];
    }

    public static function unusedFragMessage(string $fragName): string
    {
        return "Fragment \"{$fragName}\" is never used.";
    }
}
