/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Badge } from '@poocommerce/components';
import {
	Button,
	Panel,
	PanelBody,
	PanelRow,
	__experimentalText as Text,
} from '@wordpress/components';
import { ordersStore, productsStore } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { useEffect } from '@wordpress/element';
import { snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';
import {
	getLowStockCount,
	getOrderStatuses,
	getUnreadOrders,
} from './orders/utils';
import { getAllPanels } from './panels';
import { getUnapprovedReviews } from './reviews/utils';
import { getUrlParams } from '../../utils';
import { getAdminSetting } from '~/utils/admin-settings';
import { isTaskListVisible } from '~/hooks/use-tasklists-state';

const ORDERS_QUERY_PARAMS = { _fields: [ 'id' ] };
const PUBLISHED_PRODUCTS_QUERY_PARAMS = {
	status: 'publish',
	_fields: [ 'id' ],
};

export const ActivityPanel = () => {
	const panelsData = useSelect( ( select ) => {
		const {
			getOrdersTotalCount,
			hasFinishedResolution: hasFinishedOrdersResolution,
		} = select( ordersStore );
		const {
			getProductsTotalCount,
			hasFinishedResolution: hasFinishedProductsResolution,
		} = select( productsStore );
		const totalOrderCount = getOrdersTotalCount( ORDERS_QUERY_PARAMS, 0 );
		const orderStatuses = getOrderStatuses( select );
		const reviewsEnabled = getAdminSetting( 'reviewsEnabled', 'no' );
		const unreadOrdersCount = getUnreadOrders( select, orderStatuses );
		const manageStock = getAdminSetting( 'manageStock', 'no' );
		const lowStockProductsCount = getLowStockCount( select );
		const unapprovedReviewsCount = getUnapprovedReviews( select );
		const publishedProductCount = getProductsTotalCount(
			PUBLISHED_PRODUCTS_QUERY_PARAMS,
			0
		);
		const loadingOrderAndProductCount =
			! hasFinishedOrdersResolution( 'getOrdersTotalCount', [
				ORDERS_QUERY_PARAMS,
				0,
			] ) ||
			! hasFinishedProductsResolution( 'getProductsTotalCount', [
				PUBLISHED_PRODUCTS_QUERY_PARAMS,
				0,
			] );

		return {
			loadingOrderAndProductCount,
			lowStockProductsCount,
			unapprovedReviewsCount,
			unreadOrdersCount,
			manageStock,
			isTaskListHidden: ! isTaskListVisible( 'setup' ),
			publishedProductCount,
			reviewsEnabled,
			totalOrderCount,
			orderStatuses,
		};
	} );

	const panels = panelsData.loadingOrderAndProductCount
		? []
		: getAllPanels( panelsData );

	useEffect( () => {
		if ( panelsData.isTaskListHidden !== undefined ) {
			const visiblePanels = panels.reduce(
				( acc, panel ) => {
					const panelId = snakeCase( panel.id );
					acc[ panelId ] = true;
					return acc;
				},
				{ task_list: panelsData.isTaskListHidden }
			);
			recordEvent( 'activity_panel_visible_panels', visiblePanels );
		}
	}, [ panelsData.isTaskListHidden, panels ] );

	if ( panels.length === 0 ) {
		return null;
	}

	const getInitialOpenState = ( panelId ) => {
		const { opened_panel: openedPanel } = getUrlParams(
			window.location.search
		);
		return panelId === openedPanel;
	};

	return (
		<Panel className="poocommerce-activity-panel">
			{ panels.map( ( panelData ) => {
				const {
					className,
					count,
					id,
					initialOpen,
					panel,
					title,
					collapsible,
				} = panelData;
				return collapsible ? (
					<PanelBody
						title={ [
							<Text
								key={ title }
								variant="title.small"
								size="20"
								lineHeight="28px"
							>
								{ title }
							</Text>,
							count !== null && (
								<Badge
									key={ `${ title }-badge` }
									count={ count }
								/>
							),
						] }
						key={ id }
						className={ className }
						initialOpen={ getInitialOpenState( id ) || initialOpen }
						collapsible={ collapsible }
						disabled={ ! collapsible }
						onToggle={ ( isOpen ) => {
							if ( ! isOpen ) {
								return;
							}

							recordEvent( 'activity_panel_open', {
								tab: id,
							} );
						} }
					>
						<PanelRow>{ panel }</PanelRow>
					</PanelBody>
				) : (
					<div className="components-panel__body" key={ id }>
						<h2 className="components-panel__body-title">
							<Button
								className="components-panel__body-toggle"
								aria-expanded={ false }
								disabled={ true }
							>
								<Text
									variant="title.small"
									size="20"
									lineHeight="28px"
								>
									{ title }
								</Text>
								{ count !== null && <Badge count={ count } /> }
							</Button>
						</h2>
					</div>
				);
			} ) }
		</Panel>
	);
};
