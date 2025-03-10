<?php

namespace Automattic\PooCommerce\Vendor\League\Container\Exception;

use Automattic\PooCommerce\Vendor\Psr\Container\NotFoundExceptionInterface;
use InvalidArgumentException;

class NotFoundException extends InvalidArgumentException implements NotFoundExceptionInterface
{
}
