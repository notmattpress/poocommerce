/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Form, H, TextControl } from '@poocommerce/components';
import { OPTIONS_STORE_NAME } from '@poocommerce/data';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { WooPaymentGatewaySetup } from '@poocommerce/onboarding';

const initialFormValues = {
	account_name: '',
	account_number: '',
	bank_name: '',
	sort_code: '',
	iban: '',
	bic: '',
};

const BacsPaymentGatewaySetup = () => {
	const isUpdating = useSelect( ( select ) => {
		return select( OPTIONS_STORE_NAME ).isOptionsUpdating();
	} );
	const { createNotice } = useDispatch( 'core/notices' );
	const { updateOptions } = useDispatch( OPTIONS_STORE_NAME );

	const validate = ( values ) => {
		const errors = {};

		if ( ! values.account_number && ! values.iban ) {
			errors.account_number = errors.iban = __(
				'Please enter an account number or IBAN',
				'poocommerce'
			);
		}

		return errors;
	};

	const updateSettings = async ( values, markConfigured ) => {
		const update = await updateOptions( {
			poocommerce_bacs_settings: {
				enabled: 'yes',
			},
			poocommerce_bacs_accounts: [ values ],
		} );

		if ( update.success ) {
			markConfigured();
			createNotice(
				'success',
				__(
					'Direct bank transfer details added successfully',
					'poocommerce'
				)
			);
			return;
		}

		createNotice(
			'error',
			__(
				'There was a problem saving your payment settings',
				'poocommerce'
			)
		);
	};

	return (
		<>
			<WooPaymentGatewaySetup id="bacs">
				{ ( { markConfigured } ) => {
					return (
						<Form
							initialValues={ initialFormValues }
							onSubmit={ ( values ) =>
								updateSettings( values, markConfigured )
							}
							validate={ validate }
						>
							{ ( { getInputProps, handleSubmit } ) => {
								return (
									<>
										<H>
											{ __(
												'Add your bank details',
												'poocommerce'
											) }
										</H>
										<p>
											{ __(
												'These details are required to receive payments via bank transfer',
												'poocommerce'
											) }
										</p>
										<div className="poocommerce-task-payment-method__fields">
											<TextControl
												label={ __(
													'Account name',
													'poocommerce'
												) }
												required
												{ ...getInputProps(
													'account_name'
												) }
											/>
											<TextControl
												label={ __(
													'Account number',
													'poocommerce'
												) }
												required
												{ ...getInputProps(
													'account_number'
												) }
											/>
											<TextControl
												label={ __(
													'Bank name',
													'poocommerce'
												) }
												required
												{ ...getInputProps(
													'bank_name'
												) }
											/>
											<TextControl
												label={ __(
													'Sort code',
													'poocommerce'
												) }
												required
												{ ...getInputProps(
													'sort_code'
												) }
											/>
											<TextControl
												label={ __(
													'IBAN',
													'poocommerce'
												) }
												required
												{ ...getInputProps( 'iban' ) }
											/>
											<TextControl
												label={ __(
													'BIC / Swift',
													'poocommerce'
												) }
												required
												{ ...getInputProps( 'bic' ) }
											/>
										</div>
										<Button
											isPrimary
											isBusy={ isUpdating }
											onClick={ handleSubmit }
										>
											{ __( 'Save', 'poocommerce' ) }
										</Button>
									</>
								);
							} }
						</Form>
					);
				} }
			</WooPaymentGatewaySetup>
		</>
	);
};

registerPlugin( 'wc-admin-payment-gateway-setup-bacs', {
	render: BacsPaymentGatewaySetup,
	scope: 'poocommerce-tasks',
} );
