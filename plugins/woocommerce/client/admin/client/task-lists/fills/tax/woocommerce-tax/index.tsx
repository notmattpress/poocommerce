/**
 * External dependencies
 */
import { difference } from 'lodash';
import { useSelect } from '@wordpress/data';
import { Spinner } from '@poocommerce/components';
import { pluginsStore, settingsStore } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import {
	AUTOMATION_PLUGINS,
	hasCompleteAddress,
	TaxChildProps,
} from '../utils';
import { AutomatedTaxes } from './automated-taxes';
import { Setup } from './setup';

export const PooCommerceTax: React.FC< TaxChildProps > = ( {
	isPending,
	onAutomate,
	onManual,
	onDisable,
} ) => {
	const {
		generalSettings,
		isJetpackConnected,
		isResolving,
		pluginsToActivate,
	} = useSelect( ( select ) => {
		const { getSettings } = select( settingsStore );
		const { getActivePlugins, hasFinishedResolution } =
			select( pluginsStore );
		const activePlugins = getActivePlugins();

		return {
			generalSettings: getSettings( 'general' ).general,
			isJetpackConnected: select( pluginsStore ).isJetpackConnected(),
			isResolving:
				// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
				! hasFinishedResolution( 'isJetpackConnected' ) ||
				! select( settingsStore ).hasFinishedResolution(
					'getSettings',
					[ 'general' ]
				) ||
				// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
				! hasFinishedResolution( 'getActivePlugins' ),
			pluginsToActivate: difference( AUTOMATION_PLUGINS, activePlugins ),
		};
	}, [] );

	const canAutomateTaxes = () => {
		return (
			hasCompleteAddress( generalSettings || {} ) &&
			! pluginsToActivate.length &&
			isJetpackConnected
		);
	};

	if ( isResolving ) {
		return <Spinner />;
	}

	const childProps = {
		isPending,
		onAutomate,
		onManual,
		onDisable,
	};

	if ( canAutomateTaxes() ) {
		return <AutomatedTaxes { ...childProps } />;
	}

	return <Setup { ...childProps } />;
};
