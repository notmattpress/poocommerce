/**
 * External dependencies
 */
import {
	Button,
	CheckboxControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { paymentGatewaysStore, paymentSettingsStore } from '@poocommerce/data';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import '../settings-payments-body.scss';
import { Settings } from '~/settings-payments/components/settings';
import { FieldPlaceholder } from '~/settings-payments/components/field-placeholder';

/**
 * This page is used to manage the settings for the Cheque payment gateway.
 * Noting that we refer to it as 'cheque' in the code, but use the American English spelling
 * 'check' in the UI.
 */
export const SettingsPaymentsCheque = () => {
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( 'core/notices' );
	const { chequeSettings, isLoading } = useSelect(
		( select ) => ( {
			chequeSettings:
				select( paymentGatewaysStore ).getPaymentGateway( 'cheque' ),
			isLoading: ! select( paymentGatewaysStore ).hasFinishedResolution(
				'getPaymentGateway',
				[ 'cheque' ]
			),
		} ),
		[]
	);

	const { updatePaymentGateway, invalidateResolutionForStoreSelector } =
		useDispatch( paymentGatewaysStore );

	const {
		invalidateResolution,
		invalidateResolutionForStoreSelector:
			invalidateResolutionForPaymentSettings,
	} = useDispatch( paymentSettingsStore );

	const [ formValues, setFormValues ] = useState<
		Record< string, string | boolean | string[] >
	>( {} );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ hasChanges, setHasChanges ] = useState( false );

	useEffect( () => {
		if ( chequeSettings ) {
			setFormValues( {
				enabled: chequeSettings.enabled,
				title: chequeSettings.settings.title.value,
				description: chequeSettings.description,
				instructions: chequeSettings.settings.instructions.value,
			} );
		}
	}, [ chequeSettings ] );

	const saveSettings = () => {
		if ( ! chequeSettings ) {
			return;
		}

		setIsSaving( true );

		const settings: Record< string, string > = {
			title: String( formValues.title ),
			instructions: String( formValues.instructions ),
		};

		updatePaymentGateway( 'cheque', {
			enabled: Boolean( formValues.enabled ),
			description: String( formValues.description ),
			settings,
		} )
			.then( () => {
				setHasChanges( false );
				invalidateResolutionForStoreSelector( 'getPaymentGateway' );
				createSuccessNotice(
					__( 'Settings updated successfully', 'poocommerce' )
				);
			} )
			.catch( () => {
				createErrorNotice(
					__( 'Failed to update settings', 'poocommerce' )
				);
			} )
			.finally( () => {
				setIsSaving( false );
				invalidateResolution( 'getPaymentProviders', [] );
				invalidateResolutionForPaymentSettings(
					'getOfflinePaymentGateways'
				);
			} );
	};

	return (
		<Settings>
			<Settings.Layout>
				<Settings.Form
					onSubmit={ ( e ) => {
						e.preventDefault();
						saveSettings();
					} }
				>
					<Settings.Section
						title={ __( 'Enable and customise', 'poocommerce' ) }
						description={ __(
							'Choose how you want to present check payments to your customers during checkout.',
							'poocommerce'
						) }
					>
						{ isLoading ? (
							<FieldPlaceholder size="small" />
						) : (
							<CheckboxControl
								label={ __(
									'Enable check payments',
									'poocommerce'
								) }
								checked={ Boolean( formValues.enabled ) }
								onChange={ ( checked ) => {
									setFormValues( {
										...formValues,
										enabled: checked,
									} );
									setHasChanges( true );
								} }
							/>
						) }
						{ isLoading ? (
							<FieldPlaceholder size="medium" />
						) : (
							<TextControl
								label={ __( 'Title', 'poocommerce' ) }
								help={ __(
									'Payment method name that the customer will see during checkout.',
									'poocommerce'
								) }
								placeholder={ __(
									'Check payments',
									'poocommerce'
								) }
								value={ String( formValues.title ) }
								onChange={ ( value ) => {
									setFormValues( {
										...formValues,
										title: value,
									} );
									setHasChanges( true );
								} }
							/>
						) }
						{ isLoading ? (
							<FieldPlaceholder size="large" />
						) : (
							<TextareaControl
								label={ __( 'Description', 'poocommerce' ) }
								help={ __(
									'Payment method description that the customer will see during checkout.',
									'poocommerce'
								) }
								value={ String( formValues.description ) }
								onChange={ ( value ) => {
									setFormValues( {
										...formValues,
										description: value,
									} );
									setHasChanges( true );
								} }
							/>
						) }
						{ isLoading ? (
							<FieldPlaceholder size="large" />
						) : (
							<TextareaControl
								label={ __( 'Instructions', 'poocommerce' ) }
								help={ __(
									'Instructions that will be added to the thank you page and emails.',
									'poocommerce'
								) }
								value={ String( formValues.instructions ) }
								onChange={ ( value ) => {
									setFormValues( {
										...formValues,
										instructions: value,
									} );
									setHasChanges( true );
								} }
							/>
						) }
					</Settings.Section>
					<Settings.Actions>
						<Button
							variant="primary"
							type="submit"
							isBusy={ isSaving }
							disabled={ isSaving || ! hasChanges }
						>
							{ __( 'Save changes', 'poocommerce' ) }
						</Button>
					</Settings.Actions>
				</Settings.Form>
			</Settings.Layout>
		</Settings>
	);
};

export default SettingsPaymentsCheque;
