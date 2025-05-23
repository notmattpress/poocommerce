/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { WooPaymentsMethodsLogos } from '@poocommerce/onboarding';
import { PaymentExtensionSuggestionProvider } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import sanitizeHTML from '~/lib/sanitize-html';
import { EllipsisMenuWrapper as EllipsisMenu } from '~/settings-payments/components/ellipsis-menu-content';
import {
	isWooPayments,
	hasIncentive,
	isWooPayEligible,
} from '~/settings-payments/utils';
import { DefaultDragHandle } from '~/settings-payments/components/sortable';
import { StatusBadge } from '~/settings-payments/components/status-badge';
import { IncentiveStatusBadge } from '~/settings-payments/components/incentive-status-badge';
import { OfficialBadge } from '~/settings-payments/components/official-badge';

type PaymentExtensionSuggestionListItemProps = {
	/**
	 * The payment extension suggestion to display.
	 */
	extension: PaymentExtensionSuggestionProvider;
	/**
	 * The ID of the plugin currently being installed, or `null` if none.
	 */
	installingPlugin: string | null;
	/**
	 * Callback function to handle the setup of the plugin. Receives the plugin ID, slug, and onboarding URL (if available).
	 */
	setupPlugin: (
		id: string,
		slug: string,
		onboardingUrl: string | null,
		attachUrl: string | null
	) => void;
	/**
	 * Indicates whether the plugin is already installed.
	 */
	pluginInstalled: boolean;
	/**
	 * Callback function to handle accepting an incentive. Receives the incentive ID as a parameter.
	 */
	acceptIncentive: ( id: string ) => void;
	/**
	 * Indicates whether the incentive should be highlighted.
	 */
	shouldHighlightIncentive: boolean;
};

/**
 * A component that renders an individual payment extension suggestion in a list.
 * Displays extension details including title, description, and an action button
 * for installation or enabling the plugin. The component highlights incentive if available.
 */
export const PaymentExtensionSuggestionListItem = ( {
	extension,
	installingPlugin,
	setupPlugin,
	pluginInstalled,
	acceptIncentive,
	shouldHighlightIncentive,
	...props
}: PaymentExtensionSuggestionListItemProps ) => {
	const incentive = hasIncentive( extension ) ? extension._incentive : null;

	// Determine the CTA button label based on the extension state.
	let ctaButtonLabel = __( 'Install', 'poocommerce' );
	if ( pluginInstalled ) {
		ctaButtonLabel = __( 'Enable', 'poocommerce' );
	} else if ( installingPlugin === extension.id ) {
		ctaButtonLabel = __( 'Installing', 'poocommerce' );
	}

	return (
		<div
			id={ extension.id }
			className={ `transitions-disabled poocommerce-list__item poocommerce-list__item-enter-done ${
				hasIncentive( extension ) && shouldHighlightIncentive
					? `has-incentive`
					: ''
			}` }
			{ ...props }
		>
			<div className="poocommerce-list__item-inner">
				<div className="poocommerce-list__item-before">
					<DefaultDragHandle />
					{ extension.icon && (
						<img
							className={ 'poocommerce-list__item-image' }
							src={ extension.icon }
							alt={ extension.title + ' logo' }
						/>
					) }
				</div>
				<div className="poocommerce-list__item-text">
					<span className="poocommerce-list__item-title">
						{ extension.title }{ ' ' }
						{ ! hasIncentive( extension ) &&
							isWooPayments( extension.id ) && (
								<StatusBadge status="recommended" />
							) }
						{ incentive && (
							<IncentiveStatusBadge incentive={ incentive } />
						) }
						{ /* All payment extension suggestions are official. */ }
						<OfficialBadge variant="expanded" />
					</span>
					<span
						className="poocommerce-list__item-content"
						dangerouslySetInnerHTML={ sanitizeHTML(
							decodeEntities( extension.description )
						) }
					/>
					{ isWooPayments( extension.id ) && (
						<WooPaymentsMethodsLogos
							maxElements={ 10 }
							tabletWidthBreakpoint={ 1080 } // Reduce the number of logos earlier.
							mobileWidthBreakpoint={ 768 } // Reduce the number of logos earlier.
							isWooPayEligible={ isWooPayEligible( extension ) }
						/>
					) }
				</div>
				<div className="poocommerce-list__item-buttons">
					<div className="poocommerce-list__item-buttons__actions">
						<Button
							variant="primary"
							onClick={ () => {
								if ( pluginInstalled ) {
									// Record the event when user clicks on a gateway's enable button.
									recordEvent(
										'settings_payments_provider_enable_click',
										{
											provider_id: extension.id,
										}
									);
								}

								if ( incentive ) {
									acceptIncentive( incentive.promo_id );
								}

								setupPlugin(
									extension.id,
									extension.plugin.slug,
									extension.onboarding?._links.onboard.href ??
										null,
									pluginInstalled
										? null
										: extension._links?.attach?.href ?? null
								);
							} }
							isBusy={ installingPlugin === extension.id }
							disabled={ !! installingPlugin }
						>
							{ ctaButtonLabel }
						</Button>
					</div>
				</div>
				<div className="poocommerce-list__item-after">
					<div className="poocommerce-list__item-after__actions">
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
