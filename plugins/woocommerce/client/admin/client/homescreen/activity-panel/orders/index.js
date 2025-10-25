/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import PropTypes from 'prop-types';
import interpolateComponents from '@automattic/interpolate-components';
import {
	EmptyContent,
	Flag,
	H,
	Link,
	OrderStatus,
	Section,
} from '@poocommerce/components';
import { getNewPath } from '@poocommerce/navigation';
import { getAdminLink } from '@poocommerce/settings';
import { ordersStore, itemsStore } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { CurrencyContext, CurrencyFactory } from '@poocommerce/currency';

/**
 * Internal dependencies
 */
import {
	ActivityCard,
	ActivityCardPlaceholder,
} from '~/activity-panel/activity-card';
import { getAdminSetting } from '~/utils/admin-settings';
import './style.scss';

function recordOrderEvent( eventName ) {
	recordEvent( `activity_panel_orders_${ eventName }`, {} );
}

const renderEmptyCard = () => {
	return (
		<>
			<ActivityCard
				className="poocommerce-empty-activity-card"
				title=""
				icon=""
			>
				<span
					className="poocommerce-order-empty__success-icon"
					role="img"
					aria-labelledby="poocommerce-order-empty-message"
				>
					🎉
				</span>
				<H id="poocommerce-order-empty-message">
					{ __( 'You’ve fulfilled all your orders', 'poocommerce' ) }
				</H>
			</ActivityCard>
			<Link
				href={ 'edit.php?post_type=shop_order' }
				onClick={ () => recordOrderEvent( 'orders_manage' ) }
				className="poocommerce-layout__activity-panel-outbound-link poocommerce-layout__activity-panel-empty"
				type="wp-admin"
			>
				{ __( 'Manage all orders', 'poocommerce' ) }
			</Link>
		</>
	);
};

function renderOrders( orders, customers, getFormattedOrderTotal ) {
	if ( orders.length === 0 ) {
		return renderEmptyCard();
	}

	const getCustomerString = ( customer ) => {
		const { name } = customer || {};

		if ( ! name ) {
			return '';
		}

		return `{{customerLink}}${ name }{{/customerLink}}`;
	};

	const orderCardTitle = ( order ) => {
		const {
			id: orderId,
			number: orderNumber,
			customer_id: customerId,
		} = order;
		const customer =
			customers.find( ( c ) => c.user_id === customerId ) || {};
		let customerUrl = null;
		if ( customer && customer.id ) {
			customerUrl = window.wcAdminFeatures.analytics
				? getNewPath( {}, '/analytics/customers', {
						filter: 'single_customer',
						customers: customer.id,
				  } )
				: getAdminLink( 'user-edit.php?user_id=' + customer.id );
		}

		return (
			<>
				{ interpolateComponents( {
					mixedString: sprintf(
						/* translators: 1: order number, 2: customer name */
						__(
							'{{orderLink}}Order #%(orderNumber)s{{/orderLink}} %(customerString)s',
							'poocommerce'
						),
						{
							orderNumber,
							customerString: getCustomerString( customer ),
						}
					),
					components: {
						orderLink: (
							<Link
								href={ getAdminLink(
									'post.php?action=edit&post=' + orderId
								) }
								onClick={ () =>
									recordOrderEvent( 'order_number' )
								}
								type="wp-admin"
							/>
						),
						destinationFlag:
							customer && customer.country ? (
								<Flag
									code={ customer && customer.country }
									round={ false }
								/>
							) : null,
						customerLink: customerUrl ? (
							<Link
								href={ customerUrl }
								onClick={ () =>
									recordOrderEvent( 'customer_name' )
								}
								type="wc-admin"
							/>
						) : (
							<span />
						),
					},
				} ) }
			</>
		);
	};

	const cards = [];
	orders.forEach( ( order ) => {
		const {
			date_created_gmt: dateCreatedGmt,
			line_items: lineItems,
			id: orderId,
		} = order;
		const productsCount = lineItems ? lineItems.length : 0;

		cards.push(
			<ActivityCard
				key={ orderId }
				className="poocommerce-order-activity-card"
				title={ orderCardTitle( order ) }
				date={ dateCreatedGmt }
				onClick={ ( { target } ) => {
					recordOrderEvent( 'orders_begin_fulfillment' );
					if ( ! target.href ) {
						window.location.href = getAdminLink(
							`post.php?action=edit&post=${ orderId }`
						);
					}
				} }
				subtitle={
					<div>
						<span>
							{ sprintf(
								/* translators: %d: number of products */
								_n(
									'%d product',
									'%d products',
									productsCount,
									'poocommerce'
								),
								productsCount
							) }
						</span>
						<span>
							{ getFormattedOrderTotal(
								order.total,
								order.currency
							) }
						</span>
					</div>
				}
			>
				<OrderStatus
					order={ order }
					orderStatusMap={ getAdminSetting( 'orderStatuses', {} ) }
				/>
			</ActivityCard>
		);
	} );
	return (
		<>
			{ cards }
			<Link
				href={ 'edit.php?post_type=shop_order' }
				className="poocommerce-layout__activity-panel-outbound-link"
				onClick={ () => recordOrderEvent( 'orders_manage' ) }
				type="wp-admin"
			>
				{ __( 'Manage all orders', 'poocommerce' ) }
			</Link>
		</>
	);
}

