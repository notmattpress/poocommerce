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
import {
	getCategoryLabels,
	getProductLabels,
	getVariationLabels,
} from '../../../lib/async-requests';

const VARIATIONS_REPORT_CHARTS_FILTER =
	'poocommerce_admin_variations_report_charts';
const VARIATIONS_REPORT_FILTERS_FILTER =
	'poocommerce_admin_variations_report_filters';
const VARIATIONS_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_variations_report_advanced_filters';

const { addCesSurveyForAnalytics } = dispatch( CES_STORE_KEY );

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Variations Report charts filter.
 *
 * @filter poocommerce_admin_variations_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters( VARIATIONS_REPORT_CHARTS_FILTER, [
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
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Variations Report Filters.
 *
 * @filter poocommerce_admin_variations_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( VARIATIONS_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'chartType', 'paged', 'per_page' ],
		param: 'filter-variations',
		showFilters: () => true,
		filters: [
			{
				label: __( 'All variations', 'poocommerce' ),
				chartMode: 'item-comparison',
				value: 'all',
			},
			{
				label: __( 'Single variation', 'poocommerce' ),
				value: 'select_variation',
				subFilters: [
					{
						component: 'Search',
						value: 'single_variation',
						path: [ 'select_variation' ],
						settings: {
							type: 'variations',
							param: 'variations',
							getLabels: getVariationLabels,
							labels: {
								placeholder: __(
									'Type to search for a variation',
									'poocommerce'
								),
								button: __( 'Single variation', 'poocommerce' ),
							},
						},
					},
				],
			},
			{
				label: __( 'Comparison', 'poocommerce' ),
				chartMode: 'item-comparison',
				value: 'compare-variations',
				settings: {
					type: 'variations',
					param: 'variations',
					getLabels: getVariationLabels,
					labels: {
						helpText: __(
							'Check at least two variations below to compare',
							'poocommerce'
						),
						placeholder: __(
							'Search for variations to compare',
							'poocommerce'
						),
						title: __( 'Compare Variations', 'poocommerce' ),
						update: __( 'Compare', 'poocommerce' ),
					},
					onClick: addCesSurveyForAnalytics,
				},
			},
			{
				label: __( 'Advanced filters', 'poocommerce' ),
				value: 'advanced',
			},
		],
	},
] );

/**
 * Variations Report Advanced Filters.
 *
 * @filter poocommerce_admin_variations_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	VARIATIONS_REPORT_ADVANCED_FILTERS_FILTER,
	{
		title: _x(
			'Variations match <select/> filters',
			'A sentence describing filters for Variations. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ',
			'poocommerce'
		),
		filters: {
			attribute: {
				allowMultiple: true,
				labels: {
					add: __( 'Product attribute', 'poocommerce' ),
					placeholder: __(
						'Search product attributes',
						'poocommerce'
					),
					remove: __(
						'Remove product attribute filter',
						'poocommerce'
					),
					rule: __(
						'Select a product attribute filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Product attribute</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select product attributes', 'poocommerce' ),
				},
				rules: [
					{
						value: 'is',
						/* translators: Sentence fragment, logical, "Is" refers to searching for product variations matching a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Is', 'product attribute', 'poocommerce' ),
					},
					{
						value: 'is_not',
						/* translators: Sentence fragment, logical, "Is Not" refers to searching for product variations that don\'t match a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x(
							'Is Not',
							'product attribute',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'ProductAttribute',
				},
			},
			category: {
				labels: {
					add: __( 'Product category', 'poocommerce' ),
					placeholder: __(
						'Search product categories',
						'poocommerce'
					),
					remove: __(
						'Remove product category filter',
						'poocommerce'
					),
					rule: __(
						'Select a product category filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Category filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Product category</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select product categories', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to variations including a given category. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Includes', 'categories', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to variations excluding a given category. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Excludes', 'categories', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'categories',
					getLabels: getCategoryLabels,
				},
			},
			product: {
				labels: {
					add: __( 'Product', 'poocommerce' ),
					placeholder: __( 'Search products', 'poocommerce' ),
					remove: __( 'Remove product filter', 'poocommerce' ),
					rule: __( 'Select a product filter match', 'poocommerce' ),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Product</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select products', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to orders including a given product(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Includes', 'products', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given product(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Excludes', 'products', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'variableProducts',
					getLabels: getProductLabels,
				},
			},
		},
	}
);
