<?php declare(strict_types=1);

namespace Automattic\PooCommerce\Vendor\GraphQL\Server;

use Automattic\PooCommerce\Vendor\GraphQL\Error\ClientAware;

class RequestError extends \Exception implements ClientAware
{
    public function isClientSafe(): bool
    {
        return true;
    }
}
