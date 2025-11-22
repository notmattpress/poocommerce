/**
 * External dependencies
 */
import { Sender } from 'xstate';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Button } from '@wordpress/components';
import { getNewPath } from '@poocommerce/navigation';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import { IntroSiteIframe } from './intro-site-iframe';
import type { customizeStoreStateMachineEvents } from '~/customize-store';
import { ADMIN_URL, getAdminSetting } from '~/utils/admin-settings';
import { navigateOrParent } from '../utils';
import { trackEvent } from '../tracking';

export const BaseIntroBanner = ( {
	bannerTitle,
	bannerText,
	bannerClass,
	showAIDisclaimer,
	buttonIsLink,
	bannerButtonOnClick,
	bannerButtonText,
	secondaryButton,
	previewBanner,
	children,
	isSecondaryBanner,
}: {
	bannerTitle: string;
	bannerText: string | React.ReactNode;
	bannerClass: string;
	showAIDisclaimer: boolean;
	buttonIsLink?: boolean;
	bannerButtonOnClick?: () => void;
	bannerButtonText?: string;
	secondaryButton?: React.ReactNode;
	previewBanner?: React.ReactNode;
	children?: React.ReactNode;
	isSecondaryBanner?: boolean;
} ) => {
	const TextTag = typeof bannerText === 'string' ? 'p' : 'div';
	const TitleTag = isSecondaryBanner ? 'h2' : 'h1';
	return (
		<div
			className={ clsx(
				'poocommerce-customize-store-banner',
				bannerClass
			) }
		>
			<div className={ `poocommerce-customize-store-banner-content` }>
				<div className="banner-actions">
					<TitleTag>{ bannerTitle }</TitleTag>
					<TextTag>{ bannerText }</TextTag>
					{ bannerButtonText && (
						<Button
							onClick={ () =>
								bannerButtonOnClick && bannerButtonOnClick()
							}
							variant={ buttonIsLink ? 'link' : 'primary' }
						>
							{ bannerButtonText }
						</Button>
					) }
					{ secondaryButton }
					{ showAIDisclaimer && (
						<p className="ai-disclaimer">
							{ interpolateComponents( {
								mixedString: __(
									'Powered by experimental AI. {{link}}Learn more{{/link}}',
									'poocommerce'
								),
								components: {
									link: (
										<Link
											href="https://automattic.com/ai-guidelines"
											target="_blank"
											type="external"
										/>
									),
								},
							} ) }
						</p>
					) }
				</div>
				{ children }
			</div>
			{ previewBanner }
		</div>
	);
};

export const NetworkOfflineBanner = () => {
	return (
		<BaseIntroBanner
			bannerTitle={ __(
				'Looking to design your store using AI?',
				'poocommerce'
			) }
			bannerText={ __(
				"Unfortunately, the [AI Store designer] isn't available right now as we can't detect your network. Please check your internet connection.",
				'poocommerce'
			) }
			bannerClass="offline-banner"
			bannerButtonOnClick={ () => {} }
			showAIDisclaimer={ true }
		/>
	);
};

export const JetpackOfflineBanner = ( {
	sendEvent,
}: {
	sendEvent: Sender< customizeStoreStateMachineEvents >;
} ) => {
	return (
		<BaseIntroBanner
			bannerTitle={ __(
				'Looking to design your store using AI?',
				'poocommerce'
			) }
			bannerText={ __(
				"It looks like you're using Jetpack's offline mode — switch to online mode to start designing with AI.",
				'poocommerce'
			) }
			bannerClass="offline-banner"
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				sendEvent( {
					type: 'JETPACK_OFFLINE_HOWTO',
				} );
			} }
			bannerButtonText={ __( 'Find out how', 'poocommerce' ) }
			showAIDisclaimer={ true }
		/>
	);
};

export const NoAIBanner = ( {
	redirectToCYSFlow,
}: {
	redirectToCYSFlow: () => void;
} ) => {
	return (
		<BaseIntroBanner
			bannerTitle={ __( 'Design your own', 'poocommerce' ) }
			bannerText={ __(
				'Quickly create a beautiful store using our built-in store designer. Choose your layout, select a style, and much more.',
				'poocommerce'
			) }
			bannerClass="no-ai-banner"
			bannerButtonText={ __( 'Start designing', 'poocommerce' ) }
			bannerButtonOnClick={ () => {
				redirectToCYSFlow();
			} }
			showAIDisclaimer={ false }
		/>
	);
};

