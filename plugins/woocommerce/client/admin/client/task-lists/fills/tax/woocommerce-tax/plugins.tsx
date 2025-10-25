/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Plugins as PluginInstaller } from '@poocommerce/components';
import { optionsStore, InstallPluginsResponse } from '@poocommerce/data';
import { recordEvent, queueRecordEvent } from '@poocommerce/tracks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { createNoticesFromResponse } from '~/lib/notices';
import { SetupStepProps } from './setup';
import { TermsOfService } from '~/task-lists/components/terms-of-service';

const isWcConnectOptions = (
	wcConnectOptions: unknown
): wcConnectOptions is {
	[ key: string ]: unknown;
} => typeof wcConnectOptions === 'object' && wcConnectOptions !== null;

export const Plugins = ( {
	nextStep,
	onDisable,
	onManual,
	pluginsToActivate,
}: SetupStepProps ) => {
	const { updateOptions } = useDispatch( optionsStore );
	const { isResolving, tosAccepted } = useSelect( ( select ) => {
		const { getOption, hasFinishedResolution } = select( optionsStore );
		const wcConnectOptions = getOption( 'wc_connect_options' );

		return {
			isResolving:
				! hasFinishedResolution( 'getOption', [
					'poocommerce_setup_jetpack_opted_in',
				] ) ||
				! hasFinishedResolution( 'getOption', [
					'wc_connect_options',
				] ),
			tosAccepted:
				( isWcConnectOptions( wcConnectOptions ) &&
					wcConnectOptions?.tos_accepted ) ||
				getOption( 'poocommerce_setup_jetpack_opted_in' ) === '1',
		};
	}, [] );

	useEffect( () => {
		if ( ! tosAccepted || pluginsToActivate.length ) {
			return;
		}

		nextStep();
	}, [ isResolving, nextStep, pluginsToActivate.length, tosAccepted ] );

	if ( isResolving ) {
		return null;
	}

	return (
		<>
			{ ! tosAccepted && (
				<TermsOfService
					buttonText={ __( 'Install & enable', 'poocommerce' ) }
				/>
			) }
			<PluginInstaller
				onComplete={ (
					activatedPlugins: string[],
					response: InstallPluginsResponse
				) => {
					createNoticesFromResponse( response );
					recordEvent( 'tasklist_tax_install_extensions', {
						install_extensions: true,
					} );
					updateOptions( {
						poocommerce_setup_jetpack_opted_in: true,
					} );
					nextStep();
				} }
				onError={ ( errors: unknown, response: unknown ) =>
					createNoticesFromResponse( response )
				}
				onSkip={ () => {
					queueRecordEvent( 'tasklist_tax_install_extensions', {
						install_extensions: false,
					} );
					onManual();
				} }
				skipText={ __( 'Set up manually', 'poocommerce' ) }
				onAbort={ () => onDisable() }
				abortText={ __( "I don't charge sales tax", 'poocommerce' ) }
				pluginSlugs={ pluginsToActivate }
			/>
		</>
	);
};
