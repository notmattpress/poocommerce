/**
 * External dependencies
 */
import { __, _n } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { map } from 'lodash';
import { Date, Link } from '@poocommerce/components';
import { getNewPath, getPersistedQuery } from '@poocommerce/navigation';
import { formatValue } from '@poocommerce/number';
import { defaultTableDateFormat } from '@poocommerce/date';
import { CurrencyContext } from '@poocommerce/currency';

/**
 * Internal dependencies
 */
import ReportTable from '../../components/report-table';
import { getAdminSetting } from '~/utils/admin-settings';

class CouponsReportTable extends Component {
	constructor() {
		super();

		this.getHeadersContent = this.getHeadersContent.bind( this );
		this.getRowsContent = this.getRowsContent.bind( this );
		this.getSummary = this.getSummary.bind( this );
	}

	getHeadersContent() {
		return [
			{
				label: __( 'Coupon code', 'poocommerce' ),
				key: 'code',
				required: true,
				isLeftAligned: true,
				isSortable: true,
			},
			{
				label: __( 'Orders', 'poocommerce' ),
				key: 'orders_count',
				required: true,
				defaultSort: true,
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Amount discounted', 'poocommerce' ),
				key: 'amount',
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Created', 'poocommerce' ),
				key: 'created',
			},
			{
				label: __( 'Expires', 'poocommerce' ),
				key: 'expires',
			},
			{
				label: __( 'Type', 'poocommerce' ),
				key: 'type',
			},
		];
	}

	getRowsContent( coupons ) {
		const { query } = this.props;
		const persistedQuery = getPersistedQuery( query );
		const dateFormat = getAdminSetting(
			'dateFormat',
			defaultTableDateFormat
		);
		const {
			formatAmount,
			formatDecimal: getCurrencyFormatDecimal,
			getCurrencyConfig,
		} = this.context;

		return map( coupons, ( coupon ) => {
			const {
				amount,
				coupon_id: couponId,
				orders_count: ordersCount,
			} = coupon;
			const extendedInfo = coupon.extended_info || {};
			const {
				code,
				date_created: dateCreated,
				date_expires: dateExpires,
				discount_type: discountType,
			} = extendedInfo;

			const couponUrl =
				couponId > 0
					? getNewPath( persistedQuery, '/analytics/coupons', {
							filter: 'single_coupon',
							coupons: couponId,
					  } )
					: null;

			const couponLink =
				couponUrl === null ? (
					code
				) : (
					<Link href={ couponUrl } type="wc-admin">
						{ code }
					</Link>
				);

			const ordersUrl =
				couponId > 0
					? getNewPath( persistedQuery, '/analytics/orders', {
							filter: 'advanced',
							coupon_includes: couponId,
					  } )
					: null;
			const ordersLink =
				ordersUrl === null ? (
					ordersCount
				) : (
					<Link href={ ordersUrl } type="wc-admin">
						{ formatValue(
							getCurrencyConfig(),
							'number',
							ordersCount
						) }
					</Link>
				);

			return [
				{
					display: couponLink,
					value: code,
				},
				{
					display: ordersLink,
					value: ordersCount,
				},
				{
					display: formatAmount( amount ),
					value: getCurrencyFormatDecimal( amount ),
				},
				{
					display: dateCreated ? (
						<Date
							date={ dateCreated }
							visibleFormat={ dateFormat }
						/>
					) : (
						__( 'N/A', 'poocommerce' )
					),
					value: dateCreated,
				},
				{
					display: dateExpires ? (
						<Date
							date={ dateExpires }
							visibleFormat={ dateFormat }
						/>
					) : (
						__( 'N/A', 'poocommerce' )
					),
					value: dateExpires,
				},
				{
					display: this.getCouponType( discountType ),
					value: discountType,
				},
			];
		} );
	}

	getSummary( totals ) {
		const {
			coupons_count: couponsCount = 0,
			orders_count: ordersCount = 0,
			amount = 0,
		} = totals;
		const { formatAmount, getCurrencyConfig } = this.context;
		const currency = getCurrencyConfig();
		return [
			{
				label: _n( 'Coupon', 'Coupons', couponsCount, 'poocommerce' ),
				value: formatValue( currency, 'number', couponsCount ),
			},
			{
				label: _n( 'Order', 'Orders', ordersCount, 'poocommerce' ),
				value: formatValue( currency, 'number', ordersCount ),
			},
			{
				label: __( 'Amount discounted', 'poocommerce' ),
				value: formatAmount( amount ),
			},
		];
	}

	getCouponType( discountType ) {
		const couponTypes = {
			percent: __( 'Percentage', 'poocommerce' ),
			fixed_cart: __( 'Fixed cart', 'poocommerce' ),
			fixed_product: __( 'Fixed product', 'poocommerce' ),
		};
		return couponTypes[ discountType ] || __( 'N/A', 'poocommerce' );
	}

	render() {
		const { advancedFilters, filters, isRequesting, query } = this.props;

		return (
			<ReportTable
				compareBy="coupons"
				endpoint="coupons"
				getHeadersContent={ this.getHeadersContent }
				getRowsContent={ this.getRowsContent }
				getSummary={ this.getSummary }
				summaryFields={ [ 'coupons_count', 'orders_count', 'amount' ] }
				isRequesting={ isRequesting }
				itemIdField="coupon_id"
				query={ query }
				searchBy="coupons"
				tableQuery={ {
					orderby: query.orderby || 'orders_count',
					order: query.order || 'desc',
					extended_info: true,
				} }
				title={ __( 'Coupons', 'poocommerce' ) }
				columnPrefsKey="coupons_report_columns"
				filters={ filters }
				advancedFilters={ advancedFilters }
			/>
		);
	}
}

CouponsReportTable.contextType = CurrencyContext;

export default CouponsReportTable;
