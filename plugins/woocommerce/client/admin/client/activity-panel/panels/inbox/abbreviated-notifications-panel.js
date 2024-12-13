/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Text } from '@poocommerce/experimental';
import { recordEvent } from '@poocommerce/tracks';
import { AbbreviatedCard } from '@poocommerce/components';
import { useSelect } from '@wordpress/data';
import { ONBOARDING_STORE_NAME } from '@poocommerce/data';
import { box, comment, page } from '@wordpress/icons';
import { createSlotFill } from '@wordpress/components';
import { isWCAdmin } from '@poocommerce/navigation';

/**
 * Internal dependencies
 */
import {
	getLowStockCount,
	getOrderStatuses,
	getUnreadOrders,
} from '~/homescreen/activity-panel/orders/utils';
import { getUnapprovedReviews } from '~/homescreen/activity-panel/reviews/utils';
import { Bell } from './icons/bell';

const EXTENDED_TASK_LIST_ID = 'extended_task_list';
const ORDER_PANEL_ID = 'orders-panel';
const REVIEWS_PANEL_ID = 'reviews-panel';
const STOCK_PANEL_ID = 'stock-panel';

export const ABBREVIATED_NOTIFICATION_SLOT_NAME = 'AbbreviatedNotification';

export const AbbreviatedNotificationsPanel = ( { thingsToDoNextCount } ) => {
	const {
		ordersToProcessCount,
		reviewsToModerateCount,
		stockNoticesCount,
		isSetupTaskListHidden,
		isExtendedTaskListHidden,
	} = useSelect( ( select ) => {
		const { getTaskList } = select( ONBOARDING_STORE_NAME );
		const orderStatuses = getOrderStatuses( select );

		return {
			ordersToProcessCount: getUnreadOrders( select, orderStatuses ),
			reviewsToModerateCount: getUnapprovedReviews( select ),
			stockNoticesCount: getLowStockCount( select ),
			isSetupTaskListHidden: getTaskList( 'setup' )?.isHidden,
			isExtendedTaskListHidden: getTaskList( 'extended' )?.isHidden,
		};
	} );

	const trackAbbreviatedCardClick = ( name ) => {
		recordEvent( 'activity_panel_click', {
			task: name,
		} );
	};

	const { Slot } = createSlotFill( ABBREVIATED_NOTIFICATION_SLOT_NAME );
	const isWCAdminPage = isWCAdmin();

	return (
		<div className="poocommerce-abbreviated-notifications">
			{ thingsToDoNextCount > 0 && ! isExtendedTaskListHidden && (
				<AbbreviatedCard
					className="poocommerce-abbreviated-notification"
					icon={ <Bell /> }
					href={ `admin.php?page=wc-admin#${ EXTENDED_TASK_LIST_ID }` }
					onClick={ () =>
						trackAbbreviatedCardClick( 'thingsToDoNext' )
					}
					type={ isWCAdminPage ? 'wc-admin' : 'wp-admin' }
				>
					<Text as="h3">
						{ __( 'Things to do next', 'poocommerce' ) }
					</Text>
					<Text as="p">
						{ sprintf(
							/* translators: Things the user has to do */
							_n(
								'You have %d new thing to do',
								'You have %d new things to do',
								thingsToDoNextCount,
								'poocommerce'
							),
							thingsToDoNextCount
						) }
					</Text>
				</AbbreviatedCard>
			) }
			{ ordersToProcessCount > 0 && isSetupTaskListHidden && (
				<AbbreviatedCard
					className="poocommerce-abbreviated-notification"
					icon={ page }
					href={ `admin.php?page=wc-admin&opened_panel=${ ORDER_PANEL_ID }` }
					onClick={ () =>
						trackAbbreviatedCardClick( 'ordersToProcess' )
					}
					type={ isWCAdminPage ? 'wc-admin' : 'wp-admin' }
				>
					<Text as="h3">
						{ __( 'Orders to fulfill', 'poocommerce' ) }
					</Text>
					<Text>
						{ sprintf(
							/* translators: Number of orders the user has to fulfill */
							_n(
								'You have %d order to fulfill',
								'You have %d orders to fulfill',
								ordersToProcessCount,
								'poocommerce'
							),
							ordersToProcessCount
						) }
					</Text>
				</AbbreviatedCard>
			) }
			{ reviewsToModerateCount > 0 && isSetupTaskListHidden && (
				<AbbreviatedCard
					className="poocommerce-abbreviated-notification"
					icon={ comment }
					href={ `admin.php?page=wc-admin&opened_panel=${ REVIEWS_PANEL_ID }` }
					onClick={ () =>
						trackAbbreviatedCardClick( 'reviewsToModerate' )
					}
					type={ isWCAdminPage ? 'wc-admin' : 'wp-admin' }
				>
					<Text as="h3">
						{ __( 'Reviews to moderate', 'poocommerce' ) }
					</Text>
					<Text>
						{ sprintf(
							/* translators: Number of reviews the user has to moderate */
							_n(
								'You have %d review to moderate',
								'You have %d reviews to moderate',
								reviewsToModerateCount,
								'poocommerce'
							),
							reviewsToModerateCount
						) }
					</Text>
				</AbbreviatedCard>
			) }
			{ stockNoticesCount > 0 && isSetupTaskListHidden && (
				<AbbreviatedCard
					className="poocommerce-abbreviated-notification"
					icon={ box }
					href={ `admin.php?page=wc-admin&opened_panel=${ STOCK_PANEL_ID }` }
					onClick={ () =>
						trackAbbreviatedCardClick( 'stockNotices' )
					}
					type={ isWCAdminPage ? 'wc-admin' : 'wp-admin' }
				>
					<Text as="h3">
						{ __( 'Inventory to review', 'poocommerce' ) }
					</Text>
					<Text>
						{ __(
							'You have inventory to review and update',
							'poocommerce'
						) }
					</Text>
				</AbbreviatedCard>
			) }
			{ ! isExtendedTaskListHidden && <Slot /> }
		</div>
	);
};

export default AbbreviatedNotificationsPanel;
