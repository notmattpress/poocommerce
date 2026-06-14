/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import { resolveSelect } from '@wordpress/data';
import { NAMESPACE, COUNTRIES_STORE_NAME } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import {
	getCustomerLabels,
	getRequestByIdString,
} from '../../../lib/async-requests';

const CUSTOMERS_REPORT_FILTERS_FILTER =
	'poocommerce_admin_customers_report_filters';
const CUSTOMERS_REPORT_ADVANCED_FILTERS_FILTER =
	'poocommerce_admin_customers_report_advanced_filters';

/**
 * @typedef {import('../index.js').filter} filter
 */

/**
 * Customers Report Filters.
 *
 * @filter poocommerce_admin_customers_report_filters
 * @param {Array.<filter>} filters Report filters.
 */
export const filters = applyFilters( CUSTOMERS_REPORT_FILTERS_FILTER, [
	{
		label: __( 'Show', 'poocommerce' ),
		staticParams: [ 'paged', 'per_page' ],
		param: 'filter',
		showFilters: () => true,
		filters: [
			{ label: __( 'All Customers', 'poocommerce' ), value: 'all' },
			{
				label: __( 'Single Customer', 'poocommerce' ),
				value: 'select_customer',
				chartMode: 'item-comparison',
				subFilters: [
					{
						component: 'Search',
						value: 'single_customer',
						chartMode: 'item-comparison',
						path: [ 'select_customer' ],
						settings: {
							type: 'customers',
							param: 'customers',
							getLabels: getCustomerLabels,
							labels: {
								placeholder: __(
									'Type to search for a customer',
									'poocommerce'
								),
								button: __( 'Single Customer', 'poocommerce' ),
							},
						},
					},
				],
			},
			{
				label: __( 'Advanced filters', 'poocommerce' ),
				value: 'advanced',
			},
		],
	},
] );

/*eslint-disable max-len*/
/**
 * Customers Report Advanced Filters.
 *
 * @filter poocommerce_admin_customers_report_advanced_filters
 * @param {Object} advancedFilters         Report Advanced Filters.
 * @param {string} advancedFilters.title   Interpolated component string for Advanced Filters title.
 * @param {Object} advancedFilters.filters An object specifying a report's Advanced Filters.
 */
