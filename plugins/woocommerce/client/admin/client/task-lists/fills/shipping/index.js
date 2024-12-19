/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component } from '@wordpress/element';
import { Button, Card, CardBody } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { filter } from 'lodash';
import interpolateComponents from '@automattic/interpolate-components';
import { withDispatch, withSelect } from '@wordpress/data';
import { Link, Stepper, Plugins } from '@poocommerce/components';
import { getAdminLink } from '@poocommerce/settings';
import { getHistory, getNewPath } from '@poocommerce/navigation';
import {
	SETTINGS_STORE_NAME,
	ONBOARDING_STORE_NAME,
	PLUGINS_STORE_NAME,
	COUNTRIES_STORE_NAME,
	SHIPPING_METHODS_STORE_NAME,
} from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { registerPlugin } from '@wordpress/plugins';
import { WooOnboardingTask } from '@poocommerce/onboarding';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import Connect from '../../../dashboard/components/connect';
import { getCountryCode } from '../../../dashboard/utils';
import StoreLocation from '../steps/location';
import ShippingRates from './rates';
import { createNoticesFromResponse } from '../../../lib/notices';
import './shipping.scss';
import {
	ShippingLayoutColumn,
	ShippingLayoutRow,
} from './shipping-providers/partners';
import { TermsOfService } from '~/task-lists/components/terms-of-service';

export class Shipping extends Component {
	constructor( props ) {
		super( props );

		this.initialState = {
			isPending: false,
			step: 'store_location',
			shippingZones: [],
		};

		// Cache active plugins to prevent removal mid-step.
		this.activePlugins = props.activePlugins;
		this.state = this.initialState;
		this.completeStep = this.completeStep.bind( this );

		this.shippingSmartDefaultsEnabled =
			window.wcAdminFeatures &&
			window.wcAdminFeatures[ 'shipping-smart-defaults' ];

		this.storeLocationCompleted = false;
		this.shippingPartners = props.shippingPartners;

		this.jetpackAuthRedirectUrl = getAdminLink( 'admin.php?page=wc-admin' );
	}

	componentDidMount() {
		this.reset();
	}

	reset() {
		this.setState( this.initialState );
	}

	async fetchShippingZones() {
		const { countryCode, countryName } = this.props;

		// @todo The following fetches for shipping information should be moved into
		// @poocommerce/data to make these methods and states more readily available.
		const shippingZones = [];
		const zones = await apiFetch( { path: '/wc/v3/shipping/zones' } );
		let hasCountryZone = false;

		await Promise.all(
			zones.map( async ( zone ) => {
				// "Rest of the world zone"
				if ( zone.id === 0 ) {
					zone.methods = await apiFetch( {
						path: `/wc/v3/shipping/zones/${ zone.id }/methods`,
					} );
					zone.name = __( 'Rest of the world', 'poocommerce' );
					zone.toggleable = true;
					shippingZones.push( zone );
					return;
				}

				// Return any zone with a single location matching the country zone.
				zone.locations = await apiFetch( {
					path: `/wc/v3/shipping/zones/${ zone.id }/locations`,
				} );
				const countryLocation = zone.locations.find(
					( location ) => countryCode === location.code
				);
				if ( countryLocation ) {
					zone.methods = await apiFetch( {
						path: `/wc/v3/shipping/zones/${ zone.id }/methods`,
					} );
					shippingZones.push( zone );
					hasCountryZone = true;
				}
			} )
		);

		// Create the default store country zone if it doesn't exist.
		if ( ! hasCountryZone ) {
			const zone = await apiFetch( {
				method: 'POST',
				path: '/wc/v3/shipping/zones',
				data: { name: countryName },
			} );
			zone.locations = await apiFetch( {
				method: 'POST',
				path: `/wc/v3/shipping/zones/${ zone.id }/locations`,
				data: [ { code: countryCode, type: 'country' } ],
			} );
			shippingZones.push( zone );
		}

		shippingZones.reverse();

		this.setState( { isPending: false, shippingZones } );
	}

	componentDidUpdate( prevProps, prevState ) {
		const { countryCode, countryName, settings } = this.props;
		const {
			poocommerce_store_address: storeAddress,
			poocommerce_default_country: defaultCountry,
			poocommerce_store_postcode: storePostCode,
		} = settings;
		const { step } = this.state;

		if (
			step === 'rates' &&
			( prevProps.countryCode !== countryCode ||
				prevProps.countryName !== countryName ||
				prevState.step !== 'rates' )
		) {
			this.setState( { isPending: true } );
			if ( countryName ) {
				this.fetchShippingZones();
			}
		}

		const isCompleteAddress = Boolean(
			storeAddress && defaultCountry && storePostCode
		);

		if ( step === 'store_location' && isCompleteAddress ) {
			if (
				this.shippingSmartDefaultsEnabled &&
				! this.storeLocationCompleted
			) {
				this.completeStep();
				this.storeLocationCompleted = true;
			} else if ( ! this.shippingSmartDefaultsEnabled ) {
				this.completeStep();
			}
		}
	}

