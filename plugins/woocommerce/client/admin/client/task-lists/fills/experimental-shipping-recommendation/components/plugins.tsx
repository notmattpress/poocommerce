/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Plugins as PluginInstaller } from '@poocommerce/components';
import { optionsStore, InstallPluginsResponse } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { createNoticesFromResponse } from '~/lib/notices';
import { TermsOfService } from '~/task-lists/components/terms-of-service';

const isWcShippingOptions = (
	wcShippingOptions: unknown
): wcShippingOptions is {
	[ key: string ]: unknown;
} => typeof wcShippingOptions === 'object' && wcShippingOptions !== null;

type Props = {
	nextStep: () => void;
	pluginsToActivate: string[];
};

export const Plugins = ( { nextStep, pluginsToActivate }: Props ) => {
	const { updateOptions } = useDispatch( optionsStore );
	const { isResolving, tosAccepted } = useSelect( ( select ) => {
		const { getOption, hasFinishedResolution } = select( optionsStore );
		const wcShippingOptions = getOption( 'wcshipping_options' );

		return {
			isResolving:
				! hasFinishedResolution( 'getOption', [
					'poocommerce_setup_jetpack_opted_in',
				] ) ||
				! hasFinishedResolution( 'getOption', [
					'wcshipping_options',
				] ),
			tosAccepted:
				( isWcShippingOptions( wcShippingOptions ) &&
					wcShippingOptions?.tos_accepted ) ||
				getOption( 'poocommerce_setup_jetpack_opted_in' ) === '1',
		};
	}, [] );

	useEffect( () => {
		if ( ! tosAccepted || pluginsToActivate.length ) {
			return;
		}

		nextStep();
	}, [ nextStep, pluginsToActivate, tosAccepted ] );

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
					recordEvent(
						'tasklist_shipping_recommendation_install_extensions',
						{
							install_extensions: true,
						}
					);
					updateOptions( {
						poocommerce_setup_jetpack_opted_in: true,
					} );
					nextStep();
				} }
				onError={ ( errors: unknown, response: unknown ) =>
					createNoticesFromResponse( response )
				}
				pluginSlugs={ pluginsToActivate }
			/>
		</>
	);
};
