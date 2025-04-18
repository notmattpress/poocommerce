/**
 * External dependencies
 */
import { settingsStore } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import { hasCompleteAddress } from '../utils';
import {
	default as StoreLocationForm,
	defaultValidate,
} from '~/task-lists/fills/steps/location';
import { FormValues } from '~/dashboard/components/settings/general/store-address';

const validateLocationForm = ( values: FormValues ) => {
	const errors = defaultValidate( values );

	if (
		document.getElementById( 'poocommerce-store-address-form-address_1' ) &&
		! values.addressLine1.trim().length
	) {
		errors.addressLine1 = __( 'Please enter an address', 'poocommerce' );
	}

	if (
		document.getElementById( 'poocommerce-store-address-form-postcode' ) &&
		! values.postCode.trim().length
	) {
		errors.postCode = __( 'Please enter a post code', 'poocommerce' );
	}

	if (
		document.getElementById( 'poocommerce-store-address-form-city' ) &&
		! values.city.trim().length
	) {
		errors.city = __( 'Please enter a city', 'poocommerce' );
	}

	return errors;
};

export const StoreLocation = ( { nextStep }: { nextStep: () => void } ) => {
	const { createNotice } = useDispatch( 'core/notices' );
	const { updateAndPersistSettingsForGroup } = useDispatch( settingsStore );
	const { generalSettings, isResolving, isUpdating } = useSelect(
		( select ) => {
			const {
				getSettings,
				hasFinishedResolution,
				isUpdateSettingsRequesting,
			} = select( settingsStore );

			return {
				generalSettings: getSettings( 'general' )?.general,
				isResolving: ! hasFinishedResolution( 'getSettings', [
					'general',
				] ),
				isUpdating: isUpdateSettingsRequesting( 'general' ),
			};
		},
		[]
	);

	useEffect( () => {
		if (
			isResolving ||
			isUpdating ||
			! hasCompleteAddress(
				generalSettings || {},
				Boolean(
					document.getElementById(
						'poocommerce-store-address-form-postcode'
					)
				)
			)
		) {
			return;
		}
		nextStep();
	}, [ isResolving, generalSettings, isUpdating ] );

	if ( isResolving ) {
		return null;
	}

	return (
		<StoreLocationForm
			validate={ validateLocationForm }
			onComplete={ ( values: { [ key: string ]: string } ) => {
				const country = getCountryCode( values.countryState );
				recordEvent( 'tasklist_tax_set_location', {
					country,
				} );
			} }
			isSettingsRequesting={ false }
			settings={ generalSettings }
			updateAndPersistSettingsForGroup={
				updateAndPersistSettingsForGroup
			}
			createNotice={ createNotice }
		/>
	);
};
