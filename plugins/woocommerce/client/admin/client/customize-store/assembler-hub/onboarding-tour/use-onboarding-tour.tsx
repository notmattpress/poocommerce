/**
 * External dependencies
 */
import { OPTIONS_STORE_NAME } from '@poocommerce/data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from 'react';

export const CUSTOMIZE_STORE_ONBOARDING_TOUR_HIDDEN =
	'poocommerce_customize_store_onboarding_tour_hidden';

export const useOnboardingTour = () => {
	const [ showWelcomeTour, setShowWelcomeTour ] = useState( true );
	const [ isResizeHandleVisible, setIsResizeHandleVisible ] =
		useState( true );

	const { updateOptions } = useDispatch( OPTIONS_STORE_NAME );
	const { shouldTourBeShown } = useSelect( ( select ) => {
		const { getOption, hasFinishedResolution } =
			select( OPTIONS_STORE_NAME );

		const wasTourShown =
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
			getOption( CUSTOMIZE_STORE_ONBOARDING_TOUR_HIDDEN ) === 'yes' ||
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
			! hasFinishedResolution( 'getOption', [
				CUSTOMIZE_STORE_ONBOARDING_TOUR_HIDDEN,
			] );

		return {
			shouldTourBeShown: ! wasTourShown,
		};
	}, [] );

	const onClose = () => {
		updateOptions( {
			[ CUSTOMIZE_STORE_ONBOARDING_TOUR_HIDDEN ]: 'yes',
		} );
	};

	return {
		onClose,
		shouldTourBeShown,
		showWelcomeTour,
		setShowWelcomeTour,
		setIsResizeHandleVisible,
		isResizeHandleVisible,
	};
};
