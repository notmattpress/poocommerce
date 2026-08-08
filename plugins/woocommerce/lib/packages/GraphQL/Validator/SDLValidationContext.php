<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Validator;

use Automattic\PooCommerce\Vendor\GraphQL\Error\Error;
use Automattic\PooCommerce\Vendor\GraphQL\Language\AST\DocumentNode;
use Automattic\PooCommerce\Vendor\GraphQL\Type\Schema;

class SDLValidationContext implements ValidationContext
{
    protected DocumentNode $ast;

    protected ?Schema $schema;

    /** @var list<Error> */
    protected array $errors = [];

    public function __construct(DocumentNode $ast, ?Schema $schema)
    {
        $this->ast = $ast;
        $this->schema = $schema;
    }

    public function reportError(Error $error): void
    {
        $this->errors[] = $error;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getDocument(): DocumentNode
    {
        return $this->ast;
    }

    public function getSchema(): ?Schema
    {
        return $this->schema;
    }
}
