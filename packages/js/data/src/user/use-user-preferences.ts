/**
 * External dependencies
 */
import { mapValues } from 'lodash';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from './constants';
import { WCUser, UserPreferences } from './types';

/**
 * Retrieve and decode the user's PooCommerce meta values.
 *
 * @param {Object} user WP User object.
 * @return {Object} User's PooCommerce preferences.
 */
const getPooCommerceMeta = ( user: WCUser ) => {
	const wooMeta = user.poocommerce_meta || {};

	const userData = mapValues( wooMeta, ( data ) => {
		if ( ! data || data.length === 0 ) {
			return '';
		}
		try {
			return JSON.parse( data );
		} catch ( e ) {
			// If we can't parse the value, return the raw data. The meta value could be a string like 'yes' or 'no'.
			return data;
		}
	} );

	return userData;
};

// Create wrapper for updating user's `poocommerce_meta`.
async function updateUserPrefs(
	receiveCurrentUser: ( user: WCUser ) => void,
	user: WCUser,
	saveUser: ( userToSave: {
		id: number;
		poocommerce_meta: WCUser[ 'poocommerce_meta' ];
	} ) => WCUser,
	getLastEntitySaveError: (
		kind: string,
		name: string,
		recordId: number
	) => unknown,
	userPrefs: UserPreferences
) {
	// @todo Handle unresolved getCurrentUser() here.
	// Prep fields for update.
	const metaData = mapValues( userPrefs, ( value ) => {
		if ( typeof value === 'string' ) {
			// If the value is a string, we don't need to serialize it.
			return value;
		}

		return JSON.stringify( value );
	} );

	if ( Object.keys( metaData ).length === 0 ) {
		return {
			error: new Error( 'Invalid poocommerce_meta data for update.' ),
			updatedUser: undefined,
		};
	}

	// Optimistically propagate new poocommerce_meta to the store for instant update.
	receiveCurrentUser( {
		...user,
		poocommerce_meta: {
			...user.poocommerce_meta,
			...metaData,
		},
	} );
	// Use saveUser() to update PooCommerce meta values.
	const updatedUser = await saveUser( {
		id: user.id,
		poocommerce_meta: metaData,
	} );

	if ( undefined === updatedUser ) {
		// Return the encountered error to the caller.
		const error = getLastEntitySaveError( 'root', 'user', user.id );

		return {
			error,
			updatedUser,
		};
	}

	// Decode the PooCommerce meta after save.
	const updatedUserResponse = {
		...updatedUser,
		poocommerce_meta: getPooCommerceMeta( updatedUser ),
	};

	return {
		updatedUser: updatedUserResponse,
	};
}

/**
 * Custom react hook for retrieving thecurrent user's PooCommerce preferences.
 *
 * This is a wrapper around @wordpress/core-data's getCurrentUser() and saveUser().
 */
export const useUserPreferences = () => {
	// Get our dispatch methods now - this can't happen inside the callback below.
	const dispatch = useDispatch( STORE_NAME );
	const { addEntities, receiveCurrentUser, saveEntityRecord } = dispatch;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let { saveUser } = dispatch;

	const userData = useSelect( ( select ) => {
		const {
			getCurrentUser,
			getEntity,
			getEntityRecord,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getLastEntitySaveError,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			hasStartedResolution,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			hasFinishedResolution,
		} = select( STORE_NAME );

		return {
			isRequesting:
				hasStartedResolution( 'getCurrentUser' ) &&
				! hasFinishedResolution( 'getCurrentUser' ),
			user: getCurrentUser() as WCUser,
			getCurrentUser,
			getEntity,
			getEntityRecord,
			getLastEntitySaveError,
		};
	} );

	const updateUserPreferences = <
		T extends Record< string, unknown > = UserPreferences
	>(
		userPrefs: UserPreferences | T
	) => {
		// WP 5.3.x doesn't have the User entity defined.
		if ( typeof saveUser !== 'function' ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			saveUser = async ( userToSave: {
				id: number;
				poocommerce_meta: { [ key: string ]: boolean };
			} ) => {
				const entityDefined = Boolean(
					userData.getEntity( 'root', 'user' )
				);
				if ( ! entityDefined ) {
					// Add the User entity so saveEntityRecord works.
					await addEntities( [
						{
							name: 'user',
							kind: 'root',
							baseURL: '/wp/v2/users',
							plural: 'users',
						},
					] );
				}

				// Fire off the save action.
				await saveEntityRecord( 'root', 'user', userToSave );

				// Respond with the updated user.
				return userData.getEntityRecord(
					'root',
					'user',
					userToSave.id
				);
			};
		}
		// Get most recent user before update.
		const currentUser = userData.getCurrentUser() as WCUser;
		return updateUserPrefs(
			receiveCurrentUser,
			currentUser,
			saveUser,
			userData.getLastEntitySaveError,
			userPrefs
		);
	};

	const userPreferences: UserPreferences = userData.user
		? getPooCommerceMeta( userData.user )
		: {};

	return {
		isRequesting: userData.isRequesting,
		...userPreferences,
		updateUserPreferences,
	};
};
