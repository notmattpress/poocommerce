<?php

namespace Automattic\PooCommerce\Vendor\Sabberworm\CSS\Parsing;

use Automattic\PooCommerce\Vendor\Sabberworm\CSS\Position\Position;
use Automattic\PooCommerce\Vendor\Sabberworm\CSS\Position\Positionable;

class SourceException extends \Exception implements Positionable
{
    use Position;

    /**
     * @param string $sMessage
     * @param int $iLineNo
     */
    public function __construct($sMessage, $iLineNo = 0)
    {
        $this->setPosition($iLineNo);
        if (!empty($iLineNo)) {
            $sMessage .= " [line no: $iLineNo]";
        }
        parent::__construct($sMessage);
    }
}
