/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Button } from '@wordpress/components';
import { getNewPath } from '@poocommerce/navigation';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import { Intro } from '.';
import { IntroSiteIframe } from './intro-site-iframe';
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
}: {
	bannerTitle: string;
	bannerText: string;
	bannerClass: string;
	showAIDisclaimer: boolean;
	buttonIsLink?: boolean;
	bannerButtonOnClick?: () => void;
	bannerButtonText?: string;
	secondaryButton?: React.ReactNode;
	previewBanner?: React.ReactNode;
	children?: React.ReactNode;
} ) => {
	return (
		<div
			className={ clsx(
				'poocommerce-customize-store-banner',
				bannerClass
			) }
		>
			<div className={ `poocommerce-customize-store-banner-content` }>
				<div className="banner-actions">
					<h1>{ bannerTitle }</h1>
					<p>{ bannerText }</p>
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
	sendEvent: React.ComponentProps< typeof Intro >[ 'sendEvent' ];
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

export const ExistingThemeBanner = ( {
	setOpenDesignChangeWarningModal,
}: {
	setOpenDesignChangeWarningModal: ( arg0: boolean ) => void;
} ) => {
	return (
		<BaseIntroBanner
			bannerTitle={ __(
				'Use the power of AI to design your store',
				'poocommerce'
			) }
			bannerText={ __(
				'Design the look of your store, create pages, and generate copy using our built-in AI tools.',
				'poocommerce'
			) }
			bannerClass=""
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				setOpenDesignChangeWarningModal( true );
			} }
			bannerButtonText={ __( 'Design with AI', 'poocommerce' ) }
			showAIDisclaimer={ true }
		/>
	);
};

export const DefaultBanner = ( {
	sendEvent,
}: {
	sendEvent: React.ComponentProps< typeof Intro >[ 'sendEvent' ];
} ) => {
	return (
		<BaseIntroBanner
			bannerTitle={ __(
				'Use the power of AI to design your store',
				'poocommerce'
			) }
			bannerText={ __(
				'Design the look of your store, create pages, and generate copy using our built-in AI tools.',
				'poocommerce'
			) }
			bannerClass=""
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				sendEvent( {
					type: 'DESIGN_WITH_AI',
				} );
			} }
			bannerButtonText={ __( 'Design with AI', 'poocommerce' ) }
			showAIDisclaimer={ true }
		/>
	);
};

export const ThemeHasModsBanner = ( {
	setOpenDesignChangeWarningModal,
}: {
	setOpenDesignChangeWarningModal: ( arg0: boolean ) => void;
} ) => {
	return (
		<BaseIntroBanner
			bannerTitle={ __(
				'Use the power of AI to design your store',
				'poocommerce'
			) }
			bannerText={ __(
				'Design the look of your store, create pages, and generate copy using our built-in AI tools.',
				'poocommerce'
			) }
			bannerClass=""
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				setOpenDesignChangeWarningModal( true );
			} }
			bannerButtonText={ __( 'Design with AI', 'poocommerce' ) }
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
		<>
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
		</>
	);
};

export const ExistingAiThemeBanner = ( {
	setOpenDesignChangeWarningModal,
}: {
	setOpenDesignChangeWarningModal: ( arg0: boolean ) => void;
} ) => {
	const secondaryButton = (
		<Button
			className=""
			onClick={ () => {
				trackEvent(
					'customize_your_store_intro_create_a_new_one_click'
				);
				setOpenDesignChangeWarningModal( true );
			} }
			variant={ 'secondary' }
		>
			{ __( 'Create a new one', 'poocommerce' ) }
		</Button>
	);
	const siteUrl = getAdminSetting( 'siteUrl' ) + '?cys-hide-admin-bar=1';

	return (
		<BaseIntroBanner
			bannerTitle={ __( 'Customize your custom theme', 'poocommerce' ) }
			bannerText={ __(
				'Keep customizing the look of your AI-generated store, or start over and create a new one.',
				'poocommerce'
			) }
			bannerClass="existing-ai-theme-banner"
			buttonIsLink={ false }
			bannerButtonOnClick={ () => {
				trackEvent( 'customize_your_store_intro_customize_click' );
				navigateOrParent(
					window,
					getNewPath(
						{ customizing: true },
						'/customize-store/assembler-hub',
						{}
					)
				);
			} }
			bannerButtonText={ __( 'Customize', 'poocommerce' ) }
			secondaryButton={ secondaryButton }
			showAIDisclaimer={ true }
		>
			<div className={ 'poocommerce-block-preview-container' }>
				<div className="iframe-container">
					<IntroSiteIframe siteUrl={ siteUrl } />
				</div>
			</div>
		</BaseIntroBanner>
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