function OrdersPanel( { unreadOrdersCount, orderStatuses } ) {
	const actionableOrdersQuery = useMemo(
		() => ( {
			page: 1,
			per_page: 5,
			status: orderStatuses,
			_fields: [
				'id',
				'number',
				'currency',
				'status',
				'total',
				'customer',
				'line_items',
				'customer_id',
				'date_created_gmt',
			],
		} ),
		[ orderStatuses ]
	);

	const currencyContext = useContext( CurrencyContext );

	const storeCurrency = currencyContext.getCurrencyConfig();
	const { currencySymbols = {} } = getAdminSetting( 'onboarding', {} );
	const getFormattedOrderTotal = ( total, orderCurrencyCode ) => {
		if ( ! orderCurrencyCode ) {
			return null;
		}

		// If the order currency is the same as the store currency, we show the formatted amount.
		if ( storeCurrency && storeCurrency.code === orderCurrencyCode ) {
			return currencyContext.formatAmount( total );
		}
		const symbol = currencySymbols[ orderCurrencyCode ];

		if ( ! symbol ) {
			// This should never happen, but if it does, we'll just show the currency code.
			return `${ orderCurrencyCode }${ total }`;
		}

		// If the order currency is different from the store currency, we show the currency code and amount in the order currency.
		return CurrencyFactory( {
			...storeCurrency,
			symbol: decodeEntities( symbol ),
			code: orderCurrencyCode,
		} ).formatAmount( total );
	};

	const {
		orders = [],
		isRequesting,
		isError,
		customerItems,
	} = useSelect( ( select ) => {
		const { getOrders, hasFinishedResolution, getOrdersError } =
			select( ordersStore );

		if ( ! orderStatuses.length && unreadOrdersCount === 0 ) {
			return { isRequesting: false };
		}

		/* eslint-disable @wordpress/no-unused-vars-before-return */
		const actionableOrders = getOrders( actionableOrdersQuery, null );

		const isRequestingActionable = hasFinishedResolution( 'getOrders', [
			actionableOrdersQuery,
		] );

		if (
			isRequestingActionable ||
			unreadOrdersCount === null ||
			actionableOrders === null
		) {
			return {
				isError: Boolean( getOrdersError( actionableOrdersQuery ) ),
				isRequesting: true,
				orderStatuses,
			};
		}

		const { getItems } = select( itemsStore );

		const customers = getItems( 'customers', {
			users: actionableOrders
				.map( ( order ) => order.customer_id )
				.filter( ( id ) => id !== 0 ),
			_fields: [ 'id', 'name', 'country', 'user_id' ],
		} );

		return {
			orders: actionableOrders,
			isError: Boolean( getOrdersError( actionableOrders ) ),
			isRequesting: isRequestingActionable,
			orderStatuses,
			customerItems: customers,
		};
	} );

	if ( isError ) {
		if ( ! orderStatuses.length && window.wcAdminFeatures.analytics ) {
			return (
				<EmptyContent
					title={ __(
						'You currently don’t have any actionable statuses. ' +
							'To display orders here, select orders that require further review in settings.',
						'poocommerce'
					) }
					actionLabel={ __( 'Settings', 'poocommerce' ) }
					actionURL={ getAdminLink(
						'admin.php?page=wc-admin&path=/analytics/settings'
					) }
				/>
			);
		}

		throw new Error(
			'Failed to load orders, raise error to trigger ErrorBoundary'
		);
	}
	const customerList = customerItems
		? Array.from( customerItems, ( [ , value ] ) => value )
		: [];

	return (
		<>
			<Section>
				{ isRequesting ? (
					<ActivityCardPlaceholder
						className="poocommerce-order-activity-card"
						hasAction
						hasDate
						lines={ 1 }
					/>
				) : (
					renderOrders( orders, customerList, getFormattedOrderTotal )
				) }
			</Section>
		</>
	);
}

OrdersPanel.propTypes = {
	unreadOrdersCount: PropTypes.number,
	orderStatuses: PropTypes.array,
};

export default OrdersPanel;
