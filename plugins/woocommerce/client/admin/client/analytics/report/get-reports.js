/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { lazy } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';
const RevenueReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-revenue" */ './revenue' )
);
const ProductsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-products" */ './products' )
);
const VariationsReport = lazy( () =>
	import(
		/* webpackChunkName: "analytics-report-variations" */ './variations'
	)
);
const OrdersReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-orders" */ './orders' )
);
const CategoriesReport = lazy( () =>
	import(
		/* webpackChunkName: "analytics-report-categories" */ './categories'
	)
);
const CouponsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-coupons" */ './coupons' )
);
const TaxesReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-taxes" */ './taxes' )
);
const DownloadsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-downloads" */ './downloads' )
);
const StockReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-stock" */ './stock' )
);
const CustomersReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-customers" */ './customers' )
);

const manageStock = getAdminSetting( 'manageStock', 'no' );
const REPORTS_FILTER = 'poocommerce_admin_reports_list';

export default () => {
	const reports = [
		{
			report: 'revenue',
			title: __( 'Revenue', 'poocommerce' ),
			component: RevenueReport,
			navArgs: {
				id: 'poocommerce-analytics-revenue',
			},
		},
		{
			report: 'products',
			title: __( 'Products', 'poocommerce' ),
			component: ProductsReport,
			navArgs: {
				id: 'poocommerce-analytics-products',
			},
		},
		{
			report: 'variations',
			title: __( 'Variations', 'poocommerce' ),
			component: VariationsReport,
			navArgs: {
				id: 'poocommerce-analytics-variations',
			},
		},
		{
			report: 'orders',
			title: __( 'Orders', 'poocommerce' ),
			component: OrdersReport,
			navArgs: {
				id: 'poocommerce-analytics-orders',
			},
		},
		{
			report: 'categories',
			title: __( 'Categories', 'poocommerce' ),
			component: CategoriesReport,
			navArgs: {
				id: 'poocommerce-analytics-categories',
			},
		},
		{
			report: 'coupons',
			title: __( 'Coupons', 'poocommerce' ),
			component: CouponsReport,
			navArgs: {
				id: 'poocommerce-analytics-coupons',
			},
		},
		{
			report: 'taxes',
			title: __( 'Taxes', 'poocommerce' ),
			component: TaxesReport,
			navArgs: {
				id: 'poocommerce-analytics-taxes',
			},
		},
		manageStock === 'yes'
			? {
					report: 'stock',
					title: __( 'Stock', 'poocommerce' ),
					component: StockReport,
					navArgs: {
						id: 'poocommerce-analytics-stock',
					},
			  }
			: null,
		{
			report: 'customers',
			title: __( 'Customers', 'poocommerce' ),
			component: CustomersReport,
		},
		{
			report: 'downloads',
			title: __( 'Downloads', 'poocommerce' ),
			component: DownloadsReport,
			navArgs: {
				id: 'poocommerce-analytics-downloads',
			},
		},
	].filter( Boolean );

	/**
	 * An object defining a report page.
	 *
	 * @typedef {Object} report
	 * @property {string} report    Report slug.
	 * @property {string} title     Report title.
	 * @property {Node}   component React Component to render.
	 * @property {Object} navArgs   Arguments supplied to PooCommerce Navigation.
	 */

	/**
	 * Filter Report pages list.
	 *
	 * @filter poocommerce_admin_reports_list
	 * @param {Array.<report>} reports Report pages list.
	 */
	return applyFilters( REPORTS_FILTER, reports );
};