export const advancedFilters = applyFilters(
	CUSTOMERS_REPORT_ADVANCED_FILTERS_FILTER,
	{
		title: _x(
			'Customers match <select/> filters',
			'A sentence describing filters for Customers. See screen shot for context: https://cloudup.com/cCsm3GeXJbE',
			'poocommerce'
		),
		filters: {
			name: {
				labels: {
					add: __( 'Name', 'poocommerce' ),
					placeholder: __( 'Search', 'poocommerce' ),
					remove: __( 'Remove customer name filter', 'poocommerce' ),
					rule: __(
						'Select a customer name filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Name</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select customer name', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to customer names including a given name(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Includes',
							'customer names',
							'poocommerce'
						),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to customer names excluding a given name(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Excludes',
							'customer names',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Search',
					type: 'customers',
					getLabels: getRequestByIdString(
						NAMESPACE + '/customers',
						( customer ) => ( {
							id: customer.id,
							label: customer.name,
						} )
					),
				},
			},
			country: {
				labels: {
					add: __( 'Country / Region', 'poocommerce' ),
					placeholder: __( 'Search', 'poocommerce' ),
					remove: __(
						'Remove country / region filter',
						'poocommerce'
					),
					rule: __(
						'Select a country / region filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Country / Region</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select country / region', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to countries including a given country or countries. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Includes', 'countries', 'poocommerce' ),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to countries excluding a given country or countries. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Excludes', 'countries', 'poocommerce' ),
					},
				],
				input: {
					component: 'Search',
					type: 'countries',
					getLabels: async ( value ) => {
						const countries = await resolveSelect(
							COUNTRIES_STORE_NAME
						).getCountries();

						const allLabels = countries.map( ( country ) => ( {
							key: country.code,
							label: decodeEntities( country.name ),
						} ) );

						const labels = value.split( ',' );
						return await allLabels.filter( ( label ) => {
							return labels.includes( label.key );
						} );
					},
				},
			},
			username: {
				labels: {
					add: __( 'Username', 'poocommerce' ),
					placeholder: __(
						'Search customer username',
						'poocommerce'
					),
					remove: __(
						'Remove customer username filter',
						'poocommerce'
					),
					rule: __(
						'Select a customer username filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a customer username filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Username</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select customer username', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to customer usernames including a given username(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Includes',
							'customer usernames',
							'poocommerce'
						),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to customer usernames excluding a given username(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Excludes',
							'customer usernames',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Search',
					type: 'usernames',
					getLabels: getCustomerLabels,
				},
			},
			email: {
				labels: {
					add: __( 'Email', 'poocommerce' ),
					placeholder: __( 'Search customer email', 'poocommerce' ),
					remove: __( 'Remove customer email filter', 'poocommerce' ),
					rule: __(
						'Select a customer email filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a customer email filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Email</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select customer email', 'poocommerce' ),
				},
				rules: [
					{
						value: 'includes',
						/* translators: Sentence fragment, logical, "Includes" refers to customer emails including a given email(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Includes',
							'customer emails',
							'poocommerce'
						),
					},
					{
						value: 'excludes',
						/* translators: Sentence fragment, logical, "Excludes" refers to customer emails excluding a given email(s). Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Excludes',
							'customer emails',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Search',
					type: 'emails',
					getLabels: getRequestByIdString(
						NAMESPACE + '/customers',
						( customer ) => ( {
							id: customer.id,
							label: customer.email,
						} )
					),
				},
			},
			orders_count: {
				labels: {
					add: __( 'No. of Orders', 'poocommerce' ),
					remove: __( 'Remove order filter', 'poocommerce' ),
					rule: __(
						'Select an order count filter match',
						'poocommerce'
					),
					title: __(
						'<title>No. of Orders</title> <rule/> <filter/>',
						'poocommerce'
					),
				},
				rules: [
					{
						value: 'max',
						/* translators: Sentence fragment, logical, "Less Than" refers to number of orders a customer has placed, less than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Less Than',
							'number of orders',
							'poocommerce'
						),
					},
					{
						value: 'min',
						/* translators: Sentence fragment, logical, "More Than" refers to number of orders a customer has placed, more than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'More Than',
							'number of orders',
							'poocommerce'
						),
					},
					{
						value: 'between',
						/* translators: Sentence fragment, logical, "Between" refers to number of orders a customer has placed, between two given integers. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Between',
							'number of orders',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Number',
				},
			},
			total_spend: {
				labels: {
					add: __( 'Total Spend', 'poocommerce' ),
					remove: __( 'Remove total spend filter', 'poocommerce' ),
					rule: __(
						'Select a total spend filter match',
						'poocommerce'
					),
					title: __(
						'<title>Total Spend</title> <rule/> <filter/>',
						'poocommerce'
					),
				},
				rules: [
					{
						value: 'max',
						/* translators: Sentence fragment, logical, "Less Than" refers to total spending by a customer, less than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Less Than',
							'total spend by customer',
							'poocommerce'
						),
					},
					{
						value: 'min',
						/* translators: Sentence fragment, logical, "Less Than" refers to total spending by a customer, more than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'More Than',
							'total spend by customer',
							'poocommerce'
						),
					},
					{
						value: 'between',
						/* translators: Sentence fragment, logical, "Between" refers to total spending by a customer, between two given amounts. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Between',
							'total spend by customer',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Currency',
				},
			},
			avg_order_value: {
				labels: {
					add: __( 'AOV', 'poocommerce' ),
					remove: __(
						'Remove average order value filter',
						'poocommerce'
					),
					rule: __(
						'Select an average order value filter match',
						'poocommerce'
					),
					title: __(
						'<title>AOV</title> <rule/> <filter/>',
						'poocommerce'
					),
				},
				rules: [
					{
						value: 'max',
						/* translators: Sentence fragment, logical, "Less Than" refers to average order value of a customer, more than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Less Than',
							'average order value of customer',
							'poocommerce'
						),
					},
					{
						value: 'min',
						/* translators: Sentence fragment, logical, "Less Than" refers to average order value of a customer, less than a given amount. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */

						label: _x(
							'More Than',
							'average order value of customer',
							'poocommerce'
						),
					},
					{
						value: 'between',
						/* translators: Sentence fragment, logical, "Between" refers to average order value of a customer, between two given amounts. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x(
							'Between',
							'average order value of customer',
							'poocommerce'
						),
					},
				],
				input: {
					component: 'Currency',
				},
			},
			registered: {
				labels: {
					add: __( 'Registered', 'poocommerce' ),
					remove: __( 'Remove registered filter', 'poocommerce' ),
					rule: __(
						'Select a registered filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Registered</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select registered date', 'poocommerce' ),
				},
				rules: [
					{
						value: 'before',
						/* translators: Sentence fragment, logical, "Before" refers to customers registered before a given date. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Before', 'date', 'poocommerce' ),
					},
					{
						value: 'after',
						/* translators: Sentence fragment, logical, "after" refers to customers registered after a given date. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'After', 'date', 'poocommerce' ),
					},
					{
						value: 'between',
						/* translators: Sentence fragment, logical, "Between" refers to average order value of a customer, between two given amounts. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Between', 'date', 'poocommerce' ),
					},
				],
				input: {
					component: 'Date',
				},
			},
			last_active: {
				labels: {
					add: __( 'Last active', 'poocommerce' ),
					remove: __( 'Remove last active filter', 'poocommerce' ),
					rule: __(
						'Select a last active filter match',
						'poocommerce'
					),
					/* translators: A sentence describing a Product filter. See screen shot for context: https://cloudup.com/cCsm3GeXJbE */
					title: __(
						'<title>Last active</title> <rule/> <filter/>',
						'poocommerce'
					),
					filter: __( 'Select registered date', 'poocommerce' ),
				},
				rules: [
					{
						value: 'before',
						/* translators: Sentence fragment, logical, "Before" refers to customers registered before a given date. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Before', 'date', 'poocommerce' ),
					},
					{
						value: 'after',
						/* translators: Sentence fragment, logical, "after" refers to customers registered after a given date. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'After', 'date', 'poocommerce' ),
					},
					{
						value: 'between',
						/* translators: Sentence fragment, logical, "Between" refers to average order value of a customer, between two given amounts. Screenshot for context: https://cloudup.com/cCsm3GeXJbE */
						label: _x( 'Between', 'date', 'poocommerce' ),
					},
				],
				input: {
					component: 'Date',
				},
			},
		},
	}
);
/*eslint-enable max-len*/
