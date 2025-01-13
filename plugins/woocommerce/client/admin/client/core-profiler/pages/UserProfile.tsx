/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { SelectControl } from '@poocommerce/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CoreProfilerStateMachineContext } from '../index';
import { UserProfileEvent } from '../events';
import { Navigation } from '../components/navigation/navigation';
import { Heading } from '../components/heading/heading';
import { Choice } from '../components/choice/choice';
import { MultipleSelector } from '../components/multiple-selector/multiple-selector';

const businessOptions = [
	{
		title: __( 'I’m just starting my business', 'poocommerce' ),
		value: 'im_just_starting_my_business' as const,
	},
	{
		title: __( 'I’m already selling', 'poocommerce' ),
		value: 'im_already_selling' as const,
	},
	{
		title: __( 'I’m setting up a store for a client', 'poocommerce' ),
		value: 'im_setting_up_a_store_for_a_client' as const,
	},
];

const sellingOnlineOptions = [
	{
		label: __( 'Yes, I’m selling online', 'poocommerce' ),
		value: 'yes_im_selling_online' as const,
		key: 'yes_im_selling_online' as const,
	},
	{
		label: __( 'No, I’m selling offline', 'poocommerce' ),
		value: 'no_im_selling_offline' as const,
		key: 'no_im_selling_offline' as const,
	},
	{
		label: __( 'I’m selling both online and offline', 'poocommerce' ),
		value: 'im_selling_both_online_and_offline' as const,
		key: 'im_selling_both_online_and_offline' as const,
	},
];

const platformOptions = [
	{
		label: __( 'Amazon', 'poocommerce' ),
		value: 'amazon' as const,
	},
	{
		label: __( 'Adobe Commerce', 'poocommerce' ),
		value: 'adobe_commerce' as const,
	},
	{
		label: __( 'Big Cartel', 'poocommerce' ),
		value: 'big_cartel' as const,
	},
	{
		label: __( 'Big Commerce', 'poocommerce' ),
		value: 'big_commerce' as const,
	},
	{
		label: __( 'Ebay', 'poocommerce' ),
		value: 'ebay' as const,
	},
	{
		label: __( 'Ecwid', 'poocommerce' ),
		value: 'ecwid' as const,
	},
	{
		label: __( 'Etsy', 'poocommerce' ),
		value: 'etsy' as const,
	},
	{
		label: __( 'Facebook Marketplace', 'poocommerce' ),
		value: 'facebook_marketplace' as const,
	},
	{
		label: __( 'Google Shopping', 'poocommerce' ),
		value: 'google_shopping' as const,
	},
	{
		label: __( 'Pinterest', 'poocommerce' ),
		value: 'pinterest' as const,
	},
	{
		label: __( 'Shopify', 'poocommerce' ),
		value: 'shopify' as const,
	},
	{
		label: __( 'Square', 'poocommerce' ),
		value: 'square' as const,
	},
	{
		label: __( 'Squarespace', 'poocommerce' ),
		value: 'squarespace' as const,
	},
	{
		label: __( 'Wix', 'poocommerce' ),
		value: 'wix' as const,
	},
	{
		label: __( 'WordPress', 'poocommerce' ),
		value: 'wordpress' as const,
	},
];

export type BusinessChoice = ( typeof businessOptions )[ 0 ][ 'value' ];
export type SellingOnlineAnswer =
	( typeof sellingOnlineOptions )[ 0 ][ 'value' ];
export type SellingPlatform = ( typeof platformOptions )[ 0 ][ 'value' ];

