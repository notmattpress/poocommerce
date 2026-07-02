/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { lazy, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';
import { useFilterHook } from '~/utils/use-filter-hook';
import { ScheduledUpdatesPromotionNotice } from '~/analytics/components';

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

const getReports = () => {
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

	// Wrap the report component with the scheduled updates promotion notice
	// Create a new array to avoid mutating the original, which could lead to
	// multiple wrappings if getReports() is called multiple times.
	const wrappedReports = reports.map( ( report ) => {
		const OriginalComponent = report.component;

		function WrappedComponent( props ) {
			return (
				<Fragment>
					<ScheduledUpdatesPromotionNotice />
					<OriginalComponent { ...props } />
				</Fragment>
			);
		}

		// Add displayName to help with debugging
		WrappedComponent.displayName = `WithScheduledNotice(${
			OriginalComponent.displayName || OriginalComponent.name || 'Report'
		})`;

		return {
			...report,
			component: WrappedComponent,
		};
	} );

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
	return applyFilters( REPORTS_FILTER, wrappedReports );
};

export function useReports() {
	return useFilterHook( REPORTS_FILTER, getReports );
}
