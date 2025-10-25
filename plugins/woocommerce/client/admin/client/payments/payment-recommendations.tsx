/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { Card, CardHeader, CardFooter, Button } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { EllipsisMenu, List, Pill } from '@poocommerce/components';
import { Text } from '@poocommerce/experimental';
import {
	onboardingStore,
	PAYMENT_GATEWAYS_STORE_NAME,
	pluginsStore,
	Plugin,
	type PaymentSelectors,
} from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { getAdminLink } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import './payment-recommendations.scss';
import { createNoticesFromResponse } from '~/lib/notices';
import { getPluginSlug } from '~/utils';
import { isWcPaySupported } from './utils';
import { TrackedLink } from '~/components/tracked-link/tracked-link';
import { isFeatureEnabled } from '~/utils/features';

const WcPayPromotionGateway = document.querySelector(
	'[data-gateway_id="pre_install_poocommerce_payments_promotion"]'
);

const PaymentRecommendations = () => {
	const [ installingPlugin, setInstallingPlugin ] = useState< string | null >(
		null
	);
	const [ isDismissed, setIsDismissed ] = useState< boolean >( false );
	const [ isInstalled, setIsInstalled ] = useState< boolean >( false );
	const { installAndActivatePlugins, dismissRecommendedPlugins } =
		useDispatch( pluginsStore );
	const { createNotice } = useDispatch( 'core/notices' );

	const {
		installedPaymentGateway,
		installedPaymentGateways,
		paymentGatewaySuggestions,
		isResolving,
	} = useSelect(
		( select ) => {
			const installingGatewayId =
				isInstalled && getPluginSlug( installingPlugin );
			return {
				installedPaymentGateway:
					installingGatewayId &&
					(
						select(
							PAYMENT_GATEWAYS_STORE_NAME
						) as PaymentSelectors
					 ).getPaymentGateway( installingGatewayId ),
				installedPaymentGateways: (
					select( PAYMENT_GATEWAYS_STORE_NAME ) as PaymentSelectors
				 )
					.getPaymentGateways()
					.reduce(
						(
							gateways: { [ id: string ]: boolean },
							gateway: { id: string }
						) => {
							if ( installingGatewayId === gateway.id ) {
								return gateways;
							}
							gateways[ gateway.id ] = true;
							return gateways;
						},
						{}
					),
				isResolving: select( onboardingStore ).isResolving(
					'getPaymentGatewaySuggestions',
					[]
				),
				paymentGatewaySuggestions:
					select( onboardingStore ).getPaymentGatewaySuggestions(),
			};
		},
		[ isInstalled ]
	);

	const triggeredPageViewRef = useRef( false );
	const shouldShowRecommendations =
		paymentGatewaySuggestions &&
		paymentGatewaySuggestions.length > 0 &&
		! isWcPaySupported( paymentGatewaySuggestions ) &&
		! isDismissed;

	useEffect( () => {
		if (
			( shouldShowRecommendations ||
				( WcPayPromotionGateway && ! isResolving ) ) &&
			! triggeredPageViewRef.current
		) {
			triggeredPageViewRef.current = true;
			const eventProps = ( paymentGatewaySuggestions || [] ).reduce(
				( props: { [ key: string ]: boolean }, plugin: Plugin ) => {
					if ( plugin.plugins && plugin.plugins.length > 0 ) {
						return {
							...props,
							[ plugin.plugins[ 0 ].replace( /\-/g, '_' ) +
							'_displayed' ]: true,
						};
					}
					return props;
				},
				{
					poocommerce_payments_displayed: !! WcPayPromotionGateway,
				}
			);
			recordEvent(
				'settings_payments_recommendations_pageview',
				eventProps
			);
		}
	}, [ shouldShowRecommendations, WcPayPromotionGateway, isResolving ] );

	useEffect( () => {
		if ( ! installedPaymentGateway ) {
			return;
		}
		window.location.href = installedPaymentGateway.settings_url;
	}, [ installedPaymentGateway ] );

	if ( ! shouldShowRecommendations ) {
		return null;
	}
	const dismissPaymentRecommendations = async () => {
		setIsDismissed( true );
		recordEvent( 'settings_payments_recommendations_dismiss', {} );
		const success = await dismissRecommendedPlugins( 'payments' );
		if ( ! success ) {
			setIsDismissed( false );
			createNotice(
				'error',
				__(
					'There was a problem hiding the "Additional ways to get paid" card.',
					'poocommerce'
				)
			);
		}
	};

	const setupPlugin = ( plugin: Plugin ) => {
		if ( installingPlugin ) {
			return;
		}
		setInstallingPlugin( plugin.id );
		recordEvent( 'settings_payments_recommendations_setup', {
			extension_selected: plugin.plugins[ 0 ],
		} );
		installAndActivatePlugins( [ plugin.plugins[ 0 ] ] )
			.then( () => {
				setIsInstalled( true );
			} )
			.catch( ( response: { errors: Record< string, string > } ) => {
				createNoticesFromResponse( response );
				setInstallingPlugin( null );
			} );
	};

	const pluginsList = ( paymentGatewaySuggestions || [] )
		.filter( ( plugin: Plugin ) => {
			return (
				! installedPaymentGateways[ plugin.id ] &&
				plugin.plugins?.length &&
				( ! window.wcAdminFeatures[ 'wc-pay-promotion' ] ||
					! plugin.id.startsWith( 'poocommerce_payments' ) )
			);
		} )
		.map( ( plugin: Plugin ) => {
			return {
				key: plugin.id,
				title: (
					<>
						{ plugin.title }
						{ plugin.recommended && (
							<Pill>{ __( 'Recommended', 'poocommerce' ) }</Pill>
						) }
					</>
				),
				content: decodeEntities( plugin.content ),
				after: (
					<Button
						isSecondary
						onClick={ () => setupPlugin( plugin ) }
						isBusy={ installingPlugin === plugin.id }
						disabled={ !! installingPlugin }
					>
						{ plugin.actionText ||
							__( 'Get started', 'poocommerce' ) }
					</Button>
				),
				before: (
					<img
						src={
							plugin.square_image ||
							plugin.image_72x72 ||
							plugin.image
						}
						alt=""
					/>
				),
			};
		} );

	if ( pluginsList.length === 0 ) {
		return null;
	}

	return (
		<Card size="medium" className="poocommerce-recommended-payments-card">
			<CardHeader>
				<div className="poocommerce-recommended-payments-card__header">
					<Text
						variant="title.small"
						as="p"
						size="20"
						lineHeight="28px"
					>
						{ __( 'Recommended payment providers', 'poocommerce' ) }
					</Text>
					<Text
						className={
							'poocommerce-recommended-payments__header-heading'
						}
						variant="caption"
						as="p"
						size="12"
						lineHeight="16px"
					>
						{ __(
							'We recommend adding one of the following payment extensions to your store. The extension will be installed and activated for you when you click "Get started".',
							'poocommerce'
						) }
					</Text>
				</div>
				<div className="poocommerce-card__menu poocommerce-card__header-item">
					<EllipsisMenu
						label={ __( 'Task List Options', 'poocommerce' ) }
						renderContent={ () => (
							<div className="poocommerce-review-activity-card__section-controls">
								<Button
									onClick={ dismissPaymentRecommendations }
								>
									{ __( 'Hide this', 'poocommerce' ) }
								</Button>
							</div>
						) }
					/>
				</div>
			</CardHeader>
			<List items={ pluginsList } />
			<CardFooter>
				<TrackedLink
					message={ __(
						// translators: {{Link}} is a placeholder for a html element.
						'Visit {{Link}}the PooCommerce Marketplace{{/Link}} to find additional payment providers.',
						'poocommerce'
					) }
					eventName="settings_payment_recommendations_visit_marketplace_click"
					targetUrl={
						isFeatureEnabled( 'marketplace' )
							? getAdminLink(
									'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=payment-gateways'
							  )
							: 'https://poocommerce.com/product-category/poocommerce-extensions/payment-gateways/'
					}
					linkType={
						isFeatureEnabled( 'marketplace' )
							? 'wc-admin'
							: 'external'
					}
				/>
			</CardFooter>
		</Card>
	);
};

export default PaymentRecommendations;
