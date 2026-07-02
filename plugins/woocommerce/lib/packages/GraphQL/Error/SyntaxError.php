<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Error;

use Automattic\PooCommerce\Vendor\GraphQL\Language\Source;

class SyntaxError extends Error
{
    public function __construct(Source $source, int $position, string $description)
    {
        parent::__construct(
            "Syntax Error: {$description}",
            null,
            $source,
            [$position]
        );
    }
}