export const ExistingNoAiThemeBanner = () => {
	const siteUrl = getAdminSetting( 'siteUrl' ) + '?cys-hide-admin-bar=1';

	return (
		<BaseIntroBanner
			bannerTitle={ __( 'Customize your theme', 'poocommerce' ) }
			bannerText={ __(
				'Customize everything from the color palette and the fonts to the page layouts, making sure every detail aligns with your brand.',
				'poocommerce'
			) }
			bannerClass="existing-no-ai-theme-banner"
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				trackEvent( 'customize_your_store_intro_customize_click', {
					theme_type: 'block',
				} );
				navigateOrParent(
					window,
					getNewPath(
						{ customizing: true },
						'/customize-store/assembler-hub',
						{}
					)
				);
			} }
			bannerButtonText={ __( 'Customize your store', 'poocommerce' ) }
			showAIDisclaimer={ false }
			previewBanner={ <IntroSiteIframe siteUrl={ siteUrl } /> }
		></BaseIntroBanner>
	);
};

export const ClassicThemeBanner = () => {
	const siteUrl = getAdminSetting( 'siteUrl' ) + '?cys-hide-admin-bar=1';

	return (
		<BaseIntroBanner
			bannerTitle={ __( 'Customize your theme', 'poocommerce' ) }
			bannerText={ __(
				'Customize everything from the color palette and the fonts to the page layouts, making sure every detail aligns with your brand.',
				'poocommerce'
			) }
			bannerClass="existing-no-ai-theme-banner"
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				trackEvent( 'customize_your_store_intro_customize_click', {
					theme_type: 'classic',
				} );
				navigateOrParent(
					window,
					'customize.php?return=/wp-admin/themes.php'
				);
			} }
			bannerButtonText={ __( 'Go to the Customizer', 'poocommerce' ) }
			showAIDisclaimer={ false }
			previewBanner={ <IntroSiteIframe siteUrl={ siteUrl } /> }
		></BaseIntroBanner>
	);
};

export const NonDefaultBlockThemeBanner = () => {
	const siteUrl = getAdminSetting( 'siteUrl' ) + '?cys-hide-admin-bar=1';

	return (
		<BaseIntroBanner
			bannerTitle={ __( 'Customize your theme', 'poocommerce' ) }
			bannerText={ __(
				'Customize everything from the color palette and the fonts to the page layouts, making sure every detail aligns with your brand.',
				'poocommerce'
			) }
			bannerClass="existing-no-ai-theme-banner"
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				trackEvent( 'customize_your_store_intro_customize_click', {
					theme_type: 'block',
				} );
				navigateOrParent( window, `${ ADMIN_URL }site-editor.php` );
			} }
			bannerButtonText={ __( 'Go to the Editor', 'poocommerce' ) }
			showAIDisclaimer={ false }
			previewBanner={ <IntroSiteIframe siteUrl={ siteUrl } /> }
		></BaseIntroBanner>
	);
};

export const PickYourThemeBanner = ( {
	sendEvent,
}: {
	sendEvent: Sender< customizeStoreStateMachineEvents >;
} ) => {
	return (
		<BaseIntroBanner
			isSecondaryBanner
			bannerTitle={ __( 'Pick your perfect theme', 'poocommerce' ) }
			bannerText={
				<div className="pick-your-theme-banner__content">
					<p>
						{ __(
							'Bring your vision to life — no coding required. Explore hundreds of free and paid ecommerce-optimized themes.',
							'poocommerce'
						) }
					</p>
					<ul>
						<li>
							{ __( 'Themes for every industry', 'poocommerce' ) }
						</li>
						<li>
							{ __(
								'Ready to use out of the box',
								'poocommerce'
							) }
						</li>
						<li>
							{ __(
								'30-day money-back guarantee',
								'poocommerce'
							) }
						</li>
					</ul>
				</div>
			}
			bannerButtonText={ __( 'Browse the Marketplace', 'poocommerce' ) }
			bannerButtonOnClick={ () => {
				sendEvent( {
					type: 'SELECTED_BROWSE_ALL_THEMES',
				} );
			} }
			showAIDisclaimer={ false }
			bannerClass="pick-your-theme-banner"
		/>
	);
};
