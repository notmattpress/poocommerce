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

type OfflinePaymentGatewayListItemProps = {
	gateway: OfflinePaymentMethodProvider;
};

export const OfflinePaymentGatewayListItem = ( {
	gateway,
	...props
}: OfflinePaymentGatewayListItemProps ) => {
	return (
		<SortableItem
			key={ gateway.id }
			id={ gateway.id }
			className="poocommerce-list__item poocommerce-list__item-enter-done"
			{ ...props }
		>
			<div className="poocommerce-list__item-inner">
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
				<div className="poocommerce-list__item-text">
					<span className="poocommerce-list__item-title">
						{ gateway.title }
					</span>
					<span
						className="poocommerce-list__item-content"
						dangerouslySetInnerHTML={ sanitizeHTML(
							decodeEntities( gateway.description )
						) }
					/>
				</div>
				<div className="poocommerce-list__item-after">
					<div className="poocommerce-list__item-after__actions">
						{ ! gateway.state.enabled ? (
							<EnableGatewayButton
								gatewayId={ gateway.id }
								gatewayState={ gateway.state }
								settingsHref={
									gateway.management._links.settings.href
								}
								onboardingHref={
									gateway.onboarding._links.onboard.href
								}
								isOffline={ true }
								gatewayHasRecommendedPaymentMethods={ false }
							/>
						) : (
							<SettingsButton
								settingsHref={
									gateway.management._links.settings.href
								}
							/>
						) }
					</div>
				</div>
			</div>
		</SortableItem>
	);
};

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
			{ gateways.map( ( method ) => (
				<OfflinePaymentGatewayListItem
					gateway={ method }
					key={ method.id }
				/>
			) ) }
		</SortableContainer>
	);
};
