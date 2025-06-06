/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { STORE_KEY as CES_STORE_KEY } from '@poocommerce/customer-effort-score';

/**
 * Internal dependencies
 */
import { getCategoryLabels } from '../../../lib/async-requests';

const CATEGORY_REPORT_CHARTS_FILTER =
	'poocommerce_admin_categories_report_charts';
const CATEGORY_REPORT_FILTERS_FILTER =
	'poocommerce_admin_categories_report_filters';
const CATEGORY_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_category_report_advanced_filters';

const { addCesSurveyForAnalytics } = dispatch( CES_STORE_KEY );

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Category Report charts filter.
 *
 * @filter poocommerce_admin_categories_report_charts
 * @param {Array.<chart>} charts Category Report charts.
 */
export const charts = applyFilters( CATEGORY_REPORT_CHARTS_FILTER, [
	{
		key: 'items_sold',
		label: __( 'Items sold', 'poocommerce' ),
		order: 'desc',
		orderby: 'items_sold',
		type: 'number',
	},
	{
		key: 'net_revenue',
		label: __( 'Net sales', 'poocommerce' ),
		order: 'desc',
		orderby: 'net_revenue',
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
 * Category Report Advanced Filters.
 *
 * @filter poocommerce_admin_category_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	CATEGORY_REPORT_ADVANCED_FILTERS_FILTER,
	{
		filters: {},
		title: _x(
			'Categories match <select/> filters',
			'A sentence describing filters for Categories. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ',
			'poocommerce'
		),
	}
);

const filterValues = [
	{
		label: __( 'All categories', 'poocommerce' ),
		value: 'all',
	},
	{
		label: __( 'Single category', 'poocommerce' ),
		value: 'select_category',
		chartMode: 'item-comparison',
		subFilters: [
			{
				component: 'Search',
				value: 'single_category',
				chartMode: 'item-comparison',
				path: [ 'select_category' ],
				settings: {
					type: 'categories',
					param: 'categories',
					getLabels: getCategoryLabels,
					labels: {
						placeholder: __(
							'Type to search for a category',
							'poocommerce'
						),
						button: __( 'Single Category', 'poocommerce' ),
					},
				},
			},
		],
	},
	{
		label: __( 'Comparison', 'poocommerce' ),
		value: 'compare-categories',
		chartMode: 'item-comparison',
		settings: {
			type: 'categories',
			param: 'categories',
			getLabels: getCategoryLabels,
			labels: {
				helpText: __(
					'Check at least two categories below to compare',
					'poocommerce'
				),
				placeholder: __(
					'Search for categories to compare',
					'poocommerce'
				),
				title: __( 'Compare Categories', 'poocommerce' ),
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
 * Category Report Filters.
 *
 * @filter poocommerce_admin_categories_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( CATEGORY_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'chartType', 'paged', 'per_page' ],
		param: 'filter',
		showFilters: () => true,
		filters: filterValues,
	},
] );
