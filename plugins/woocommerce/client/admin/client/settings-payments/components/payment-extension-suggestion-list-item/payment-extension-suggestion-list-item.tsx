/**
 * External dependencies
 */

import { decodeEntities } from '@wordpress/html-entities';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { WooPaymentMethodsLogos } from '@poocommerce/onboarding';
import { PaymentExtensionSuggestionProvider } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import sanitizeHTML from '~/lib/sanitize-html';
import { EllipsisMenuWrapper as EllipsisMenu } from '~/settings-payments/components/ellipsis-menu-content';
import {
	isWooPayments,
	hasIncentive,
	isActionIncentive,
	isIncentiveDismissedInContext,
} from '~/settings-payments/utils';
import { DefaultDragHandle } from '~/settings-payments/components/sortable';
import { StatusBadge } from '~/settings-payments/components/status-badge';

type PaymentExtensionSuggestionListItemProps = {
	extension: PaymentExtensionSuggestionProvider;
	installingPlugin: string | null;
	setupPlugin: (
		id: string,
		slug: string,
		onboardingUrl: string | null
	) => void;
	pluginInstalled: boolean;
	acceptIncentive: ( id: string ) => void;
};

export const PaymentExtensionSuggestionListItem = ( {
	extension,
	installingPlugin,
	setupPlugin,
	pluginInstalled,
	acceptIncentive,
	...props
}: PaymentExtensionSuggestionListItemProps ) => {
	const incentive = hasIncentive( extension ) ? extension._incentive : null;
	const shouldHighlightIncentive =
		hasIncentive( extension ) &&
		( ! isActionIncentive( extension._incentive ) ||
			isIncentiveDismissedInContext(
				extension._incentive,
				'wc_settings_payments__banner'
			) );

	return (
		<div
			id={ extension.id }
			className={ `transitions-disabled poocommerce-list__item poocommerce-list__item-enter-done ${
				shouldHighlightIncentive ? `has-incentive` : ''
			}` }
			{ ...props }
		>
			<div className="poocommerce-list__item-inner">
				<div className="poocommerce-list__item-before">
					<DefaultDragHandle />
					<img
						src={ extension.icon }
						alt={ extension.title + ' logo' }
					/>
				</div>
				<div className="poocommerce-list__item-text">
					<span className="poocommerce-list__item-title">
						{ extension.title }{ ' ' }
						{ ! hasIncentive( extension ) &&
							isWooPayments( extension.id ) && (
								<StatusBadge status="recommended" />
							) }
						{ incentive && (
							<StatusBadge
								status="has_incentive"
								message={ incentive.badge }
							/>
						) }
					</span>
					<span
						className="poocommerce-list__item-content"
						dangerouslySetInnerHTML={ sanitizeHTML(
							decodeEntities( extension.description )
						) }
					/>
					{ isWooPayments( extension.id ) && (
						<WooPaymentMethodsLogos
							maxElements={ 10 }
							isWooPayEligible={ true }
						/>
					) }
				</div>
				<div className="poocommerce-list__item-after">
					<div className="poocommerce-list__item-after__actions">
						<Button
							variant="primary"
							onClick={ () => {
								if ( incentive ) {
									acceptIncentive( incentive.promo_id );
								}

								setupPlugin(
									extension.id,
									extension.plugin.slug,
									extension.onboarding?._links.onboard.href ??
										null
								);
							} }
							isBusy={ installingPlugin === extension.id }
							disabled={ !! installingPlugin }
						>
							{ pluginInstalled
								? __( 'Enable', 'poocommerce' )
								: __( 'Install', 'poocommerce' ) }
						</Button>

						<EllipsisMenu
							label={ __(
								'Payment Provider Options',
								'poocommerce'
							) }
							provider={ extension }
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
