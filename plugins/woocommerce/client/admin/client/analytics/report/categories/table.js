/**
 * External dependencies
 */
import { __, _n } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { map } from 'lodash';
import { getNewPath, getPersistedQuery } from '@poocommerce/navigation';
import { Link } from '@poocommerce/components';
import { formatValue } from '@poocommerce/number';
import { itemsStore } from '@poocommerce/data';
import { CurrencyContext } from '@poocommerce/currency';

/**
 * Internal dependencies
 */
import CategoryBreacrumbs from './breadcrumbs';
import ReportTable from '../../components/report-table';

class CategoriesReportTable extends Component {
	constructor( props ) {
		super( props );

		this.getRowsContent = this.getRowsContent.bind( this );
		this.getSummary = this.getSummary.bind( this );
	}

	getHeadersContent() {
		return [
			{
				label: __( 'Category', 'poocommerce' ),
				key: 'category',
				required: true,
				isSortable: true,
				isLeftAligned: true,
			},
			{
				label: __( 'Items sold', 'poocommerce' ),
				key: 'items_sold',
				required: true,
				defaultSort: true,
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Net sales', 'poocommerce' ),
				key: 'net_revenue',
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Products', 'poocommerce' ),
				key: 'products_count',
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Orders', 'poocommerce' ),
				key: 'orders_count',
				isSortable: true,
				isNumeric: true,
			},
		];
	}

	getRowsContent( categoryStats ) {
		const {
			render: renderCurrency,
			formatDecimal: getCurrencyFormatDecimal,
			getCurrencyConfig,
		} = this.context;
		const { categories, query } = this.props;
		if ( ! categories ) {
			return [];
		}
		const currency = getCurrencyConfig();

		return map( categoryStats, ( categoryStat ) => {
			const {
				category_id: categoryId,
				items_sold: itemsSold,
				net_revenue: netRevenue,
				products_count: productsCount,
				orders_count: ordersCount,
			} = categoryStat;
			const category = categories.get( categoryId );
			const persistedQuery = getPersistedQuery( query );

			return [
				{
					display: (
						<CategoryBreacrumbs
							query={ query }
							category={ category }
							categories={ categories }
						/>
					),
					value: category && category.name,
				},
				{
					display: formatValue( currency, 'number', itemsSold ),
					value: itemsSold,
				},
				{
					display: renderCurrency( netRevenue ),
					value: getCurrencyFormatDecimal( netRevenue ),
				},
				{
					display: category && (
						<Link
							href={ getNewPath(
								persistedQuery,
								'/analytics/categories',
								{
									filter: 'single_category',
									categories: category.id,
								}
							) }
							type="wc-admin"
						>
							{ formatValue( currency, 'number', productsCount ) }
						</Link>
					),
					value: productsCount,
				},
				{
					display: formatValue( currency, 'number', ordersCount ),
					value: ordersCount,
				},
			];
		} );
	}

	getSummary( totals, totalResults = 0 ) {
		const {
			items_sold: itemsSold = 0,
			net_revenue: netRevenue = 0,
			orders_count: ordersCount = 0,
		} = totals;
		const { formatAmount, getCurrencyConfig } = this.context;
		const currency = getCurrencyConfig();
		return [
			{
				label: _n(
					'Category',
					'Categories',
					totalResults,
					'poocommerce'
				),
				value: formatValue( currency, 'number', totalResults ),
			},
			{
				label: _n(
					'Item sold',
					'Items sold',
					itemsSold,
					'poocommerce'
				),
				value: formatValue( currency, 'number', itemsSold ),
			},
			{
				label: __( 'Net sales', 'poocommerce' ),
				value: formatAmount( netRevenue ),
			},
			{
				label: _n( 'Order', 'Orders', ordersCount, 'poocommerce' ),
				value: formatValue( currency, 'number', ordersCount ),
			},
		];
	}

	render() {
		const { advancedFilters, filters, isRequesting, query } = this.props;

		const labels = {
			helpText: __(
				'Check at least two categories below to compare',
				'poocommerce'
			),
			placeholder: __( 'Search by category name', 'poocommerce' ),
		};

		return (
			<ReportTable
				compareBy="categories"
				endpoint="categories"
				getHeadersContent={ this.getHeadersContent }
				getRowsContent={ this.getRowsContent }
				getSummary={ this.getSummary }
				summaryFields={ [
					'items_sold',
					'net_revenue',
					'orders_count',
				] }
				isRequesting={ isRequesting }
				itemIdField="category_id"
				query={ query }
				searchBy="categories"
				labels={ labels }
				tableQuery={ {
					orderby: query.orderby || 'items_sold',
					order: query.order || 'desc',
					extended_info: true,
				} }
				title={ __( 'Categories', 'poocommerce' ) }
				columnPrefsKey="categories_report_columns"
				filters={ filters }
				advancedFilters={ advancedFilters }
			/>
		);
	}
}

CategoriesReportTable.contextType = CurrencyContext;

export default compose(
	withSelect( ( select, props ) => {
		const { isRequesting, query } = props;
		if (
			isRequesting ||
			( query.search &&
				! ( query.categories && query.categories.length ) )
		) {
			return {};
		}

		const { getItems, getItemsError, isResolving } = select( itemsStore );
		const tableQuery = {
			per_page: -1,
		};

		const categories = getItems( 'categories', tableQuery );
		const isCategoriesError = Boolean(
			getItemsError( 'categories', tableQuery )
		);
		const isCategoriesRequesting = isResolving( 'getItems', [
			'categories',
			tableQuery,
		] );

		return {
			categories,
			isError: isCategoriesError,
			isRequesting: isCategoriesRequesting,
		};
	} )
)( CategoriesReportTable );
