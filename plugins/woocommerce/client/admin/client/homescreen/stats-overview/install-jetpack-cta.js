/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	PLUGINS_STORE_NAME,
	useUser,
	useUserPreferences,
} from '@poocommerce/data';
import { H } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';
import { getAdminLink } from '@poocommerce/settings';
import { createErrorNotice } from '@poocommerce/data/src/plugins/actions';

const getJetpackInstallText = ( jetpackInstallState ) => {
	return (
		{
			unavailable: __( 'Get Jetpack', 'poocommerce' ),
			installed: __( 'Activate Jetpack', 'poocommerce' ),
			activated: __( 'Connect Jetpack', 'poocommerce' ),
		}[ jetpackInstallState ] || ''
	);
};

export const JetpackCTA = ( {
	onClickInstall,
	onClickDismiss,
	isBusy,
	jetpackInstallState,
} ) => {
	return (
		<article className="poocommerce-stats-overview__install-jetpack-promo">
			<div className="poocommerce-stats-overview__install-jetpack-promo__content">
				<H>{ __( 'Get traffic stats with Jetpack', 'poocommerce' ) }</H>
				<p>
					{ __(
						'Keep an eye on your views and visitors metrics with ' +
							'Jetpack. Requires Jetpack plugin and a WordPress.com ' +
							'account.',
						'poocommerce'
					) }
				</p>
			</div>
			<footer>
				<Button
					isSecondary
					onClick={ () => {
						recordEvent( 'statsoverview_install_jetpack' );
						onClickInstall();
					} }
					disabled={ isBusy }
					isBusy={ isBusy }
				>
					{ getJetpackInstallText( jetpackInstallState ) }
				</Button>
				<Button
					isTertiary
					onClick={ () => {
						recordEvent( 'statsoverview_dismiss_install_jetpack' );
						onClickDismiss();
					} }
					disabled={ isBusy }
					isBusy={ isBusy }
				>
					{ __( 'No thanks', 'poocommerce' ) }
				</Button>
			</footer>
		</article>
	);
};

export const InstallJetpackCTA = () => {
	const { currentUserCan } = useUser();
	const { updateUserPreferences, ...userPrefs } = useUserPreferences();
	const { canUserInstallPlugins, jetpackInstallState, isBusy } = useSelect(
		( select ) => {
			const { getPluginInstallState, isPluginsRequesting } =
				select( PLUGINS_STORE_NAME );
			const installState = getPluginInstallState( 'jetpack' );
			const busyState =
				isPluginsRequesting( 'getJetpackConnectUrl' ) ||
				isPluginsRequesting( 'installPlugins' ) ||
				isPluginsRequesting( 'activatePlugins' );

			return {
				isBusy: busyState,
				jetpackInstallState: installState,
				canUserInstallPlugins: currentUserCan( 'install_plugins' ),
			};
		}
	);

	const { installJetpackAndConnect } = useDispatch( PLUGINS_STORE_NAME );

	if ( ! canUserInstallPlugins ) {
		return null;
	}

	const onClickInstall = () => {
		installJetpackAndConnect( createErrorNotice, getAdminLink );
	};

	return (
		<JetpackCTA
			jetpackInstallState={ jetpackInstallState }
			isBusy={ isBusy }
			onClickInstall={ onClickInstall }
			onClickDismiss={ () => {
				const homepageStats = userPrefs.homepage_stats || {};
				homepageStats.installJetpackDismissed = true;
				updateUserPreferences( {
					homepage_stats: homepageStats,
				} );
			} }
		/>
	);
};
