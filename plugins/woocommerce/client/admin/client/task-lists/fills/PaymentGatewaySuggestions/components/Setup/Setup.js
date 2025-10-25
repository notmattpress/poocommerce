/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody } from '@wordpress/components';
import {
	optionsStore,
	PAYMENT_GATEWAYS_STORE_NAME,
	pluginsStore,
} from '@poocommerce/data';
import { Plugins, Stepper } from '@poocommerce/components';
import { WooPaymentGatewaySetup } from '@poocommerce/onboarding';
import { recordEvent } from '@poocommerce/tracks';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { useSlot } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import { createNoticesFromResponse } from '~/lib/notices';
import { enqueueScript } from '~/utils/enqueue-script';
import { Configure } from './Configure';
import './Setup.scss';

export const Setup = ( { markConfigured, paymentGateway } ) => {
	const {
		id,
		plugins = [],
		title,
		postInstallScripts,
		installed: gatewayInstalled,
	} = paymentGateway;
	const slot = useSlot( `poocommerce_payment_gateway_setup_${ id }` );
	const hasFills = Boolean( slot?.fills?.length );
	const [ isPluginLoaded, setIsPluginLoaded ] = useState( false );

	useEffect( () => {
		recordEvent( 'payments_task_stepper_view', {
			payment_method: id,
		} );
	}, [] );

	const { invalidateResolutionForStoreSelector } = useDispatch(
		PAYMENT_GATEWAYS_STORE_NAME
	);

	const { isOptionUpdating, isPaymentGatewayResolving, needsPluginInstall } =
		useSelect( ( select ) => {
			const { isOptionsUpdating } = select( optionsStore );
			const { isResolving } = select( PAYMENT_GATEWAYS_STORE_NAME );
			const activePlugins = select( pluginsStore ).getActivePlugins();
			const pluginsToInstall = plugins.filter(
				( m ) => ! activePlugins.includes( m )
			);

			return {
				isOptionUpdating: isOptionsUpdating(),
				isPaymentGatewayResolving: isResolving( 'getPaymentGateways' ),
				needsPluginInstall: !! pluginsToInstall.length,
			};
		} );

	useEffect( () => {
		if ( needsPluginInstall ) {
			return;
		}

		if ( postInstallScripts && postInstallScripts.length ) {
			const scriptPromises = postInstallScripts.map( ( script ) =>
				enqueueScript( script )
			);
			Promise.all( scriptPromises ).then( () => {
				setIsPluginLoaded( true );
			} );
			return;
		}

		setIsPluginLoaded( true );
	}, [ postInstallScripts, needsPluginInstall ] );

	const installStep = useMemo( () => {
		return plugins && plugins.length
			? {
					key: 'install',
					label: sprintf(
						/* translators: %s = title of the payment gateway to install */
						__( 'Install %s', 'poocommerce' ),
						title
					),
					content: (
						<Plugins
							onComplete={ ( installedPlugins, response ) => {
								createNoticesFromResponse( response );
								invalidateResolutionForStoreSelector(
									'getPaymentGateways'
								);
								recordEvent(
									'tasklist_payment_install_method',
									{
										plugins,
									}
								);
							} }
							onError={ ( errors, response ) =>
								createNoticesFromResponse( response )
							}
							autoInstall
							pluginSlugs={ plugins }
						/>
					),
			  }
			: null;
	}, [] );

	const configureStep = useMemo(
		() => ( {
			key: 'configure',
			label: sprintf(
				/* translators: %s = title of the payment gateway to install */
				__( 'Configure your %(title)s account', 'poocommerce' ),
				{
					title,
				}
			),
			content: gatewayInstalled ? (
				<Configure
					markConfigured={ markConfigured }
					paymentGateway={ paymentGateway }
				/>
			) : null,
		} ),
		[ gatewayInstalled ]
	);

	const stepperPending =
		needsPluginInstall ||
		isOptionUpdating ||
		isPaymentGatewayResolving ||
		! isPluginLoaded;

	const defaultStepper = (
		<Stepper
			isVertical
			isPending={ stepperPending }
			currentStep={ needsPluginInstall ? 'install' : 'configure' }
			steps={ [ installStep, configureStep ].filter( Boolean ) }
		/>
	);

	return (
		<Card className="poocommerce-task-payment-method poocommerce-task-card">
			<CardBody>
				{ hasFills ? (
					<WooPaymentGatewaySetup.Slot
						fillProps={ {
							defaultStepper,
							defaultInstallStep: installStep,
							defaultConfigureStep: configureStep,
							markConfigured: () => markConfigured( id ),
							paymentGateway,
						} }
						id={ id }
					/>
				) : (
					defaultStepper
				) }
			</CardBody>
		</Card>
	);
};
