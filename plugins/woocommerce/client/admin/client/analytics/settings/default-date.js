/**
 * External dependencies
 */
import { DateRangeFilterPicker } from '@poocommerce/components';
import { useSettings } from '@poocommerce/data';
import {
	getCurrentDates,
	getDateParamsFromQuery,
	isoDateFormat,
} from '@poocommerce/date';

const DefaultDate = ( { value, onChange } ) => {
	const { wcAdminSettings } = useSettings( 'wc_admin', [
		'wcAdminSettings',
	] );
	const { poocommerce_default_date_range: defaultDateRange } =
		wcAdminSettings;
	const change = ( query ) => {
		const sanitizedQuery = Object.fromEntries(
			Object.entries( query ).filter(
				( [ , queryValue ] ) => typeof queryValue !== 'undefined'
			)
		);
		onChange( {
			target: {
				name: 'poocommerce_default_date_range',
				value: new URLSearchParams( sanitizedQuery ).toString(),
			},
		} );
	};
	const query = Object.fromEntries(
		new URLSearchParams( value.replace( /&amp;/g, '&' ) )
	);
	const { period, compare, before, after } = getDateParamsFromQuery(
		query,
		defaultDateRange
	);
	const { primary: primaryDate, secondary: secondaryDate } = getCurrentDates(
		query,
		defaultDateRange
	);
	const dateQuery = {
		period,
		compare,
		before,
		after,
		primaryDate,
		secondaryDate,
	};
	return (
		<DateRangeFilterPicker
			query={ query }
			onRangeSelect={ change }
			dateQuery={ dateQuery }
			isoDateFormat={ isoDateFormat }
		/>
	);
};

export default DefaultDate;
