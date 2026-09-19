/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { STORE_KEY as CES_STORE_KEY } from '@poocommerce/customer-effort-score';
import { NAMESPACE } from '@poocommerce/data';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getRequestByIdString } from '../../../lib/async-requests';
import { getTaxCode } from './utils';

const TAXES_REPORT_CHARTS_FILTER = 'poocommerce_admin_taxes_report_charts';
const TAXES_REPORT_FILTERS_FILTER = 'poocommerce_admin_taxes_report_filters';
const TAXES_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_taxes_report_advanced_filters';

const { addCesSurveyForAnalytics } = dispatch( CES_STORE_KEY );

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Taxes Report charts filter.
 *
 * @filter poocommerce_admin_taxes_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters( TAXES_REPORT_CHARTS_FILTER, [
	{
		key: 'total_tax',
		label: __( 'Total tax', 'poocommerce' ),
		order: 'desc',
		orderby: 'total_tax',
		type: 'currency',
	},
	{
		key: 'order_tax',
		label: __( 'Order tax', 'poocommerce' ),
		order: 'desc',
		orderby: 'order_tax',
		type: 'currency',
	},
	{
		key: 'shipping_tax',
		label: __( 'Shipping tax', 'poocommerce' ),
		order: 'desc',
		orderby: 'shipping_tax',
		type: 'currency',
	},
	{
		key: 'orders_count',
		label: __( 'Orders', 'poocommerce' ),
		order: 'desc',
		orderby: 'orders_count',
		type: 'number',
	},
] );

/**
 * Taxes Report Advanced Filters.
 *
 * @filter poocommerce_admin_taxes_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	TAXES_REPORT_ADVANCED_FILTERS_FILTER,
	{
		filters: {},
		title: _x(
			'Taxes match <select/> filters',
			'A sentence describing filters for Taxes. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ',
			'poocommerce'
		),
	}
);

const filterValues = [
	{ label: __( 'All taxes', 'poocommerce' ), value: 'all' },
	{
		label: __( 'Comparison', 'poocommerce' ),
		value: 'compare-taxes',
		chartMode: 'item-comparison',
		settings: {
			type: 'taxes',
			param: 'taxes',
			getLabels: getRequestByIdString(
				NAMESPACE + '/taxes',
				( tax ) => ( {
					id: tax.id,
					key: tax.id,
					label: getTaxCode( tax ),
				} )
			),
			labels: {
				helpText: __(
					'Check at least two tax codes below to compare',
					'poocommerce'
				),
				placeholder: __(
					'Search for tax codes to compare',
					'poocommerce'
				),
				title: __( 'Compare Tax Codes', 'poocommerce' ),
				update: __( 'Compare', 'poocommerce' ),
			},
			onClick: addCesSurveyForAnalytics,
		},
	},
];

if ( Object.keys( advancedFilters.filters ).length ) {
	filterValues.push( {
		label: __( 'Advanced filters', 'poocommerce' ),
		value: 'advanced',
	} );
}

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Coupons Report Filters.
 *
 * @filter poocommerce_admin_taxes_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( TAXES_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'chartType', 'paged', 'per_page' ],
		param: 'filter',
		showFilters: () => true,
		filters: filterValues,
	},
] );
