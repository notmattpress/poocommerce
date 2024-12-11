/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { OPTIONS_STORE_NAME } from '@poocommerce/data';

type Props = {
	/** Set to false to disable this query, defaults to true to query the data */
	enabled?: boolean;
};

export const useLaunchYourStore = (
	{ enabled }: Props = {
		enabled: true,
	}
) => {
	const {
		isLoading,
		launchYourStoreEnabled,
		comingSoon,
		storePagesOnly,
		privateLink,
		shareKey,
	} = useSelect( ( select ) => {
		if ( ! enabled ) {
			return {
				isLoading: false,
				comingSoon: null,
				storePagesOnly: null,
				privateLink: null,
				shareKey: null,
				launchYourStoreEnabled: null,
			};
		}

		const { hasFinishedResolution, getOption } =
			select( OPTIONS_STORE_NAME );

		const allOptionResolutionsFinished =
			! hasFinishedResolution( 'getOption', [
				'poocommerce_coming_soon',
			] ) &&
			! hasFinishedResolution( 'getOption', [
				'poocommerce_store_pages_only',
			] ) &&
			! hasFinishedResolution( 'getOption', [
				'poocommerce_private_link',
			] ) &&
			! hasFinishedResolution( 'getOption', [ 'poocommerce_share_key' ] );

		return {
			isLoading: allOptionResolutionsFinished,
			comingSoon: getOption( 'poocommerce_coming_soon' ),
			storePagesOnly: getOption( 'poocommerce_store_pages_only' ),
			privateLink: getOption( 'poocommerce_private_link' ),
			shareKey: getOption( 'poocommerce_share_key' ),
			launchYourStoreEnabled:
				window.wcAdminFeatures[ 'launch-your-store' ],
		};
	} );

	return {
		isLoading,
		comingSoon,
		storePagesOnly,
		privateLink,
		shareKey,
		launchYourStoreEnabled,
	};
};
