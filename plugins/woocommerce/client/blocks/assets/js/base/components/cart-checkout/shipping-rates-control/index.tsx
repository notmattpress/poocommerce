/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { usePrevious } from '@poocommerce/base-hooks';
import LoadingMask from '@poocommerce/base-components/loading-mask';
import { ExperimentalOrderShippingPackages } from '@poocommerce/blocks-checkout';
import {
	getShippingRatesPackageCount,
	getShippingRatesRateCount,
} from '@poocommerce/base-utils';
import {
	useStoreCart,
	useEditorContext,
	useShippingData,
} from '@poocommerce/base-context';
import NoticeBanner from '@poocommerce/base-components/notice-banner';
import { isObject } from '@poocommerce/types';
import { CheckoutShippingSkeleton } from '@poocommerce/base-components/skeleton/patterns/checkout-shipping';

/**
 * Internal dependencies
 */
import ShippingRatesControlPackage from '../shipping-rates-control-package';
import { speakFoundShippingOptions } from './utils';
import type { PackagesProps, ShippingRatesControlProps } from './types';

/**
 * Renders multiple packages within the slotfill.
 */
const Packages = ( {
	packages,
	showItems,
	collapsible,
	noResultsMessage,
	renderOption,
	context = '',
}: PackagesProps ): JSX.Element | null => {
	// If there are no packages, return nothing.
	if ( ! packages.length ) {
		return null;
	}
	return (
		<>
			{ packages.map( ( { package_id: packageId, ...packageData } ) => (
				<ShippingRatesControlPackage
					highlightChecked={ context !== 'poocommerce/cart' }
					key={ packageId }
					packageId={ packageId }
					packageData={ packageData }
					collapsible={ collapsible }
					showItems={ showItems }
					noResultsMessage={ noResultsMessage }
					renderOption={ renderOption }
				/>
			) ) }
		</>
	);
};

/**
 * Renders the shipping rates control element.
 */
const ShippingRatesControl = ( {
	shippingRates,
	isLoadingRates,
	className,
	collapsible,
	showItems,
	noResultsMessage = <></>,
	renderOption,
	context,
}: ShippingRatesControlProps ): JSX.Element => {
	const shippingRatesRateCount = getShippingRatesRateCount( shippingRates );
	const shippingRatesPackageCount =
		getShippingRatesPackageCount( shippingRates );
	const previousShippingRatesRateCount = usePrevious(
		shippingRatesRateCount
	);
	const previousShippingRatesPackageCount = usePrevious(
		shippingRatesPackageCount
	);

	useEffect( () => {
		if ( isLoadingRates ) {
			return;
		}

		if (
			previousShippingRatesRateCount === shippingRatesRateCount &&
			previousShippingRatesPackageCount === shippingRatesPackageCount
		) {
			return;
		}

		speakFoundShippingOptions(
			shippingRatesPackageCount,
			shippingRatesRateCount
		);
	}, [
		isLoadingRates,
		shippingRatesRateCount,
		shippingRatesPackageCount,
		previousShippingRatesRateCount,
		previousShippingRatesPackageCount,
	] );

	// Prepare props to pass to the ExperimentalOrderShippingPackages slot fill.
	// We need to pluck out receiveCart.
	// eslint-disable-next-line no-unused-vars
	const { extensions, receiveCart, ...cart } = useStoreCart();
	const slotFillProps = {
		className,
		collapsible,
		showItems,
		noResultsMessage,
		renderOption,
		extensions,
		cart,
		components: {
			ShippingRatesControlPackage,
		},
		context,
	};
	const { isEditor } = useEditorContext();
	const { hasSelectedLocalPickup, selectedRates } = useShippingData();

	// Check if all rates selected are the same.
	const selectedRateIds = isObject( selectedRates )
		? ( Object.values( selectedRates ) as string[] )
		: [];
	const allPackagesHaveSameRate = selectedRateIds.every( ( rate: string ) => {
		return rate === selectedRateIds[ 0 ];
	} );

	if ( isLoadingRates ) {
		return <CheckoutShippingSkeleton />;
	}

	return (
		<LoadingMask
			isLoading={ isLoadingRates }
			screenReaderLabel={ __( 'Loading shipping rates…', 'poocommerce' ) }
			showSpinner={ true }
		>
			{ hasSelectedLocalPickup &&
				context === 'poocommerce/cart' &&
				shippingRates.length > 1 &&
				! allPackagesHaveSameRate &&
				! isEditor && (
					<NoticeBanner
						className="wc-block-components-notice"
						isDismissible={ false }
						status="warning"
					>
						{ __(
							'Multiple shipments must have the same pickup location',
							'poocommerce'
						) }
					</NoticeBanner>
				) }
			<ExperimentalOrderShippingPackages.Slot { ...slotFillProps } />
			<ExperimentalOrderShippingPackages>
				<Packages
					packages={ shippingRates }
					noResultsMessage={ noResultsMessage }
					renderOption={ renderOption }
				/>
			</ExperimentalOrderShippingPackages>
		</LoadingMask>
	);
};

export default ShippingRatesControl;
