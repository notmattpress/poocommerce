/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { type OfflinePaymentMethodProvider } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import sanitizeHTML from '~/lib/sanitize-html';
import {
	DefaultDragHandle,
	SortableContainer,
	SortableItem,
} from '../sortable';
import {
	EnableGatewayButton,
	SettingsButton,
} from '~/settings-payments/components/buttons';
import './offline-payment-gateway-list.scss';

type OfflinePaymentGatewayListItemProps = {
	/**
	 * The offline payment gateway to display in the list item.
	 */
	gateway: OfflinePaymentMethodProvider;
	className?: string;
};

/**
 * A component that renders an offline payment gateway as a sortable list item.
 * Displays gateway information including the title, description, icon, and actions to enable or manage the gateway.
 */
export const OfflinePaymentGatewayListItem = ( {
	gateway,
	...props
}: OfflinePaymentGatewayListItemProps ) => {
	return (
		<SortableItem
			key={ gateway.id }
			id={ gateway.id }
			className={
				'poocommerce-list__item poocommerce-list__item-enter-done' +
				( props.className ? ` ${ props.className }` : '' )
			}
			{ ...props }
		>
			<div className="poocommerce-list__item-inner">
				{ /* Left section with drag handle and icon */ }
				<div className="poocommerce-list__item-before">
					<DefaultDragHandle />
					{ gateway.icon && (
						<img
							className={ 'poocommerce-list__item-image' }
							src={ gateway.icon }
							alt={ gateway.title + ' logo' }
						/>
					) }
				</div>
				{ /* Middle section with title and description */ }
				<div className="poocommerce-list__item-text">
					<span className="poocommerce-list__item-title">
						{ gateway.title }
					</span>
					<span
						className="poocommerce-list__item-content"
						// eslint-disable-next-line react/no-danger -- This string is sanitized by the PaymentGateway class.
						dangerouslySetInnerHTML={ sanitizeHTML(
							decodeEntities( gateway.description )
						) }
					/>
				</div>
				{ /* Right section with action buttons */ }
				<div className="poocommerce-list__item-after">
					<div className="poocommerce-list__item-after__actions">
						{ ! gateway.state.enabled ? (
							<EnableGatewayButton
								installingPlugin={ null }
								gatewayProvider={ gateway }
								settingsHref={
									gateway.management._links.settings.href
								}
								onboardingHref={
									gateway.onboarding._links.onboard.href
								}
								isOffline={ true }
								gatewayHasRecommendedPaymentMethods={ false } // Offline gateway items don't have recommended PMs.
							/>
						) : (
							<SettingsButton
								gatewayProvider={ gateway }
								settingsHref={
									gateway.management._links.settings.href
								}
								isInstallingPlugin={ false }
							/>
						) }
					</div>
				</div>
			</div>
		</SortableItem>
	);
};

/**
 * A component that renders a sortable list of offline payment gateways.
 * Each gateway is rendered as a `OfflinePaymentGatewayListItem` and the list supports reordering via drag-and-drop.
 */
export const OfflinePaymentGatewayList = ( {
	gateways,
	setGateways,
}: {
	gateways: OfflinePaymentMethodProvider[];
	setGateways: ( gateways: OfflinePaymentMethodProvider[] ) => void;
} ) => {
	return (
		<SortableContainer< OfflinePaymentMethodProvider >
			className="poocommerce-list"
			items={ gateways }
			setItems={ setGateways }
		>
			{ gateways.map( ( method, index ) => (
				<OfflinePaymentGatewayListItem
					gateway={ method }
					key={ method.id }
					className={
						'poocommerce-list__item' +
						( index === gateways.length - 1 ? ' is-last' : '' )
					}
				/>
			) ) }
		</SortableContainer>
	);
};