export const UserProfile = ( {
	sendEvent,
	navigationProgress,
	context,
}: {
	sendEvent: ( event: UserProfileEvent ) => void;
	navigationProgress: number;
	context: Pick< CoreProfilerStateMachineContext, 'userProfile' >;
} ) => {
	const [ businessChoice, setBusinessChoice ] = useState< BusinessChoice >(
		context.userProfile.businessChoice || 'im_just_starting_my_business'
	);
	const [ sellingOnlineAnswer, setSellingOnlineAnswer ] =
		useState< SellingOnlineAnswer | null >(
			context.userProfile.sellingOnlineAnswer || null
		);
	const [ sellingPlatforms, setSellingPlatforms ] =
		useState< Array< SellingPlatform > | null >(
			context.userProfile.sellingPlatforms || null
		);
	const [ isPlatformDropdownOpen, setIsPlatformDropdownOpen ] =
		useState( false );

	const renderAlreadySellingOptions = () => {
		return (
			<>
				<div className="poocommerce-profiler-selling-online-question">
					<p className="poocommerce-profiler-question-label">
						{ __( 'Are you selling online?', 'poocommerce' ) }
					</p>
					<SelectControl
						className="poocommerce-profiler-select-control__selling-online-question"
						instanceId={ 1 }
						label={ __( 'Select an option', 'poocommerce' ) }
						autoComplete="new-password" // disable autocomplete and autofill
						options={ sellingOnlineOptions }
						excludeSelectedOptions={ false }
						help={ <Icon icon={ chevronDown } /> }
						onChange={ (
							selectedOptionKey: typeof sellingOnlineAnswer
						) => {
							setSellingOnlineAnswer( selectedOptionKey );
						} }
						multiple={ false }
						selected={ sellingOnlineAnswer }
					/>
				</div>
				{ sellingOnlineAnswer &&
					[
						'yes_im_selling_online',
						'im_selling_both_online_and_offline',
					].includes( sellingOnlineAnswer ) && (
						<div className="poocommerce-profiler-selling-platform">
							<p className="poocommerce-profiler-question-label">
								{ __(
									'Which platform(s) are you currently using?',
									'poocommerce'
								) }
							</p>
							<MultipleSelector
								options={ platformOptions }
								selectedOptions={ platformOptions.filter(
									( option ) =>
										sellingPlatforms?.includes(
											option.value
										)
								) }
								onSelect={ ( items ) => {
									setSellingPlatforms(
										items.map(
											( item ) =>
												item.value as SellingPlatform
										)
									);
								} }
								onOpenClose={ setIsPlatformDropdownOpen }
							/>
						</div>
					) }
			</>
		);
	};

	const onContinue = () => {
		sendEvent( {
			type: 'USER_PROFILE_COMPLETED',
			payload: {
				userProfile: {
					businessChoice,
					sellingOnlineAnswer:
						businessChoice === 'im_already_selling'
							? sellingOnlineAnswer
							: null,
					sellingPlatforms:
						businessChoice === 'im_already_selling'
							? sellingPlatforms
							: null,
				},
			},
		} );
	};

	return (
		<div
			className="poocommerce-profiler-user-profile"
			data-testid="core-profiler-user-profile"
		>
			<Navigation
				percentage={ navigationProgress }
				skipText={ __( 'Skip this step', 'poocommerce' ) }
				onSkip={ () =>
					sendEvent( {
						type: 'USER_PROFILE_SKIPPED',
						payload: { userProfile: { skipped: true } },
					} )
				}
			/>
			<div
				className={ clsx(
					'poocommerce-profiler-page__content poocommerce-profiler-user-profile__content',
					{
						'is-platform-selector-open': isPlatformDropdownOpen,
					}
				) }
			>
				<Heading
					className="poocommerce-profiler__stepper-heading"
					title={ __(
						'Which one of these best describes you?',
						'poocommerce'
					) }
					subTitle={ __(
						'Let us know where you are in your commerce journey so that we can tailor your Woo experience for you.',
						'poocommerce'
					) }
				/>
				<form className="poocommerce-user-profile-choices">
					<fieldset>
						<legend className="screen-reader-text">
							{ __(
								'Which one of these best describes you?',
								'poocommerce'
							) }
						</legend>
						{ businessOptions.map( ( { title, value } ) => {
							return (
								<Choice
									key={ value }
									name="user-profile-choice"
									title={ title }
									selected={ businessChoice === value }
									value={ value }
									onChange={ ( _value ) => {
										setBusinessChoice(
											_value as BusinessChoice
										);
									} }
									subOptionsComponent={
										value === 'im_already_selling'
											? renderAlreadySellingOptions()
											: null
									}
								/>
							);
						} ) }
					</fieldset>
				</form>
				<div className="poocommerce-profiler-button-container">
					<Button
						className="poocommerce-profiler-button"
						variant="primary"
						onClick={ onContinue }
					>
						{ __( 'Continue', 'poocommerce' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};
