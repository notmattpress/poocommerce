/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useCheckoutAddress,
	useStoreEvents,
	noticeContexts,
} from '@poocommerce/base-context';
import { ContactFormValues, getSetting } from '@poocommerce/settings';
import {
	StoreNoticesContainer,
	CheckboxControl,
} from '@poocommerce/blocks-components';
import { useDispatch, useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
import { CONTACT_FORM_KEYS } from '@poocommerce/block-settings';
import { Form } from '@poocommerce/base-components/cart-checkout';

/**
 * Internal dependencies
 */
import CreatePassword from './create-password';

const guestCheckoutNoticeId = 'wc-guest-checkout-notice';

const CreateAccountUI = (): React.ReactElement | null => {
	const { shouldCreateAccount } = useSelect( ( select ) => {
		const store = select( checkoutStore );
		return {
			shouldCreateAccount: store.getShouldCreateAccount(),
		};
	} );
	const { __internalSetShouldCreateAccount, __internalSetCustomerPassword } =
		useDispatch( checkoutStore );

	// Work out what fields need to be displayed for the current shopper.
	const allowGuestCheckout = getSetting( 'checkoutAllowsGuest', false );
	const allowSignup = getSetting( 'checkoutAllowsSignup', false );
	const generatePassword = getSetting( 'generatePassword', false );
	const showCreateAccountCheckbox = allowGuestCheckout && allowSignup;
	const showCreateAccountPassword = generatePassword
		? false
		: ( showCreateAccountCheckbox && shouldCreateAccount ) ||
		  ! allowGuestCheckout;

	if (
		! allowGuestCheckout &&
		! showCreateAccountCheckbox &&
		! showCreateAccountPassword
	) {
		return null;
	}

	return (
		<>
			{ allowGuestCheckout && (
				<p
					id={ guestCheckoutNoticeId }
					className="wc-block-checkout__guest-checkout-notice"
				>
					{ __(
						'You are currently checking out as a guest.',
						'poocommerce'
					) }
				</p>
			) }
			{ showCreateAccountCheckbox && (
				<CheckboxControl
					className="wc-block-checkout__create-account"
					label={ sprintf(
						/* translators: Store name */
						__( 'Create an account with %s', 'poocommerce' ),
						getSetting( 'siteTitle', '' )
					) }
					checked={ shouldCreateAccount }
					onChange={ ( value ) => {
						__internalSetShouldCreateAccount( value );
						__internalSetCustomerPassword( '' );
					} }
				/>
			) }
			{ showCreateAccountPassword && <CreatePassword /> }
		</>
	);
};

const Block = (): JSX.Element => {
	const { additionalFields, customerId } = useSelect( ( select ) => {
		const store = select( checkoutStore );
		return {
			additionalFields: store.getAdditionalFields(),
			customerId: store.getCustomerId(),
		};
	} );

	const { setAdditionalFields } = useDispatch( checkoutStore );
	const { billingAddress, setEmail } = useCheckoutAddress();
	const { dispatchCheckoutEvent } = useStoreEvents();
	const onChangeEmail = ( value: string ) => {
		setEmail( value );
		dispatchCheckoutEvent( 'set-email-address' );
	};
	const onChangeForm = ( newAddress: ContactFormValues ) => {
		const { email, ...additionalValues } = newAddress;
		onChangeEmail( email );
		setAdditionalFields( additionalValues );
	};
	const contactFormValues = {
		email: billingAddress.email,
		...additionalFields,
	};

	return (
		<>
			<StoreNoticesContainer
				context={ noticeContexts.CONTACT_INFORMATION }
			/>
			<Form< ContactFormValues >
				id="contact"
				addressType="contact"
				ariaDescribedBy={ guestCheckoutNoticeId }
				onChange={ onChangeForm }
				values={ contactFormValues }
				fields={ CONTACT_FORM_KEYS }
			>
				{ ! customerId && <CreateAccountUI /> }
			</Form>
		</>
	);
};

export default Block;
