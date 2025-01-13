/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	TextControl,
	Notice,
	Spinner,
	CheckboxControl,
} from '@wordpress/components';
import { FormInputValidation } from '@automattic/components';
import { SelectControl } from '@poocommerce/components';
import { Icon, chevronDown } from '@wordpress/icons';
import {
	createInterpolateElement,
	useEffect,
	useState,
} from '@wordpress/element';
import { findCountryOption, getCountry } from '@poocommerce/onboarding';
import { decodeEntities } from '@wordpress/html-entities';
import { z } from 'zod';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CoreProfilerStateMachineContext } from '../index';
import { BusinessInfoEvent } from '../events';
import { CountryStateOption } from '../services/country';
import { Heading } from '../components/heading/heading';
import { Navigation } from '../components/navigation/navigation';

/** These are some store names that are known to be set by default and not likely to be used as actual names */
export const POSSIBLY_DEFAULT_STORE_NAMES = [
	undefined,
	'poocommerce',
	'Site Title',
	'',
];
export type IndustryChoice = ( typeof industryChoices )[ number ][ 'key' ];
export const industryChoices = [
	{
		label: __( 'Clothing and accessories', 'poocommerce' ),
		key: 'clothing_and_accessories' as const,
	},
	{
		label: __( 'Food and drink', 'poocommerce' ),
		key: 'food_and_drink' as const,
	},
	{
		label: __( 'Electronics and computers', 'poocommerce' ),
		key: 'electronics_and_computers' as const,
	},
	{
		label: __( 'Health and beauty', 'poocommerce' ),
		key: 'health_and_beauty' as const,
	},
	{
		label: __( 'Education and learning', 'poocommerce' ),
		key: 'education_and_learning' as const,
	},
	{
		label: __( 'Home, furniture and garden', 'poocommerce' ),
		key: 'home_furniture_and_garden' as const,
	},
	{
		label: __( 'Arts and crafts', 'poocommerce' ),
		key: 'arts_and_crafts' as const,
	},
	{
		label: __( 'Sports and recreation', 'poocommerce' ),
		key: 'sports_and_recreation' as const,
	},
	{
		label: __( 'Other', 'poocommerce' ),
		key: 'other' as const,
	},
];

export type IndustryChoiceOption = ( typeof industryChoices )[ number ];

export const selectIndustryMapping = {
	im_just_starting_my_business: __(
		'What type of products or services do you plan to sell?',
		'poocommerce'
	),
	im_already_selling: __(
		'Which industry is your business in?',
		'poocommerce'
	),
	im_setting_up_a_store_for_a_client: __(
		'Which industry is your client’s business in?',
		'poocommerce'
	),
};

export type BusinessInfoContextProps = Pick<
	CoreProfilerStateMachineContext,
	'geolocatedLocation' | 'userProfile' | 'businessInfo' | 'countries'
> & {
	onboardingProfile: Pick<
		CoreProfilerStateMachineContext[ 'onboardingProfile' ],
		| 'industry'
		| 'business_choice'
		| 'is_store_country_set'
		| 'is_agree_marketing'
		| 'store_email'
	>;
} & Partial< Pick< CoreProfilerStateMachineContext, 'currentUserEmail' > >;

