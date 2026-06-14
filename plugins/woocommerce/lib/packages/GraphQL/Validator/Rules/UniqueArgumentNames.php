<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\ArgumentNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NameNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor;
use Automattic\PooCommerce\Vendor\GraphQL\Language\VisitorOperation;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\SDLValidationContext;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\ValidationContext;

/**
 * @phpstan-import-type VisitorArray from Visitor
 */
class UniqueArgumentNames extends ValidationRule
{
    /** @var array<string, NameNode> */
    protected array $knownArgNames;

    public function getSDLVisitor(SDLValidationContext $context): array
    {
        return $this->getASTVisitor($context);
    }

    public function getVisitor(QueryValidationContext $context): array
    {
        return $this->getASTVisitor($context);
    }

    /** @phpstan-return VisitorArray */
    public function getASTVisitor(ValidationContext $context): array
    {
        $this->knownArgNames = [];

        return [
            NodeKind::FIELD => function (): void {
                $this->knownArgNames = [];
            },
            NodeKind::DIRECTIVE => function (): void {
                $this->knownArgNames = [];
            },
            NodeKind::ARGUMENT => function (ArgumentNode $node) use ($context): VisitorOperation {
                $argName = $node->name->value;
                if (isset($this->knownArgNames[$argName])) {
                    $context->reportError(new Error(
                        static::duplicateArgMessage($argName),
                        [$this->knownArgNames[$argName], $node->name]
                    ));
                } else {
                    $this->knownArgNames[$argName] = $node->name;
                }

                return Visitor::skipNode();
            },
        ];
    }

    public static function duplicateArgMessage(string $argName): string
    {
        return "There can be only one argument named \"{$argName}\".";
    }
}
