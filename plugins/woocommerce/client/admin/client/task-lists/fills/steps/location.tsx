/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { countriesStore } from '@poocommerce/data';
import { Fragment, useState } from '@wordpress/element';
import { Form, FormContextType, Spinner } from '@poocommerce/components';
import { useSelect } from '@wordpress/data';
import type { Status, Options } from 'wordpress__notices';

/**
 * Internal dependencies
 */
import {
	StoreAddress,
	getStoreAddressValidator,
	FormValues,
} from '~/dashboard/components/settings/general/store-address';

type StoreLocationProps = {
	onComplete: ( values: FormValues ) => void;
	createNotice: (
		status: Status | undefined,
		content: string,
		options?: Partial< Options >
	) => void;
	isSettingsRequesting: boolean;
	buttonText?: string;
	updateAndPersistSettingsForGroup: (
		group: string,
		data: {
			[ key: string ]: unknown;
		} & {
			general?: {
				[ key: string ]: string;
			};
			tax?: {
				[ key: string ]: string;
			};
		}
	) => void;
	settings?: {
		[ key: string ]: string;
	};
	validate?: ( values: FormValues ) => { [ key: string ]: string };
};

export const defaultValidate = ( values: FormValues ) => {
	const validator = getStoreAddressValidator();
	return validator( values );
};

const StoreLocation = ( {
	onComplete,
	createNotice,
	isSettingsRequesting,
	updateAndPersistSettingsForGroup,
	settings,
	buttonText = __( 'Continue', 'poocommerce' ),
	validate = defaultValidate,
}: StoreLocationProps ) => {
	const { hasFinishedResolution } = useSelect( ( select ) => {
		const countryStore = select( countriesStore );
		countryStore.getCountries();

		return {
			getLocale: countryStore.getLocale,
			locales: countryStore.getLocales(),
			hasFinishedResolution:
				countryStore.hasFinishedResolution( 'getLocales', undefined ) &&
				countryStore.hasFinishedResolution( 'getCountries', undefined ),
		};
	}, [] );
	const [ isSubmitting, setSubmitting ] = useState( false );
	const onSubmit = async ( values: FormValues ) => {
		setSubmitting( true );
		try {
			await updateAndPersistSettingsForGroup( 'general', {
				general: {
					...settings,
					poocommerce_store_address: values.addressLine1,
					poocommerce_store_address_2: values.addressLine2,
					poocommerce_default_country: values.countryState,
					poocommerce_store_city: values.city,
					poocommerce_store_postcode: values.postCode,
				},
			} );

			setSubmitting( false );
			onComplete( values );
		} catch ( e ) {
			setSubmitting( false );

			createNotice(
				'error',
				__(
					'There was a problem saving your store location',
					'poocommerce'
				)
			);
		}
	};

	const getInitialValues = () => {
		return {
			addressLine1: settings?.poocommerce_store_address || '',
			addressLine2: settings?.poocommerce_store_address_2 || '',
			city: settings?.poocommerce_store_city || '',
			countryState: settings?.poocommerce_default_country || '',
			postCode: settings?.poocommerce_store_postcode || '',
		};
	};

	if ( isSettingsRequesting || ! hasFinishedResolution ) {
		return <Spinner />;
	}

	return (
		<Form
			initialValues={ getInitialValues() }
			onSubmit={ onSubmit }
			validate={ validate }
		>
			{ ( {
				getInputProps,
				getSelectControlProps,
				handleSubmit,
				setValue,
			}: FormContextType< FormValues > ) => (
				<Fragment>
					<StoreAddress
						getInputProps={ getInputProps }
						getSelectControlProps={ getSelectControlProps }
						setValue={ setValue }
					/>
					<Button
						variant="primary"
						onClick={ handleSubmit }
						isBusy={ isSubmitting }
					>
						{ buttonText }
					</Button>
				</Fragment>
			) }
		</Form>
	);
};

export default StoreLocation;
