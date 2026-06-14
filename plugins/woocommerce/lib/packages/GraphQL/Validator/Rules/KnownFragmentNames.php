<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\FragmentSpreadNode;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\NodeKind;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;

class KnownFragmentNames extends ValidationRule
{
    public function getVisitor(QueryValidationContext $context): array
    {
        return [
            NodeKind::FRAGMENT_SPREAD => static function (FragmentSpreadNode $node) use ($context): void {
                $fragmentName = $node->name->value;
                $fragment = $context->getFragment($fragmentName);
                if ($fragment !== null) {
                    return;
                }

                $context->reportError(new Error(
                    static::unknownFragmentMessage($fragmentName),
                    [$node->name]
                ));
            },
        ];
    }

    public static function unknownFragmentMessage(string $fragName): string
    {
        return "Unknown fragment \"{$fragName}\".";
    }
}
