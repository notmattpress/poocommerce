/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { difference } from 'lodash';
import { useEffect, useState } from '@wordpress/element';
import { Stepper } from '@poocommerce/components';
import { optionsStore, pluginsStore, settingsStore } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { AUTOMATION_PLUGINS } from '../utils';
import { Connect } from './connect';
import { Plugins } from './plugins';
import { StoreLocation } from '../components/store-location';
import './setup.scss';

export type SetupProps = {
	isPending: boolean;
	onDisable: () => void;
	onAutomate: () => void;
	onManual: () => void;
};

export type SetupStepProps = {
	isPending: boolean;
	isResolving: boolean;
	nextStep: () => void;
	onDisable: () => void;
	onAutomate: () => void;
	onManual: () => void;
	pluginsToActivate: string[];
};

export const Setup = ( {
	isPending,
	onDisable,
	onAutomate,
	onManual,
}: SetupProps ) => {
	const [ pluginsToActivate, setPluginsToActivate ] = useState< string[] >(
		[]
	);
	const { activePlugins, isResolving } = useSelect( ( select ) => {
		const { getSettings } = select( settingsStore );
		const { hasFinishedResolution } = select( optionsStore );
		const { getActivePlugins } = select( pluginsStore );

		return {
			activePlugins: getActivePlugins(),
			generalSettings: getSettings( 'general' )?.general,
			isResolving:
				! hasFinishedResolution( 'getOption', [
					'poocommerce_setup_jetpack_opted_in',
				] ) ||
				! hasFinishedResolution( 'getOption', [
					'wc_connect_options',
				] ),
		};
	}, [] );
	const [ stepIndex, setStepIndex ] = useState( 0 );

	useEffect( () => {
		const remainingPlugins = difference(
			AUTOMATION_PLUGINS,
			activePlugins
		);
		if ( remainingPlugins.length <= pluginsToActivate.length ) {
			return;
		}
		setPluginsToActivate( remainingPlugins );
	}, [ activePlugins, pluginsToActivate.length ] );

	const nextStep = () => {
		setStepIndex( stepIndex + 1 );
	};

	const stepProps = {
		isPending,
		isResolving,
		onAutomate,
		onDisable,
		nextStep,
		onManual,
		pluginsToActivate,
	};

	const steps = [
		{
			key: 'store_location',
			label: __( 'Set store location', 'poocommerce' ),
			description: __(
				'The address from which your business operates',
				'poocommerce'
			),
			content: <StoreLocation { ...stepProps } />,
		},
		{
			key: 'plugins',
			label: __( 'Install PooCommerce Tax', 'poocommerce' ),
			description: __(
				'PooCommerce Tax allows you to automate sales tax calculations',
				'poocommerce'
			),
			content: <Plugins { ...stepProps } />,
		},
		{
			key: 'connect',
			label: __( 'Connect your store', 'poocommerce' ),
			description: __(
				'Connect your store to WordPress.com to enable automated sales tax calculations',
				'poocommerce'
			),
			content: <Connect { ...stepProps } />,
		},
	];

	const step = steps[ stepIndex ];

	return (
		<Stepper
			isPending={ isResolving }
			isVertical={ true }
			currentStep={ step.key }
			steps={ steps }
		/>
	);
};
