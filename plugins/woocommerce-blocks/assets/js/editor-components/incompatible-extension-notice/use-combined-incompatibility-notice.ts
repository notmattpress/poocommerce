/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { useLocalStorageState } from '@poocommerce/base-hooks';

/**
 * Internal dependencies
 */
import { useIncompatiblePaymentGatewaysNotice } from './use-incompatible-payment-gateways-notice';
import { useIncompatibleExtensionNotice } from './use-incompatible-extensions-notice';

type StoredIncompatibleExtension = { [ k: string ]: string[] };
const initialDismissedNotices: React.SetStateAction<
	StoredIncompatibleExtension[]
> = [];

const areEqual = ( array1: string[], array2: string[] ) => {
	if ( array1.length !== array2.length ) {
		return false;
	}

	const uniqueCollectionValues = new Set( [ ...array1, ...array2 ] );

	return uniqueCollectionValues.size === array1.length;
};

const sortAlphabetically = ( obj: {
	[ key: string ]: string;
} ): { [ key: string ]: string } =>
	Object.fromEntries(
		Object.entries( obj ).sort( ( [ , a ], [ , b ] ) =>
			a.localeCompare( b )
		)
	);

export const useCombinedIncompatibilityNotice = (
	blockName: string
): [ boolean, () => void, { [ k: string ]: string }, number ] => {
	const [
		incompatibleExtensions,
		incompatibleExtensionSlugs,
		incompatibleExtensionCount,
	] = useIncompatibleExtensionNotice();

	const [
		incompatiblePaymentMethods,
		incompatiblePaymentMethodSlugs,
		incompatiblePaymentMethodCount,
	] = useIncompatiblePaymentGatewaysNotice();

	const allIncompatibleItems = {
		...incompatibleExtensions,
		...incompatiblePaymentMethods,
	};

	const allIncompatibleItemSlugs = [
		...incompatibleExtensionSlugs,
		...incompatiblePaymentMethodSlugs,
	];

	const allIncompatibleItemCount =
		incompatibleExtensionCount + incompatiblePaymentMethodCount;

	const [ dismissedNotices, setDismissedNotices ] = useLocalStorageState<
		StoredIncompatibleExtension[]
	>(
		`wc-blocks_dismissed_incompatible_extensions_notices`,
		initialDismissedNotices
	);

	const [ isVisible, setIsVisible ] = useState( false );

	const isDismissedNoticeUpToDate = dismissedNotices.some(
		( notice ) =>
			Object.keys( notice ).includes( blockName ) &&
			areEqual(
				notice[ blockName as keyof object ],
				allIncompatibleItemSlugs
			)
	);

	const shouldBeDismissed =
		allIncompatibleItemCount === 0 || isDismissedNoticeUpToDate;

	const dismissNotice = () => {
		const dismissedNoticesSet = new Set( dismissedNotices );
		dismissedNoticesSet.add( {
			[ blockName ]: allIncompatibleItemSlugs,
		} );
		setDismissedNotices( [ ...dismissedNoticesSet ] );
	};

	// This ensures the modal is not loaded on first render. This is required so
	// Gutenberg doesn't steal the focus from the Guide and focuses the block.
	useEffect( () => {
		setIsVisible( ! shouldBeDismissed );

		if ( ! shouldBeDismissed && ! isDismissedNoticeUpToDate ) {
			setDismissedNotices( ( previousDismissedNotices ) =>
				previousDismissedNotices.reduce(
					( acc: StoredIncompatibleExtension[], curr ) => {
						if ( Object.keys( curr ).includes( blockName ) ) {
							return acc;
						}
						acc.push( curr );

						return acc;
					},
					[]
				)
			);
		}
	}, [
		shouldBeDismissed,
		isDismissedNoticeUpToDate,
		setDismissedNotices,
		blockName,
	] );

	return [
		isVisible,
		dismissNotice,
		sortAlphabetically( allIncompatibleItems ),
		allIncompatibleItemCount,
	];
};