	completeStep() {
		const { createNotice, onComplete } = this.props;
		const { step } = this.state;
		const steps = this.getSteps();
		const currentStepIndex = steps.findIndex( ( s ) => s.key === step );
		const nextStep = steps[ currentStepIndex + 1 ];

		if ( nextStep ) {
			this.setState( { step: nextStep.key } );
		} else {
			createNotice(
				'success',
				__(
					'📦 Shipping is done! Don’t worry, you can always change it later',
					'poocommerce'
				)
			);
			onComplete();
		}
	}

	getSteps() {
		const {
			countryCode,
			createNotice,
			invalidateResolutionForStoreSelector,
			isJetpackConnected,
			onComplete,
			optimisticallyCompleteTask,
			settings,
			task,
			updateAndPersistSettingsForGroup,
			shippingPartners,
		} = this.props;
		const pluginsToPromote = shippingPartners;

		const pluginsToActivate = pluginsToPromote.map( ( pluginToPromote ) => {
			return pluginToPromote.slug;
		} );

		const onShippingPluginInstalltionSkip = () => {
			recordEvent( 'tasklist_shipping_label_printing', {
				install: false,
				plugins_to_activate: pluginsToActivate,
			} );
			getHistory().push( getNewPath( {}, '/', {} ) );
			onComplete();
		};

		const getSinglePluginDescription = ( name, url ) => {
			return interpolateComponents( {
				mixedString: sprintf(
					/* translators: %s = plugin name */
					__(
						'Save time and money by printing your shipping labels right from your computer with %1$s. Try %2$s for free. {{link}}Learn more{{/link}}',
						'poocommerce'
					),
					name,
					name
				),
				components: {
					link: <Link href={ url } target="_blank" type="external" />,
				},
			} );
		};

		const requiresJetpackConnection =
			! isJetpackConnected && countryCode === 'US';

		let steps = [
			{
				key: 'store_location',
				label: __( 'Set store location', 'poocommerce' ),
				description: __(
					'The address from which your business operates',
					'poocommerce'
				),
				content: (
					<StoreLocation
						createNotice={ createNotice }
						updateAndPersistSettingsForGroup={
							updateAndPersistSettingsForGroup
						}
						settings={ settings }
						onComplete={ ( values ) => {
							const country = getCountryCode(
								values.countryState
							);
							recordEvent( 'tasklist_shipping_set_location', {
								country,
							} );

							// Don't need to trigger completeStep here as it's triggered by the address updates in the componentDidUpdate function.
							if ( this.shippingSmartDefaultsEnabled ) {
								this.completeStep();
							}
						} }
					/>
				),
				visible: true,
			},
			{
				key: 'rates',
				label: __( 'Set shipping costs', 'poocommerce' ),
				description: __(
					'Define how much customers pay to ship to different destinations',
					'poocommerce'
				),
				content: (
					<ShippingRates
						buttonText={
							pluginsToActivate.length ||
							requiresJetpackConnection
								? __( 'Continue', 'poocommerce' )
								: __( 'Complete task', 'poocommerce' )
						}
						shippingZones={ this.state.shippingZones }
						onComplete={ () => {
							const { id } = task;
							optimisticallyCompleteTask( id );
							invalidateResolutionForStoreSelector();
							this.completeStep();
						} }
						createNotice={ createNotice }
					/>
				),
				visible:
					settings.poocommerce_ship_to_countries === 'disabled'
						? false
						: true,
			},
			{
				key: 'label_printing',
				label: __( 'Enable shipping label printing', 'poocommerce' ),
				description: pluginsToActivate.includes(
					'poocommerce-shipstation-integration'
				)
					? interpolateComponents( {
							mixedString: __(
								'We recommend using ShipStation to save time at the post office by printing your shipping ' +
									'labels at home. Try ShipStation free for 30 days. {{link}}Learn more{{/link}}.',
								'poocommerce'
							),
							components: {
								link: (
									<Link
										href="https://poocommerce.com/products/shipstation-integration?utm_medium=product"
										target="_blank"
										type="external"
									/>
								),
							},
					  } )
					: __(
							'With PooCommerce Shipping you can save time ' +
								'by printing your USPS and DHL Express shipping labels at home',
							'poocommerce'
					  ),
				content: (
					<>
						{ ! isJetpackConnected &&
							pluginsToActivate.includes(
								'poocommerce-services'
							) && (
								<TermsOfService
									buttonText={ __(
										'Install & enable',
										'poocommerce'
									) }
								/>
							) }
						<Plugins
							onComplete={ ( _plugins, response ) => {
								createNoticesFromResponse( response );
								recordEvent(
									'tasklist_shipping_label_printing',
									{
										install: true,
										plugins_to_activate: pluginsToActivate,
									}
								);
								this.completeStep();
							} }
							onError={ ( errors, response ) =>
								createNoticesFromResponse( response )
							}
							onSkip={ () => {
								recordEvent(
									'tasklist_shipping_label_printing',
									{
										install: false,
										plugins_to_activate: pluginsToActivate,
									}
								);
								invalidateResolutionForStoreSelector();
								getHistory().push( getNewPath( {}, '/', {} ) );
								onComplete();
							} }
							pluginSlugs={ pluginsToActivate }
						/>
					</>
				),
				visible: pluginsToActivate.length,
			},

			// Only needed for PooCommerce Shipping
			{
				key: 'connect',
				label: __( 'Connect your store', 'poocommerce' ),
				description: __(
					'Connect your store to WordPress.com to enable label printing',
					'poocommerce'
				),
				content: (
					<Connect
						redirectUrl={ this.jetpackAuthRedirectUrl }
						completeStep={ this.completeStep }
						onConnect={ () => {
							recordEvent( 'tasklist_shipping_connect_store' );
						} }
					/>
				),
				visible: requiresJetpackConnection,
			},
		];

		// Override the step fields for the smart shipping defaults.
		if ( this.shippingSmartDefaultsEnabled ) {
			const shippingSmartDefaultsSteps = {
				rates: {
					label: __( 'Review your shipping options', 'poocommerce' ),
					description: __(
						'We recommend the following shipping options based on your location. You can manage your shipping options again at any time in PooCommerce Shipping settings.',
						'poocommerce'
					),
					onClick:
						this.state.step !== 'rates'
							? () => {
									this.setState( { step: 'rates' } );
							  }
							: undefined,
					content: (
						<ShippingRates
							buttonText={ __(
								'Save shipping options',
								'poocommerce'
							) }
							shippingZones={ this.state.shippingZones }
							onComplete={ () => {
								const { id } = task;
								optimisticallyCompleteTask( id );
								invalidateResolutionForStoreSelector();
								this.completeStep();
							} }
							createNotice={ createNotice }
						/>
					),
				},
				label_printing: {
					label: __(
						'Enable shipping label printing and discounted rates',
						'poocommerce'
					),
					description:
						pluginsToPromote.length === 1
							? getSinglePluginDescription(
									pluginsToPromote[ 0 ].name,
									pluginsToPromote[ 0 ].learn_more_link
							  )
							: __(
									'Save time and money by printing your shipping labels right from your computer with one of these shipping solutions.',
									'poocommerce'
							  ),

					content: (
						<>
							{ pluginsToPromote.length === 1 ? (
								<ShippingLayoutColumn
									shippingMethod={ pluginsToPromote[ 0 ] }
								/>
							) : (
								<div className="poocommerce-task-shipping-recommendation_plugins-install-container">
									{ pluginsToPromote.map(
										( shippingMethod ) => {
											const pluginsForPartner = [
												shippingMethod?.slug,
												...( shippingMethod?.dependencies ??
													[] ),
											].filter(
												( element ) =>
													element !== undefined
											); // remove undefineds
											return (
												<ShippingLayoutRow
													shippingMethod={
														shippingMethod
													}
													key={ shippingMethod.name }
												>
													<div className="poocommerce-task-shipping-recommendations_plugins-buttons">
														<Plugins
															onComplete={ (
																response
															) => {
																createNoticesFromResponse(
																	response
																);
																recordEvent(
																	'tasklist_shipping_label_printing',
																	{
																		install: true,
																		plugins_to_activate:
																			pluginsForPartner,
																	}
																);
																invalidateResolutionForStoreSelector();
																this.completeStep();
															} }
															onError={ (
																errors,
																response
															) =>
																createNoticesFromResponse(
																	response
																)
															}
															installText={ __(
																'Install and enable',
																'poocommerce'
															) }
															learnMoreLink={
																shippingMethod.learn_more_link
															}
															onLearnMore={ () => {
																recordEvent(
																	'tasklist_shipping_label_printing_learn_more',
																	{
																		plugin: shippingMethod.slug,
																	}
																);
															} }
															pluginSlugs={
																pluginsForPartner
															}
															installButtonVariant={
																'secondary'
															}
														/>
													</div>
												</ShippingLayoutRow>
											);
										}
									) }
								</div>
							) }
							{ pluginsToPromote.length === 1 &&
								pluginsToPromote[ 0 ].slug === undefined && ( // if it doesn't have a slug we just show a download button
									<a
										href={
											pluginsToPromote[ 0 ]
												.learn_more_link
										}
										target="_blank"
										rel="noreferrer"
									>
										<Button variant="primary">
											{ __( 'Download', 'poocommerce' ) }
										</Button>
									</a>
								) }
							{ pluginsToPromote.length === 1 &&
							pluginsToPromote[ 0 ].slug ? (
								<>
									{ ! isJetpackConnected &&
										pluginsToPromote[ 0 ].slug ===
											'poocommerce-services' && (
											<TermsOfService
												buttonText={ __(
													'Install and enable',
													'poocommerce'
												) }
											/>
										) }
									<Plugins
										onComplete={ ( _plugins, response ) => {
											createNoticesFromResponse(
												response
											);
											recordEvent(
												'tasklist_shipping_label_printing',
												{
													install: true,
													plugins_to_activate:
														pluginsToActivate,
												}
											);
											invalidateResolutionForStoreSelector();
											this.completeStep();
										} }
										onError={ ( errors, response ) =>
											createNoticesFromResponse(
												response
											)
										}
										onSkip={
											onShippingPluginInstalltionSkip
										}
										pluginSlugs={ pluginsToActivate }
										installText={ __(
											'Install and enable',
											'poocommerce'
										) }
									/>
								</>
							) : (
								<Button
									isTertiary
									onClick={ onShippingPluginInstalltionSkip }
									className={ clsx(
										'poocommerce-task-shipping-recommendations_skip-button',
										pluginsToPromote.length === 2
											? 'dual'
											: ''
									) }
								>
									{ __( 'No Thanks', 'poocommerce' ) }
								</Button>
							) }
						</>
					),
				},
				store_location: {
					label: __( 'Set your store location', 'poocommerce' ),
					description: __(
						'Add your store location to help us calculate shipping rates and the best shipping options for you. You can manage your store location again at any time in PooCommerce Settings General.',
						'poocommerce'
					),
					onClick:
						this.state.step !== 'store_location'
							? () => {
									this.setState( { step: 'store_location' } );
							  }
							: undefined,
					buttonText: __( 'Save store location', 'poocommerce' ),
				},
			};

			steps = steps.map( ( step ) => {
				if ( shippingSmartDefaultsSteps.hasOwnProperty( step.key ) ) {
					step = {
						...step,
						...shippingSmartDefaultsSteps[ step.key ],
					};
				}
				// Empty description field if it's not the current step.
				if ( step.key !== this.state.step ) {
					step.description = '';
				}
				return step;
			} );
		}
		return filter( steps, ( step ) => step.visible );
	}