export const BusinessInfo = ( {
	context,
	navigationProgress,
	sendEvent,
}: {
	context: BusinessInfoContextProps;
	navigationProgress: number;
	sendEvent: ( event: BusinessInfoEvent ) => void;
} ) => {
	const {
		geolocatedLocation,
		userProfile: { businessChoice },
		businessInfo,
		countries,
		onboardingProfile: {
			is_store_country_set: isStoreCountrySet = false,
			industry: industryFromOnboardingProfile = [],
			business_choice: businessChoiceFromOnboardingProfile = '',
			is_agree_marketing: isOptInMarketingFromOnboardingProfile = false,
			store_email: storeEmailAddressFromOnboardingProfile = '',
		} = {},
		currentUserEmail,
	} = context;

	const [ storeName, setStoreName ] = useState(
		businessInfo.storeName || ''
	);

	const [ storeCountry, setStoreCountry ] = useState< CountryStateOption >( {
		key: '',
		label: '',
	} );

	useEffect( () => {
		if ( isStoreCountrySet ) {
			const previouslyStoredCountryOption = countries.find(
				( country ) => country.key === businessInfo.location
			);
			setStoreCountry(
				previouslyStoredCountryOption || { key: '', label: '' }
			);
		}
	}, [ businessInfo.location, countries, isStoreCountrySet ] );

	const [ geolocationMatch, setGeolocationMatch ] = useState( {
		key: '',
		label: '',
	} );

	useEffect( () => {
		if ( geolocatedLocation ) {
			const foundCountryOption = findCountryOption(
				countries,
				geolocatedLocation
			);
			if ( foundCountryOption ) {
				setGeolocationMatch( foundCountryOption );
				if ( ! isStoreCountrySet ) {
					setStoreCountry( foundCountryOption );
				}
			}
		}
	}, [ countries, isStoreCountrySet, geolocatedLocation ] );

	const geolocationOverruled =
		geolocatedLocation &&
		getCountry( storeCountry.key ) !== getCountry( geolocationMatch.key );

	const [ industry, setIndustry ] = useState<
		IndustryChoiceOption | undefined
	>(
		industryFromOnboardingProfile
			? industryChoices.find(
					( choice ) =>
						choice.key === industryFromOnboardingProfile[ 0 ]
			  )
			: undefined
	);

	const selectCountryLabel = __( 'Select country/region', 'poocommerce' );
	const selectIndustryQuestionLabel =
		selectIndustryMapping[
			businessChoice ||
				businessChoiceFromOnboardingProfile ||
				'im_just_starting_my_business'
		];

	const [ dismissedGeolocationNotice, setDismissedGeolocationNotice ] =
		useState( false );

	const [ hasSubmitted, setHasSubmitted ] = useState( false );

	const [ isEmailInvalid, setIsEmailInvalid ] = useState( false );

	const [ storeEmailAddress, setEmailAddress ] = useState(
		storeEmailAddressFromOnboardingProfile || currentUserEmail || ''
	);

	const [ isOptInMarketing, setIsOptInMarketing ] = useState< boolean >(
		isOptInMarketingFromOnboardingProfile || false
	);

	const [ doValidate, setDoValidate ] = useState( false );

	useEffect( () => {
		if ( doValidate ) {
			const parseEmail = z
				.string()
				.email()
				.safeParse( storeEmailAddress );
			setIsEmailInvalid( isOptInMarketing && ! parseEmail.success );
			setDoValidate( false );
		}
	}, [ isOptInMarketing, doValidate, storeEmailAddress ] );

	return (
		<div
			className="poocommerce-profiler-business-information"
			data-testid="core-profiler-business-information"
		>
			<Navigation percentage={ navigationProgress } />
			<div className="poocommerce-profiler-page__content poocommerce-profiler-business-information__content">
				<Heading
					className="poocommerce-profiler__stepper-heading"
					title={ __(
						'Tell us a bit about your store',
						'poocommerce'
					) }
					subTitle={ __(
						'We’ll use this information to help you set up payments, shipping, and taxes, as well as recommending the best theme for your store.',
						'poocommerce'
					) }
				/>

				<form
					className="poocommerce-profiler-business-information-form"
					autoComplete="off"
				>
					<TextControl
						className="poocommerce-profiler-business-info-store-name"
						onChange={ ( value ) => {
							setStoreName( value );
						} }
						value={ decodeEntities( storeName ) }
						label={
							<>
								{ __(
									'Give your store a name',
									'poocommerce'
								) }
							</>
						}
						placeholder={ __(
							'Ex. My awesome store',
							'poocommerce'
						) }
					/>
					<p className="poocommerce-profiler-question-subtext">
						{ __(
							'Don’t worry — you can always change it later!',
							'poocommerce'
						) }
					</p>
					<p className="poocommerce-profiler-question-label">
						{ selectIndustryQuestionLabel }
					</p>
					<SelectControl
						className="poocommerce-profiler-select-control__industry"
						instanceId={ 1 }
						placeholder={ __(
							'Select an industry',
							'poocommerce'
						) }
						label={ __( 'Select an industry', 'poocommerce' ) }
						options={ industryChoices }
						excludeSelectedOptions={ false }
						help={ <Icon icon={ chevronDown } /> }
						onChange={ (
							results: Array<
								( typeof industryChoices )[ number ]
							>
						) => {
							if ( results.length ) {
								setIndustry( results[ 0 ] );
							}
						} }
						selected={ industry ? [ industry ] : [] }
						showAllOnFocus
						isSearchable
					/>
					<p className="poocommerce-profiler-question-label">
						{ __( 'Where is your store located?', 'poocommerce' ) }
						<span className="poocommerce-profiler-question-required">
							{ '*' }
						</span>
					</p>
					<SelectControl
						className="poocommerce-profiler-select-control__country"
						instanceId={ 2 }
						placeholder={ selectCountryLabel }
						label={
							storeCountry.key === '' ? selectCountryLabel : ''
						}
						getSearchExpression={ ( query: string ) => {
							return new RegExp(
								'(^' + query + '| — (' + query + '))',
								'i'
							);
						} }
						options={ countries }
						excludeSelectedOptions={ false }
						help={ <Icon icon={ chevronDown } /> }
						onChange={ ( results: Array< CountryStateOption > ) => {
							if ( results.length ) {
								setStoreCountry( results[ 0 ] );
							}
						} }
						selected={ storeCountry ? [ storeCountry ] : [] }
						showAllOnFocus
						isSearchable
					/>
					{ countries.length === 0 && (
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
													type: 'RETRY_PRE_BUSINESS_INFO',
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
													type: 'SKIP_BUSINESS_INFO_STEP',
												} );
											} }
											variant="tertiary"
										>
											{ __(
												'skip this step',
												'poocommerce'
											) }
										</Button>
									),
								}
							) }
						</Notice>
					) }
					{ /* poocommerce-profiler-select-control__country-spacer exists purely because the select-control above has an unremovable and unstyleable div and that's preventing margin collapse */ }
					<div className="poocommerce-profiler-select-control__country-spacer" />
					{ geolocationOverruled && ! dismissedGeolocationNotice && (
						<Notice
							className="poocommerce-profiler-geolocation-notice"
							onRemove={ () =>
								setDismissedGeolocationNotice( true )
							}
							status="warning"
						>
							<p>
								{ createInterpolateElement(
									__(
										// translators: first tag is filled with the country name detected by geolocation, second tag is the country name selected by the user
										'It looks like you’re located in <geolocatedCountry></geolocatedCountry>. Are you sure you want to create a store in <selectedCountry></selectedCountry>?',
										'poocommerce'
									),
									{
										geolocatedCountry: (
											<Button
												className="geolocation-notice-geolocated-country"
												variant="link"
												onClick={ () =>
													setStoreCountry(
														geolocationMatch
													)
												}
											>
												{
													geolocatedLocation?.country_long
												}
											</Button>
										),
										selectedCountry: (
											<span className="geolocation-notice-selected-country">
												{ storeCountry.label }
											</span>
										),
									}
								) }
							</p>
							<p>
								{ __(
									'Setting up your store in the wrong country may lead to the following issues: ',
									'poocommerce'
								) }
							</p>
							<ul className="poocommerce-profiler-geolocation-notice__list">
								<li>
									{ __(
										'Tax and duty obligations',
										'poocommerce'
									) }
								</li>
								<li>
									{ __( 'Payment issues', 'poocommerce' ) }
								</li>
								<li>
									{ __( 'Shipping issues', 'poocommerce' ) }
								</li>
							</ul>
						</Notice>
					) }
					{
						<>
							<TextControl
								className={ clsx(
									'poocommerce-profiler-business-info-email-adddress',
									{ 'is-error': isEmailInvalid }
								) }
								onChange={ ( value ) => {
									if ( isEmailInvalid ) {
										setDoValidate( true ); // trigger validation as we want to feedback to the user as soon as it becomes valid
									}
									setEmailAddress( value );
								} }
								onBlur={ () => {
									setDoValidate( true );
								} }
								value={ decodeEntities( storeEmailAddress ) }
								label={
									<>
										{ __(
											'Your email address',
											'poocommerce'
										) }
										{ isOptInMarketing && (
											<span className="poocommerce-profiler-question-required">
												{ '*' }
											</span>
										) }
									</>
								}
								placeholder={ __(
									'wordpress@example.com',
									'poocommerce'
								) }
							/>
							{ isEmailInvalid && (
								<FormInputValidation
									isError
									text={ __(
										'This email is not valid.',
										'poocommerce'
									) }
								/>
							) }
							<CheckboxControl
								className="core-profiler__checkbox"
								label={ __(
									'Opt-in to receive tips, discounts, and recommendations from the Woo team directly in your inbox.',
									'poocommerce'
								) }
								checked={ isOptInMarketing }
								onChange={ ( isChecked ) => {
									setIsOptInMarketing( isChecked );
									setDoValidate( true );
								} }
							/>
						</>
					}
				</form>
				<div className="poocommerce-profiler-button-container">
					<Button
						className="poocommerce-profiler-button"
						variant="primary"
						disabled={ ! storeCountry.key || isEmailInvalid }
						onClick={ () => {
							sendEvent( {
								type: 'BUSINESS_INFO_COMPLETED',
								payload: {
									storeName,
									industry: industry?.key,
									storeLocation: storeCountry.key,
									geolocationOverruled:
										geolocationOverruled || false,
									isOptInMarketing,
									storeEmailAddress,
								},
							} );
							setHasSubmitted( true );
						} }
					>
						{ hasSubmitted ? (
							<Spinner />
						) : (
							__( 'Continue', 'poocommerce' )
						) }
					</Button>
				</div>
			</div>
		</div>
	);
};
