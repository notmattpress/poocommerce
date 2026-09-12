/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	getCustomerLabels,
	getProductLabels,
} from '../../../lib/async-requests';

const DOWNLOADS_REPORT_CHARTS_FILTER =
	'poocommerce_admin_downloads_report_charts';
const DOWNLOADS_REPORT_FILTERS_FILTER =
	'poocommerce_admin_downloads_report_filters';
const DOWNLOADS_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_downloads_report_advanced_filters';

/**
 * @typedef {import('../index.js').chart} chart
 */

/**
 * Downloads Report charts filter.
 *
 * @filter poocommerce_admin_downloads_report_charts
 * @param {Array.<chart>} charts Report charts.
 */
export const charts = applyFilters( DOWNLOADS_REPORT_CHARTS_FILTER, [
	{
		key: 'download_count',
		label: __( 'Downloads', 'poocommerce' ),
		type: 'number',
	},
] );

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Downloads Report Filters.
 *
 * @filter poocommerce_admin_downloads_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( DOWNLOADS_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'chartType', 'paged', 'per_page' ],
		param: 'filter',
		showFilters: () => true,
		filters: [
			{ label: __( 'All downloads', 'poocommerce' ), value: 'all' },
			{
				label: __( 'Advanced filters', 'poocommerce' ),
				value: 'advanced',
			},
		],
	},
] );

/**
 * Downloads Report Advanced Filters.
 *
 * @filter poocommerce_admin_downloads_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	DOWNLOADS_REPORT_ADVANCED_FILTERS_FILTER,
	{
		title: _x(
			'Downloads match <select/> filters',
			'A sentence describing filters for Downloads. See screen shot for context: https://cloudup.com/ccxhyH2mEDg',
			'poocommerce'
		),
		filters: {
			product: {
				labels: {
					add: __( 'Product', 'poocommerce' ),
					placeholder: __( 'Search', 'poocommerce' ),
					remove: __( 'Remove product filter', 'poocommerce' ),
					rule: __( 'Select a product filter match', 'poocommerce' ),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
					title: __(
						'<title>Product</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select product', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to products including a given product(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Includes', 'products', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to products excluding a products(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Excludes', 'products', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'products',
					getLabels: getProductLabels,
				},
			},
			customer: {
				labels: {
					add: __( 'Customer', 'poocommerce' ),
					placeholder: __( 'Search customer', 'poocommerce' ),
					remove: __( 'Remove customer filter', 'poocommerce' ),
					rule: __( 'Select a customer filter match', 'poocommerce' ),
					/* translators: A sentence describing a customer filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
					title: __(
						'<title>Customer</title> <rule/> <filter />',
						'poocommerce'
					),
					filter: __( 'Select customer', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to customers including a given customer(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Includes', 'customers', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to customers excluding a given customer(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Excludes', 'customers', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					// The report matches customers to downloads through their
					// user id, which guests don't have, so only registered
					// customers can be offered.
					type: 'registeredCustomers',
					getLabels: getCustomerLabels,
				},
			},
			order: {
				labels: {
					add: __( 'Order #', 'poocommerce' ),
					placeholder: __( 'Search order number', 'poocommerce' ),
					remove: __( 'Remove order number filter', 'poocommerce' ),
					rule: __(
						'Select an order number filter match',
						'poocommerce'
					),
					/* translators: A sentence describing an order number filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
					title: __(
						'<title>Order #</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select order number', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to order numbers including a given order(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Includes', 'order numbers', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to order numbers excluding a given order(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Excludes', 'order numbers', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'orders',
					getLabels: async ( value ) => {
						const orderIds = value.split( ',' );
						return await orderIds.map( ( orderId ) => ( {
							id: orderId,
							label: '#' + orderId,
						} ) );
					},
				},
			},
			ip_address: {
				labels: {
					add: __( 'IP Address', 'poocommerce' ),
					placeholder: __( 'Search IP address', 'poocommerce' ),
					remove: __( 'Remove IP address filter', 'poocommerce' ),
					rule: __(
						'Select an IP address filter match',
						'poocommerce'
					),
					/* translators: A sentence describing an order number filter. See screen shot for context: https://cloudup.com/ccxhyH2mEDg */
					title: __(
						'<title>IP Address</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select IP address', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to IP addresses including a given address(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Includes', 'IP addresses', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to IP addresses excluding a given address(s). Screenshot for context: https://cloudup.com/ccxhyH2mEDg */
						label: _x( 'Excludes', 'IP addresses', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'downloadIps',
					getLabels: async ( value ) => {
						const ips = value.split( ',' );
						return await ips.map( ( ip ) => {
							return {
								id: ip,
								label: ip,
							};
						} );
					},
				},
			},
		},
	}
);
