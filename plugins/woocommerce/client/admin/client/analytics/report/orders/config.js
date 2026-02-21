/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	getCouponLabels,
	getProductLabels,
	getTaxRateLabels,
	getVariationLabels,
} from '../../../lib/async-requests';
import { ORDER_STATUSES } from '~/utils/admin-settings';

const ORDERS_REPORT_CHARTS_FILTER = 'poocommerce_admin_orders_report_charts';
const ORDERS_REPORT_FILTERS_FILTER = 'poocommerce_admin_orders_report_filters';
const ORDERS_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_orders_report_advanced_filters';

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Orders Report charts filter.
 *
 * @filter poocommerce_admin_orders_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters( ORDERS_REPORT_CHARTS_FILTER, [
	{
		key: 'orders_count',
		label: __( 'Orders', 'poocommerce' ),
		type: 'number',
	},
	{
		key: 'net_revenue',
		label: __( 'Net sales', 'poocommerce' ),
		order: 'desc',
		orderby: 'net_total',
		type: 'currency',
	},
	{
		key: 'avg_order_value',
		label: __( 'Average order value', 'poocommerce' ),
		type: 'currency',
	},
	{
		key: 'avg_items_per_order',
		label: __( 'Average items per order', 'poocommerce' ),
		order: 'desc',
		orderby: 'num_items_sold',
		type: 'average',
	},
] );

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Orders Report Filters.
 *
 * @filter poocommerce_admin_orders_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( ORDERS_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'chartType', 'paged', 'per_page' ],
		param: 'filter',
		showFilters: () => true,
		filters: [
			{ label: __( 'All orders', 'poocommerce' ), value: 'all' },
			{
				label: __( 'Advanced filters', 'poocommerce' ),
				value: 'advanced',
			},
		],
	},
] );

/*eslint-disable max-len*/

/**
 * Orders Report Advanced Filters.
 *
 * @filter poocommerce_admin_orders_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	ORDERS_REPORT_ADVANCED_FILTERS_FILTER,
	{
		title: _x(
			'Orders match <select/> filters',
			'A sentence describing filters for Orders. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ',
			'poocommerce'
		),
		filters: {
			status: {
				labels: {
					add: __( 'Order status', 'poocommerce' ),
					remove: __( 'Remove order status filter', 'poocommerce' ),
					rule: __(
						'Select an order status filter match',
						'poocommerce'
					),
					/* translators: A sentence describing an Order Status filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Order status</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select an order status', 'poocommerce' ),
				},
				rules: [
					{
						value: 'is',
						/* translators: Sentence fragment, logical, "Is" refers to searching for orders matching a chosen order status. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Is', 'order status', 'poocommerce' ),
					},
					{
						value: 'is_not',
						/* translators: Sentence fragment, logical, "Is Not" refers to searching for orders that don\'t match a chosen order status. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Is Not', 'order status', 'poocommerce' ),
					},
				],
				input: {
					component: 'SelectControl',
					options: Object.keys( ORDER_STATUSES ).map( ( key ) => ( {
						value: key,
						label: ORDER_STATUSES[ key ],
					} ) ),
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
					type: 'products',
					getLabels: getProductLabels,
				},
			},
			variation: {
				labels: {
					add: __( 'Product variation', 'poocommerce' ),
					placeholder: __(
						'Search product variations',
						'poocommerce'
					),
					remove: __(
						'Remove product variation filter',
						'poocommerce'
					),
					rule: __(
						'Select a product variation filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Variation filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Product variation</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select variation', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to orders including a given variation(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Includes', 'variations', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given variation(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Excludes', 'variations', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'variations',
					getLabels: getVariationLabels,
				},
			},
			coupon: {
				labels: {
					add: __( 'Coupon code', 'poocommerce' ),
					placeholder: __( 'Search coupons', 'poocommerce' ),
					remove: __( 'Remove coupon filter', 'poocommerce' ),
					rule: __( 'Select a coupon filter match', 'poocommerce' ),
					/* translators: A sentence describing a Coupon filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Coupon code</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select coupon codes', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to orders including a given coupon code(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Includes', 'coupon code', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given coupon code(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Excludes', 'coupon code', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'coupons',
					getLabels: getCouponLabels,
				},
			},
			customer_type: {
				labels: {
					add: __( 'Customer type', 'poocommerce' ),
					remove: __( 'Remove customer filter', 'poocommerce' ),
					rule: __( 'Select a customer filter match', 'poocommerce' ),
					/* translators: A sentence describing a Customer filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Customer is</title> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select a customer type', 'poocommerce' ),
				},
				input: {
					component: 'SelectControl',
					options: [
						{
							value: 'new',
							label: __( 'New', 'poocommerce' ),
						},
						{
							value: 'returning',
							label: __( 'Returning', 'poocommerce' ),
						},
					],
					defaultOption: 'new',
				},
			},
			refunds: {
				labels: {
					add: __( 'Refund', 'poocommerce' ),
					remove: __( 'Remove refund filter', 'poocommerce' ),
					rule: __( 'Select a refund filter match', 'poocommerce' ),
					title: __(
						'<title>Refund</title> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select a refund type', 'poocommerce' ),
				},
				input: {
					component: 'SelectControl',
					options: [
						{
							value: 'all',
							label: __( 'All', 'poocommerce' ),
						},
						{
							value: 'partial',
							label: __( 'Partially refunded', 'poocommerce' ),
						},
						{
							value: 'full',
							label: __( 'Fully refunded', 'poocommerce' ),
						},
						{
							value: 'none',
							label: __( 'None', 'poocommerce' ),
						},
					],
					defaultOption: 'all',
				},
			},
			tax_rate: {
				labels: {
					add: __( 'Tax rate', 'poocommerce' ),
					placeholder: __( 'Search tax rates', 'poocommerce' ),
					remove: __( 'Remove tax rate filter', 'poocommerce' ),
					rule: __( 'Select a tax rate filter match', 'poocommerce' ),
					/* translators: A sentence describing a tax rate filter. See screen shot for context: https://cloudup.com/cSsUY9VeCVJ */
					title: __(
						'<title>Tax Rate</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select tax rates', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to orders including a given tax rate(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Includes', 'tax rate', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to orders excluding a given tax rate(s). Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Excludes', 'tax rate', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'taxes',
					getLabels: getTaxRateLabels,
				},
			},
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
					filter: __( 'Select attributes', 'poocommerce' ),
				},
				rules: [
					{
						value: 'is',
						/* translators: Sentence fragment, logical, "Is" refers to searching for products matching a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
						label: _x( 'Is', 'product attribute', 'poocommerce' ),
					},
					{
						value: 'is_not',
						/* translators: Sentence fragment, logical, "Is Not" refers to searching for products that don\'t match a chosen attribute. Screenshot for context: https://cloudup.com/cSsUY9VeCVJ */
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
		},
	}
);
/*eslint-enable max-len*/
