<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\DocumentNode;
use Automattic\PooCommerce\Vendor\GraphQL\Type\Schema;

interface ValidationContext
{
    public function reportError(Error $error): void;

    /** @return list<Error> */
    public function getErrors(): array;

    public function getDocument(): DocumentNode;

    public function getSchema(): ?Schema;
}
