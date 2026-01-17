/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Notice } from '@wordpress/components';
import { useState, createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { CoreProfilerStateMachineContext } from '../index';
import { BusinessLocationEvent } from '../events';
import { CountryStateOption } from '../services/country';
import { Heading } from '../components/heading/heading';
import { Navigation } from '../components/navigation/navigation';
import { GeolocationCountrySelect } from '../components/geolocation-country-select/geolocation-country-select';

export const BusinessLocation = ( {
	sendEvent,
	navigationProgress,
	context,
}: {
	sendEvent: ( event: BusinessLocationEvent ) => void;
	navigationProgress: number;
	context: Pick<
		CoreProfilerStateMachineContext,
		'geolocatedLocation' | 'countries'
	>;
} ) => {
	const [ storeCountry, setStoreCountry ] = useState< CountryStateOption >( {
		key: '',
		label: '',
	} );

	const inputLabel = __( 'Select country/region', 'poocommerce' );

	return (
		<div
			className="poocommerce-profiler-business-location"
			data-testid="core-profiler-business-location"
		>
			<Navigation percentage={ navigationProgress } />
			<div className="poocommerce-profiler-page__content poocommerce-profiler-business-location__content">
				<Heading
					className="poocommerce-profiler__stepper-heading"
					title={ __(
						'Where is your business located?',
						'poocommerce'
					) }
					subTitle={ __(
						'We’ll use this information to help you set up payments, shipping, and taxes.',
						'poocommerce'
					) }
				/>
				<GeolocationCountrySelect
					countries={ context.countries }
					initialValue={ storeCountry }
					label={ inputLabel }
					geolocatedLocation={ context.geolocatedLocation }
					placeholder={ inputLabel }
					onChange={ ( countryStateOption ) => {
						setStoreCountry( countryStateOption );
					} }
				/>
				{ context.countries.length === 0 && (
					<Notice
						className="poocommerce-profiler-select-control__country-error"
						isDismissible={ false }
						status="error"
					>
						{ createInterpolateElement(
							__(
								'Oops! We encountered a problem while fetching the list of countries to choose from. <retryButton/> or <skipButton/>',
								'poocommerce'
							),
							{
								retryButton: (
									<Button
										onClick={ () => {
											sendEvent( {
												type: 'RETRY_COUNTRIES_LIST',
											} );
										} }
										variant="tertiary"
									>
										{ __(
											'Please try again',
											'poocommerce'
										) }
									</Button>
								),
								skipButton: (
									<Button
										onClick={ () => {
											sendEvent( {
												type: 'BUSINESS_LOCATION_COMPLETED',
												payload: {
													storeLocation: 'US:CA',
												},
											} );
										} }
										variant="tertiary"
									>
										{ __(
											'Skip this step',
											'poocommerce'
										) }
									</Button>
								),
							}
						) }
					</Notice>
				) }
				<div className="poocommerce-profiler-button-container poocommerce-profiler-go-to-mystore__button-container">
					<Button
						className="poocommerce-profiler-button"
						variant="primary"
						disabled={ ! storeCountry.key }
						onClick={ () => {
							sendEvent( {
								type: 'BUSINESS_LOCATION_COMPLETED',
								payload: {
									storeLocation: storeCountry.key,
								},
							} );
						} }
					>
						{ __( 'Go to my store', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};
