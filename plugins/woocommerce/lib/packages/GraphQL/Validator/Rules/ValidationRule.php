<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator\Rules;

use Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\QueryValidationContext;
use Automattic\PooCommerce\Vendor\GraphQL\Validator\SDLValidationContext;

/**
 * @phpstan-import-type VisitorArray from Visitor
 */
abstract class ValidationRule
{
    protected string $name;

    public function getName(): string
    {
        return $this->name ?? static::class;
    }

    /**
     * Returns structure suitable for @see \Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor.
     *
     * @phpstan-return VisitorArray
     */
    public function getVisitor(QueryValidationContext $context): array
    {
        return [];
    }

    /**
     * Returns structure suitable for @see \Automattic\PooCommerce\Vendor\GraphQL\Language\Visitor.
     *
     * @phpstan-return VisitorArray
     */
    public function getSDLVisitor(SDLValidationContext $context): array
    {
        return [];
    }
}
