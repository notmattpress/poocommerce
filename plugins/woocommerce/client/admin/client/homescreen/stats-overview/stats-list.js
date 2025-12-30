/**
 * External dependencies
 */
import { useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';
import clsx from 'clsx';
import {
	SummaryNumber,
	SummaryNumberPlaceholder,
} from '@poocommerce/components';
import { getPersistedQuery } from '@poocommerce/navigation';
import { recordEvent } from '@poocommerce/tracks';
import { CurrencyContext } from '@poocommerce/currency';

/**
 * Internal dependencies
 */
import {
	getIndicatorData,
	getIndicatorValues,
} from '../../dashboard/store-performance/utils';

export const StatsList = ( {
	stats,
	primaryData,
	secondaryData,
	primaryRequesting,
	secondaryRequesting,
	primaryError,
	secondaryError,
	query,
} ) => {
	const { formatAmount, getCurrencyConfig } = useContext( CurrencyContext );
	if ( primaryError || secondaryError ) {
		return null;
	}
	const persistedQuery = getPersistedQuery( query );
	const currency = getCurrencyConfig();

	return (
		<ul
			className={ clsx( 'poocommerce-stats-overview__stats', {
				'is-even': stats.length % 2 === 0,
			} ) }
		>
			{ stats.map( ( item ) => {
				if ( primaryRequesting || secondaryRequesting ) {
					return <SummaryNumberPlaceholder key={ item.stat } />;
				}

				const {
					primaryValue,
					secondaryValue,
					delta,
					reportUrl,
					reportUrlType,
				} = getIndicatorValues( {
					indicator: item,
					primaryData,
					secondaryData,
					currency,
					formatAmount,
					persistedQuery,
				} );

				return (
					<SummaryNumber
						isHomescreen
						key={ item.stat }
						href={ reportUrl }
						hrefType={ reportUrlType }
						label={ item.label }
						value={ primaryValue }
						prevLabel={ __( 'Previous period:', 'poocommerce' ) }
						prevValue={ secondaryValue }
						delta={ delta }
						onLinkClickCallback={ () => {
							recordEvent( 'statsoverview_indicators_click', {
								key: item.stat,
							} );
						} }
					/>
				);
			} ) }
		</ul>
	);
};

export default withSelect( ( select, { stats, query } ) => {
	return getIndicatorData( select, stats, query );
} )( StatsList );
