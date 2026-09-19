<?php
namespace Automattic\PooCommerce\StoreApi\Formatters;

use Automattic\PooCommerce\Enums\CurrencyPosition;
use Automattic\PooCommerce\Internal\Utilities\PriceSeparators;

/**
 * Currency Formatter.
 *
 * Formats an array of monetary values by inserting currency data.
 */
class CurrencyFormatter implements FormatterInterface {
	/**
	 * Format a given value and return the result.
	 *
	 * @param array $value Value to format.
	 * @param array $options Options that influence the formatting.
	 * @return array
	 */
	public function format( $value, array $options = [] ) {
		$position = get_option( 'poocommerce_currency_pos' );
		$symbol   = html_entity_decode( get_poocommerce_currency_symbol() );
		$prefix   = '';
		$suffix   = '';

		switch ( $position ) {
			case CurrencyPosition::LEFT_SPACE:
				$prefix = $symbol . ' ';
				break;
			case CurrencyPosition::LEFT:
				$prefix = $symbol;
				break;
			case CurrencyPosition::RIGHT_SPACE:
				$suffix = ' ' . $symbol;
				break;
			case CurrencyPosition::RIGHT:
				$suffix = $symbol;
				break;
		}

		return array_merge(
			(array) $value,
			[
				'currency_code'               => get_poocommerce_currency(),
				'currency_symbol'             => $symbol,
				'currency_minor_unit'         => wc_get_price_decimals(),
				'currency_decimal_separator'  => PriceSeparators::get_decimal(),
				'currency_thousand_separator' => PriceSeparators::get_thousand(),
				'currency_prefix'             => $prefix,
				'currency_suffix'             => $suffix,
			]
		);
	}
}
