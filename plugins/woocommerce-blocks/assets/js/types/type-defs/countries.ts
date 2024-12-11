/**
 * External dependencies
 */
import { LocaleSpecificFormField } from '@poocommerce/settings';

export type CountryData = {
	allowBilling: boolean;
	allowShipping: boolean;
	states: Record< string, string >;
	locale: Record< string, LocaleSpecificFormField >;
	format?: string;
};
