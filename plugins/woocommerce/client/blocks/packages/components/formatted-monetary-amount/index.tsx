/**
 * External dependencies
 */
import NumberFormat from 'react-number-format';
import type {
	NumberFormatValues,
	NumberFormatProps,
} from 'react-number-format';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import type { Currency } from '@poocommerce/types';
import { SITE_CURRENCY } from '@poocommerce/settings';
import { decodeHtmlEntities } from '@poocommerce/utils';

/**
 * Internal dependencies
 */
import './style.scss';

export interface FormattedMonetaryAmountProps
	extends Omit< NumberFormatProps, 'onValueChange' | 'displayType' > {
	className?: string;
	displayType?: NumberFormatProps[ 'displayType' ] | undefined;
	allowNegative?: boolean;
	isAllowed?: ( formattedValue: NumberFormatValues ) => boolean;
	value: number | string; // Value of money amount.
	currency?: Currency | undefined; // Currency configuration object. Defaults to site currency.
	onValueChange?: ( unit: number ) => void; // Function to call when value changes.
	style?: React.CSSProperties | undefined;
	renderText?: ( value: string ) => JSX.Element;
}

/**
 * Formats currency data into the expected format for NumberFormat.
 */
const currencyToNumberFormat = ( currency: Currency ) => {
	const { prefix, suffix, thousandSeparator, decimalSeparator } = currency;
	// Decode HTML entities in separators
	const decodedThousandSeparator = decodeHtmlEntities( thousandSeparator );
	const decodedDecimalSeparator = decodeHtmlEntities( decimalSeparator );

	const hasDuplicateSeparator =
		decodedThousandSeparator === decodedDecimalSeparator;
	if ( hasDuplicateSeparator ) {
		// eslint-disable-next-line no-console
		console.warn(
			'Thousand separator and decimal separator are the same. This may cause formatting issues.'
		);
	}
	return {
		thousandSeparator: hasDuplicateSeparator
			? ''
			: decodedThousandSeparator,
		decimalSeparator: decodedDecimalSeparator,
		fixedDecimalScale: true,
		prefix: decodeHtmlEntities( prefix ),
		suffix: decodeHtmlEntities( suffix ),
		isNumericString: true,
	};
};

/**
 * FormattedMonetaryAmount component.
 *
 * Takes a price and returns a formatted price using the NumberFormat component.
 *
 * More detailed docs on the additional props can be found here:https://s-yadav.github.io/react-number-format/docs/intro
 */
const FormattedMonetaryAmount = ( {
	className,
	value: rawValue,
	currency: rawCurrency = SITE_CURRENCY,
	onValueChange,
	displayType = 'text',
	...props
}: FormattedMonetaryAmountProps ): ReactElement | null => {
	// Merge currency configuration with site currency.
	const currency = {
		...SITE_CURRENCY,
		...rawCurrency,
	};

	// Convert values to int.
	const value =
		typeof rawValue === 'string' ? parseInt( rawValue, 10 ) : rawValue;

	if ( ! Number.isFinite( value ) ) {
		return null;
	}

	const priceValue = value / 10 ** currency.minorUnit;

	if ( ! Number.isFinite( priceValue ) ) {
		return null;
	}

	// If we have rtl character in the prefix, we need to set the direction to ltr
	// to avoid the price being displayed in the wrong direction.
	const rtlPrefixStyles =
		currency?.prefix && currency.prefix !== ''
			? {
					unicodeBidi: 'bidi-override' as const,
					direction: 'ltr' as const,
			  }
			: {};

	const classes = clsx(
		'wc-block-formatted-money-amount',
		'wc-block-components-formatted-money-amount',
		className
	);
	const decimalScale = props.decimalScale ?? currency?.minorUnit;
	const numberFormatProps = {
		...props,
		...currencyToNumberFormat( currency ),
		decimalScale,
		value: undefined,
		currency: undefined,
		onValueChange: undefined,
		style: {
			...props.style,
			...rtlPrefixStyles,
		},
	};

	// Wrapper for NumberFormat onValueChange which handles subunit conversion.
	const onValueChangeWrapper = onValueChange
		? ( values: NumberFormatValues ) => {
				const minorUnitValue = +values.value * 10 ** currency.minorUnit;
				onValueChange( minorUnitValue );
		  }
		: () => void 0;

	return (
		<span className="wc-block-number-format-container">
			<NumberFormat
				className={ classes }
				displayType={ displayType }
				{ ...numberFormatProps }
				value={ priceValue }
				onValueChange={ onValueChangeWrapper }
			/>
		</span>
	);
};

export default FormattedMonetaryAmount;