	render() {
		const { isPending, step } = this.state;
		const { isUpdateSettingsRequesting } = this.props;
		const steps = this.getSteps();

		return (
			<div className="poocommerce-task-shipping">
				<Card className="poocommerce-task-card">
					<CardBody>
						<Stepper
							isPending={
								isPending || isUpdateSettingsRequesting
							}
							isVertical
							currentStep={ step }
							steps={ steps }
						/>
					</CardBody>
				</Card>
			</div>
		);
	}
}

const ShippingWrapper = compose(
	withSelect( ( select ) => {
		const { getSettings, isUpdateSettingsRequesting } =
			select( SETTINGS_STORE_NAME );
		const { getActivePlugins, isJetpackConnected } =
			select( PLUGINS_STORE_NAME );
		const { getCountry } = select( COUNTRIES_STORE_NAME );

		const { general: settings = {} } = getSettings( 'general' );
		const countryCode = getCountryCode(
			settings.poocommerce_default_country
		);

		const shippingPartners = select(
			SHIPPING_METHODS_STORE_NAME
		).getShippingMethods();

		const country = countryCode ? getCountry( countryCode ) : null;
		const countryName = country ? country.name : null;
		const activePlugins = getActivePlugins();

		return {
			countryCode,
			countryName,
			isUpdateSettingsRequesting: isUpdateSettingsRequesting( 'general' ),
			settings,
			activePlugins,
			isJetpackConnected: isJetpackConnected(),
			shippingPartners,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { createNotice } = dispatch( 'core/notices' );
		const { updateAndPersistSettingsForGroup } =
			dispatch( SETTINGS_STORE_NAME );
		const {
			invalidateResolutionForStoreSelector,
			optimisticallyCompleteTask,
		} = dispatch( ONBOARDING_STORE_NAME );

		return {
			createNotice,
			invalidateResolutionForStoreSelector,
			optimisticallyCompleteTask,
			updateAndPersistSettingsForGroup,
		};
	} )
)( Shipping );

registerPlugin( 'wc-admin-onboarding-task-shipping', {
	scope: 'poocommerce-tasks',
	render: () => (
		<WooOnboardingTask id="shipping">
			{ ( { onComplete, task } ) => {
				return (
					<ShippingWrapper onComplete={ onComplete } task={ task } />
				);
			} }
		</WooOnboardingTask>
	),
} );
