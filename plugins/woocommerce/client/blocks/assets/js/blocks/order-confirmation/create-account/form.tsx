/**
 * External dependencies
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { useState, createInterpolateElement } from '@wordpress/element';
import Button from '@poocommerce/base-components/button';
import {
	PasswordStrengthMeter,
	getPasswordStrength,
} from '@poocommerce/base-components/cart-checkout/password-strength-meter';
import { PRIVACY_URL, TERMS_URL } from '@poocommerce/block-settings';
import { ValidatedTextInput, Spinner } from '@poocommerce/blocks-components';
import { useSelect } from '@wordpress/data';
import { validationStore } from '@poocommerce/block-data';
import { getSetting } from '@poocommerce/settings';

const termsPageLink = TERMS_URL ? (
	<a href={ TERMS_URL } target="_blank" rel="noreferrer">
		{ __( 'Terms', 'poocommerce' ) }
	</a>
) : (
	<span>{ __( 'Terms', 'poocommerce' ) }</span>
);

const privacyPageLink = PRIVACY_URL ? (
	<a href={ PRIVACY_URL } target="_blank" rel="noreferrer">
		{ __( 'Privacy Policy', 'poocommerce' ) }
	</a>
) : (
	<span>{ __( 'Privacy Policy', 'poocommerce' ) }</span>
);

const PasswordField = ( {
	isLoading,
	password,
	setPassword,
}: {
	isLoading: boolean;
	password: string;
	setPassword: ( password: string ) => void;
} ) => {
	return (
		<div>
			<ValidatedTextInput
				disabled={ isLoading }
				type="password"
				label={ __( 'Password', 'poocommerce' ) }
				className={ `wc-block-components-address-form__password` }
				value={ password }
				required={ true }
				errorId={ 'account-password' }
				customValidityMessage={ (
					validity: ValidityState
				): string | undefined => {
					if (
						validity.valueMissing ||
						validity.badInput ||
						validity.typeMismatch
					) {
						return __(
							'Please enter a valid password',
							'poocommerce'
						);
					}
				} }
				customValidation={ ( inputObject ) => {
					if ( getPasswordStrength( inputObject.value ) < 2 ) {
						inputObject.setCustomValidity(
							__(
								'Please create a stronger password',
								'poocommerce'
							)
						);
						return false;
					}
					return true;
				} }
				onChange={ ( value: string ) => setPassword( value ) }
				feedback={ <PasswordStrengthMeter password={ password } /> }
			/>
		</div>
	);
};

const Form = ( {
	attributes: blockAttributes,
	isEditor,
}: {
	attributes?: { customerEmail?: string; nonceToken?: string };
	isEditor: boolean;
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ password, setPassword ] = useState( '' );
	const hasValidationError = useSelect(
		( select ) =>
			select( validationStore ).getValidationError( 'account-password' ),
		[]
	);
	const customerEmail =
		blockAttributes?.customerEmail ||
		( isEditor ? 'customer@email.com' : '' );
	const nonceToken = blockAttributes?.nonceToken || '';

	// Passwords might not be required based on settings.
	const registrationGeneratePassword = getSetting(
		'registrationGeneratePassword',
		false
	);
	const needsPassword = ! registrationGeneratePassword && ! password;

	if ( ! customerEmail ) {
		return null;
	}

	return (
		<form
			className={ 'wc-block-order-confirmation-create-account-form' }
			id="create-account"
			method="POST"
			action="#create-account"
			onSubmit={ ( event ) => {
				if ( hasValidationError ) {
					event.preventDefault();
					return;
				}
				setIsLoading( true );
			} }
		>
			{ ! registrationGeneratePassword && (
				<>
					<p>
						{ createInterpolateElement(
							__( 'Set a password for <email/>', 'poocommerce' ),
							{
								email: <strong>{ customerEmail }</strong>,
							}
						) }
					</p>
					<PasswordField
						isLoading={ isLoading }
						password={ password }
						setPassword={ setPassword }
					/>
				</>
			) }
			<Button
				className={ clsx(
					'wc-block-order-confirmation-create-account-button',
					{
						'wc-block-order-confirmation-create-account-button--loading':
							isLoading,
					}
				) }
				type="submit"
				disabled={ !! hasValidationError || needsPassword || isLoading }
			>
				{ !! isLoading && <Spinner /> }
				{ __( 'Create account', 'poocommerce' ) }
			</Button>
			<input type="hidden" name="email" value={ customerEmail } />
			<input type="hidden" name="password" value={ password } />
			<input type="hidden" name="create-account" value="1" />
			<input type="hidden" name="_wpnonce" value={ nonceToken } />
			<div className="wc-block-order-confirmation-create-account-description">
				<p>
					{ registrationGeneratePassword && (
						<>
							{ createInterpolateElement(
								__(
									'Check your email at <email/> for the link to set up an account password.',
									'poocommerce'
								),
								{
									email: <>{ customerEmail }</>,
								}
							) }{ ' ' }
						</>
					) }
					{ createInterpolateElement(
						__(
							'By creating an account you agree to our <terms/> and <privacy/>.',
							'poocommerce'
						),
						{
							terms: termsPageLink,
							privacy: privacyPageLink,
						}
					) }
				</p>
			</div>
		</form>
	);
};

export default Form;
